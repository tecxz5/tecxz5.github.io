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
  bg2: '#1a1a2e',
  bgColorMode: 'solid',
  bgGradAngle: 45,
  fgGradAngle: 45,
  bgGradFreq: 1.0,
  fg: '#ffffff4d',
  fg2: '#cedb1a4d',
  fgColorMode: 'solid',
  cell: 28,
  fontSize: 28,
  density: 1.3,
  angle: 0,
  layout: 'grid',
  staggerAxis: 'row',
  randomRotate: 0,
  randomScale: 0,
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
  alpha: 1.0
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
  setVal('bg-color-2', DEFAULT_CONFIG.bg2);
  setVal('bg-color-mode', DEFAULT_CONFIG.bgColorMode);
  setVal('bg-grad-angle', DEFAULT_CONFIG.bgGradAngle);
  setVal('fg-grad-angle', DEFAULT_CONFIG.fgGradAngle);
  setVal('bg-grad-freq', DEFAULT_CONFIG.bgGradFreq);
  setVal('fg-color', DEFAULT_CONFIG.fg);
  setVal('fg-color-2', DEFAULT_CONFIG.fg2);
  setVal('fg-color-mode', DEFAULT_CONFIG.fgColorMode);
  setVal('bg-opacity', DEFAULT_CONFIG.opacity);
  setVal('bg-cell', DEFAULT_CONFIG.cell);
  setVal('bg-density', DEFAULT_CONFIG.density);
  setVal('bg-angle', DEFAULT_CONFIG.angle);
  setVal('bg-layout', DEFAULT_CONFIG.layout);
  setVal('bg-stagger-axis', DEFAULT_CONFIG.staggerAxis);
  setVal('bg-random-rotate', DEFAULT_CONFIG.randomRotate);
  setVal('bg-random-scale', DEFAULT_CONFIG.randomScale);
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
  if (/^#[0-9a-fA-F]{6}$/.test(v)) return v.toLowerCase();
  if (/^#[0-9a-fA-F]{8}$/.test(v)) return v.toLowerCase();
  return fallback;
}

function hexToRgba(hex, defaultAlpha = 1.0) {
  const m = /^#?([0-9a-fA-F]{6})([0-9a-fA-F]{2})?$/.exec(hex);
  if (!m) return [0, 0, 0, defaultAlpha];
  const rgbInt = parseInt(m[1], 16);
  const r = (rgbInt >> 16) & 255;
  const g = (rgbInt >> 8) & 255;
  const b = rgbInt & 255;
  let a = defaultAlpha;
  if (m[2] !== undefined) {
    a = parseInt(m[2], 16) / 255;
  }
  return [r / 255, g / 255, b / 255, a];
}

function lerpRgba(c1, c2, t) {
  return [
    c1[0] + (c2[0] - c1[0]) * t,
    c1[1] + (c2[1] - c1[1]) * t,
    c1[2] + (c2[2] - c1[2]) * t,
    c1[3] + (c2[3] - c1[3]) * t
  ];
}

function hexToRgb(hex) {
  const [r, g, b] = hexToRgba(hex);
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

function rgbaToHex(r, g, b, a = 1.0) {
  const toHex = (v) => Math.min(255, Math.max(0, Math.round(v))).toString(16).padStart(2, '0');
  const alphaHex = toHex(a * 255);
  const rgbHex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  return alphaHex === 'ff' ? rgbHex : `${rgbHex}${alphaHex}`;
}

function rgbToHex(r, g, b) {
  const toHex = (v) => Math.min(255, Math.max(0, Math.round(v))).toString(16).padStart(2, '0');
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
  const { h, s, v, alpha } = pickerState;
  const rgb = hsvToRgb(h, s, v);
  const hex = rgbaToHex(rgb.r, rgb.g, rgb.b, alpha);
  const input = document.getElementById(targetId);
  if (input instanceof HTMLInputElement) {
    input.value = hex;
  }
  updateSwatches();
}

function setPickerFromHex(hex) {
  const [r, g, b, a] = hexToRgba(hex, 1.0);
  const { h, s, v } = rgbToHsv(r * 255, g * 255, b * 255);
  pickerState.h = h;
  pickerState.s = s;
  pickerState.v = v;
  pickerState.alpha = a;
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

function drawAlphaStrip() {
  const canvas = document.getElementById('picker-alpha-strip');
  if (!(canvas instanceof HTMLCanvasElement)) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const { width, height } = canvas;
  const { h, s, v } = pickerState;
  const rgb = hsvToRgb(h, s, v);
  const solidHex = rgbToHex(rgb.r, rgb.g, rgb.b);

  ctx.clearRect(0, 0, width, height);

  const size = 6;
  for (let y = 0; y < height; y += size) {
    for (let x = 0; x < width; x += size) {
      ctx.fillStyle = ((x / size + y / size) % 2 === 0) ? '#333333' : '#1a1a1a';
      ctx.fillRect(x, y, size, size);
    }
  }

  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, solidHex);
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  const pointerY = (1 - pickerState.alpha) * height;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, pointerY);
  ctx.lineTo(width, pointerY);
  ctx.stroke();
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, pointerY + 1);
  ctx.lineTo(width, pointerY + 1);
  ctx.stroke();
}

function updatePickerUI() {
  drawPickerSV();
  drawHueStrip();
  drawAlphaStrip();
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

function handleAlphaStrip(event) {
  const canvas = document.getElementById('picker-alpha-strip');
  if (!(canvas instanceof HTMLCanvasElement)) return;
  const rect = canvas.getBoundingClientRect();
  const y = clamp(event.clientY - rect.top, 0, rect.height);
  pickerState.alpha = clamp(1 - y / rect.height, 0, 1);
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
    bg2: normalizeHex(text('bg-color-2', DEFAULT_CONFIG.bg2), DEFAULT_CONFIG.bg2),
    bgColorMode: text('bg-color-mode', DEFAULT_CONFIG.bgColorMode),
    bgGradAngle: clamp(num('bg-grad-angle', DEFAULT_CONFIG.bgGradAngle), -180, 180),
    fgGradAngle: clamp(num('fg-grad-angle', DEFAULT_CONFIG.fgGradAngle), -180, 180),
    bgGradFreq: clamp(num('bg-grad-freq', DEFAULT_CONFIG.bgGradFreq), 0.5, 10),
    fg: normalizeHex(text('fg-color', DEFAULT_CONFIG.fg), DEFAULT_CONFIG.fg),
    fg2: normalizeHex(text('fg-color-2', DEFAULT_CONFIG.fg2), DEFAULT_CONFIG.fg2),
    fgColorMode: text('fg-color-mode', DEFAULT_CONFIG.fgColorMode),
    opacity: clamp(num('bg-opacity', DEFAULT_CONFIG.opacity), 0.05, 1),
    cell: clamp(Math.round(num('bg-cell', DEFAULT_CONFIG.cell)), 12, 96),
    fontSize: clamp(Math.round(num('bg-cell', DEFAULT_CONFIG.fontSize)), 12, 96),
    density: clamp(num('bg-density', DEFAULT_CONFIG.density), 0.5, 2.5),
    angle: clamp(num('bg-angle', DEFAULT_CONFIG.angle), -90, 90),
    layout: text('bg-layout', DEFAULT_CONFIG.layout),
    staggerAxis: text('bg-stagger-axis', DEFAULT_CONFIG.staggerAxis),
    randomRotate: clamp(num('bg-random-rotate', DEFAULT_CONFIG.randomRotate), 0, 180),
    randomScale: clamp(num('bg-random-scale', DEFAULT_CONFIG.randomScale), 0, 0.8),
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

  const colorTargets = [
    { inputId: 'bg-color', swatchId: 'bg-swatch' },
    { inputId: 'bg-color-2', swatchId: 'bg2-swatch' },
    { inputId: 'fg-color', swatchId: 'fg-swatch' },
    { inputId: 'fg-color-2', swatchId: 'fg2-swatch' }
  ];

  colorTargets.forEach(({ inputId, swatchId }) => {
    const swatch = document.getElementById(swatchId);
    const input = document.getElementById(inputId);
    if (swatch) {
      swatch.style.cursor = 'pointer';
      swatch.addEventListener('click', (e) => {
        e.stopPropagation();
        openPicker(inputId);
      });
    }
    if (input instanceof HTMLInputElement) {
      input.addEventListener('focus', (e) => { e.stopPropagation(); openPicker(inputId); });
      input.addEventListener('click', (e) => { e.stopPropagation(); openPicker(inputId); });
    }
  });

  let isDraggingPicker = false;

  document.addEventListener('click', (e) => {
    if (isDraggingPicker) return;
    if (!pickerBox || pickerBox.classList.contains('hidden')) return;
    const target = e.target;
    if (target instanceof Node && pickerBox.contains(target)) return;
    if (target instanceof Element && target.closest('#bg-color, #bg-color-2, #fg-color, #fg-color-2, #bg-swatch, #bg2-swatch, #fg-swatch, #fg2-swatch, #picker-box')) return;
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

  const alphaCanvas = document.getElementById('picker-alpha-strip');
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

  if (alphaCanvas instanceof HTMLCanvasElement) {
    const handleDown = (e) => {
      e.preventDefault();
      e.stopPropagation();
      isDraggingPicker = true;
      handleAlphaStrip(e);
      const moveHandler = (ev) => {
        ev.preventDefault();
        handleAlphaStrip(ev);
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
    alphaCanvas.addEventListener('mousedown', handleDown);

    const getTouchPoint = (ev) => {
      const t = ev.touches && ev.touches[0];
      if (!t) return null;
      return { clientX: t.clientX, clientY: t.clientY };
    };
    alphaCanvas.addEventListener('touchstart', (ev) => {
      const p = getTouchPoint(ev);
      if (!p) return;
      ev.preventDefault();
      isDraggingPicker = true;
      handleAlphaStrip(p);
    }, { passive: false });
    alphaCanvas.addEventListener('touchmove', (ev) => {
      const p = getTouchPoint(ev);
      if (!p) return;
      ev.preventDefault();
      handleAlphaStrip(p);
    }, { passive: false });
    alphaCanvas.addEventListener('touchend', () => {
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

function updateRangeInputs() {
  const updateRange = (id, valId, suffix = '') => {
    const input = document.getElementById(id);
    const valEl = document.getElementById(valId);
    if (input instanceof HTMLInputElement) {
      const min = parseFloat(input.min) || 0;
      const max = parseFloat(input.max) || 1;
      const val = parseFloat(input.value) || 0;
      const percent = Math.min(100, Math.max(0, ((val - min) / (max - min)) * 100));
      input.style.setProperty('--range-progress', `${percent}%`);
      if (valEl instanceof HTMLElement) {
        const precision = id === 'bg-opacity' || id === 'bg-random-scale'
          ? 2
          : id === 'bg-grad-freq' || id === 'bg-density'
            ? 1
            : 0;
        valEl.textContent = `${val.toFixed(precision)}${suffix}`;
      }
    }
  };
  updateRange('bg-opacity', 'bg-opacity-val', '');
  updateRange('bg-grad-freq', 'bg-grad-freq-val', 'x');
  updateRange('bg-density', 'bg-density-val', 'x');
  updateRange('bg-random-rotate', 'bg-random-rotate-val', '°');
  updateRange('bg-random-scale', 'bg-random-scale-val', '');
}

function updateFieldVisibilities() {
  const layout = document.getElementById('bg-layout')?.value;
  const staggerLabel = document.getElementById('stagger-axis-label');
  if (staggerLabel) {
    staggerLabel.classList.toggle('hidden-field', layout !== 'stagger');
  }

  const bgColorMode = document.getElementById('bg-color-mode')?.value;
  const bgColor2Label = document.getElementById('bg-color-2-label');
  const bgGradAngleLabel = document.getElementById('bg-grad-angle-label');
  const bgGradFreqLabel = document.getElementById('bg-grad-freq-label');
  const fgGradAngleLabel = document.getElementById('fg-grad-angle-label');

  const isBgGrad = bgColorMode === 'gradient';
  const fgColorMode = document.getElementById('fg-color-mode')?.value;
  const isFgGrad = fgColorMode === 'gradient';

  if (bgColor2Label) bgColor2Label.classList.toggle('hidden-field', !isBgGrad);
  if (bgGradAngleLabel) bgGradAngleLabel.classList.toggle('hidden-field', !isBgGrad);
  if (fgGradAngleLabel) fgGradAngleLabel.classList.toggle('hidden-field', !isFgGrad);
  if (bgGradFreqLabel) bgGradFreqLabel.classList.toggle('hidden-field', !isBgGrad && !isFgGrad);

  const fgColor2Label = document.getElementById('fg-color-2-label');
  if (fgColor2Label) fgColor2Label.classList.toggle('hidden-field', fgColorMode === 'solid');

}

function getGradientAngle(config, angleOverride = null) {
  if (Number.isFinite(angleOverride)) return angleOverride;
  return Number.isFinite(config.bgGradAngle) ? config.bgGradAngle : 45;
}

function getGradientLine(width, height, angle) {
  const angleRad = (angle * Math.PI) / 180;
  const diag = Math.hypot(width, height);
  const cx = width / 2;
  const cy = height / 2;
  return {
    x1: cx - (Math.cos(angleRad) * diag) / 2,
    y1: cy - (Math.sin(angleRad) * diag) / 2,
    x2: cx + (Math.cos(angleRad) * diag) / 2,
    y2: cy + (Math.sin(angleRad) * diag) / 2
  };
}

function getGradientFactor(x, y, width, height, config, angleOverride = null) {
  const angleRad = (getGradientAngle(config, angleOverride) * Math.PI) / 180;
  const projected = x * Math.cos(angleRad) + y * Math.sin(angleRad);
  const span = Math.abs(width * Math.cos(angleRad)) + Math.abs(height * Math.sin(angleRad));
  const normalized = span === 0 ? 0 : projected / span + 0.5;
  const frequency = Math.max(0.5, config.bgGradFreq || 1.0);
  return 0.5 + 0.5 * Math.sin((normalized - 0.25) * Math.PI * 2 * frequency);
}

function updateSwatches() {
  const setSwatch = (inputId, swatchId, fallback) => {
    const input = document.getElementById(inputId);
    const swatch = document.getElementById(swatchId);
    if (swatch instanceof HTMLElement) {
      const val = normalizeHex(input instanceof HTMLInputElement ? input.value : fallback, fallback);
      const [r, g, b, a] = hexToRgba(val, 1.0);
      swatch.style.background = `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`;
    }
  };
  setSwatch('bg-color', 'bg-swatch', DEFAULT_CONFIG.bg);
  setSwatch('bg-color-2', 'bg2-swatch', DEFAULT_CONFIG.bg2);
  setSwatch('fg-color', 'fg-swatch', DEFAULT_CONFIG.fg);
  setSwatch('fg-color-2', 'fg2-swatch', DEFAULT_CONFIG.fg2);
}

function renderBackgroundToCanvas(config, canvas, ctx, time = 0) {
  canvas.width = config.width;
  canvas.height = config.height;

  // Background
  if (config.bgColorMode === 'gradient') {
    const { x1, y1, x2, y2 } = getGradientLine(config.width, config.height, getGradientAngle(config));
    const grad = ctx.createLinearGradient(x1, y1, x2, y2);

    const freq = Math.max(0.5, config.bgGradFreq || 1.0);
    const cycles = Math.ceil(freq);
    for (let k = 0; k < cycles; k++) {
      const p0 = k / cycles;
      const p1 = (k + 0.5) / cycles;
      const p2 = (k + 1.0) / cycles;
      grad.addColorStop(Math.min(1, p0), config.bg || '#000000');
      grad.addColorStop(Math.min(1, p1), config.bg2 || '#1a1a2e');
      if (p2 <= 1) grad.addColorStop(p2, config.bg || '#000000');
    }
    ctx.fillStyle = grad;
  } else {
    ctx.fillStyle = config.bg || '#000000';
  }
  ctx.fillRect(0, 0, config.width, config.height);

  const iconPool = getRenderableIconPool(config);
  if (!iconPool || iconPool.length === 0) return;

  const baseCell = config.cell || 28;
  const density = config.density || 1.0;
  const step = Math.max(10, baseCell / density);
  const diag = Math.hypot(config.width, config.height);
  const cols = Math.ceil(diag / step) + 8;
  const rows = Math.ceil(diag / step) + 8;
  const rand = mulberry32(config.seed);

  ctx.save();
  ctx.translate(config.width / 2, config.height / 2);
  ctx.rotate(((config.angle || 0) * Math.PI) / 180);
  ctx.translate(-diag / 2, -diag / 2);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (config.fgColorMode === 'gradient') {
    const { x1, y1, x2, y2 } = getGradientLine(diag, diag, getGradientAngle(config, config.fgGradAngle));
    const grad = ctx.createLinearGradient(x1, y1, x2, y2);
    const freq = Math.max(0.5, config.bgGradFreq || 1.0);
    const cycles = Math.ceil(freq);
    for (let k = 0; k < cycles; k++) {
      const p0 = k / cycles;
      const p1 = (k + 0.5) / cycles;
      const p2 = (k + 1.0) / cycles;
      grad.addColorStop(Math.min(1, p0), config.fg || '#ffffff4d');
      grad.addColorStop(Math.min(1, p1), config.fg2 || '#cedb1a4d');
      if (p2 <= 1) grad.addColorStop(p2, config.fg || '#ffffff4d');
    }
    ctx.fillStyle = grad;
  } else {
    ctx.fillStyle = config.fg || '#ffffff4d';
  }

  const baseOpacity = Number.isFinite(config.opacity) ? config.opacity : 0.3;
  ctx.globalAlpha = baseOpacity;

  let paletteColors = [];
  if (config.fgColorMode === 'palette') {
    paletteColors = [
      config.fg || '#ffffff',
      config.fg2 || '#cedb1a',
      '#3a86ff',
      '#ff006e',
      '#8338ec',
      '#ffbe0b'
    ];
  }

  const layout = config.layout || 'grid';
  let activeFont = '';

  const items = [];
  if (layout === 'spiral') {
    const totalIcons = Math.min(2500, Math.floor((cols * rows) / 1.5));
    const cx = diag / 2;
    const cy = diag / 2;
    let radius = 0;
    let currentAngle = 0;
    for (let i = 0; i < totalIcons; i++) {
      const iconEntry = pickIcon(rand, iconPool);
      const px = cx + radius * Math.cos(currentAngle);
      const py = cy + radius * Math.sin(currentAngle);
      items.push({
        iconEntry,
        x: px,
        y: py,
        row: i,
        col: 0,
        index: i,
        randRotate: (rand() - 0.5) * (config.randomRotate || 0) * 2,
        randScale: 1 + (rand() - 0.5) * (config.randomScale || 0) * 2,
        paletteColor: paletteColors.length > 0 ? paletteColors[Math.floor(rand() * paletteColors.length)] : null
      });
      currentAngle += step / Math.max(step, radius);
      radius += step * 0.12;
      if (radius > diag * 0.8) break;
    }
  } else {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const iconEntry = pickIcon(rand, iconPool);
        let x = c * step + step / 2;
        let y = r * step + step / 2;

        if (layout === 'stagger') {
          if (config.staggerAxis === 'col') {
            if (c % 2 === 1) y += step / 2;
          } else {
            if (r % 2 === 1) x += step / 2;
          }
        } else if (layout === 'hex') {
          const hexH = step * 0.866;
          y = r * hexH + step / 2;
          if (r % 2 === 1) x += step / 2;
        } else if (layout === 'scatter') {
          const jitterX = (rand() - 0.5) * step * 0.7;
          const jitterY = (rand() - 0.5) * step * 0.7;
          x += jitterX;
          y += jitterY;
        }

        items.push({
          iconEntry,
          x,
          y,
          row: r,
          col: c,
          index: r * cols + c,
          randRotate: (rand() - 0.5) * (config.randomRotate || 0) * 2 + (layout === 'scatter' ? (rand() - 0.5) * 60 : 0),
          randScale: 1 + (rand() - 0.5) * (config.randomScale || 0) * 2,
          paletteColor: paletteColors.length > 0 ? paletteColors[Math.floor(rand() * paletteColors.length)] : null
        });
      }
    }
  }

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    let drawX = item.x;
    let drawY = item.y;
    let drawAngle = item.randRotate || 0;
    let drawScale = item.randScale || 1;
    let itemAlpha = baseOpacity;

    const font = getIconFont(item.iconEntry.variant, config.fontSize);
    if (activeFont !== font) {
      activeFont = font;
      ctx.font = font;
    }

    const hasTransform = drawAngle !== 0 || drawScale !== 1 || config.fgColorMode === 'palette' || itemAlpha !== baseOpacity;

    if (hasTransform) {
      ctx.save();
      ctx.globalAlpha = Math.max(0.01, Math.min(1, itemAlpha));
      if (config.fgColorMode === 'palette' && item.paletteColor) {
        ctx.fillStyle = item.paletteColor;
      }
      ctx.translate(drawX, drawY);
      if (drawAngle !== 0) ctx.rotate((drawAngle * Math.PI) / 180);
      if (drawScale !== 1) ctx.scale(drawScale, drawScale);
      ctx.fillText(item.iconEntry.icon, 0, 0);
      ctx.restore();
    } else {
      ctx.fillText(item.iconEntry.icon, drawX, drawY);
    }
  }

  ctx.restore();
}

async function generateBackgroundJpeg(config) {
  await loadSymbolFonts(config.fontSize);
  await document.fonts.ready;

  const canvas = document.createElement('canvas');
  canvas.width = config.width;
  canvas.height = config.height;

  const rendered = renderBackgroundWebGL(config, canvas, 0);
  if (!rendered) {
    const ctx = canvas.getContext('2d');
    renderBackgroundToCanvas(config, canvas, ctx, 0);
  }

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

const webglContextMap = new WeakMap();

function getWebGLContext(canvas) {
  if (webglContextMap.has(canvas)) {
    return webglContextMap.get(canvas);
  }

  let gl = null;
  try {
    gl = canvas.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: false, preserveDrawingBuffer: true });
  } catch (e) {
    gl = null;
  }
  if (!gl) return null;

  const vsSource = `
    attribute vec2 a_position;
    attribute vec2 a_texCoord;
    attribute vec4 a_color;

    uniform vec2 u_resolution;

    varying vec2 v_texCoord;
    varying vec4 v_color;

    void main() {
      vec2 clip = (a_position / u_resolution) * 2.0 - 1.0;
      gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
      v_texCoord = a_texCoord;
      v_color = a_color;
    }
  `;

  const fsSource = `
    precision mediump float;

    uniform sampler2D u_texture;
    uniform float u_useTexture;

    varying vec2 v_texCoord;
    varying vec4 v_color;

    void main() {
      if (u_useTexture > 0.5) {
        float alpha = texture2D(u_texture, v_texCoord).a;
        gl_FragColor = vec4(v_color.rgb, v_color.a * alpha);
      } else {
        gl_FragColor = v_color;
      }
    }
  `;

  const vs = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vs, vsSource);
  gl.compileShader(vs);

  const fs = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fs, fsSource);
  gl.compileShader(fs);

  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);

  const buffer = gl.createBuffer();

  const ctxObj = { gl, program, buffer, atlas: null, atlasKey: '' };
  webglContextMap.set(canvas, ctxObj);
  return ctxObj;
}

function getWebGLAtlas(ctxObj, config) {
  const pool = getRenderableIconPool(config);
  const key = cachedIconPoolKey;
  if (ctxObj.atlas && ctxObj.atlasKey === key) return ctxObj.atlas;

  const gl = ctxObj.gl;
  const cellSize = 64;
  const cols = 16;
  const rows = Math.ceil(pool.length / cols);
  const atlasCanvas = document.createElement('canvas');
  atlasCanvas.width = cols * cellSize;
  atlasCanvas.height = Math.max(cellSize, rows * cellSize);
  const ctx = atlasCanvas.getContext('2d');

  ctx.clearRect(0, 0, atlasCanvas.width, atlasCanvas.height);
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const atlasMap = new Map();

  for (let i = 0; i < pool.length; i++) {
    const entry = pool[i];
    const c = i % cols;
    const r = Math.floor(i / cols);
    const x = c * cellSize + cellSize / 2;
    const y = r * cellSize + cellSize / 2;

    ctx.font = getIconFont(entry.variant, 44);
    ctx.fillText(entry.icon, x, y);

    atlasMap.set(entry.id, {
      u0: (c * cellSize) / atlasCanvas.width,
      v0: (r * cellSize) / atlasCanvas.height,
      u1: ((c + 1) * cellSize) / atlasCanvas.width,
      v1: ((r + 1) * cellSize) / atlasCanvas.height
    });
  }

  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlasCanvas);

  ctxObj.atlasKey = key;
  ctxObj.atlas = { texture, atlasMap, width: atlasCanvas.width, height: atlasCanvas.height };
  return ctxObj.atlas;
}

function renderBackgroundWebGL(config, canvas, time = 0) {
  const ctxObj = getWebGLContext(canvas);
  if (!ctxObj) return false;

  const { gl, program, buffer } = ctxObj;

  canvas.width = config.width;
  canvas.height = config.height;
  gl.viewport(0, 0, canvas.width, canvas.height);

  const atlas = getWebGLAtlas(ctxObj, config);
  if (!atlas) return false;

  const vertices = [];

  // 1. Background quad
  const bgRgba1 = hexToRgba(config.bg || '#000000', 1.0);
  const bgRgba2 = hexToRgba(config.bgColorMode === 'gradient' ? (config.bg2 || '#1a1a2e') : (config.bg || '#000000'), 1.0);
  const W = config.width;
  const H = config.height;
  const bgColorAt = (x, y) => {
    if (config.bgColorMode !== 'gradient') return bgRgba1;
    return lerpRgba(bgRgba1, bgRgba2, getGradientFactor(x, y, W, H, config));
  };

  vertices.push(
    0, 0, 0, 0, ...bgColorAt(0, 0),
    W, 0, 0, 0, ...bgColorAt(W, 0),
    0, H, 0, 0, ...bgColorAt(0, H),
    0, H, 0, 0, ...bgColorAt(0, H),
    W, 0, 0, 0, ...bgColorAt(W, 0),
    W, H, 0, 0, ...bgColorAt(W, H)
  );
  const bgVertexCount = 6;

  // 2. Icon quads
  const baseCell = config.cell || 28;
  const density = config.density || 1.0;
  const step = Math.max(10, baseCell / density);
  const diag = Math.hypot(config.width, config.height);
  const cols = Math.ceil(diag / step) + 8;
  const rows = Math.ceil(diag / step) + 8;
  const rand = mulberry32(config.seed);

  const baseOpacity = Number.isFinite(config.opacity) ? config.opacity : 0.3;
  const fgRgba1 = hexToRgba(config.fg || '#ffffff', baseOpacity);
  const fgRgba2 = hexToRgba(config.fg2 || '#cedb1a', baseOpacity);

  let paletteRgbas = [];
  if (config.fgColorMode === 'palette') {
    paletteRgbas = [
      hexToRgba(config.fg || '#ffffff', baseOpacity),
      hexToRgba(config.fg2 || '#cedb1a', baseOpacity),
      hexToRgba('#3a86ff', baseOpacity),
      hexToRgba('#ff006e', baseOpacity),
      hexToRgba('#8338ec', baseOpacity),
      hexToRgba('#ffbe0b', baseOpacity)
    ];
  }

  const iconPool = getRenderableIconPool(config);
  const layout = config.layout || 'grid';
  const items = [];

  if (layout === 'spiral') {
    const totalIcons = Math.min(2500, Math.floor((cols * rows) / 1.5));
    const cx = diag / 2;
    const cy = diag / 2;
    let radius = 0;
    let currentAngle = 0;
    for (let i = 0; i < totalIcons; i++) {
      const iconEntry = pickIcon(rand, iconPool);
      const px = cx + radius * Math.cos(currentAngle);
      const py = cy + radius * Math.sin(currentAngle);
      items.push({
        iconEntry,
        x: px,
        y: py,
        row: i,
        col: 0,
        index: i,
        randRotate: (rand() - 0.5) * (config.randomRotate || 0) * 2,
        randScale: 1 + (rand() - 0.5) * (config.randomScale || 0) * 2,
        paletteColor: paletteRgbas.length > 0 ? paletteRgbas[Math.floor(rand() * paletteRgbas.length)] : null
      });
      currentAngle += step / Math.max(step, radius);
      radius += step * 0.12;
      if (radius > diag * 0.8) break;
    }
  } else {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const iconEntry = pickIcon(rand, iconPool);
        let x = c * step + step / 2;
        let y = r * step + step / 2;

        if (layout === 'stagger') {
          if (config.staggerAxis === 'col') {
            if (c % 2 === 1) y += step / 2;
          } else {
            if (r % 2 === 1) x += step / 2;
          }
        } else if (layout === 'hex') {
          const hexH = step * 0.866;
          y = r * hexH + step / 2;
          if (r % 2 === 1) x += step / 2;
        } else if (layout === 'scatter') {
          const jitterX = (rand() - 0.5) * step * 0.7;
          const jitterY = (rand() - 0.5) * step * 0.7;
          x += jitterX;
          y += jitterY;
        }

        items.push({
          iconEntry,
          x,
          y,
          row: r,
          col: c,
          index: r * cols + c,
          randRotate: (rand() - 0.5) * (config.randomRotate || 0) * 2 + (layout === 'scatter' ? (rand() - 0.5) * 60 : 0),
          randScale: 1 + (rand() - 0.5) * (config.randomScale || 0) * 2,
          paletteColor: paletteRgbas.length > 0 ? paletteRgbas[Math.floor(rand() * paletteRgbas.length)] : null
        });
      }
    }
  }

  const gridCenterX = config.width / 2;
  const gridCenterY = config.height / 2;
  const gridAngleRad = ((config.angle || 0) * Math.PI) / 180;
  const cosG = Math.cos(gridAngleRad);
  const sinG = Math.sin(gridAngleRad);
  const originX = -diag / 2;
  const originY = -diag / 2;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    let drawX = item.x;
    let drawY = item.y;
    let drawAngle = item.randRotate || 0;
    let drawScale = item.randScale || 1;
    let itemAlpha = baseOpacity;

    const rx = originX + drawX;
    const ry = originY + drawY;
    const cx = gridCenterX + rx * cosG - ry * sinG;
    const cy = gridCenterY + rx * sinG + ry * cosG;

    const uv = atlas.atlasMap.get(item.iconEntry.id) || { u0: 0, v0: 0, u1: 1, v1: 1 };
    const size = baseCell * drawScale;
    const half = size / 2;
    const totalAngle = (drawAngle * Math.PI) / 180;
    const cosI = Math.cos(totalAngle);
    const sinI = Math.sin(totalAngle);

    const x0 = cx + (-half * cosI - -half * sinI);
    const y0 = cy + (-half * sinI + -half * cosI);
    const x1 = cx + (half * cosI - -half * sinI);
    const y1 = cy + (half * sinI + -half * cosI);
    const x2 = cx + (-half * cosI - half * sinI);
    const y2 = cy + (-half * sinI + half * cosI);
    const x3 = cx + (half * cosI - half * sinI);
    const y3 = cy + (half * sinI + half * cosI);

    let colorRgba = fgRgba1;
    if (config.fgColorMode === 'palette' && item.paletteColor) {
      colorRgba = item.paletteColor;
    } else if (config.fgColorMode === 'gradient') {
      const gradFactor = getGradientFactor(cx, cy, config.width, config.height, config, config.fgGradAngle);
      colorRgba = lerpRgba(fgRgba1, fgRgba2, gradFactor);
    }
    if (itemAlpha !== baseOpacity) {
      colorRgba = [colorRgba[0], colorRgba[1], colorRgba[2], itemAlpha];
    }

    // Canvas and WebGL use opposite texture origins. Keep screen Y in the
    // shader and explicitly map the atlas top row to the top of each quad.
    vertices.push(
      x0, y0, uv.u0, uv.v1, ...colorRgba,
      x1, y1, uv.u1, uv.v1, ...colorRgba,
      x2, y2, uv.u0, uv.v0, ...colorRgba,

      x2, y2, uv.u0, uv.v0, ...colorRgba,
      x1, y1, uv.u1, uv.v1, ...colorRgba,
      x3, y3, uv.u1, uv.v0, ...colorRgba
    );
  }

  const iconVertexCount = (vertices.length / 8) - bgVertexCount;

  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.useProgram(program);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  const uRes = gl.getUniformLocation(program, 'u_resolution');
  const uUseTex = gl.getUniformLocation(program, 'u_useTexture');
  const aPos = gl.getAttribLocation(program, 'a_position');
  const aTex = gl.getAttribLocation(program, 'a_texCoord');
  const aCol = gl.getAttribLocation(program, 'a_color');

  gl.uniform2f(uRes, canvas.width, canvas.height);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

  const stride = 8 * 4;
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, stride, 0);
  gl.enableVertexAttribArray(aTex);
  gl.vertexAttribPointer(aTex, 2, gl.FLOAT, false, stride, 2 * 4);
  gl.enableVertexAttribArray(aCol);
  gl.vertexAttribPointer(aCol, 4, gl.FLOAT, false, stride, 4 * 4);

  gl.uniform1f(uUseTex, 0.0);
  gl.drawArrays(gl.TRIANGLES, 0, bgVertexCount);

  if (iconVertexCount > 0) {
    gl.bindTexture(gl.TEXTURE_2D, atlas.texture);
    gl.uniform1f(uUseTex, 1.0);
    gl.drawArrays(gl.TRIANGLES, bgVertexCount, iconVertexCount);
  }

  return true;
}

function drawPreviewFrame(cfg, canvas) {
  const rendered = renderBackgroundWebGL(cfg, canvas, 0);
  if (!rendered) {
    if (!previewCtx) {
      previewCtx = canvas.getContext('2d');
    }
    if (previewCtx) {
      renderBackgroundToCanvas(cfg, canvas, previewCtx, 0);
    }
  }
}

function updatePreview() {
  currentConfig = readConfigFromForm();
  updateFieldVisibilities();
  updateRangeInputs();

  if (previewSeed === null) {
    previewSeed = currentConfig.seed;
  } else {
    currentConfig.seed = previewSeed;
  }

  const canvas = document.getElementById('bg-preview');
  if (!(canvas instanceof HTMLCanvasElement)) return;

  const cssSize = Math.max(PREVIEW_SIZE, Math.round(canvas.clientWidth || PREVIEW_SIZE));
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const renderSize = Math.max(PREVIEW_SIZE, Math.round(cssSize * dpr));

  const cfg = {
    ...currentConfig,
    width: renderSize,
    height: renderSize,
    cell: Math.max(12, currentConfig.cell),
    fontSize: Math.max(12, currentConfig.fontSize),
    quality: 0.8
  };

  drawPreviewFrame(cfg, canvas);
  updateSwatches();
}

let previewRaf = 0;
function schedulePreviewUpdate() {
  updateRangeInputs();
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
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

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
          document.documentElement.style.overflow = '';
          document.body.style.overflow = '';
        }, 150);
      } else {
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
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

  const webmBtn = document.getElementById('download-bg-webm');
  if (webmBtn) {
    webmBtn.addEventListener('click', async (event) => {
      event.preventDefault();
      const original = webmBtn.textContent;
      webmBtn.textContent = 'Запись видео (4с)...';
      webmBtn.style.pointerEvents = 'none';

      try {
        const config = readConfigFromForm();
        currentConfig = config;
        await generateBackgroundWebM(config);
        webmBtn.textContent = 'Записать еще';
      } catch (error) {
        console.error(error);
        webmBtn.textContent = 'Ошибка записи';
      } finally {
        webmBtn.style.pointerEvents = '';
        setTimeout(() => {
          webmBtn.textContent = original;
        }, 2000);
      }
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBackgroundDownloader, { once: true });
} else {
  initBackgroundDownloader();
}
