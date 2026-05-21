import http from 'http';
import express from 'express';
import { WebSocketServer } from 'ws';
import { TunnelRegistry } from './TunnelRegistry';
import { randomSubdomain, extractSubdomain, validateSubdomain } from './utils';

const PORT = parseInt(process.env.PORT || '3000', 10);
const DOMAIN = process.env.DOMAIN || `localhost:${PORT}`;
const AUTH_TOKEN = process.env.AUTH_TOKEN || '';
const MAX_BODY_BYTES = parseInt(process.env.MAX_BODY_BYTES || String(50 * 1024 * 1024), 10); // 50 MB
const PROTOCOL = DOMAIN.split(':')[0] === 'localhost' ? 'http' : 'https';

const registry = new TunnelRegistry();
const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });

// ── WebSocket upgrade — tunnel registration only ──────────────────────────────
server.on('upgrade', (req, socket, head) => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  if (url.pathname !== '/_porthole/register') {
    socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
    socket.destroy();
    return;
  }

  // Optional auth token check
  if (AUTH_TOKEN) {
    const provided = url.searchParams.get('token') ?? req.headers['x-porthole-token'];
    if (provided !== AUTH_TOKEN) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
      return;
    }
  }

  wss.handleUpgrade(req, socket, head, (ws) => {
    const requested = (url.searchParams.get('subdomain') || randomSubdomain())
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/^-+|-+$/g, '') // strip leading/trailing hyphens
      .slice(0, 63);

    const validationError = validateSubdomain(requested);
    if (validationError) {
      ws.send(JSON.stringify({ type: 'error', message: validationError }));
      ws.close();
      return;
    }

    if (!registry.register(requested, ws)) {
      ws.send(JSON.stringify({ type: 'error', message: 'Subdomain already taken, try another' }));
      ws.close();
      return;
    }

    const tunnelUrl = `${PROTOCOL}://${requested}.${DOMAIN}`;
    ws.send(JSON.stringify({ type: 'registered', subdomain: requested, url: tunnelUrl }));
    log(`[+] tunnel open   ${requested}  →  ${tunnelUrl}`);
    ws.on('close', () => log(`[-] tunnel closed  ${requested}`));
  });
});

// ── Health / metrics ──────────────────────────────────────────────────────────
app.get('/_porthole/health', (_req, res) => {
  res.json({ status: 'ok', activeTunnels: registry.count(), uptime: process.uptime() });
});

// ── Landing page ──────────────────────────────────────────────────────────────
app.get('/', (req, res, next) => {
  const host = req.headers.host ?? '';
  if (extractSubdomain(host, DOMAIN)) return next(); // has subdomain → fall through to proxy
  res.status(200).send(LANDING_HTML);
});

// ── Proxy all subdomain traffic to the matching tunnel ────────────────────────
app.use(async (req, res) => {
  const host = req.headers.host ?? '';
  const subdomain = extractSubdomain(host, DOMAIN);

  if (!subdomain) {
    res.status(404).json({ error: 'No tunnel found' });
    return;
  }

  if (!registry.has(subdomain)) {
    res.status(404).json({ error: `No active tunnel for "${subdomain}"` });
    return;
  }

  try {
    let received = 0;
    const chunks: Buffer[] = [];

    await new Promise<void>((resolve, reject) => {
      req.on('data', (c: Buffer | string) => {
        const chunk = Buffer.isBuffer(c) ? c : Buffer.from(c);
        received += chunk.length;
        if (received > MAX_BODY_BYTES) {
          reject(Object.assign(new Error('Request body too large'), { code: 'PAYLOAD_TOO_LARGE' }));
          req.destroy();
          return;
        }
        chunks.push(chunk);
      });
      req.on('end', resolve);
      req.on('error', reject);
    });

    const tunnelRes = await registry.forward(
      subdomain,
      req.method,
      req.url,
      req.headers as Record<string, string>,
      Buffer.concat(chunks),
    );

    const skipHeaders = new Set(['transfer-encoding', 'connection', 'keep-alive']);
    for (const [key, val] of Object.entries(tunnelRes.headers)) {
      if (!skipHeaders.has(key.toLowerCase())) {
        try { res.setHeader(key, val); } catch { /* invalid header value — skip */ }
      }
    }

    res.status(tunnelRes.status).end(Buffer.from(tunnelRes.body, 'base64'));
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === 'PAYLOAD_TOO_LARGE') {
      res.status(413).json({ error: 'Request body too large' });
      return;
    }
    const message = err instanceof Error ? err.message : 'Tunnel error';
    res.status(502).json({ error: message });
  }
});

// ── Graceful shutdown ─────────────────────────────────────────────────────────
function shutdown(signal: string) {
  log(`Received ${signal} — shutting down gracefully`);
  server.close(() => {
    log('HTTP server closed');
    process.exit(0);
  });
  // Force-exit after 10 s if connections don't drain
  setTimeout(() => {
    log('Forcing exit after 10s drain timeout');
    process.exit(1);
  }, 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// ── Start ─────────────────────────────────────────────────────────────────────
server.listen(PORT, () => {
  log(`porthole server v1.0.0`);
  log(`Listening : http://localhost:${PORT}`);
  log(`Domain    : ${PROTOCOL}://*.${DOMAIN}`);
  log(`Auth      : ${AUTH_TOKEN ? 'enabled' : 'disabled (set AUTH_TOKEN to enable)'}`);
  log(`Max body  : ${(MAX_BODY_BYTES / 1024 / 1024).toFixed(0)} MB`);
});

// ── Helpers ───────────────────────────────────────────────────────────────────
function log(msg: string) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

const LANDING_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>porthole</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 600px; margin: 80px auto; padding: 0 1rem; color: #111; }
    code { background: #f3f3f3; padding: .15em .4em; border-radius: 4px; font-size: .9em; }
    pre  { background: #f3f3f3; padding: 1rem; border-radius: 6px; overflow-x: auto; }
  </style>
</head>
<body>
  <h1>porthole 🕳</h1>
  <p>Expose your local server to the internet.</p>
  <h2>Install</h2>
  <pre>npm install -g @porthole/cli</pre>
  <h2>Use</h2>
  <pre>porthole 3000</pre>
  <p>Your local port 3000 will be available at a public URL instantly.</p>
</body>
</html>`;
