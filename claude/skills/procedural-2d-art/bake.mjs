#!/usr/bin/env node
// Bakes renders of demo.html to PNG files with headless Chromium (Playwright).
//   node bake.mjs <out-dir> "<query>" ["<query>" ...]
//   node bake.mjs shots "view=iso&look=dusk&seed=3" "only=tower&look=winter"
// Each query writes <name>.png at the art's own size and <name>@3x.png scaled
// up three times with hard pixels. Exits 1 when a render fails (its message
// is printed), 2 on bad arguments.
// Measured: about 3 s for six 640x360 scenes and four sprites (cloud container,
// headless Chromium, 27 Nov 2026).
// A project copies this and points it at its own page (the same contract:
// window.artDone or window.artError, one <canvas>).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const { chromium } = createRequire(import.meta.url)('playwright'); // require() also finds a global install
const here = path.dirname(fileURLToPath(import.meta.url));
const [out, ...queries] = process.argv.slice(2);
if (!out || !queries.length) { console.error('usage: node bake.mjs <out-dir> "<query>" ["<query>" ...]'); process.exit(2); }

// modules do not load from file://, so serve this folder on localhost only
const types = { '.html': 'text/html', '.js': 'text/javascript' };
const server = http.createServer((req, res) => {
  const file = path.join(here, path.normalize(decodeURIComponent(new URL(req.url, 'http://localhost').pathname)));
  if (!file.startsWith(here + path.sep) || !types[path.extname(file)] || !fs.existsSync(file)) return res.writeHead(404).end();
  res.writeHead(200, { 'content-type': types[path.extname(file)] });
  fs.createReadStream(file).pipe(res);
});
await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
const base = `http://127.0.0.1:${server.address().port}/demo.html`;

let failed = 0;
const browser = await chromium.launch();
try {
  fs.mkdirSync(out, { recursive: true });
  const page = await browser.newPage();
  for (const query of queries) {
    const name = query.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'default';
    await page.goto(`${base}?still&${query}`);
    await page.waitForFunction(() => window.artDone || window.artError, null, { timeout: 60000 });
    const error = await page.evaluate(() => window.artError);
    if (error) { console.error(`${name}: ${error}`); failed++; continue; }
    const [small, big, stats] = await page.evaluate(() => {
      const c = document.querySelector('canvas'), b = document.createElement('canvas');
      b.width = c.width * 3; b.height = c.height * 3;
      const ctx = b.getContext('2d'); ctx.imageSmoothingEnabled = false; ctx.drawImage(c, 0, 0, b.width, b.height);
      return [c.toDataURL(), b.toDataURL(), window.artStats];
    });
    for (const [file, url] of [[`${name}.png`, small], [`${name}@3x.png`, big]]) fs.writeFileSync(path.join(out, file), Buffer.from(url.split(',')[1], 'base64'));
    console.log(`${name}: ${stats.faces} faces, ${stats.lights} lights, drawn in ${stats.ms} ms`);
  }
} finally {
  await browser.close();
  server.close();
}
process.exit(failed ? 1 : 0);
