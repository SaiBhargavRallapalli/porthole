import WebSocket from 'ws';

export interface ForwardedResponse {
  status: number;
  headers: Record<string, string>;
  body: string; // base64
}

interface PendingRequest {
  resolve: (res: ForwardedResponse) => void;
  reject: (err: Error) => void;
  timer: ReturnType<typeof setTimeout>;
}

const HOP_BY_HOP = new Set([
  'connection', 'keep-alive', 'proxy-authenticate', 'proxy-authorization',
  'te', 'trailer', 'transfer-encoding', 'upgrade',
]);

const PING_INTERVAL_MS = 25_000;
const REQUEST_TIMEOUT_MS = 30_000;

export class TunnelRegistry {
  private tunnels = new Map<string, WebSocket>();
  private pending = new Map<string, PendingRequest>();
  // Track which request IDs belong to each tunnel so we can drain on disconnect
  private tunnelRequests = new Map<string, Set<string>>();
  private pingTimers = new Map<string, ReturnType<typeof setInterval>>();

  register(subdomain: string, ws: WebSocket): boolean {
    if (this.tunnels.has(subdomain)) return false;

    this.tunnels.set(subdomain, ws);
    this.tunnelRequests.set(subdomain, new Set());

    ws.on('message', (data) => {
      let msg: Record<string, unknown>;
      try {
        msg = JSON.parse(data.toString());
      } catch {
        return; // non-JSON frame (e.g. pong text) — ignore
      }

      if (msg.type === 'response' && typeof msg.id === 'string') {
        const req = this.pending.get(msg.id);
        if (req) {
          clearTimeout(req.timer);
          this.pending.delete(msg.id);
          this.tunnelRequests.get(subdomain)?.delete(msg.id);
          req.resolve(msg as unknown as ForwardedResponse);
        }
      }
    });

    ws.on('pong', () => {
      // Connection is alive — nothing to do, the interval handles re-pinging
    });

    // Heartbeat: detect silently-dead connections
    const ping = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping();
      } else {
        clearInterval(ping);
      }
    }, PING_INTERVAL_MS);
    this.pingTimers.set(subdomain, ping);

    const cleanup = () => {
      clearInterval(this.pingTimers.get(subdomain)!);
      this.pingTimers.delete(subdomain);
      this.tunnels.delete(subdomain);

      // Immediately reject all pending requests for this tunnel
      const ids = this.tunnelRequests.get(subdomain);
      if (ids) {
        for (const id of ids) {
          const req = this.pending.get(id);
          if (req) {
            clearTimeout(req.timer);
            this.pending.delete(id);
            req.reject(new Error('Tunnel disconnected'));
          }
        }
        this.tunnelRequests.delete(subdomain);
      }
    };

    ws.on('close', cleanup);
    ws.on('error', cleanup);

    return true;
  }

  has(subdomain: string): boolean {
    return this.tunnels.has(subdomain);
  }

  count(): number {
    return this.tunnels.size;
  }

  async forward(
    subdomain: string,
    method: string,
    path: string,
    headers: Record<string, string | string[] | undefined>,
    body: Buffer,
  ): Promise<ForwardedResponse> {
    const ws = this.tunnels.get(subdomain);
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      throw new Error('Tunnel not connected');
    }

    const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

    const forwardHeaders: Record<string, string | string[]> = {};
    for (const [key, val] of Object.entries(headers)) {
      if (val !== undefined && !HOP_BY_HOP.has(key.toLowerCase())) {
        forwardHeaders[key] = val;
      }
    }

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        this.tunnelRequests.get(subdomain)?.delete(id);
        reject(new Error('Tunnel request timed out after 30s'));
      }, REQUEST_TIMEOUT_MS);

      this.pending.set(id, { resolve, reject, timer });
      this.tunnelRequests.get(subdomain)?.add(id);

      ws.send(
        JSON.stringify({ type: 'request', id, method, path, headers: forwardHeaders, body: body.toString('base64') }),
        (err) => {
          if (err) {
            clearTimeout(timer);
            this.pending.delete(id);
            this.tunnelRequests.get(subdomain)?.delete(id);
            reject(err);
          }
        },
      );
    });
  }
}
