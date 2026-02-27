const DOWNLOAD_ID = 'download-bg-jpeg';

const CONFIG = {
  width: 2000,
  height: 2000,
  bg: '#000000',
  fg: '#ffffff',
  opacity: 0.3,
  cell: 36,
  fontSize: 36,
  angle: -15,
  quality: 0.92
};
const RENDER_BATCH_ROWS = 6;

const ICONS = [
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

function mulberry32(seed) {
  let t = seed >>> 0;
  return function rand() {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function pickIcon(rand, pool, left, top) {
  for (let i = 0; i < 24; i++) {
    const icon = pool[Math.floor(rand() * pool.length)];
    if (icon !== left && icon !== top) return icon;
  }
  return pool[Math.floor(rand() * pool.length)];
}

function iconLooksValid(measureCtx, iconName, cell) {
  const width = measureCtx.measureText(iconName).width;
  return width > 0 && width <= cell * 1.2;
}

let iconPoolPromise = null;

async function getValidIconPool() {
  if (iconPoolPromise) {
    return iconPoolPromise;
  }

  iconPoolPromise = (async () => {
    await document.fonts.load(`${CONFIG.fontSize}px "Material Icons"`);
    await document.fonts.ready;

    const measureCanvas = document.createElement('canvas');
    const measureCtx = measureCanvas.getContext('2d');
    measureCtx.font = `${CONFIG.fontSize}px "Material Icons"`;
    const validIcons = ICONS.filter((icon) => iconLooksValid(measureCtx, icon, CONFIG.cell));
    return validIcons.length ? validIcons : ['apps'];
  })();

  return iconPoolPromise;
}

function nextFrame() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => resolve());
  });
}

async function generateBackgroundJpeg() {
  const iconPool = await getValidIconPool();

  const canvas = document.createElement('canvas');
  canvas.width = CONFIG.width;
  canvas.height = CONFIG.height;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = CONFIG.bg;
  ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);

  const diag = Math.hypot(CONFIG.width, CONFIG.height);
  const cols = Math.ceil(diag / CONFIG.cell) + 8;
  const rows = Math.ceil(diag / CONFIG.cell) + 8;
  const grid = Array.from({ length: rows }, () => Array(cols).fill(''));

  ctx.save();
  ctx.translate(CONFIG.width / 2, CONFIG.height / 2);
  ctx.rotate((CONFIG.angle * Math.PI) / 180);
  ctx.translate(-diag / 2, -diag / 2);
  ctx.font = `${CONFIG.fontSize}px "Material Icons"`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = CONFIG.fg;
  ctx.globalAlpha = CONFIG.opacity;

  const rand = mulberry32(Date.now());
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const left = c > 0 ? grid[r][c - 1] : '';
      const top = r > 0 ? grid[r - 1][c] : '';
      const icon = pickIcon(rand, iconPool, left, top);
      grid[r][c] = icon;
      const x = c * CONFIG.cell + CONFIG.cell / 2;
      const y = r * CONFIG.cell + CONFIG.cell / 2;
      ctx.fillText(icon, x, y);
    }

    if (r % RENDER_BATCH_ROWS === 0) {
      await nextFrame();
    }
  }
  ctx.restore();

  const blob = await new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b), 'image/jpeg', CONFIG.quality);
  });

  if (!blob) {
    throw new Error('JPEG generation failed');
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `generated-bg-${Date.now()}.jpeg`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function initBackgroundDownloader() {
  const link = document.getElementById(DOWNLOAD_ID);
  if (!link) return;

  link.addEventListener('click', async (event) => {
    event.preventDefault();
    const original = link.textContent;
    link.textContent = 'Генерация...';
    link.style.pointerEvents = 'none';
    try {
      await generateBackgroundJpeg();
      link.textContent = 'Скачать еще';
    } catch (error) {
      console.error(error);
      link.textContent = 'Ошибка генерации';
    } finally {
      link.style.pointerEvents = '';
      setTimeout(() => {
        link.textContent = original;
      }, 2000);
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBackgroundDownloader, { once: true });
} else {
  initBackgroundDownloader();
}
