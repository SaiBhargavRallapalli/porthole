import { CopyButton } from '@/components/CopyButton';

// ─── Data ────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: '⚡',
    title: 'Zero configuration',
    body: 'One command. No config files, no sign-up, no credit card. porthole <port> and you\'re live.',
  },
  {
    icon: '🔄',
    title: 'Auto-reconnect',
    body: 'Network blip? The CLI detects dead connections via WebSocket ping/pong and reconnects with exponential backoff.',
  },
  {
    icon: '🔒',
    title: 'Optional auth',
    body: 'Set AUTH_TOKEN on your server. Clients pass --token to connect. Everything else is rejected at the handshake.',
  },
  {
    icon: '🏷',
    title: 'Custom subdomains',
    body: 'Request a memorable name: porthole 3000 --subdomain staging. Great for sharing with teammates or clients.',
  },
  {
    icon: '🍺',
    title: 'Homebrew support',
    body: 'Mac users install in one line. No Node.js required — pkg bundles the runtime into a single self-contained binary.',
  },
  {
    icon: '🛡',
    title: 'Production hardened',
    body: '50 MB body cap, heartbeat keep-alive, immediate request drain on disconnect, graceful SIGTERM shutdown.',
  },
];

const CLI_OPTIONS = [
  { flag: '<port>', desc: 'Local port to expose', default: '—' },
  { flag: '-s, --subdomain <name>', desc: 'Request a specific subdomain (e.g. my-demo)', default: 'random' },
  { flag: '--server <url>', desc: 'porthole server URL', default: 'http://localhost:3000' },
  { flag: '--local-host <host>', desc: 'Local hostname to forward requests to', default: 'localhost' },
  { flag: '--token <token>', desc: 'Auth token (required if server has AUTH_TOKEN set)', default: '—' },
  { flag: '--open', desc: 'Open the public URL in your browser after connecting', default: 'off' },
  { flag: '--print-requests', desc: 'Print each forwarded request and response inline', default: 'off' },
  { flag: '-V, --version', desc: 'Print CLI version', default: '—' },
];

const ENV_VARS = [
  { name: 'PORT', desc: 'HTTP port the server listens on', default: '3000' },
  { name: 'DOMAIN', desc: 'Public base domain (subdomains are carved from this)', default: 'localhost:PORT' },
  { name: 'AUTH_TOKEN', desc: 'If set, all tunnel registrations must supply this token', default: 'unset' },
  { name: 'MAX_BODY_BYTES', desc: 'Maximum request / response body size in bytes', default: '52428800' },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function Page() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Navbar />
      <Hero />
      <HowItWorks />
      <Features />
      <QuickStart />
      <Packages />
      <CLIReference />
      <SelfHost />
      <Footer />
    </div>
  );
}

// ─── Navbar ──────────────────────────────────────────────────────────────────

function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2.5 font-bold text-lg tracking-tight">
          <span className="text-xl">🕳</span>
          <span className="text-zinc-100">porthole</span>
        </a>
        <div className="flex items-center gap-6 text-sm text-zinc-400">
          <a href="#how-it-works" className="hover:text-zinc-100 transition-colors hidden sm:inline">How it works</a>
          <a href="#quick-start" className="hover:text-zinc-100 transition-colors hidden sm:inline">Quick start</a>
          <a href="#self-host" className="hover:text-zinc-100 transition-colors hidden sm:inline">Self-host</a>
          <a
            href="https://github.com/OWNER/porthole"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 hover:text-zinc-100 transition-colors"
          >
            <GithubIcon /> GitHub
          </a>
        </div>
      </div>
    </nav>
  );
}

// ─── Hero ────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="pt-20 pb-16 px-6">
      <div className="mx-auto max-w-6xl">
        {/* Badge */}
        <div className="flex justify-center mb-8">
          <span className="badge border-emerald-800 text-emerald-400 bg-emerald-950/40">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Open source · Self-hosted · MIT license
          </span>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left — copy */}
          <div>
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-[1.05] mb-6">
              Your localhost,{' '}
              <span className="text-emerald-400">on the internet.</span>
            </h1>
            <p className="text-lg text-zinc-400 leading-relaxed mb-8 max-w-lg">
              porthole exposes your local server to the internet through a persistent WebSocket tunnel.
              No accounts, no paid plans, no third-party infrastructure — run your own server or use ours.
            </p>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 font-mono text-sm flex-1 min-w-0">
                <span className="text-emerald-400 shrink-0">$</span>
                <span className="text-zinc-100 truncate">npm install -g @porthole/cli</span>
              </div>
              <CopyButton text="npm install -g @porthole/cli" />
            </div>
            <p className="mt-3 text-xs text-zinc-500">
              Or:{' '}
              <code className="font-mono text-zinc-300">brew install porthole</code>
              {' '}· requires macOS
            </p>
          </div>

          {/* Right — terminal */}
          <Terminal />
        </div>
      </div>
    </section>
  );
}

function Terminal() {
  return (
    <div className="rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-2xl shadow-black/50">
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800 bg-zinc-900/60">
        <span className="w-3 h-3 rounded-full bg-red-500/70" />
        <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
        <span className="w-3 h-3 rounded-full bg-green-500/70" />
        <span className="ml-2 text-xs text-zinc-500 font-mono">zsh — porthole</span>
      </div>

      {/* Content */}
      <div className="p-5 font-mono text-sm leading-relaxed space-y-1">
        <p>
          <span className="text-zinc-500">$</span>{' '}
          <span className="text-zinc-100">porthole 3000 --subdomain staging</span>
        </p>
        <p className="text-zinc-500">&nbsp;</p>
        <p className="text-zinc-400 font-bold pl-2">porthole v1.0.0</p>
        <p className="text-zinc-500">&nbsp;</p>
        <p className="text-zinc-400 pl-2">Your public URL is:</p>
        <p className="text-zinc-500">&nbsp;</p>
        <p className="pl-2">
          <span className="text-emerald-400 font-semibold">https://staging.porthole.devbench.co.in</span>
        </p>
        <p className="text-zinc-500">&nbsp;</p>
        <p className="text-zinc-500 pl-2 text-xs">
          Forwarding → http://localhost:3000
        </p>
        <p className="text-zinc-500">&nbsp;</p>
        <TerminalRow method="GET"  path="/"                   status={200} ms={8}   />
        <TerminalRow method="POST" path="/api/auth/login"     status={200} ms={134} />
        <TerminalRow method="GET"  path="/api/users"          status={200} ms={22}  />
        <TerminalRow method="GET"  path="/static/bundle.js"   status={304} ms={3}   />
        <p>
          <span className="text-emerald-400">▌</span>
          <span className="animate-blink text-emerald-400">█</span>
        </p>
      </div>
    </div>
  );
}

function TerminalRow({ method, path, status, ms }: { method: string; path: string; status: number; ms: number }) {
  const sc = status < 400 ? 'text-emerald-400' : status < 500 ? 'text-yellow-400' : 'text-red-400';
  return (
    <p className="flex gap-3 pl-2 text-xs">
      <span className="text-cyan-400 w-5 shrink-0">{method.slice(0, 4)}</span>
      <span className="text-zinc-300 flex-1 truncate">{path}</span>
      <span className={`${sc} shrink-0`}>{status}</span>
      <span className="text-zinc-500 shrink-0 w-10 text-right">{ms}ms</span>
    </p>
  );
}

// ─── How it works ─────────────────────────────────────────────────────────────

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 px-6 border-t border-zinc-800/50">
      <div className="mx-auto max-w-6xl">
        <p className="section-label text-center">How it works</p>
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
          A tunnel in three steps
        </h2>
        <p className="text-zinc-400 text-center mb-16 max-w-xl mx-auto">
          porthole keeps a persistent WebSocket open from your machine to the server. HTTP requests
          for your subdomain travel down that socket and land on your local process.
        </p>

        {/* Architecture diagram */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-14 overflow-x-auto">
          <div className="flex items-center justify-center gap-3 font-mono text-sm min-w-max mx-auto">
            <DiagramBox label="Browser" sub="anywhere" color="zinc" />
            <Arrow label="HTTPS request" />
            <DiagramBox label="porthole server" sub="porthole.devbench.co.in" color="emerald" />
            <Arrow label="WebSocket" bidirectional />
            <DiagramBox label="porthole CLI" sub="your machine" color="sky" />
            <Arrow label="HTTP" />
            <DiagramBox label="localhost:3000" sub="your app" color="zinc" />
          </div>
        </div>

        {/* Steps */}
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            {
              n: '01',
              title: 'Install',
              body: 'Install the porthole CLI via npm or Homebrew. Requires Node 18+ (or use the standalone binary — no Node needed).',
              code: 'npm i -g @porthole/cli',
            },
            {
              n: '02',
              title: 'Connect',
              body: 'Run porthole with the port of your local server. The CLI opens a WebSocket to the porthole server and gets assigned a subdomain.',
              code: 'porthole 3000',
            },
            {
              n: '03',
              title: 'Share',
              body: 'Copy the public URL. Anyone on the internet can now hit your local server. Requests are tunnelled over the WebSocket in real time.',
              code: 'https://swift-fox-0042\n  .porthole.devbench.co.in',
            },
          ].map(({ n, title, body, code }) => (
            <div key={n} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <div className="text-4xl font-bold text-zinc-800 mb-4">{n}</div>
              <h3 className="text-lg font-semibold mb-2">{title}</h3>
              <p className="text-sm text-zinc-400 mb-4 leading-relaxed">{body}</p>
              <pre className="code-block text-xs text-emerald-300">{code}</pre>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DiagramBox({ label, sub, color }: { label: string; sub: string; color: string }) {
  const border = color === 'emerald' ? 'border-emerald-600 bg-emerald-950/30' :
                 color === 'sky' ? 'border-sky-700 bg-sky-950/30' :
                 'border-zinc-700 bg-zinc-900';
  const text = color === 'emerald' ? 'text-emerald-300' :
               color === 'sky' ? 'text-sky-300' : 'text-zinc-300';
  return (
    <div className={`border rounded-xl px-4 py-3 text-center ${border}`}>
      <p className={`font-mono text-xs font-semibold ${text}`}>{label}</p>
      <p className="text-zinc-500 text-xs mt-0.5">{sub}</p>
    </div>
  );
}

function Arrow({ label, bidirectional }: { label: string; bidirectional?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-zinc-600 text-xs">{label}</span>
      <span className="text-zinc-600">{bidirectional ? '←→' : '→'}</span>
    </div>
  );
}

// ─── Features ────────────────────────────────────────────────────────────────

function Features() {
  return (
    <section className="py-20 px-6 border-t border-zinc-800/50">
      <div className="mx-auto max-w-6xl">
        <p className="section-label text-center">Features</p>
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-14">
          Everything you need
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon, title, body }) => (
            <div key={title} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-colors">
              <div className="text-3xl mb-4">{icon}</div>
              <h3 className="font-semibold text-zinc-100 mb-2">{title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Quick start ─────────────────────────────────────────────────────────────

function QuickStart() {
  return (
    <section id="quick-start" className="py-20 px-6 border-t border-zinc-800/50">
      <div className="mx-auto max-w-6xl">
        <p className="section-label text-center">Quick start</p>
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-14">
          Up and running in 30 seconds
        </h2>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* npm */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-5">
              <NpmIcon />
              <span className="font-semibold text-zinc-200">via npm</span>
            </div>
            <CodeBlock label="Install globally" code="npm install -g @porthole/cli" />
            <CodeBlock label="Expose port 3000" code="porthole 3000" />
            <CodeBlock label="Custom subdomain + open browser" code="porthole 3000 --subdomain my-demo --open" />
            <CodeBlock label="Use a private server" code={`porthole 3000 \\\n  --server https://porthole.devbench.co.in \\\n  --token mysecret`} />
          </div>

          {/* brew */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-5">
              <BrewIcon />
              <span className="font-semibold text-zinc-200">via Homebrew (macOS)</span>
            </div>
            <CodeBlock label="Add tap" code="brew tap OWNER/porthole" />
            <CodeBlock label="Install" code="brew install porthole" />
            <CodeBlock label="Use" code="porthole 3000" />
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-400">
              <p className="text-zinc-300 font-medium mb-1">✓ No Node.js required</p>
              The Homebrew formula installs a self-contained binary bundled with the Node.js runtime.
              Works on Apple Silicon and Intel Macs.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Packages ────────────────────────────────────────────────────────────────

function Packages() {
  return (
    <section id="packages" className="py-20 px-6 border-t border-zinc-800/50">
      <div className="mx-auto max-w-6xl">
        <p className="section-label text-center">npm packages</p>
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
          Two packages, one tunnel
        </h2>
        <p className="text-zinc-400 text-center mb-14 max-w-xl mx-auto">
          porthole ships as a monorepo. The CLI is what you run locally;
          the server is what you deploy.
        </p>

        <div className="grid sm:grid-cols-2 gap-6">
          {/* CLI */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-7">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="font-mono text-sm text-emerald-400 mb-1">@porthole/cli</p>
                <h3 className="text-xl font-bold">The CLI tool</h3>
              </div>
              <span className="badge border-zinc-700 text-zinc-400 text-xs">v1.0.0</span>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed mb-6">
              The tunnel client you run on your machine. Connects to the porthole server over WebSocket,
              proxies requests to your local port, and streams responses back. Auto-reconnects on network failure.
            </p>
            <div className="space-y-2 mb-6">
              {['WebSocket tunnel client', 'Auto-reconnect + backoff', 'Request/response logging', 'Auth token support', '--open flag', 'Homebrew binary'].map(f => (
                <div key={f} className="flex items-center gap-2 text-sm text-zinc-300">
                  <span className="text-emerald-500">✓</span> {f}
                </div>
              ))}
            </div>
            <CodeBlock label="" code="npm install -g @porthole/cli" />
          </div>

          {/* Server */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-7">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="font-mono text-sm text-sky-400 mb-1">@porthole/server</p>
                <h3 className="text-xl font-bold">The tunnel server</h3>
              </div>
              <span className="badge border-zinc-700 text-zinc-400 text-xs">v1.0.0</span>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed mb-6">
              The always-on server that receives public HTTP traffic and tunnels it to registered CLI clients.
              Deploy it on Railway, Render, Fly.io, or any VPS. Needs wildcard DNS pointing to it.
            </p>
            <div className="space-y-2 mb-6">
              {['HTTP + WebSocket server', 'Wildcard subdomain routing', 'Heartbeat keep-alive', 'Body size limits', 'Auth token gating', 'Graceful shutdown'].map(f => (
                <div key={f} className="flex items-center gap-2 text-sm text-zinc-300">
                  <span className="text-sky-400">✓</span> {f}
                </div>
              ))}
            </div>
            <CodeBlock label="" code="npm install @porthole/server" />
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── CLI Reference ────────────────────────────────────────────────────────────

function CLIReference() {
  return (
    <section id="cli" className="py-20 px-6 border-t border-zinc-800/50">
      <div className="mx-auto max-w-6xl">
        <p className="section-label text-center">CLI reference</p>
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-14">
          All options
        </h2>

        <div className="overflow-x-auto rounded-2xl border border-zinc-800">
          <table className="w-full text-sm">
            <thead className="bg-zinc-900 border-b border-zinc-800">
              <tr>
                <th className="text-left px-5 py-3.5 text-zinc-400 font-medium">Flag</th>
                <th className="text-left px-5 py-3.5 text-zinc-400 font-medium">Description</th>
                <th className="text-left px-5 py-3.5 text-zinc-400 font-medium hidden sm:table-cell">Default</th>
              </tr>
            </thead>
            <tbody className="bg-zinc-950 divide-y divide-zinc-800/50">
              {CLI_OPTIONS.map(({ flag, desc, default: def }) => (
                <tr key={flag} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-emerald-300 whitespace-nowrap">{flag}</td>
                  <td className="px-5 py-3.5 text-zinc-300">{desc}</td>
                  <td className="px-5 py-3.5 text-zinc-500 font-mono text-xs hidden sm:table-cell">{def}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

// ─── Self-host ────────────────────────────────────────────────────────────────

function SelfHost() {
  return (
    <section id="self-host" className="py-20 px-6 border-t border-zinc-800/50">
      <div className="mx-auto max-w-6xl">
        <p className="section-label text-center">Self-host</p>
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
          Run your own server
        </h2>
        <p className="text-zinc-400 text-center mb-14 max-w-xl mx-auto">
          porthole is fully self-hostable. The tunnel server runs on any platform that
          supports persistent Node.js processes. Vercel is for the landing page only
          — the tunnel server needs an always-on host like Railway, Render, or Fly.io.
        </p>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Left: deploy steps */}
          <div className="space-y-6">
            <h3 className="font-semibold text-zinc-200 text-lg">Deploy the tunnel server</h3>

            <Step n={1} title="Clone the repo">
              <CodeBlock label="" code="git clone https://github.com/OWNER/porthole" />
            </Step>

            <Step n={2} title="Deploy packages/server to Railway or Render">
              <p className="text-sm text-zinc-400 mb-3">
                On Railway: <span className="font-mono text-zinc-300">railway up</span>. On Render: connect the repo
                and set Root Directory to <span className="font-mono text-zinc-300">packages/server</span>.
              </p>
            </Step>

            <Step n={3} title="Configure wildcard DNS">
              <div className="code-block text-xs space-y-1">
                <p className="text-zinc-500"># DNS records for porthole.devbench.co.in</p>
                <p>
                  <span className="text-zinc-400">porthole.devbench.co.in</span>
                  {'  '}
                  <span className="text-sky-400">CNAME</span>
                  {'  '}
                  <span className="text-emerald-300">cname.vercel-dns.com</span>
                  {'  '}
                  <span className="text-zinc-500"># landing page</span>
                </p>
                <p>
                  <span className="text-zinc-400">*.porthole.devbench.co.in</span>
                  {'  '}
                  <span className="text-sky-400">A</span>
                  {'  '}
                  <span className="text-emerald-300">YOUR_SERVER_IP</span>
                  {'  '}
                  <span className="text-zinc-500"># tunnel server</span>
                </p>
              </div>
            </Step>

            <Step n={4} title="Connect your CLI to your own server">
              <CodeBlock label="" code={`porthole 3000 \\\n  --server https://porthole.devbench.co.in`} />
            </Step>
          </div>

          {/* Right: env vars */}
          <div>
            <h3 className="font-semibold text-zinc-200 text-lg mb-6">Environment variables</h3>
            <div className="overflow-hidden rounded-2xl border border-zinc-800">
              <table className="w-full text-sm">
                <thead className="bg-zinc-900 border-b border-zinc-800">
                  <tr>
                    <th className="text-left px-4 py-3 text-zinc-400 font-medium">Variable</th>
                    <th className="text-left px-4 py-3 text-zinc-400 font-medium hidden sm:table-cell">Default</th>
                  </tr>
                </thead>
                <tbody className="bg-zinc-950 divide-y divide-zinc-800/50">
                  {ENV_VARS.map(({ name, desc, default: def }) => (
                    <tr key={name}>
                      <td className="px-4 py-3">
                        <p className="font-mono text-emerald-300 text-xs mb-0.5">{name}</p>
                        <p className="text-zinc-400 text-xs">{desc}</p>
                      </td>
                      <td className="px-4 py-3 font-mono text-zinc-500 text-xs hidden sm:table-cell">{def}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 bg-amber-950/30 border border-amber-800/50 rounded-xl p-4 text-sm text-amber-300">
              <p className="font-semibold mb-1">⚠️ Vercel limitation</p>
              <p className="text-amber-400/80 text-xs leading-relaxed">
                The tunnel server requires persistent WebSocket connections — Vercel functions time out after
                10–300s. Deploy the server on Railway, Render, or a VPS. Only this landing page runs on Vercel.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ──────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t border-zinc-800/50 py-12 px-6">
      <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
        <div className="flex items-center gap-2">
          <span className="text-base">🕳</span>
          <span className="font-semibold text-zinc-400">porthole</span>
          <span>·</span>
          <span>MIT license</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="https://github.com/OWNER/porthole" target="_blank" rel="noreferrer" className="hover:text-zinc-300 transition-colors">
            GitHub
          </a>
          <a href="https://www.npmjs.com/package/@porthole/cli" target="_blank" rel="noreferrer" className="hover:text-zinc-300 transition-colors">
            npm
          </a>
          <a href="https://github.com/OWNER/porthole/issues" target="_blank" rel="noreferrer" className="hover:text-zinc-300 transition-colors">
            Issues
          </a>
        </div>
      </div>
    </footer>
  );
}

// ─── Shared components ───────────────────────────────────────────────────────

function CodeBlock({ label, code }: { label: string; code: string }) {
  return (
    <div>
      {label && <p className="text-xs text-zinc-500 mb-1.5">{label}</p>}
      <div className="relative group">
        <pre className="code-block text-xs text-zinc-200 pr-16">{code}</pre>
        <div className="absolute top-2.5 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <CopyButton text={code.replace(/\\\n\s+/g, ' ')} />
        </div>
      </div>
    </div>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 text-xs font-bold mt-0.5">
        {n}
      </div>
      <div className="flex-1">
        <h4 className="font-medium text-zinc-200 mb-2">{title}</h4>
        {children}
      </div>
    </div>
  );
}

// ─── Icons ───────────────────────────────────────────────────────────────────

function GithubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function NpmIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#cb3837">
      <path d="M1.763 0C.786 0 0 .786 0 1.763v20.474C0 23.214.786 24 1.763 24h20.474c.977 0 1.763-.786 1.763-1.763V1.763C24 .786 23.214 0 22.237 0zM5.13 5.323l13.837.019-.009 13.568h-3.84V8.868h-3.82v10.024H5.113z" />
    </svg>
  );
}

function BrewIcon() {
  return (
    <span className="text-xl">🍺</span>
  );
}
