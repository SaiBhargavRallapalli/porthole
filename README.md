# porthole

Expose your local server to the internet. A self-hosted tunnel service — own your infrastructure.

```
  porthole

  Your public URL is:

  https://swift-fox-1234.porthole.dev

  Forwarding  https://swift-fox-1234.porthole.dev  →  http://localhost:3000

  GET     /api/users                                                 200   45ms
  POST    /api/login                                                 200  123ms
  GET     /static/app.js                                             304    3ms
```

## Architecture

```
Browser ──► porthole server ──(WebSocket)──► porthole CLI ──► localhost:PORT
              (public)                          (your machine)
```

The CLI client opens a persistent WebSocket to the server. The server forwards
incoming HTTP requests over that socket; the CLI proxies them to your local server
and sends responses back.

## Quick start

### 1. Start the server

```bash
cd packages/server
npm install
PORT=3000 DOMAIN=localhost:3000 npm run dev
```

### 2. Run the CLI

```bash
cd packages/cli
npm install
npx ts-node src/cli.ts 8080 --server http://localhost:3000
```

Replace `8080` with the local port you want to expose.

## Production deployment

Deploy the server to any Node.js host (Railway, Render, Fly.io, etc.).

Requirements:
- A domain with **wildcard DNS** pointing to your server  
  e.g. `*.porthole.dev  A  <your-server-ip>`
- TLS termination via nginx/Caddy in front of the Node server

Set environment variables:
```
PORT=3000
DOMAIN=porthole.dev
```

Then install the CLI globally:
```bash
npm install -g @porthole-tunnel/cli
porthole 3000 --server https://porthole.dev
```

## Local testing without DNS wildcards

Use [sslip.io](https://sslip.io) which provides free wildcard DNS for any IP:

```bash
DOMAIN=127.0.0.1.sslip.io:3000 npm run dev
# Your tunnels will be at http://swift-fox-1234.127.0.0.1.sslip.io:3000
```

## CLI options

```
porthole <port> [options]

Arguments:
  port                   Local port to expose

Options:
  -s, --subdomain <name> Request a specific subdomain
  --server <url>         Porthole server URL (default: http://localhost:3000)
  --local-host <host>    Local hostname to forward to (default: localhost)
  --print-requests       Log every forwarded request
  -V, --version          Print version
  -h, --help             Show help
```

## Build

```bash
npm run build   # builds both packages
```
