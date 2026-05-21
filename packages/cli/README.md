# @porthole-tunnel/cli

Expose your local server to the internet through a self-hosted [porthole](https://github.com/SaiBhargavRallapalli/porthole) tunnel.

The CLI opens a persistent WebSocket to a porthole server, receives HTTP requests for your assigned subdomain, proxies them to `localhost`, and streams responses back.

## Install

```bash
npm install -g @porthole-tunnel/cli
```

Requires **Node.js 18+**.

### Homebrew (macOS)

Standalone binaries are published on [GitHub Releases](https://github.com/SaiBhargavRallapalli/porthole/releases). See the root repo `Formula/porthole.rb` for tap instructions.

## Quick start

1. Run a porthole server (your own or the project's hosted instance).
2. Expose a local port:

```bash
porthole 3000
```

Example output:

```
  porthole

  Your public URL is:

  https://swift-fox-1234.example.com

  Forwarding  https://swift-fox-1234.example.com  →  http://localhost:3000
```

Traffic to that URL is tunneled to whatever is listening on port `3000` on your machine.

## Usage

```
porthole <port> [options]
```

### Options

| Flag | Description | Default |
|------|-------------|---------|
| `<port>` | Local TCP port to expose | — |
| `-s, --subdomain <name>` | Request a specific subdomain | random name |
| `--server <url>` | Base URL of the porthole server | `http://localhost:3000` |
| `--local-host <host>` | Hostname for local upstream requests | `localhost` |
| `--token <token>` | Auth token when the server sets `AUTH_TOKEN` | — |
| `--open` | Open the public URL in the default browser | off |
| `--print-requests` | Log each forwarded request (method, path, status, time) | off |
| `-V, --version` | Print version | — |
| `-h, --help` | Show help | — |

### Examples

```bash
# Default server (local dev)
porthole 3000

# Custom subdomain
porthole 3000 --subdomain my-demo

# Remote server with auth
porthole 3000 \
  --server https://tunnel.example.com \
  --token my-secret

# Docker / VM: app listens on another host interface
porthole 8080 --local-host host.docker.internal

# Request logging + open browser
porthole 3000 --subdomain staging --open --print-requests
```

## How it works

```
Internet  →  porthole server  ⇄  WebSocket  ⇄  porthole CLI  →  localhost:<port>
```

1. The CLI connects to `/_porthole/register` on the server (HTTP upgraded to WebSocket).
2. The server assigns a subdomain and returns the public URL.
3. Incoming HTTP requests for that subdomain are sent over the socket to the CLI.
4. The CLI forwards them to your local process and returns the response.

The CLI **auto-reconnects** with exponential backoff if the connection drops.

## Self-hosted server

Point the CLI at your own server:

```bash
porthole 3000 --server https://your-tunnel-host.example.com
```

Deploy [@porthole-tunnel/server](https://www.npmjs.com/package/@porthole-tunnel/server) on Railway, Render, Fly.io, or any VPS with wildcard DNS. See the [server README](../server/README.md).

## Development

From the monorepo root:

```bash
npm run dev:cli -- 3000 --server http://localhost:3000
```

Or from this package:

```bash
npm install
npm run dev -- 3000
```

Build:

```bash
npm run build
```

## Links

- [Repository](https://github.com/SaiBhargavRallapalli/porthole)
- [Issues](https://github.com/SaiBhargavRallapalli/porthole/issues)
- [@porthole-tunnel/server on npm](https://www.npmjs.com/package/@porthole-tunnel/server)

## License

MIT
