import { spawn, type ChildProcess } from 'node:child_process';

export interface AppServer {
  url: string;
  /** Stops the server and starts it again on the same database file, as a reboot would. */
  restart: () => Promise<void>;
  stop: () => Promise<void>;
}

async function isUp(url: string): Promise<boolean> {
  try {
    const response = await fetch(`${url}/settings`);
    return response.ok;
  } catch {
    return false;
  }
}

async function waitFor(check: () => Promise<boolean>, what: string, timeoutMs = 90_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await check()) return;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Timed out waiting for ${what}`);
}

/**
 * Runs `pnpm start` (so the migrations run first, exactly as in production) on its own port and
 * its own database file. The production build already exists: the webServer of the Playwright
 * config built it. A test that has to restart the server cannot use that shared one.
 */
export async function startAppServer({
  port,
  dbPath,
}: {
  port: number;
  dbPath: string;
}): Promise<AppServer> {
  const url = `http://localhost:${port}`;
  let child: ChildProcess | null = null;
  const output: string[] = [];

  async function start() {
    const process_ = spawn('pnpm', ['start'], {
      env: { ...process.env, PORT: String(port), ARCANA_DB_PATH: dbPath },
      // Its own process group, so stopping it also stops the `next start` it spawns.
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    child = process_;
    process_.stdout?.on('data', (chunk: Buffer) => output.push(chunk.toString()));
    process_.stderr?.on('data', (chunk: Buffer) => output.push(chunk.toString()));
    try {
      await waitFor(() => isUp(url), `the app on ${url}`);
    } catch (error) {
      throw new Error(`${String(error)}\n${output.join('').slice(-2000)}`);
    }
  }

  async function stop() {
    const running = child;
    if (!running?.pid) return;
    child = null;
    const exited = new Promise<void>((resolve) => running.once('exit', () => resolve()));
    try {
      process.kill(-running.pid, 'SIGTERM');
    } catch {
      // Already gone.
    }
    await exited;
    await waitFor(async () => !(await isUp(url)), `the app on ${url} to stop`, 15_000);
  }

  await start();
  return {
    url,
    stop,
    async restart() {
      await stop();
      await start();
    },
  };
}
