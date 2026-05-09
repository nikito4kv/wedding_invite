import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { promises as fs } from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import process from 'node:process';
import * as chromeLauncher from 'chrome-launcher';
import lighthouse from 'lighthouse';

const require = createRequire(import.meta.url);

const HOST = '127.0.0.1';
const START_PORT = 3101;
const SERVER_READY_TIMEOUT_MS = 60_000;
const POLL_INTERVAL_MS = 500;
const THRESHOLDS = {
  performance: 90,
  accessibility: 95,
  'best-practices': 95
};

const nextBinPath = require.resolve('next/dist/bin/next');

const evidenceDirectory = path.join(process.cwd(), '.sisyphus', 'evidence');
const jsonReportPath = path.join(evidenceDirectory, 'task-11-lighthouse.json');
const htmlReportPath = path.join(evidenceDirectory, 'task-11-lighthouse.html');

const delay = (timeoutMs) => new Promise((resolve) => {
  setTimeout(resolve, timeoutMs);
});

const normalizeReport = (report) => {
  if (typeof report === 'string') {
    return { html: null, json: report };
  }

  const [json, html] = report;
  return { html, json };
};

const readCategoryScore = (lhr, category) => {
  return Math.round((lhr.categories[category]?.score ?? 0) * 100);
};

const findAvailablePort = async (port) => {
  return new Promise((resolve, reject) => {
    const server = net.createServer();

    server.once('error', (error) => {
      if (error instanceof Error && 'code' in error && error.code === 'EADDRINUSE') {
        resolve(findAvailablePort(port + 1));
        return;
      }

      reject(error);
    });

    server.listen(port, HOST, () => {
      const address = server.address();

      server.close((closeError) => {
        if (closeError) {
          reject(closeError);
          return;
        }

        if (!address || typeof address === 'string') {
          reject(new Error('Could not determine a free local port for Lighthouse.'));
          return;
        }

        resolve(address.port);
      });
    });
  });
};

const runNextBuild = async () => {
  return new Promise((resolve, reject) => {
    const buildProcess = spawn(process.execPath, [nextBinPath, 'build'], {
      cwd: process.cwd(),
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let output = '';

    const collectOutput = (chunk) => {
      output += chunk.toString();
    };

    buildProcess.stdout.on('data', collectOutput);
    buildProcess.stderr.on('data', collectOutput);
    buildProcess.once('error', reject);
    buildProcess.once('exit', (exitCode) => {
      if (exitCode === 0) {
        resolve();
        return;
      }

      reject(new Error(`Failed to build the production app for Lighthouse.\n${output.trim()}`.trim()));
    });
  });
};

const startNextProductionServer = (port) => {
  const serverProcess = spawn(process.execPath, [nextBinPath, 'start', '-p', String(port), '-H', HOST], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      NODE_ENV: 'production'
    },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  let output = '';

  const collectOutput = (chunk) => {
    output += chunk.toString();
  };

  serverProcess.stdout.on('data', collectOutput);
  serverProcess.stderr.on('data', collectOutput);

  return { output: () => output.trim(), serverProcess };
};

const waitForServer = async (url, serverProcess, getOutput) => {
  const startTime = Date.now();

  while (Date.now() - startTime < SERVER_READY_TIMEOUT_MS) {
    if (serverProcess.exitCode !== null) {
      throw new Error(`Production server exited before Lighthouse could connect.\n${getOutput()}`.trim());
    }

    try {
      const response = await fetch(url, { redirect: 'manual' });

      if (response.ok || response.status === 307 || response.status === 308) {
        return;
      }
    } catch {
      // Keep polling until timeout.
    }

    await delay(POLL_INTERVAL_MS);
  }

  throw new Error(`Timed out waiting for the production server at ${url}.\n${getOutput()}`.trim());
};

let chrome;
let serverProcess;

try {
  await fs.mkdir(evidenceDirectory, { recursive: true });
  console.log('Building production app for Lighthouse...');
  await runNextBuild();

  const port = await findAvailablePort(START_PORT);
  const baseUrl = `http://${HOST}:${port}`;
  const server = startNextProductionServer(port);

  serverProcess = server.serverProcess;

  await waitForServer(baseUrl, serverProcess, server.output);

  chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu']
  });

  const runnerResult = await lighthouse(baseUrl, {
    logLevel: 'error',
    onlyCategories: Object.keys(THRESHOLDS),
    output: ['json', 'html'],
    port: chrome.port
  });

  if (!runnerResult) {
    throw new Error('Lighthouse did not return a result.');
  }

  const { html, json } = normalizeReport(runnerResult.report);

  await fs.writeFile(jsonReportPath, json, 'utf8');

  if (html) {
    await fs.writeFile(htmlReportPath, html, 'utf8');
  }

  const failedCategories = Object.entries(THRESHOLDS).flatMap(([category, minimum]) => {
    const score = readCategoryScore(runnerResult.lhr, category);

    return score >= minimum ? [] : [`${category}: ${score} < ${minimum}`];
  });

  const summary = Object.keys(THRESHOLDS)
    .map((category) => `${category}=${readCategoryScore(runnerResult.lhr, category)}`)
    .join(', ');

  console.log(`Lighthouse scores for ${runnerResult.lhr.finalDisplayedUrl}: ${summary}`);
  console.log(`Saved JSON report to ${jsonReportPath}`);

  if (html) {
    console.log(`Saved HTML report to ${htmlReportPath}`);
  }

  if (failedCategories.length > 0) {
    throw new Error(`Lighthouse thresholds failed: ${failedCategories.join('; ')}`);
  }
} finally {
  chrome?.kill();

  if (serverProcess && serverProcess.exitCode === null) {
    serverProcess.kill('SIGTERM');
    await new Promise((resolve) => {
      serverProcess.once('exit', () => {
        resolve();
      });
    });
  }
}
