import { mkdir, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';

const serverUrl = process.env.CAPACITOR_SERVER_URL;
if (!serverUrl) {
  console.error('Set CAPACITOR_SERVER_URL to your live HTTPS website before syncing the apps.');
  process.exit(1);
}
const parsedUrl = new URL(serverUrl);
if (parsedUrl.protocol !== 'https:' || parsedUrl.username || parsedUrl.password) {
  throw new Error('Use an HTTPS deployment URL without credentials.');
}

await mkdir('mobile-web', { recursive: true });
await writeFile('mobile-web/index.html', `<!doctype html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><title>Raagam</title>
<style>body{font-family:system-ui;background:#f0eae2;color:#2a1511;min-height:90vh;display:grid;place-content:center;text-align:center;padding:24px}a{color:#b8432c}</style></head>
<body><h1>Raagam</h1><p>Connect to the internet to explore ragas.</p><a id="open">Open Raagam</a>
<script>const url=${JSON.stringify(parsedUrl.origin)};document.getElementById('open').href=url;location.replace(url);</script></body></html>`);

const result = spawnSync('npx', ['cap', 'sync', ...process.argv.slice(2)], {
  stdio: 'inherit', env: process.env,
});
process.exit(result.status ?? 1);
