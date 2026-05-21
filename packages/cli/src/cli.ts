#!/usr/bin/env node
import { execSync } from 'child_process';
import { Command } from 'commander';
import chalk from 'chalk';
import { Tunnel, RequestEvent } from './Tunnel';

const program = new Command();

program
  .name('porthole')
  .description('Expose your local server to the internet')
  .version('1.0.0')
  .argument('<port>', 'Local port to expose')
  .option('-s, --subdomain <name>', 'Request a specific subdomain')
  .option('--server <url>', 'Porthole server URL', 'http://localhost:3000')
  .option('--local-host <host>', 'Local hostname to forward to', 'localhost')
  .option('--token <token>', 'Auth token (if the server requires one)')
  .option('--open', 'Open the tunnel URL in your browser after connecting')
  .option('--print-requests', 'Print forwarded request/response lines')
  .action(async (portArg: string, opts: {
    subdomain?: string;
    server: string;
    localHost: string;
    token?: string;
    open: boolean;
    printRequests: boolean;
  }) => {
    const localPort = parseInt(portArg, 10);
    if (isNaN(localPort) || localPort < 1 || localPort > 65535) {
      console.error(chalk.red(`  Invalid port: ${portArg}`));
      process.exit(1);
    }

    console.log(chalk.bold('\n  porthole\n'));

    let reconnectDelay = 1_000;
    let running = true;

    const connect = async (): Promise<void> => {
      const tunnel = new Tunnel({
        serverUrl: opts.server,
        localPort,
        localHost: opts.localHost,
        subdomain: opts.subdomain,
        token: opts.token,
      });

      if (opts.printRequests) {
        tunnel.on('request', ({ method, path, status, duration }: RequestEvent) => {
          const sc = status < 400 ? chalk.green : status < 500 ? chalk.yellow : chalk.red;
          const m = chalk.cyan(method.padEnd(7));
          const p = path.length > 55 ? path.slice(0, 52) + '…' : path.padEnd(55);
          console.log(`  ${m} ${p} ${sc(String(status).padStart(3))}  ${chalk.gray(duration + 'ms')}`);
        });
      }

      tunnel.on('error', (err: Error) => {
        console.error(chalk.red(`  Error: ${err.message}`));
      });

      tunnel.on('close', async () => {
        if (!running) return;
        console.log(chalk.yellow(`\n  Tunnel closed — reconnecting in ${reconnectDelay / 1000}s…\n`));
        await delay(reconnectDelay);
        reconnectDelay = Math.min(reconnectDelay * 2, 30_000);
        connect().catch(() => {}); // retry
      });

      try {
        const url = await tunnel.open();
        reconnectDelay = 1_000; // reset on successful connect

        console.log(`  Your public URL is:\n`);
        console.log(`  ${chalk.bold(chalk.green(url))}\n`);
        console.log(
          `  ${chalk.gray('Forwarding')}  ${chalk.green(url)}  ${chalk.gray('→')}  ` +
          `${chalk.cyan(`http://${opts.localHost}:${localPort}`)}\n`,
        );

        if (opts.open) openInBrowser(url);
        if (opts.printRequests) {
          console.log(chalk.gray(`  ${'METHOD'.padEnd(8)}${'PATH'.padEnd(56)}STATUS  TIME`));
          console.log(chalk.gray(`  ${'─'.repeat(80)}\n`));
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        if (!running) return;
        console.error(chalk.red(`  Connection failed: ${message}`));
        console.log(chalk.yellow(`  Retrying in ${reconnectDelay / 1000}s…\n`));
        await delay(reconnectDelay);
        reconnectDelay = Math.min(reconnectDelay * 2, 30_000);
        connect().catch(() => {});
      }
    };

    process.on('SIGINT', () => {
      running = false;
      console.log(chalk.yellow('\n  Closing…\n'));
      process.exit(0);
    });

    await connect();
  });

program.parse(process.argv);

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function openInBrowser(url: string): void {
  try {
    const cmd =
      process.platform === 'darwin' ? `open "${url}"` :
      process.platform === 'win32'  ? `start "" "${url}"` :
                                      `xdg-open "${url}"`;
    execSync(cmd, { stdio: 'ignore' });
  } catch { /* non-fatal */ }
}
