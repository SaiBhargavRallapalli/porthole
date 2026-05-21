import WebSocket from 'ws';
import http from 'http';
import https from 'https';
import { EventEmitter } from 'events';

export interface TunnelOptions {
  serverUrl: string;
  localPort: number;
  localHost: string;
  subdomain?: string;
  token?: string;
}

export interface RequestEvent {
  method: string;
  path: string;
  status: number;
  duration: number;
}

interface IncomingRequest {
  type: 'request';
  id: string;
  method: string;
  path: string;
  headers: Record<string, string | string[]>;
  body: string; // base64
}

interface OutgoingResponse {
  type: 'response';
  id: string;
  status: number;
  headers: Record<string, string>;
  body: string; // base64
}

const HOP_BY_HOP = new Set(['host', 'connection', 'transfer-encoding', 'keep-alive']);
const CONNECT_TIMEOUT_MS = 15_000;
const LOCAL_REQUEST_TIMEOUT_MS = 30_000;
const PING_INTERVAL_MS = 20_000;
const MAX_RESPONSE_BYTES = 50 * 1024 * 1024; // 50 MB

export class Tunnel extends EventEmitter {
  private ws: WebSocket | null = null;
  private pingTimer: ReturnType<typeof setInterval> | null = null;
  public url = '';
  public subdomain = '';

  constructor(private opts: TunnelOptions) {
    super();
  }

  open(): Promise<string> {
    return new Promise((resolve, reject) => {
      const wsBase = this.opts.serverUrl.replace(/^http/, 'ws');
      const wsUrl = new URL('/_porthole/register', wsBase);
      if (this.opts.subdomain) wsUrl.searchParams.set('subdomain', this.opts.subdomain);
      if (this.opts.token) wsUrl.searchParams.set('token', this.opts.token);

      const ws = new WebSocket(wsUrl.toString());
      this.ws = ws;

      let settled = false;
      const settle = (fn: () => void) => {
        if (settled) return;
        settled = true;
        fn();
      };

      // Connection timeout
      const connectTimeout = setTimeout(() => {
        settle(() => reject(new Error(`Could not connect to server within ${CONNECT_TIMEOUT_MS / 1000}s`)));
        ws.terminate();
      }, CONNECT_TIMEOUT_MS);

      ws.once('open', () => clearTimeout(connectTimeout));

      ws.on('message', async (data) => {
        let msg: Record<string, unknown>;
        try { msg = JSON.parse(data.toString()); } catch { return; }

        if (msg.type === 'registered') {
          this.url = msg.url as string;
          this.subdomain = msg.subdomain as string;
          this.startHeartbeat(ws);
          settle(() => resolve(this.url));
        } else if (msg.type === 'request') {
          await this.handleRequest(msg as unknown as IncomingRequest);
        } else if (msg.type === 'error') {
          settle(() => reject(new Error(msg.message as string)));
        }
      });

      ws.on('error', (err) => {
        clearTimeout(connectTimeout);
        settle(() => reject(err));
        this.emit('error', err);
      });

      ws.on('close', () => {
        clearTimeout(connectTimeout);
        this.stopHeartbeat();
        this.emit('close');
      });
    });
  }

  private startHeartbeat(ws: WebSocket) {
    this.stopHeartbeat();
    this.pingTimer = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) ws.ping();
    }, PING_INTERVAL_MS);
  }

  private stopHeartbeat() {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  private async handleRequest(req: IncomingRequest): Promise<void> {
    const start = Date.now();

    try {
      const body = req.body ? Buffer.from(req.body, 'base64') : Buffer.alloc(0);
      const response = await this.proxyToLocal(req.method, req.path, req.headers, body);

      this.emit('request', {
        method: req.method,
        path: req.path,
        status: response.status,
        duration: Date.now() - start,
      } satisfies RequestEvent);

      this.send({
        type: 'response',
        id: req.id,
        status: response.status,
        headers: response.headers,
        body: response.body.toString('base64'),
      } satisfies OutgoingResponse);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Local server error';
      this.send({
        type: 'response',
        id: req.id,
        status: 502,
        headers: { 'content-type': 'application/json' },
        body: Buffer.from(JSON.stringify({ error: message })).toString('base64'),
      } satisfies OutgoingResponse);
    }
  }

  private send(msg: OutgoingResponse): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg), (err) => {
        if (err) this.emit('error', err);
      });
    }
  }

  private proxyToLocal(
    method: string,
    path: string,
    headers: Record<string, string | string[]>,
    body: Buffer,
  ): Promise<{ status: number; headers: Record<string, string>; body: Buffer }> {
    return new Promise((resolve, reject) => {
      const url = new URL(path, `http://${this.opts.localHost}:${this.opts.localPort}`);
      const lib = url.protocol === 'https:' ? https : http;

      const reqHeaders: Record<string, string | string[]> = {
        host: `${this.opts.localHost}:${this.opts.localPort}`,
      };
      for (const [k, v] of Object.entries(headers)) {
        if (!HOP_BY_HOP.has(k.toLowerCase())) reqHeaders[k] = v;
      }
      if (body.length) reqHeaders['content-length'] = String(body.length);

      const req = lib.request(
        {
          hostname: url.hostname,
          port: parseInt(url.port || (url.protocol === 'https:' ? '443' : '80'), 10),
          path: url.pathname + url.search,
          method,
          headers: reqHeaders,
          timeout: LOCAL_REQUEST_TIMEOUT_MS,
        },
        (res) => {
          let received = 0;
          const chunks: Buffer[] = [];

          res.on('data', (c: Buffer | string) => {
            const chunk = Buffer.isBuffer(c) ? c : Buffer.from(c);
            received += chunk.length;
            if (received > MAX_RESPONSE_BYTES) {
              req.destroy(new Error('Response body too large'));
              return;
            }
            chunks.push(chunk);
          });

          res.on('end', () => {
            const resHeaders: Record<string, string> = {};
            for (const [k, v] of Object.entries(res.headers)) {
              if (v != null) resHeaders[k] = Array.isArray(v) ? v.join(', ') : v;
            }
            resolve({ status: res.statusCode ?? 200, headers: resHeaders, body: Buffer.concat(chunks) });
          });

          res.on('error', (err) => { req.destroy(); reject(err); });
        },
      );

      req.on('timeout', () => req.destroy(new Error('Local server request timed out')));
      req.on('error', reject);

      if (body.length) req.write(body);
      req.end();
    });
  }

  close(): void {
    this.stopHeartbeat();
    this.ws?.close();
  }
}
