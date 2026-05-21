# @porthole-tunnel/server

Self-hosted HTTP tunnel server for [porthole](https://github.com/SaiBhargavRallapalli/porthole). Accepts public HTTP traffic on wildcard subdomains and forwards it to connected CLI clients over WebSocket.

Pair with [@porthole-tunnel/cli](https://www.npmjs.com/package/@porthole-tunnel/cli) on developer machines.

## Install

```bash
npm install @porthole-tunnel/server
```

For global CLI-style usage after install:

```bash
npx @porthole-tunnel/server
# or, from package after npm link / global install:
node node_modules/@porthole-tunnel/server/dist/index.js
```

Requires **Node.js 18+** and a **long-running process** (not serverless). WebSockets must stay open.

## Quick start (local)

```bash
cd packages/server   # or use installed package
npm install
PORT=3000 DOMAIN=localhost:3000 npm run dev
```

In another terminal, run the CLI against that server:

```bash
porthole 3000 --server http://localhost:3000
```

Health check:

```bash
curl http://localhost:3000/_porthole/health
```

## Production deployment

### Requirements

- **Always-on** Node.js host (Railway, Render, Fly.io, VPS, etc.)
- **Wildcard DNS** for your tunnel domain, e.g. `*.tunnel.example.com` → server IP
- **TLS** in front of Node (Caddy, nginx, or platform TLS) for HTTPS/WSS

### Environment variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | HTTP port the server listens on | `3000` |
| `DOMAIN` | Public base domain (subdomains are prepended), e.g. `tunnel.example.com` or `localhost:3000` | `localhost:PORT` |
| `AUTH_TOKEN` | If set, tunnel registration must include this token | unset (open registration) |
| `MAX_BODY_BYTES` | Max request body size in bytes | `52428800` (50 MB) |

Example:

```bash
PORT=3000 \
DOMAIN=tunnel.example.com \
AUTH_TOKEN=change-me-in-production \
node dist/index.js
```

CLI clients must pass the same token:

```bash
porthole 3000 --server https://tunnel.example.com --token change-me-in-production
```

### DNS example

```
tunnel.example.com      A      <SERVER_IP>     # optional apex / landing
*.tunnel.example.com    A      <SERVER_IP>     # wildcard for tunnels
```

### Platform notes

| Platform | Notes |
|----------|--------|
| Railway / Render / Fly.io | Set root directory to `packages/server`, start command `npm start` |
| Vercel / Lambda | **Not supported** — no persistent WebSockets |
| Behind reverse proxy | Proxy HTTP and WebSocket upgrades to `PORT` |

### Local testing without a real domain

Use [sslip.io](https://sslip.io) for wildcard DNS to your machine's IP:

```bash
DOMAIN=127.0.0.1.sslip.io:3000 npm run dev
```

Tunnel URLs use `http` when `DOMAIN` starts with `localhost`; otherwise `https` is assumed for printed CLI URLs.

## Architecture

```
Browser ──► porthole server ──(WebSocket)──► porthole CLI ──► localhost:PORT
              (public)                          (your machine)
```

### HTTP routes

| Path | Purpose |
|------|---------|
| `GET /` | Landing page (when Host has no tunnel subdomain) |
| `GET /_porthole/health` | JSON health: `{ status, activeTunnels, uptime }` |
| `/*` (subdomain Host) | Proxied to the tunnel registered for that subdomain |

### WebSocket

| Path | Purpose |
|------|---------|
| `/_porthole/register` | CLI registers a tunnel; query params: `subdomain`, `token` |

Registration flow:

1. CLI connects with optional `?subdomain=name&token=...`
2. Server validates subdomain and auth, responds with `{ type: "registered", subdomain, url }`
3. Server forwards HTTP requests as `{ type: "request", id, method, path, headers, body }` (body base64)
4. CLI replies with `{ type: "response", id, status, headers, body }`

### Operational behavior

- **Heartbeat** — WebSocket ping every 25s to detect dead clients
- **Request timeout** — 30s per proxied request
- **Body limit** — Rejects oversized request bodies with `413`
- **Graceful shutdown** — Drains HTTP on `SIGTERM` / `SIGINT`

## Programmatic use

The package exports the compiled server entry (`dist/index.js`). Typical deployment runs it as a process:

```bash
npm run build
npm start
```

## Development

From the monorepo root:

```bash
npm run dev:server
```

From this package:

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```

## Links

- [Repository](https://github.com/SaiBhargavRallapalli/porthole)
- [Issues](https://github.com/SaiBhargavRallapalli/porthole/issues)
- [@porthole-tunnel/cli on npm](https://www.npmjs.com/package/@porthole-tunnel/cli)

## License

MIT
