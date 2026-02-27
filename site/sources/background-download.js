const DOWNLOAD_ID = 'download-bg-jpeg';
const FORM_ID = 'bg-generator-form';

const DEFAULT_CONFIG = {
  width: 2000,
  height: 2000,
  bg: '#000000',
  fg: '#ffffff',
  opacity: 0.3,
  cell: 36,
  fontSize: 36,
  angle: -15,
  quality: 1,
  seed: Date.now()
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

let currentConfig = { ...DEFAULT_CONFIG };

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalizeHex(value, fallback) {
  if (typeof value !== 'string') return fallback;
  let v = value.trim();
  if (!v) return fallback;
  if (!v.startsWith('#')) v = `#${v}`;
  if (!/^#[0-9a-fA-F]{6}$/.test(v)) return fallback;
  return v.toLowerCase();
}

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

function iconLooksValid(measureCtx, iconName, fontSize) {
  const width = measureCtx.measureText(iconName).width;
  return width > 0 && width <= fontSize * 1.25;
}

function readConfigFromForm() {
  const form = document.getElementById(FORM_ID);
  if (!form) {
    currentConfig = { ...DEFAULT_CONFIG, seed: Date.now() };
    return currentConfig;
  }

  const num = (id, fallback) => {
    const input = form.querySelector(`#${id}`);
    if (!input) return fallback;
    const parsed = Number(input.value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  const text = (id, fallback) => {
    const input = form.querySelector(`#${id}`);
    return input && input.value ? input.value : fallback;
  };

  const seedRaw = num('bg-seed', NaN);

  currentConfig = {
    width: clamp(Math.round(num('bg-width', DEFAULT_CONFIG.width)), 512, 5000),
    height: clamp(Math.round(num('bg-height', DEFAULT_CONFIG.height)), 512, 5000),
    bg: normalizeHex(text('bg-color', DEFAULT_CONFIG.bg), DEFAULT_CONFIG.bg),
    fg: normalizeHex(text('fg-color', DEFAULT_CONFIG.fg), DEFAULT_CONFIG.fg),
    opacity: clamp(num('bg-opacity', DEFAULT_CONFIG.opacity), 0.05, 1),
    cell: clamp(Math.round(num('bg-cell', DEFAULT_CONFIG.cell)), 16, 96),
    fontSize: clamp(Math.round(num('bg-cell', DEFAULT_CONFIG.fontSize)), 16, 96),
    angle: clamp(num('bg-angle', DEFAULT_CONFIG.angle), -90, 90),
    quality: DEFAULT_CONFIG.quality,
    seed: Number.isFinite(seedRaw) && seedRaw > 0 ? Math.floor(seedRaw) : Date.now()
  };

  return currentConfig;
}

function syncSwatchState(control, color) {
  const swatches = control.querySelectorAll('.swatch');
  swatches.forEach((swatch) => {
    if (!(swatch instanceof HTMLButtonElement)) return;
    const isActive = swatch.dataset.color?.toLowerCase() === color.toLowerCase();
    swatch.classList.toggle('active', isActive);
  });
}

function initColorControls() {
  const controls = document.querySelectorAll('.color-control');
  controls.forEach((control) => {
    if (!(control instanceof HTMLElement)) return;
    const targetId = control.dataset.target;
    if (!targetId) return;
    const input = document.getElementById(targetId);
    if (!(input instanceof HTMLInputElement)) return;

    input.value = normalizeHex(input.value, targetId === 'bg-color' ? DEFAULT_CONFIG.bg : DEFAULT_CONFIG.fg);
    syncSwatchState(control, input.value);

    control.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLButtonElement) || !target.classList.contains('swatch')) return;
      const color = normalizeHex(target.dataset.color || '', input.value);
      input.value = color;
      syncSwatchState(control, color);
    });

    input.addEventListener('input', () => {
      const raw = input.value.replace(/[^#0-9a-fA-F]/g, '');
      input.value = raw.slice(0, 7);
    });

    input.addEventListener('blur', () => {
      const fallback = targetId === 'bg-color' ? DEFAULT_CONFIG.bg : DEFAULT_CONFIG.fg;
      const color = normalizeHex(input.value, fallback);
      input.value = color;
      syncSwatchState(control, color);
    });
  });
}

function nextFrame() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => resolve());
  });
}

async function generateBackgroundJpeg(config) {
  await document.fonts.load(`${config.fontSize}px "Material Icons"`);
  await document.fonts.ready;

  const measureCanvas = document.createElement('canvas');
  const measureCtx = measureCanvas.getContext('2d');
  measureCtx.font = `${config.fontSize}px "Material Icons"`;
  const validIcons = ICONS.filter((icon) => iconLooksValid(measureCtx, icon, config.fontSize));
  const iconPool = validIcons.length >= 20 ? validIcons : ICONS;

  const canvas = document.createElement('canvas');
  canvas.width = config.width;
  canvas.height = config.height;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = config.bg;
  ctx.fillRect(0, 0, config.width, config.height);

  const diag = Math.hypot(config.width, config.height);
  const cols = Math.ceil(diag / config.cell) + 8;
  const rows = Math.ceil(diag / config.cell) + 8;
  const grid = Array.from({ length: rows }, () => Array(cols).fill(''));

  ctx.save();
  ctx.translate(config.width / 2, config.height / 2);
  ctx.rotate((config.angle * Math.PI) / 180);
  ctx.translate(-diag / 2, -diag / 2);
  ctx.font = `${config.fontSize}px "Material Icons"`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = config.fg;
  ctx.globalAlpha = config.opacity;

  const rand = mulberry32(config.seed);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const left = c > 0 ? grid[r][c - 1] : '';
      const top = r > 0 ? grid[r - 1][c] : '';
      const icon = pickIcon(rand, iconPool, left, top);
      grid[r][c] = icon;
      const x = c * config.cell + config.cell / 2;
      const y = r * config.cell + config.cell / 2;
      ctx.fillText(icon, x, y);
    }

    if (r % RENDER_BATCH_ROWS === 0) {
      await nextFrame();
    }
  }

  ctx.restore();

  const blob = await new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b), 'image/jpeg', config.quality);
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
  initColorControls();

  link.addEventListener('click', async (event) => {
    event.preventDefault();
    const original = link.textContent;
    link.textContent = 'Генерация...';
    link.style.pointerEvents = 'none';

    try {
      const config = readConfigFromForm();
      await generateBackgroundJpeg(config);
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
