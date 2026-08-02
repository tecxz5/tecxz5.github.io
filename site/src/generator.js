import t5Svg from './assets/icons/t5.svg?url';
import copyrightSvg from './assets/icons/c.svg?url';

(function () {
  const icons = [t5Svg, copyrightSvg];
  const icon = icons[Math.floor(Math.random() * icons.length)];
  const link = document.createElement('link');
  link.rel = 'icon';
  link.type = 'image/svg+xml';
  link.href = icon;
  document.head.appendChild(link);
})();

const DOWNLOAD_ID = 'download-bg-jpeg';
const FORM_ID = 'bg-generator-form';
const PREVIEW_SIZE = 150;

const DEFAULT_CONFIG = {
  width: 2000,
  height: 2000,
  bg: '#000000',
  fg: '#ffffff',
  opacity: 0.3,
  cell: 36,
  fontSize: 36,
  angle: 0,
  iconStyles: ['outlined', 'rounded', 'sharp', 'outlined-filled', 'rounded-filled', 'sharp-filled'],
  quality: 1,
  seed: Date.now()
};

const RENDER_BATCH_ROWS = 6;
const ICON_STYLE_VARIANTS = [
  { key: 'outlined', family: 'Material Symbols Outlined', fill: 0, weight: 400 },
  { key: 'rounded', family: 'Material Symbols Rounded', fill: 0, weight: 400 },
  { key: 'sharp', family: 'Material Symbols Sharp', fill: 0, weight: 400 },
  { key: 'outlined-filled', family: 'Material Symbols Outlined', fill: 1, weight: 400 },
  { key: 'rounded-filled', family: 'Material Symbols Rounded', fill: 1, weight: 400 },
  { key: 'sharp-filled', family: 'Material Symbols Sharp', fill: 1, weight: 400 }
];

import { ICONS, fetchLiveIcons, getLoadedIcons } from './icons.js';

let currentConfig = { ...DEFAULT_CONFIG };
let previewCtx = null;
let cachedIconPoolKey = '';
let cachedIconPool = null;
let pickerState = {
  target: 'bg-color',
  h: 0,
  s: 0,
  v: 0,
  alpha: DEFAULT_CONFIG.opacity
};
let previewSeed = null;

function resetPreviewSeed() {
  previewSeed = null;
}

function getSelectedVariants(styleKey) {
  if (!Array.isArray(styleKey)) return ICON_STYLE_VARIANTS;
  if (styleKey.length === 0) return ICON_STYLE_VARIANTS;
  const selected = ICON_STYLE_VARIANTS.filter((v) => styleKey.includes(v.key));
  return selected.length > 0 ? selected : ICON_STYLE_VARIANTS;
}

function getIconFont(variant, fontSize) {
  return `${variant.weight} ${fontSize}px "${variant.family}"`;
}

function loadSymbolFonts(fontSize) {
  const unique = new Set(ICON_STYLE_VARIANTS.map((v) => getIconFont(v, fontSize)));
  return Promise.all(Array.from(unique, (font) => document.fonts.load(font)));
}

let checkCanvas = null;
let checkCtx = null;

function getCheckContext() {
  if (!checkCtx) {
    checkCanvas = document.createElement('canvas');
    checkCanvas.width = 100;
    checkCanvas.height = 100;
    checkCtx = checkCanvas.getContext('2d');
  }
  return checkCtx;
}

const glyphCache = new Map();

function glyphExists(checkCtx, iconName, variant, fontSize = 24) {
  if (!checkCtx) return true;
  const fontSpec = getIconFont(variant, fontSize);
  const cacheKey = `${iconName}|${variant.key}|${fontSize}`;
  if (glyphCache.has(cacheKey)) return glyphCache.get(cacheKey);

  checkCtx.font = fontSpec;
  const width = checkCtx.measureText(iconName).width;

  const maxLigatureWidth = fontSize * 1.4;
  const isValid = Number.isFinite(width) && width > 0 && width <= maxLigatureWidth;
  glyphCache.set(cacheKey, isValid);
  return isValid;
}

function getRenderableIconPool(config) {
  const styleKey = Array.isArray(config.iconStyles) ? [...config.iconStyles].sort().join(',') : '';
  const currentIcons = (typeof getLoadedIcons === 'function' ? getLoadedIcons() : null) || ICONS || [];
  const key = `${currentIcons.length}|${styleKey}`;
  if (cachedIconPool && cachedIconPoolKey === key) return cachedIconPool;

  const selectedVariants = getSelectedVariants(config.iconStyles);
  const variants = selectedVariants.length > 0 ? selectedVariants : ICON_STYLE_VARIANTS;
  const uniqueIcons = Array.from(new Set(currentIcons));
  const checkContext = getCheckContext();
  const checkFontSize = config.fontSize || 24;

  const pool = [];
  for (let i = 0; i < uniqueIcons.length; i++) {
    const iconName = uniqueIcons[i];
    for (let j = 0; j < variants.length; j++) {
      if (checkContext && !glyphExists(checkContext, iconName, variants[j], checkFontSize)) {
        continue;
      }
      pool.push({
        id: `${iconName}|${variants[j].key}`,
        icon: iconName,
        styleId: variants[j].key,
        variant: variants[j]
      });
    }
  }

  if (pool.length === 0) {
    const fallbackIcons = ['star', 'favorite', 'settings', 'code', 'lock', 'home', 'check_circle', 'search'];
    for (let i = 0; i < fallbackIcons.length; i++) {
      for (let j = 0; j < variants.length; j++) {
        pool.push({
          id: `${fallbackIcons[i]}|${variants[j].key}`,
          icon: fallbackIcons[i],
          styleId: variants[j].key,
          variant: variants[j]
        });
      }
    }
  }

  cachedIconPoolKey = key;
  cachedIconPool = pool;
  return pool;
}

function applyDefaults() {
  const setVal = (id, value) => {
    const el = document.getElementById(id);
    if (el instanceof HTMLInputElement) {
      el.value = String(value);
    }
    if (el instanceof HTMLSelectElement) {
      const values = Array.isArray(value) ? value : [String(value)];
      for (const option of el.options) {
        option.selected = values.includes(option.value);
      }
    }
  };

  setVal('bg-width', DEFAULT_CONFIG.width);
  setVal('bg-height', DEFAULT_CONFIG.height);
  setVal('bg-color', DEFAULT_CONFIG.bg);
  setVal('fg-color', DEFAULT_CONFIG.fg);
  setVal('bg-opacity', DEFAULT_CONFIG.opacity);
  setVal('bg-cell', DEFAULT_CONFIG.cell);
  setVal('bg-angle', DEFAULT_CONFIG.angle);
  setVal('bg-icon-style', DEFAULT_CONFIG.iconStyles);
  setVal('bg-seed', '');
  resetPreviewSeed();

  setPickerFromHex(DEFAULT_CONFIG.bg);
  pickerState.target = 'bg-color';

  updatePickerUI();
  updatePreview();
}

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

function hexToRgb(hex) {
  const m = /^#?([0-9a-fA-F]{6})$/.exec(hex);
  if (!m) return { r: 0, g: 0, b: 0 };
  const int = parseInt(m[1], 16);
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
}

function rgbToHex(r, g, b) {
  const toHex = (v) => v.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function rgbToHsv(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    switch (max) {
      case r: h = ((g - b) / d) % 6; break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  const s = max === 0 ? 0 : d / max;
  return { h, s, v: max };
}

function hsvToRgb(h, s, v) {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0, g = 0, b = 0;
  if (h >= 0 && h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255)
  };
}

function setHexFromPicker(targetId) {
  const { h, s, v } = pickerState;
  const rgb = hsvToRgb(h, s, v);
  const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
  const input = document.getElementById(targetId);
  if (input instanceof HTMLInputElement) {
    input.value = hex;
  }
  updateSwatches();
}

function setPickerFromHex(hex) {
  const { r, g, b } = hexToRgb(hex);
  const { h, s, v } = rgbToHsv(r, g, b);
  pickerState.h = h;
  pickerState.s = s;
  pickerState.v = v;
}

function drawPickerSV() {
  const canvas = document.getElementById('picker-sv');
  if (!(canvas instanceof HTMLCanvasElement)) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const { h } = pickerState;
  const width = canvas.width;
  const height = canvas.height;

  const satGrad = ctx.createLinearGradient(0, 0, width, 0);
  satGrad.addColorStop(0, '#ffffff');
  const rgb = hsvToRgb(h, 1, 1);
  satGrad.addColorStop(1, rgbToHex(rgb.r, rgb.g, rgb.b));
  ctx.fillStyle = satGrad;
  ctx.fillRect(0, 0, width, height);

  const valGrad = ctx.createLinearGradient(0, 0, 0, height);
  valGrad.addColorStop(0, 'rgba(0,0,0,0)');
  valGrad.addColorStop(1, 'rgba(0,0,0,1)');
  ctx.fillStyle = valGrad;
  ctx.fillRect(0, 0, width, height);

  const x = pickerState.s * width;
  const y = (1 - pickerState.v) * height;
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.strokeRect(x - 5, y - 5, 10, 10);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1;
  ctx.strokeRect(x - 4, y - 4, 8, 8);
}

function drawHueStrip() {
  const canvas = document.getElementById('picker-hue-strip');
  if (!(canvas instanceof HTMLCanvasElement)) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const { width, height } = canvas;
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, '#ff0000');
  grad.addColorStop(1 / 6, '#ffff00');
  grad.addColorStop(2 / 6, '#00ff00');
  grad.addColorStop(3 / 6, '#00ffff');
  grad.addColorStop(4 / 6, '#0000ff');
  grad.addColorStop(5 / 6, '#ff00ff');
  grad.addColorStop(1, '#ff0000');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  const y = (pickerState.h / 360) * height;
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, y);
  ctx.lineTo(width, y);
  ctx.stroke();
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, y + 1);
  ctx.lineTo(width, y + 1);
  ctx.stroke();
}

function updatePickerUI() {
  drawPickerSV();
  drawHueStrip();
}

function handlePickerSV(event) {
  const canvas = document.getElementById('picker-sv');
  if (!(canvas instanceof HTMLCanvasElement)) return;
  const rect = canvas.getBoundingClientRect();
  const x = clamp(event.clientX - rect.left, 0, rect.width);
  const y = clamp(event.clientY - rect.top, 0, rect.height);
  pickerState.s = x / rect.width;
  pickerState.v = 1 - y / rect.height;
  setHexFromPicker(pickerState.target);
  drawPickerSV();
  schedulePreviewUpdate();
}

function handleHueStrip(event) {
  const canvas = document.getElementById('picker-hue-strip');
  if (!(canvas instanceof HTMLCanvasElement)) return;
  const rect = canvas.getBoundingClientRect();
  const y = clamp(event.clientY - rect.top, 0, rect.height);
  pickerState.h = (y / rect.height) * 360;
  setHexFromPicker(pickerState.target);
  updatePickerUI();
  schedulePreviewUpdate();
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

function pickIcon(rand, pool) {
  return pool[Math.floor(rand() * pool.length)];
}

function rowsPerChunk(config) {
  const area = config.width * config.height;
  if (area > 4_000_000) return 2;
  if (area > 2_500_000) return 3;
  if (area > 1_000_000) return 4;
  return RENDER_BATCH_ROWS;
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
  const multi = (id, fallback) => {
    const input = form.querySelector(`#${id}`);
    if (!(input instanceof HTMLSelectElement)) return fallback;
    const selected = Array.from(input.selectedOptions, (opt) => opt.value);
    return selected.length > 0 ? selected : fallback;
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
    iconStyles: multi('bg-icon-style', DEFAULT_CONFIG.iconStyles),
    quality: DEFAULT_CONFIG.quality,
    seed: Number.isFinite(seedRaw) && seedRaw > 0 ? Math.floor(seedRaw) : Date.now()
  };

  return currentConfig;
}

function initAdvancedPicker() {
  const svCanvas = document.getElementById('picker-sv');
  const hueCanvas = document.getElementById('picker-hue-strip');
  const paletteInput = document.getElementById('palette-image');
  const randomBtn = document.getElementById('random-color-btn');
  const pickerBox = document.getElementById('picker-box');
  const closePickerBtn = document.getElementById('close-picker-btn');
  const bgInput = document.getElementById('bg-color');
  const fgInput = document.getElementById('fg-color');

  pickerState.target = 'bg-color';
  setPickerFromHex(DEFAULT_CONFIG.bg);
  updatePickerUI();
  updateSwatches();
  initIconStyleSelect();

  function openPicker(targetId) {
    pickerState.target = targetId;
    const input = document.getElementById(targetId);
    if (!input || !pickerBox) return;

    const color = normalizeHex(input instanceof HTMLInputElement ? input.value : DEFAULT_CONFIG.bg, DEFAULT_CONFIG.bg);
    setPickerFromHex(color);
    updatePickerUI();

    const parentEl = input.closest('.color-input') || input.closest('label') || input;
    const rect = parentEl.getBoundingClientRect();

    const boxWidth = pickerBox.offsetWidth || 284;
    const boxHeight = pickerBox.offsetHeight || 280;
    let left = Math.max(12, Math.min(Math.round(rect.left), window.innerWidth - boxWidth - 12));
    let top = Math.round(rect.bottom + 6);
    if (top + boxHeight > window.innerHeight) {
      top = Math.max(12, Math.round(rect.top - boxHeight - 6));
    }

    pickerBox.style.position = 'fixed';
    pickerBox.style.top = `${top}px`;
    pickerBox.style.left = `${left}px`;
    pickerBox.classList.remove('hidden');
  }

  function closePicker() {
    if (pickerBox) pickerBox.classList.add('hidden');
  }

  const bgSwatch = document.getElementById('bg-swatch');
  const fgSwatch = document.getElementById('fg-swatch');
  if (bgSwatch) {
    bgSwatch.style.cursor = 'pointer';
    bgSwatch.addEventListener('click', (e) => {
      e.stopPropagation();
      openPicker('bg-color');
    });
  }
  if (fgSwatch) {
    fgSwatch.style.cursor = 'pointer';
    fgSwatch.addEventListener('click', (e) => {
      e.stopPropagation();
      openPicker('fg-color');
    });
  }

  if (bgInput instanceof HTMLInputElement) {
    bgInput.addEventListener('focus', (e) => { e.stopPropagation(); openPicker('bg-color'); });
    bgInput.addEventListener('click', (e) => { e.stopPropagation(); openPicker('bg-color'); });
  }
  if (fgInput instanceof HTMLInputElement) {
    fgInput.addEventListener('focus', (e) => { e.stopPropagation(); openPicker('fg-color'); });
    fgInput.addEventListener('click', (e) => { e.stopPropagation(); openPicker('fg-color'); });
  }

  let isDraggingPicker = false;

  document.addEventListener('click', (e) => {
    if (isDraggingPicker) return;
    if (!pickerBox || pickerBox.classList.contains('hidden')) return;
    const target = e.target;
    if (target instanceof Node && pickerBox.contains(target)) return;
    if (target instanceof Element && target.closest('#bg-color, #fg-color, #bg-swatch, #fg-swatch, #picker-box')) return;
    closePicker();
  });

  if (closePickerBtn instanceof HTMLButtonElement) {
    closePickerBtn.addEventListener('click', () => closePicker());
  }



  if (svCanvas instanceof HTMLCanvasElement) {
    const handleDown = (e) => {
      e.preventDefault();
      e.stopPropagation();
      isDraggingPicker = true;
      handlePickerSV(e);
      const moveHandler = (ev) => {
        ev.preventDefault();
        handlePickerSV(ev);
      };
      const upHandler = (ev) => {
        ev.preventDefault();
        window.removeEventListener('mousemove', moveHandler);
        window.removeEventListener('mouseup', upHandler);
        setTimeout(() => { isDraggingPicker = false; }, 50);
      };
      window.addEventListener('mousemove', moveHandler);
      window.addEventListener('mouseup', upHandler, { once: true });
    };
    svCanvas.addEventListener('mousedown', handleDown);

    const getTouchPoint = (ev) => {
      const t = ev.touches && ev.touches[0];
      if (!t) return null;
      return { clientX: t.clientX, clientY: t.clientY };
    };
    svCanvas.addEventListener('touchstart', (ev) => {
      const p = getTouchPoint(ev);
      if (!p) return;
      ev.preventDefault();
      isDraggingPicker = true;
      handlePickerSV(p);
    }, { passive: false });
    svCanvas.addEventListener('touchmove', (ev) => {
      const p = getTouchPoint(ev);
      if (!p) return;
      ev.preventDefault();
      handlePickerSV(p);
    }, { passive: false });
    svCanvas.addEventListener('touchend', () => {
      setTimeout(() => { isDraggingPicker = false; }, 50);
    });
  }

  if (hueCanvas instanceof HTMLCanvasElement) {
    const handleDown = (e) => {
      e.preventDefault();
      e.stopPropagation();
      isDraggingPicker = true;
      handleHueStrip(e);
      const moveHandler = (ev) => {
        ev.preventDefault();
        handleHueStrip(ev);
      };
      const upHandler = (ev) => {
        ev.preventDefault();
        window.removeEventListener('mousemove', moveHandler);
        window.removeEventListener('mouseup', upHandler);
        setTimeout(() => { isDraggingPicker = false; }, 50);
      };
      window.addEventListener('mousemove', moveHandler);
      window.addEventListener('mouseup', upHandler, { once: true });
    };
    hueCanvas.addEventListener('mousedown', handleDown);

    const getTouchPoint = (ev) => {
      const t = ev.touches && ev.touches[0];
      if (!t) return null;
      return { clientX: t.clientX, clientY: t.clientY };
    };
    hueCanvas.addEventListener('touchstart', (ev) => {
      const p = getTouchPoint(ev);
      if (!p) return;
      ev.preventDefault();
      isDraggingPicker = true;
      handleHueStrip(p);
    }, { passive: false });
    hueCanvas.addEventListener('touchmove', (ev) => {
      const p = getTouchPoint(ev);
      if (!p) return;
      ev.preventDefault();
      handleHueStrip(p);
    }, { passive: false });
    hueCanvas.addEventListener('touchend', () => {
      setTimeout(() => { isDraggingPicker = false; }, 50);
    });
  }

  if (paletteInput instanceof HTMLInputElement) {
    let paletteRequestId = 0;
    paletteInput.addEventListener('click', () => { paletteInput.value = ''; });
    paletteInput.addEventListener('change', () => {
      const file = paletteInput.files?.[0];
      if (!file) return;
      const requestId = ++paletteRequestId;
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          if (requestId !== paletteRequestId) return;
          const canvas = document.createElement('canvas');
          canvas.width = 32;
          canvas.height = 32;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
          const buckets = {};
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i], g = data[i + 1], b = data[i + 2];
            const key = `${r},${g},${b}`;
            buckets[key] = (buckets[key] || 0) + 1;
          }
          const colors = Object.entries(buckets)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([k]) => {
              const [r, g, b] = k.split(',').map(Number);
              return rgbToHex(r, g, b);
            });
          renderExtractedPalette(colors);
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  if (randomBtn instanceof HTMLButtonElement) {
    randomBtn.addEventListener('click', () => {
      const h = Math.random() * 360;
      const s = 0.25 + Math.random() * 0.7;
      const v = 0.35 + Math.random() * 0.6;
      pickerState.h = h;
      pickerState.s = s;
      pickerState.v = v;
      setHexFromPicker(pickerState.target);
      updatePickerUI();
      updatePreview();
    });
  }
}

function initIconStyleSelect() {
  const select = document.getElementById('bg-icon-style');
  const previewSelect = document.getElementById('icon-preview-glyph');
  if (!(select instanceof HTMLSelectElement)) return;
  const preview = document.getElementById('icon-style-preview');
  if (select.selectedOptions.length === 0) {
    for (const option of select.options) {
      option.selected = DEFAULT_CONFIG.iconStyles.includes(option.value);
    }
  }
  const labels = {
    outlined: 'Outlined',
    rounded: 'Rounded',
    sharp: 'Sharp',
    'outlined-filled': 'Outlined Filled',
    'rounded-filled': 'Rounded Filled',
    'sharp-filled': 'Sharp Filled'
  };
  const previewOrder = [
    'outlined',
    'outlined-filled',
    'rounded',
    'rounded-filled',
    'sharp',
    'sharp-filled'
  ];
  const variantByKey = new Map(ICON_STYLE_VARIANTS.map((v) => [v.key, v]));
  for (const option of select.options) {
    option.textContent = labels[option.value] || option.value;
  }

  if (!(preview instanceof HTMLElement)) return;
  const getPreviewIcon = () => (
    previewSelect instanceof HTMLSelectElement && previewSelect.value
      ? previewSelect.value
      : 'star'
  );
  const drawStylePreview = () => {
    const previewIcon = getPreviewIcon();
    preview.innerHTML = '';
    for (const key of previewOrder) {
      const label = labels[key];
      const variant = variantByKey.get(key);
      if (!variant) continue;

      const option = Array.from(select.options).find((o) => o.value === key);
      if (!option) continue;

      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'icon-style-item';
      item.dataset.styleKey = key;

      const glyph = document.createElement('span');
      glyph.className = 'icon-style-glyph';
      glyph.textContent = previewIcon;
      glyph.style.fontFamily = `"${variant.family}", sans-serif`;
      glyph.style.fontWeight = String(variant.weight);
      glyph.style.fontVariationSettings = `'FILL' ${Number.isFinite(variant.fill) ? variant.fill : 0}, 'wght' ${variant.weight}, 'GRAD' 0, 'opsz' 48`;
      glyph.style.fontSize = '48px';
      glyph.style.lineHeight = '1';

      const text = document.createElement('span');
      text.className = 'icon-style-label';
      text.textContent = label;

      item.appendChild(glyph);
      item.appendChild(text);
      const syncState = () => {
        const active = option.selected;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', active ? 'true' : 'false');
      };
      syncState();
      item.addEventListener('click', () => {
        option.selected = !option.selected;
        syncState();
        select.dispatchEvent(new Event('change', { bubbles: true }));
        select.dispatchEvent(new Event('input', { bubbles: true }));
      });
      preview.appendChild(item);
    }
  };
  if (previewSelect instanceof HTMLSelectElement) {
    previewSelect.addEventListener('change', drawStylePreview);
  }
  drawStylePreview();

  // Custom Icon Preview Dropdown Grid
  const customDropdown = document.getElementById('custom-icon-dropdown');
  const customTrigger = document.getElementById('custom-icon-trigger');
  const customMenu = document.getElementById('custom-icon-menu');
  const customCurrent = document.getElementById('custom-icon-current');
  const customName = document.getElementById('custom-icon-name');

  if (previewSelect instanceof HTMLSelectElement && customMenu && customTrigger) {
    const renderCustomMenu = () => {
      customMenu.innerHTML = '';
      const currentVal = previewSelect.value || 'star';
      if (customCurrent) customCurrent.textContent = currentVal;
      if (customName) customName.textContent = currentVal;

      Array.from(previewSelect.options).forEach((opt) => {
        const val = opt.value;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `custom-icon-option${val === currentVal ? ' is-active' : ''}`;
        btn.innerHTML = `<span class="custom-icon-glyph">${val}</span><span>${val}</span>`;
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          previewSelect.value = val;
          if (customCurrent) customCurrent.textContent = val;
          if (customName) customName.textContent = val;
          previewSelect.dispatchEvent(new Event('change', { bubbles: true }));
          customMenu.classList.add('hidden');
          if (customDropdown) customDropdown.classList.remove('is-open');
          renderCustomMenu();
        });
        customMenu.appendChild(btn);
      });
    };

    renderCustomMenu();

    if (!customTrigger.dataset.initialized) {
      customTrigger.dataset.initialized = 'true';
      customTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        const isOpen = customDropdown.classList.contains('is-open');
        if (isOpen) {
          customMenu.classList.add('hidden');
          customDropdown.classList.remove('is-open');
        } else {
          customMenu.classList.remove('hidden');
          customDropdown.classList.add('is-open');
        }
      });

      document.addEventListener('click', (e) => {
        if (!customDropdown || !customMenu) return;
        const target = e.target;
        if (target instanceof Node && customDropdown.contains(target)) return;
        customMenu.classList.add('hidden');
        customDropdown.classList.remove('is-open');
      });
    }
  }
}

function renderExtractedPalette(colors) {
  const container = document.getElementById('extracted-palette');
  if (!container) return;
  container.innerHTML = '';
  colors.forEach((hex) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'swatch';
    btn.style.setProperty('--swatch', hex);
    btn.dataset.color = hex;
    btn.addEventListener('click', () => {
      const input = document.getElementById(pickerState.target);
      if (input instanceof HTMLInputElement) input.value = hex;
      setPickerFromHex(hex);
      updatePickerUI();
      updatePreview();
    });
    container.appendChild(btn);
  });
}

function updateSwatches() {
  const bgInput = document.getElementById('bg-color');
  const fgInput = document.getElementById('fg-color');
  const bgSwatch = document.getElementById('bg-swatch');
  const fgSwatch = document.getElementById('fg-swatch');
  if (bgSwatch instanceof HTMLElement) {
    bgSwatch.style.background = normalizeHex(bgInput instanceof HTMLInputElement ? bgInput.value : DEFAULT_CONFIG.bg, DEFAULT_CONFIG.bg);
  }
  if (fgSwatch instanceof HTMLElement) {
    fgSwatch.style.background = normalizeHex(fgInput instanceof HTMLInputElement ? fgInput.value : DEFAULT_CONFIG.fg, DEFAULT_CONFIG.fg);
  }
}

function nextFrame() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => resolve());
  });
}

async function generateBackgroundJpeg(config) {
  await loadSymbolFonts(config.fontSize);
  await document.fonts.ready;

  const iconPool = getRenderableIconPool(config);

  const canvas = document.createElement('canvas');
  canvas.width = config.width;
  canvas.height = config.height;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = config.bg;
  ctx.fillRect(0, 0, config.width, config.height);

  const diag = Math.hypot(config.width, config.height);
  const cols = Math.ceil(diag / config.cell) + 8;
  const rows = Math.ceil(diag / config.cell) + 8;

  ctx.save();
  ctx.translate(config.width / 2, config.height / 2);
  ctx.rotate((config.angle * Math.PI) / 180);
  ctx.translate(-diag / 2, -diag / 2);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = config.fg;
  ctx.globalAlpha = config.opacity;
  let activeFont = '';

  const rand = mulberry32(config.seed);
  const chunkRows = rowsPerChunk(config);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const iconEntry = pickIcon(rand, iconPool);
      const x = c * config.cell + config.cell / 2;
      const y = r * config.cell + config.cell / 2;
      const font = getIconFont(iconEntry.variant, config.fontSize);
      if (activeFont !== font) {
        activeFont = font;
        ctx.font = font;
      }
      ctx.fontVariationSettings = `'FILL' ${Number.isFinite(iconEntry.variant.fill) ? iconEntry.variant.fill : 0}, 'wght' ${iconEntry.variant.weight}, 'GRAD' 0, 'opsz' 48`;
      ctx.fillText(iconEntry.icon, x, y);
    }

    if (r % chunkRows === 0) {
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

  const filenameSeed = Number.isFinite(config.seed) ? config.seed : Date.now();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `generated-bg-${filenameSeed}.jpeg`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function renderBackgroundToCanvas(config, canvas, ctx) {
  canvas.width = config.width;
  canvas.height = config.height;

  ctx.fillStyle = config.bg || '#000000';
  ctx.fillRect(0, 0, config.width, config.height);

  const diag = Math.hypot(canvas.width, canvas.height);
  const cols = Math.ceil(diag / config.cell) + 8;
  const rows = Math.ceil(diag / config.cell) + 8;

  const iconPool = getRenderableIconPool(config);
  if (!iconPool || iconPool.length === 0) return;

  ctx.save();
  ctx.translate(config.width / 2, config.height / 2);
  ctx.rotate((config.angle * Math.PI) / 180);
  ctx.translate(-diag / 2, -diag / 2);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = config.fg || '#ffffff';
  ctx.globalAlpha = Number.isFinite(config.opacity) ? config.opacity : 0.3;
  let activeFont = '';

  const rand = mulberry32(config.seed);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const iconEntry = pickIcon(rand, iconPool);
      const x = c * config.cell + config.cell / 2;
      const y = r * config.cell + config.cell / 2;
      const font = getIconFont(iconEntry.variant, config.fontSize);
      if (activeFont !== font) {
        activeFont = font;
        ctx.font = font;
      }
      ctx.fillText(iconEntry.icon, x, y);
    }
  }
  ctx.restore();
}

function updatePreview() {
  currentConfig = readConfigFromForm();
  if (previewSeed === null) {
    previewSeed = currentConfig.seed;
  } else {
    currentConfig.seed = previewSeed;
  }

  if (!previewCtx) {
    const canvas = document.getElementById('bg-preview');
    if (!(canvas instanceof HTMLCanvasElement)) return;
    previewCtx = canvas.getContext('2d');
  }
  if (!previewCtx) return;
  const previewCanvas = previewCtx.canvas;
  const cssSize = Math.max(
    PREVIEW_SIZE,
    Math.round(previewCanvas.clientWidth || PREVIEW_SIZE)
  );
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const renderSize = Math.max(PREVIEW_SIZE, Math.round(cssSize * dpr));

  const previewScale = renderSize / (currentConfig.width || 2000);
  const previewCell = Math.max(22, Math.round(currentConfig.cell * previewScale * 3.8));
  const previewFontSize = Math.max(22, Math.round(currentConfig.fontSize * previewScale * 3.8));

  const cfg = {
    ...currentConfig,
    width: renderSize,
    height: renderSize,
    cell: previewCell,
    fontSize: previewFontSize,
    quality: 0.8
  };
  renderBackgroundToCanvas(cfg, previewCtx.canvas, previewCtx);
  updateSwatches();
}

function updateOpacityDisplay() {
  const opacityInput = document.getElementById('bg-opacity');
  const opacityVal = document.getElementById('bg-opacity-val');
  if (opacityInput instanceof HTMLInputElement) {
    const min = parseFloat(opacityInput.min) || 0.05;
    const max = parseFloat(opacityInput.max) || 1;
    const val = parseFloat(opacityInput.value) || 0.3;
    const percent = Math.min(100, Math.max(0, ((val - min) / (max - min)) * 100));
    opacityInput.style.setProperty('--range-progress', `${percent}%`);

    if (opacityVal instanceof HTMLElement) {
      opacityVal.textContent = val.toFixed(2);
    }
  }
}

let previewRaf = 0;
function schedulePreviewUpdate() {
  updateOpacityDisplay();
  if (previewRaf) return;
  previewRaf = requestAnimationFrame(() => {
    previewRaf = 0;
    updatePreview();
  });
}

function initBackgroundDownloader() {
  const link = document.getElementById(DOWNLOAD_ID);
  if (!link) return;

  const loader = document.getElementById('generator-loader');

  initAdvancedPicker();
  const form = document.getElementById(FORM_ID);
  if (form instanceof HTMLFormElement) {
    form.addEventListener('submit', (e) => e.preventDefault());
    form.addEventListener('input', schedulePreviewUpdate);
    form.addEventListener('change', schedulePreviewUpdate);
    const seedInput = document.getElementById('bg-seed');
    if (seedInput instanceof HTMLInputElement) {
      const onSeedChange = () => {
        resetPreviewSeed();
        schedulePreviewUpdate();
      };
      seedInput.addEventListener('input', onSeedChange);
      seedInput.addEventListener('change', onSeedChange);
    }

    const resetBtn = document.getElementById('reset-form-btn');
    if (resetBtn instanceof HTMLButtonElement) {
      resetBtn.addEventListener('click', () => applyDefaults());
    }
  }

  const setupIconsAndFonts = async () => {
    try {
      const [_, icons] = await Promise.all([
        loadSymbolFonts(24),
        fetchLiveIcons()
      ]);

      const previewSelect = document.getElementById('icon-preview-glyph');
      if (previewSelect instanceof HTMLSelectElement) {
        const top16 = icons.slice(0, 16);
        const curVal = previewSelect.value || top16[0];
        previewSelect.innerHTML = '';
        top16.forEach((name) => {
          const opt = document.createElement('option');
          opt.value = name;
          opt.textContent = name;
          if (name === curVal) opt.selected = true;
          previewSelect.appendChild(opt);
        });
        if (previewSelect.options.length > 0 && !top16.includes(curVal)) {
          previewSelect.options[0].selected = true;
        }
        initIconStyleSelect();
      }

      cachedIconPoolKey = '';
      cachedIconPool = null;
      glyphCache.clear();
      updatePreview();
    } catch (err) {
      console.warn('Initialization error:', err);
    } finally {
      if (loader) {
        setTimeout(() => {
          loader.classList.add('is-hidden');
        }, 120);
      }
    }
  };

  setupIconsAndFonts();

  link.addEventListener('click', async (event) => {
    event.preventDefault();
    const original = link.textContent;
    link.textContent = 'Генерация...';
    link.style.pointerEvents = 'none';

    try {
      const config = readConfigFromForm();
      currentConfig = config;
      await generateBackgroundJpeg(config);
      link.textContent = 'Сгенерировать ещё';
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
