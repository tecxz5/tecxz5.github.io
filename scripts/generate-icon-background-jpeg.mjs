import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { chromium } from 'playwright';

const DEFAULTS = {
  width: 2000,
  height: 2000,
  bg: '#000000',
  fg: '#ffffff',
  opacity: 0.3,
  cell: 36,
  fontSize: 36,
  angle: -15,
  seed: Date.now(),
  quality: 92,
  output: 'site/sources/pictures/site/generated-bg.jpeg'
};

function parseArgs(argv) {
  const args = { ...DEFAULTS };
  for (let i = 2; i < argv.length; i++) {
    const key = argv[i];
    const value = argv[i + 1];
    if (!key.startsWith('--') || value === undefined) continue;
    i++;
    switch (key) {
      case '--out': args.output = value; break;
      case '--w': args.width = Number(value); break;
      case '--h': args.height = Number(value); break;
      case '--bg': args.bg = value; break;
      case '--fg': args.fg = value; break;
      case '--opacity': args.opacity = Number(value); break;
      case '--cell': args.cell = Number(value); break;
      case '--fontSize': args.fontSize = Number(value); break;
      case '--angle': args.angle = Number(value); break;
      case '--seed': args.seed = Number(value); break;
      case '--quality': args.quality = Number(value); break;
      default: break;
    }
  }
  return args;
}

function buildHtml(args) {
  const fallbackIcon = 'apps';
  const icons = [
    'grid_view', 'memory', 'cpu', 'router', 'dns', 'settings', 'code', 'terminal',
    'data_object', 'webhook', 'link', 'lock', 'security', 'fingerprint', 'verified_user',
    'visibility', 'language', 'schedule', 'build', 'extension', 'dashboard', 'api',
    'cloud', 'storage', 'public', 'domain', 'hub', 'analytics', 'monitoring', 'dataset',
    'devices', 'computer', 'laptop', 'phone_android', 'wifi', 'bluetooth', 'shield',
    'bolt', 'bug_report', 'engineering', 'smart_toy', 'science', 'rocket_launch',
    'precision_manufacturing', 'model_training', 'insights', 'query_stats', 'troubleshoot',
    'lan', 'device_hub', 'schema', 'token', 'key', 'vpn_key', 'admin_panel_settings',
    'gpp_good', 'fact_check', 'cloud_done', 'cloud_sync', 'cloud_queue', 'backup', 'sync',
    'http', 'travel_explore', 'explore', 'code_blocks', 'polyline', 'account_tree',
    'fork_right', 'join_full', 'build_circle', 'widgets', 'apps', 'tune', 'auto_awesome',
    'flare', 'stars', 'lightbulb', 'psychology', 'assistant', 'robot_2', 'neurology',
    'biotech', 'psychology_alt', 'tips_and_updates', 'emoji_objects', 'architecture',
    'construction', 'handyman', 'design_services', 'brush', 'palette', 'format_paint',
    'draw', 'edit', 'edit_note', 'developer_mode', 'data_thresholding', 'settings_ethernet',
    'settings_input_antenna', 'settings_remote', 'settings_suggest', 'settings_applications'
  ];

  const cfg = JSON.stringify({
    ...args,
    icons
  });

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
  <style>
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      background: #000;
      overflow: hidden;
    }
    #wrap {
      width: 100%;
      height: 100%;
      display: grid;
      place-items: center;
      background: var(--bg);
    }
    canvas { display: block; }
  </style>
</head>
<body>
  <div id="wrap"><canvas id="c"></canvas></div>
  <script>
    const cfg = ${cfg};

    function mulberry32(seed) {
      let t = seed >>> 0;
      return function() {
        t += 0x6d2b79f5;
        let r = Math.imul(t ^ (t >>> 15), 1 | t);
        r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
        return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
      };
    }

    function pickIcon(rand, icons, left, top) {
      for (let i = 0; i < 24; i++) {
        const candidate = icons[Math.floor(rand() * icons.length)];
        if (candidate !== left && candidate !== top) return candidate;
      }
      return icons[Math.floor(rand() * icons.length)];
    }

    function iconLooksValid(measureCtx, iconName, cell) {
      // Invalid ligatures render as plain words and become too wide.
      const width = measureCtx.measureText(iconName).width;
      return width > 0 && width <= cell * 1.2;
    }

    (async () => {
      const canvas = document.getElementById('c');
      const ctx = canvas.getContext('2d');
      const { width, height, bg, fg, opacity, cell, fontSize, angle, icons, seed } = cfg;
      canvas.width = width;
      canvas.height = height;
      document.documentElement.style.setProperty('--bg', bg);

      await document.fonts.load(fontSize + 'px "Material Icons"');
      await document.fonts.ready;

      const measureCanvas = document.createElement('canvas');
      measureCanvas.width = cell * 2;
      measureCanvas.height = cell * 2;
      const measureCtx = measureCanvas.getContext('2d');
      measureCtx.font = fontSize + 'px "Material Icons"';

      const validIcons = icons.filter((icon) => iconLooksValid(measureCtx, icon, cell));
      const iconPool = validIcons.length > 0 ? validIcons : [${JSON.stringify(fallbackIcon)}];

      const rand = mulberry32(seed);
      const diag = Math.hypot(width, height);
      const cols = Math.ceil(diag / cell) + 8;
      const rows = Math.ceil(diag / cell) + 8;
      const grid = Array.from({ length: rows }, () => Array(cols).fill(''));

      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.rotate((angle * Math.PI) / 180);
      ctx.translate(-diag / 2, -diag / 2);

      ctx.font = fontSize + 'px "Material Icons"';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = fg;
      ctx.globalAlpha = opacity;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const left = c > 0 ? grid[r][c - 1] : '';
          const top = r > 0 ? grid[r - 1][c] : '';
          const icon = pickIcon(rand, iconPool, left, top);
          grid[r][c] = icon;
          const x = c * cell + cell / 2;
          const y = r * cell + cell / 2;
          ctx.fillText(icon, x, y);
        }
      }

      ctx.restore();
      window.__DONE__ = true;
    })();
  </script>
</body>
</html>`;
}

async function run() {
  const args = parseArgs(process.argv);
  const html = buildHtml(args);
  const tempFile = path.join(os.tmpdir(), `bg-gen-${Date.now()}.html`);
  fs.writeFileSync(tempFile, html, 'utf8');

  const outPath = path.resolve(process.cwd(), args.output);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });

  let browser;
  try {
    browser = await chromium.launch({ headless: true, channel: process.platform === 'win32' ? 'msedge' : undefined });
    const page = await browser.newPage({ viewport: { width: args.width, height: args.height } });
    await page.goto(`file:///${tempFile.replace(/\\/g, '/')}`, { waitUntil: 'load' });
    await page.waitForFunction(() => window.__DONE__ === true, { timeout: 15000 });
    await page.screenshot({ path: outPath, type: 'jpeg', quality: args.quality });
    process.stdout.write(`Generated: ${outPath}\n`);
  } finally {
    if (browser) await browser.close();
    if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
  }
}

run().catch((err) => {
  console.error(err.message);
  console.error('Hint: if browser launch fails, run `npx playwright install chromium` once.');
  process.exit(1);
});
