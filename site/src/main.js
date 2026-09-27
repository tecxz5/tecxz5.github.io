import SlideJS from './vendor/slidejs.js';
import t5Svg from './assets/icons/t5.svg?url';
import copyrightSvg from './assets/icons/c.svg?url';
import { BubblesEffect } from './bubbles.js';
import { LifeEffect } from './life.js';

(function () {
  const icons = [t5Svg, copyrightSvg];
  const icon = icons[Math.floor(Math.random() * icons.length)];
  const link = document.createElement('link');
  link.rel = 'icon';
  link.type = 'image/svg+xml';
  link.href = icon;
  document.head.appendChild(link);
})();

const canvas = document.querySelector('#bubbles-bg') || document.querySelector('#scribble-bg');
const symbolsCanvas = document.querySelector('#symbols-bg');
const lifeCanvas = document.querySelector('#life-bg');
const loader = document.querySelector('#loader');
const siteHeader = document.querySelector('#site-header');
const siteHeaderHoverZone = document.querySelector('#site-header-hover-zone');
const siteLogo = siteHeader.querySelector('.site-header__logo');
const siteNavigation = siteHeader.querySelector('.site-header__nav');
const presentationTrack = document.querySelector('#presentation-track');
const siteFooter = document.querySelector('.site-footer');
const bubblesEffect = new BubblesEffect(canvas);
const lifeEffect = lifeCanvas ? new LifeEffect(lifeCanvas) : null;
const symbolsGl = symbolsCanvas.getContext('webgl', {
  alpha: true,
  antialias: true,
  premultipliedAlpha: false
});

let resizeTimer;
let animationFrame;
let backgroundReady = false;
let loaderHidden = false;
let loaderExitTimer;
let symbolGrid = {
  cell: 92,
  columns: 0,
  rows: 0,
  width: 0,
  height: 0
};
let symbolsProgram;
let symbolsBuffer;
let symbolsTexture;
let symbolsVertexCount = 0;
let presentationAngle = -8;
let sectionSlider;
let activeSlideIndex = 0;
let menuRestoreTimer;
let menuRestoreEndHandler;
let isLinkJumpAnimating = false;
let pendingNavHash = null;
let pendingPresentationSlide = null;
let presentationSlideTimer;
let isScrollLocked = false;
let isProgrammaticSectionMove = false;
let wheelBurstLocked = false;
let wheelBurstReleaseTimer;
let lastWheelEventAt = 0;
let touchGestureStartX = 0;
let touchGestureStartY = 0;
let touchGestureHandled = false;
const symbolPatternSeed = 5185;
const presentationSlideCount = 3;
const wheelIntentThreshold = 10;
const wheelBurstQuietDelay = 180;
const touchGestureThreshold = 18;
const pageByHash = new Map([
  ['#top', { section: 1 }],
  ['#about', { section: 2, slide: 0 }],
  ['#services', { section: 2, slide: 1 }],
  ['#portfolio', { section: 2, slide: 2 }],
  ['#links', { section: 3 }]
]);

const loaderExitDelay = 1500;
const materialSymbols = [
  'terminal',
  'code',
  'memory',
  'hub',
  'data_object',
  'polyline',
  'settings',
  'bolt',
  'dns',
  'route',
  'schema',
  'api',
  'deployed_code',
  'extension',
  'lan',
  'network_node',
  'gesture',
  'draw',
  'architecture',
  'webhook'
];
const symbolsVertexShader = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  attribute vec4 a_color;

  uniform vec2 u_resolution;
  uniform vec2 u_offset;

  varying vec2 v_texCoord;
  varying vec4 v_color;

  void main() {
    vec2 position = a_position + u_offset;
    vec2 clip = (position / u_resolution) * 2.0 - 1.0;
    gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
    v_texCoord = a_texCoord;
    v_color = a_color;
  }
`;
const symbolsFragmentShader = `
  precision mediump float;

  uniform sampler2D u_texture;

  varying vec2 v_texCoord;
  varying vec4 v_color;

  void main() {
    float alpha = texture2D(u_texture, v_texCoord).a;
    gl_FragColor = vec4(v_color.rgb, v_color.a * alpha);
  }
`;

const loadingState = {
  page: false,
  fonts: false,
  background: false
};

function getViewportHeight() {
  return Math.max(1, Math.round(window.visualViewport?.height || window.innerHeight));
}

function syncViewportMetrics() {
  document.documentElement.style.setProperty('--app-height', `${getViewportHeight()}px`);
}

function randomBetween(min, max) {
  const values = new Uint32Array(1);

  if (window.crypto?.getRandomValues) {
    window.crypto.getRandomValues(values);
    return min + (values[0] / 0xffffffff) * (max - min);
  }

  return min + Math.random() * (max - min);
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function hashUnit(value) {
  const x = Math.sin(value) * 10000;
  return x - Math.floor(x);
}

function cellRandom(column, row, salt) {
  return hashUnit((column + 1) * 127.1 + (row + 1) * 311.7 + salt * 74.7 + symbolPatternSeed);
}

function setupHeaderAngles() {
  const topAngle = randomBetween(0, 8);
  const bottomAngle = randomBetween(-8, 0);
  const topShift = 0;
  const bottomShift = 0;

  siteHeader.style.setProperty('--header-top-angle', `${topAngle.toFixed(2)}deg`);
  siteHeader.style.setProperty('--header-bottom-angle', `${bottomAngle.toFixed(2)}deg`);
  siteHeader.style.setProperty('--header-top-shift', `${topShift.toFixed(0)}px`);
  siteHeader.style.setProperty('--header-bottom-shift', `${bottomShift.toFixed(0)}px`);
  presentationAngle = bottomAngle;
  document.documentElement.style.setProperty('--presentation-angle', `${bottomAngle.toFixed(2)}deg`);
}

function setupFooterShape() {
  if (!siteFooter) return;
  const cornerX = randomBetween(47, 53);
  const cornerHeight = randomBetween(13, 17);
  const leftAngle = randomBetween(6.5, 8.5);
  const rightAngle = randomBetween(6.0, 8.0);

  const leftTan = Math.tan((leftAngle * Math.PI) / 180);
  const rightTan = Math.tan((rightAngle * Math.PI) / 180);

  const leftRiseVw = (cornerX * leftTan).toFixed(2);
  const rightRiseVw = ((100 - cornerX) * rightTan).toFixed(2);

  siteFooter.style.setProperty('--footer-corner-x', `${cornerX.toFixed(1)}%`);
  siteFooter.style.setProperty('--footer-corner-height', `calc(clamp(96px, ${cornerHeight.toFixed(1)}vh, 140px) + var(--safe-bottom, 0px))`);
  siteFooter.style.setProperty('--footer-left-height', `calc(var(--footer-corner-height) + max(36px, ${leftRiseVw}vw))`);
  siteFooter.style.setProperty('--footer-right-height', `calc(var(--footer-corner-height) + max(36px, ${rightRiseVw}vw))`);
}

function triggerHaptic(pattern = 12) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try { navigator.vibrate(pattern); } catch {}
  }
}

function setupSectionLinks() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const hash = link.getAttribute('href');

      if (window.innerWidth <= 720 && hash === '#top' && !siteHeader.classList.contains('is-menu-open')) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
      }

      if (!pageByHash.has(hash)) {
        return;
      }

      event.preventDefault();
      triggerHaptic(12);
      setMenuOpen(false);

      const destination = pageByHash.get(hash);
      pendingNavHash = hash;
      window.history.replaceState(null, '', hash);
      setCurrentNavLink(hash);
      isLinkJumpAnimating = true;
      setHeaderCompact(destination.section === 2);
      document.body.classList.add('is-page-scrolling');

      if (destination.slide === undefined) {
        if (!moveToSection(destination.section)) {
          finishNavigation();
        }

        return;
      }

      if (getActiveSectionIndex() === 1) {
        animatePresentationSlide(destination.slide, () => finishNavigation());
        return;
      }

      pendingPresentationSlide = destination.slide;
      setPresentationSlide(destination.slide, false);
      moveToSection(destination.section);
    });
  });
}

function getLogoLabel() {
  return 'tecxz5';
}

function getMenuButtonLabel(isOpen) {
  return isOpen ? 'Закрыть меню' : 'Открыть меню';
}

function syncMenuControls(isOpen) {
  siteLogo.setAttribute('aria-label', getLogoLabel());
  siteHeader.setAttribute('aria-expanded', String(isOpen));
  siteHeader.setAttribute('aria-label', getMenuButtonLabel(isOpen));
}

function clearMenuRestoreState() {
  window.clearTimeout(menuRestoreTimer);

  if (menuRestoreEndHandler) {
    siteHeader.removeEventListener('transitionend', menuRestoreEndHandler);
    menuRestoreEndHandler = null;
  }
}

function setMenuOpen(isOpen) {
  clearMenuRestoreState();

  if (
    !isOpen &&
    window.innerWidth <= 720 &&
    siteHeader.classList.contains('is-menu-open') &&
    siteHeader.classList.contains('is-compact')
  ) {
    const finishRestore = () => {
      clearMenuRestoreState();
      siteHeader.classList.remove('is-menu-restoring');
      syncMenuControls(false);
    };

    menuRestoreEndHandler = (event) => {
      if (event.target === siteHeader && event.propertyName === 'height') {
        finishRestore();
      }
    };

    siteHeader.classList.add('is-menu-restoring');
    siteHeader.classList.remove('is-menu-open');
    siteHeader.classList.remove('is-hovered');
    syncMenuControls(false);
    siteHeader.addEventListener('transitionend', menuRestoreEndHandler);
    menuRestoreTimer = window.setTimeout(finishRestore, 520);
    return;
  }

  siteHeader.classList.remove('is-menu-restoring');

  const wasOpen = siteHeader.classList.contains('is-menu-open');
  siteHeader.classList.toggle('is-menu-open', isOpen);
  const nowOpen = siteHeader.classList.contains('is-menu-open');

  if (wasOpen !== nowOpen && window.innerWidth <= 720) {
    triggerHaptic(18);
  }

  if (window.innerWidth <= 720) {
    siteHeader.classList.remove('is-hovered');
  }

  syncMenuControls(isOpen);
}

function setupMobileMenu() {
  function openMenuAfterRestore() {
    let isRestored = false;

    const finishRestore = () => {
      if (isRestored) {
        return;
      }

      isRestored = true;
      clearMenuRestoreState();
      setMenuOpen(true);
    };

    menuRestoreEndHandler = (event) => {
      if (event.target === siteHeader && event.propertyName === 'height') {
        finishRestore();
      }
    };

    clearMenuRestoreState();
    siteHeader.classList.add('is-menu-restoring');
    syncMenuControls(false);
    siteHeader.addEventListener('transitionend', menuRestoreEndHandler);
    menuRestoreTimer = window.setTimeout(finishRestore, 520);
  }

  let activeTouchLink = null;
  let suppressLogoTopNavigation = false;
  let touchResetTimer = null;

  function clearTouchLink() {
    window.clearTimeout(touchResetTimer);
    touchResetTimer = null;

    if (!activeTouchLink) {
      return;
    }

    activeTouchLink.classList.remove('is-touch-active');
    activeTouchLink = null;
  }

  function scheduleTouchLinkClear(delay = 90) {
    window.clearTimeout(touchResetTimer);
    touchResetTimer = window.setTimeout(clearTouchLink, delay);
  }

  siteHeader.addEventListener('pointerdown', (event) => {
    if (window.innerWidth > 720) {
      return;
    }

    const tappedLink = event.target.closest('a');

    if (tappedLink) {
      if (!tappedLink.classList.contains('site-header__logo')) {
        clearTouchLink();
        tappedLink.classList.add('is-touch-active');
        activeTouchLink = tappedLink;
        return;
      }

      if (siteHeader.classList.contains('is-menu-open')) {
        clearTouchLink();
        tappedLink.classList.add('is-touch-active');
        activeTouchLink = tappedLink;
        suppressLogoTopNavigation = false;
        return;
      }

      suppressLogoTopNavigation = true;
      event.preventDefault();
      event.stopPropagation();

      if (siteHeader.classList.contains('is-compact')) {
        openMenuAfterRestore();
        return;
      }

      setMenuOpen(true);
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    if (siteHeader.classList.contains('is-menu-open')) {
      setMenuOpen(false);
      return;
    }

    if (siteHeader.classList.contains('is-compact')) {
      openMenuAfterRestore();
      return;
    }

    setMenuOpen(true);
  });

  document.addEventListener('pointerdown', (event) => {
    if (window.innerWidth > 720 || !siteHeader.classList.contains('is-menu-open')) {
      return;
    }

    if (event.target.closest('.site-header')) {
      return;
    }

    setMenuOpen(false);
  });

  siteNavigation.addEventListener('click', (event) => {
    if (event.target.closest('a')) {
      setMenuOpen(false);
    }
  });

  siteLogo.addEventListener('click', (event) => {
    if (window.innerWidth > 720) {
      return;
    }

    if (suppressLogoTopNavigation) {
      event.preventDefault();
      event.stopImmediatePropagation();
      suppressLogoTopNavigation = false;
      return;
    }

    if (!siteHeader.classList.contains('is-menu-open')) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      setMenuOpen(false);
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 720) {
      setMenuOpen(false);
      suppressLogoTopNavigation = false;
    }

    syncMenuControls(siteHeader.classList.contains('is-menu-open'));
  });

  window.addEventListener('pointerup', () => {
    scheduleTouchLinkClear();
  });

  window.addEventListener('pointercancel', clearTouchLink);
  window.addEventListener('blur', clearTouchLink);

  syncMenuControls(false);
}

function setupHeaderHoverZone() {
  if (window.matchMedia('(max-width: 720px)').matches) {
    return;
  }

  function addHeaderHover() {
    siteHeader.classList.add('is-hovered');
  }

  function removeHeaderHover() {
    siteHeader.classList.remove('is-hovered');
  }

  siteHeaderHoverZone.addEventListener('mouseenter', addHeaderHover);
  siteHeaderHoverZone.addEventListener('mouseleave', removeHeaderHover);
  siteHeader.addEventListener('mouseenter', addHeaderHover);
  siteHeader.addEventListener('mouseleave', removeHeaderHover);

  siteHeader.querySelectorAll('.site-header__nav a').forEach((link) => {
    link.addEventListener('mouseenter', () => {
      link.classList.add('is-hovered');
    });

    link.addEventListener('mouseleave', () => {
      link.classList.remove('is-hovered');
    });
  });

  siteLogo.addEventListener('mouseenter', () => {
    siteLogo.classList.add('is-hovered');
  });

  siteLogo.addEventListener('mouseleave', () => {
    siteLogo.classList.remove('is-hovered');
  });
}

function setupMobileHeaderHover() {
  if (!window.matchMedia('(max-width: 720px)').matches) {
    return;
  }

  siteHeader.addEventListener('pointerover', (event) => {
    const link = event.target.closest('.site-header__nav a');

    if (!link || !siteHeader.classList.contains('is-menu-open')) {
      return;
    }

    siteHeader.querySelectorAll('.site-header__nav a.is-hovered').forEach((item) => {
      if (item !== link) {
        item.classList.remove('is-hovered');
      }
    });

    link.classList.add('is-hovered');
  });

  siteHeader.addEventListener('pointerout', (event) => {
    const link = event.target.closest('.site-header__nav a');

    if (!link) {
      return;
    }

    if (event.relatedTarget && link.contains(event.relatedTarget)) {
      return;
    }

    link.classList.remove('is-hovered');
  });
}

function smoothStep(progress) {
  return progress * progress * (3 - 2 * progress);
}

function resizeCanvas() {
  const rect = canvas.parentElement.getBoundingClientRect();
  bubblesEffect.resize(rect.width, rect.height);
}

function resizeLifeCanvas() {
  if (lifeEffect && lifeCanvas) {
    const rect = lifeCanvas.parentElement.getBoundingClientRect();
    lifeEffect.resize(rect.width, rect.height);
  }
}

function resizeSymbolsCanvas() {
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  const width = presentationTrack.scrollWidth;
  const height = getViewportHeight();

  symbolsCanvas.width = Math.floor(width * pixelRatio);
  symbolsCanvas.height = Math.floor(height * pixelRatio);
  symbolsCanvas.style.width = `${width}px`;
  symbolsCanvas.style.height = `${height}px`;
  symbolGrid.width = width;
  symbolGrid.height = height;

  if (symbolsGl) {
    symbolsGl.viewport(0, 0, symbolsCanvas.width, symbolsCanvas.height);
  }
}

function draw(now) {
  if (document.hidden) {
    animationFrame = window.requestAnimationFrame(draw);
    return;
  }

  const sectionIndex = getActiveSectionIndex();

  if (sectionIndex === 0) {
    bubblesEffect.updateAndDraw(now);
  }

  if (sectionIndex === 1) {
    drawSymbols(now);
  }

  if (sectionIndex === 2 && lifeEffect) {
    lifeEffect.updateAndDraw(now);
  }

  if (!backgroundReady) {
    backgroundReady = true;
    markLoaded('background');
  }

  animationFrame = window.requestAnimationFrame(draw);
}

function compileSymbolsShader(type, source, context = symbolsGl) {
  const shader = context.createShader(type);
  context.shaderSource(shader, source);
  context.compileShader(shader);

  if (!context.getShaderParameter(shader, context.COMPILE_STATUS)) {
    throw new Error(context.getShaderInfoLog(shader));
  }

  return shader;
}

function createSymbolsProgram() {
  const program = symbolsGl.createProgram();

  symbolsGl.attachShader(program, compileSymbolsShader(symbolsGl.VERTEX_SHADER, symbolsVertexShader));
  symbolsGl.attachShader(program, compileSymbolsShader(symbolsGl.FRAGMENT_SHADER, symbolsFragmentShader));
  symbolsGl.linkProgram(program);

  if (!symbolsGl.getProgramParameter(program, symbolsGl.LINK_STATUS)) {
    throw new Error(symbolsGl.getProgramInfoLog(program));
  }

  return program;
}

function createSymbolsAtlas() {
  const cell = 96;
  const columns = 5;
  const rows = Math.ceil(materialSymbols.length / columns);
  const atlas = document.createElement('canvas');
  const atlasCtx = atlas.getContext('2d');

  atlas.width = columns * cell;
  atlas.height = rows * cell;
  atlasCtx.clearRect(0, 0, atlas.width, atlas.height);
  atlasCtx.fillStyle = '#fff';
  atlasCtx.textAlign = 'center';
  atlasCtx.textBaseline = 'middle';
  atlasCtx.font = '400 58px "Material Symbols Outlined"';

  if ('fontKerning' in atlasCtx) {
    atlasCtx.fontKerning = 'none';
  }

  if ('fontVariantLigatures' in atlasCtx) {
    atlasCtx.fontVariantLigatures = 'normal';
  }

  materialSymbols.forEach((icon, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    atlasCtx.fillText(icon, column * cell + cell / 2, row * cell + cell / 2);
  });

  symbolsTexture = symbolsGl.createTexture();
  symbolsGl.bindTexture(symbolsGl.TEXTURE_2D, symbolsTexture);
  symbolsGl.texParameteri(symbolsGl.TEXTURE_2D, symbolsGl.TEXTURE_WRAP_S, symbolsGl.CLAMP_TO_EDGE);
  symbolsGl.texParameteri(symbolsGl.TEXTURE_2D, symbolsGl.TEXTURE_WRAP_T, symbolsGl.CLAMP_TO_EDGE);
  symbolsGl.texParameteri(symbolsGl.TEXTURE_2D, symbolsGl.TEXTURE_MIN_FILTER, symbolsGl.LINEAR);
  symbolsGl.texParameteri(symbolsGl.TEXTURE_2D, symbolsGl.TEXTURE_MAG_FILTER, symbolsGl.LINEAR);
  symbolsGl.texImage2D(symbolsGl.TEXTURE_2D, 0, symbolsGl.RGBA, symbolsGl.RGBA, symbolsGl.UNSIGNED_BYTE, atlas);

  return { cell, columns, rows, width: atlas.width, height: atlas.height };
}

function pushSymbolQuad(vertices, x, y, size, iconIndex, color, atlas) {
  const column = iconIndex % atlas.columns;
  const row = Math.floor(iconIndex / atlas.columns);
  const u0 = (column * atlas.cell) / atlas.width;
  const v0 = (row * atlas.cell) / atlas.height;
  const u1 = ((column + 1) * atlas.cell) / atlas.width;
  const v1 = ((row + 1) * atlas.cell) / atlas.height;
  const x0 = x - size / 2;
  const y0 = y - size / 2;
  const x1 = x + size / 2;
  const y1 = y + size / 2;
  const [r, g, b, a] = color;

  vertices.push(
    x0, y0, u0, v0, r, g, b, a,
    x1, y0, u1, v0, r, g, b, a,
    x0, y1, u0, v1, r, g, b, a,
    x0, y1, u0, v1, r, g, b, a,
    x1, y0, u1, v0, r, g, b, a,
    x1, y1, u1, v1, r, g, b, a
  );
}

function resetSymbols() {
  if (!symbolsGl) {
    symbolsCanvas.style.display = 'none';
    return;
  }

  if (!symbolsProgram) {
    symbolsProgram = createSymbolsProgram();
    symbolsBuffer = symbolsGl.createBuffer();
  }

  const atlas = createSymbolsAtlas();
  const width = symbolGrid.width || window.innerWidth;
  const height = symbolGrid.height || getViewportHeight();
  const cell = window.innerWidth <= 720 ? 46 : 58;
  const span = Math.hypot(width, height) + cell * 10;
  const columns = Math.ceil(span / cell);
  const rows = Math.ceil(span / cell);
  const centerX = width / 2;
  const centerY = height / 2;
  const angle = (presentationAngle || -8) * (Math.PI / 180);
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const vertices = [];

  symbolGrid = { ...symbolGrid, cell, columns, rows, width, height };

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const stableIcon = Math.floor(cellRandom(column, row, 1) * materialSymbols.length);
      const size = cell * (0.58 + cellRandom(column, row, 2) * 0.32);
      const accent = cellRandom(column, row, 3) < 0.12;
      const alpha = accent
        ? 0.5 + cellRandom(column, row, 4) * 0.28
        : 0.22 + cellRandom(column, row, 5) * 0.2;
      const color = accent ? [206 / 255, 219 / 255, 26 / 255, alpha] : [1, 1, 1, alpha];
      const rawX = column * cell - span / 2;
      const rawY = row * cell - span / 2;
      const x = centerX + rawX * cos - rawY * sin;
      const y = centerY + rawX * sin + rawY * cos;

      pushSymbolQuad(vertices, x, y, size, stableIcon, color, atlas);
    }
  }

  symbolsVertexCount = vertices.length / 8;
  symbolsGl.bindBuffer(symbolsGl.ARRAY_BUFFER, symbolsBuffer);
  symbolsGl.bufferData(symbolsGl.ARRAY_BUFFER, new Float32Array(vertices), symbolsGl.STATIC_DRAW);
}

let cachedURes = null, cachedUOff = null, cachedAPos = -1, cachedATex = -1, cachedACol = -1;

function initSymbolsLocations() {
  if (cachedURes !== null || !symbolsGl || !symbolsProgram) return;
  cachedURes = symbolsGl.getUniformLocation(symbolsProgram, 'u_resolution');
  cachedUOff = symbolsGl.getUniformLocation(symbolsProgram, 'u_offset');
  cachedAPos = symbolsGl.getAttribLocation(symbolsProgram, 'a_position');
  cachedATex = symbolsGl.getAttribLocation(symbolsProgram, 'a_texCoord');
  cachedACol = symbolsGl.getAttribLocation(symbolsProgram, 'a_color');
}

function drawSymbols(now) {
  if (!symbolsGl || !symbolsProgram || !symbolsVertexCount) {
    return;
  }

  initSymbolsLocations();

  const { cell } = symbolGrid;
  const width = symbolGrid.width || window.innerWidth;
  const height = symbolGrid.height || getViewportHeight();
  const drift = now / 1000;
  const offsetX = Math.sin(drift * 0.18) * cell * 0.34;
  const offsetY = Math.cos(drift * 0.14) * cell * 0.28;

  symbolsGl.viewport(0, 0, symbolsCanvas.width, symbolsCanvas.height);
  symbolsGl.clearColor(0, 0, 0, 0);
  symbolsGl.clear(symbolsGl.COLOR_BUFFER_BIT);
  symbolsGl.useProgram(symbolsProgram);
  symbolsGl.uniform2f(cachedURes, width, height);
  symbolsGl.uniform2f(cachedUOff, offsetX, offsetY);
  symbolsGl.bindTexture(symbolsGl.TEXTURE_2D, symbolsTexture);
  symbolsGl.bindBuffer(symbolsGl.ARRAY_BUFFER, symbolsBuffer);
  symbolsGl.enable(symbolsGl.BLEND);
  symbolsGl.blendFunc(symbolsGl.SRC_ALPHA, symbolsGl.ONE_MINUS_SRC_ALPHA);

  const stride = 8 * 4;
  symbolsGl.enableVertexAttribArray(cachedAPos);
  symbolsGl.vertexAttribPointer(cachedAPos, 2, symbolsGl.FLOAT, false, stride, 0);
  symbolsGl.enableVertexAttribArray(cachedATex);
  symbolsGl.vertexAttribPointer(cachedATex, 2, symbolsGl.FLOAT, false, stride, 2 * 4);
  symbolsGl.enableVertexAttribArray(cachedACol);
  symbolsGl.vertexAttribPointer(cachedACol, 4, symbolsGl.FLOAT, false, stride, 4 * 4);
  symbolsGl.drawArrays(symbolsGl.TRIANGLES, 0, symbolsVertexCount);
}

function startBackground() {
  window.cancelAnimationFrame(animationFrame);
  resizeCanvas();
  resizeSymbolsCanvas();
  resizeLifeCanvas();
  resetSymbols();
  animationFrame = window.requestAnimationFrame(draw);
}

function hideLoader() {
  if (loaderHidden) {
    return;
  }

  loaderHidden = true;
  document.body.classList.remove('is-loading');
  document.body.classList.add('is-loaded');
  window.setTimeout(() => loader.remove(), 1800);
}

function markLoaded(key) {
  loadingState[key] = true;

  if (loadingState.page && loadingState.fonts && loadingState.background) {
    window.clearTimeout(loaderExitTimer);
    loaderExitTimer = window.setTimeout(hideLoader, loaderExitDelay);
  }
}

function waitForPageLoad() {
  if (document.readyState === 'complete') {
    markLoaded('page');
    return;
  }

  window.addEventListener('load', () => markLoaded('page'), { once: true });
}

function waitForFonts() {
  if (!document.fonts) {
    markLoaded('fonts');
    return;
  }

  document.fonts.ready.then(() => {
    resetSymbols();
    markLoaded('fonts');
  });
}

function setPresentationSlide(slideIndex, animate = true) {
  const clampedIndex = Math.min(Math.max(slideIndex, 0), presentationSlideCount - 1);
  activeSlideIndex = clampedIndex;

  if (!animate) {
    document.body.classList.add('is-track-instant');
  }

  presentationTrack.style.transform = `translateX(${-clampedIndex * window.innerWidth}px)`;

  if (!animate) {
    window.requestAnimationFrame(() => {
      document.body.classList.remove('is-track-instant');
    });
  }
}

function animatePresentationSlide(slideIndex, onComplete) {
  const clampedIndex = Math.min(Math.max(slideIndex, 0), presentationSlideCount - 1);

  if (clampedIndex === activeSlideIndex) {
    onComplete?.();
    return;
  }

  isScrollLocked = true;
  setHeaderCompact(true);
  triggerHaptic(10);
  setPresentationSlide(clampedIndex, true);
  syncCurrentHash();
  window.clearTimeout(presentationSlideTimer);

  function handleTransitionEnd(event) {
    if (event.target !== presentationTrack || event.propertyName !== 'transform') {
      return;
    }

    presentationTrack.removeEventListener('transitionend', handleTransitionEnd);
    window.clearTimeout(presentationSlideTimer);
    onComplete?.();
    completeScrollStep();
  }

  presentationTrack.addEventListener('transitionend', handleTransitionEnd);
  presentationSlideTimer = window.setTimeout(() => {
    presentationTrack.removeEventListener('transitionend', handleTransitionEnd);
    onComplete?.();
    completeScrollStep();
  }, 580);
}

function setHeaderCompact(isCompact) {
  if (siteHeader.classList.contains('is-menu-open')) {
    return;
  }

  siteHeader.classList.toggle('is-compact', isCompact);
}

function updateHeaderForSection(sectionIndex) {
  if (isLinkJumpAnimating) {
    return;
  }

  setHeaderCompact(sectionIndex === 1);
}

function finishNavigation() {
  isLinkJumpAnimating = false;
  pendingNavHash = null;
  unlockScrollStep();
}

function withProgrammaticSectionMove(action) {
  isProgrammaticSectionMove = true;

  try {
    action();
  } finally {
    isProgrammaticSectionMove = false;
  }
}

function moveToSection(sectionNumber) {
  if (!sectionSlider) {
    return false;
  }

  const destinationIndex = Math.max(sectionNumber - 1, 0);

  if (sectionSlider.activeIndex === destinationIndex) {
    return false;
  }

  withProgrammaticSectionMove(() => {
    sectionSlider.slideTo(destinationIndex);
  });

  return true;
}

function getActiveSectionIndex() {
  return sectionSlider?.activeIndex ?? 0;
}

function unlockScrollStep() {
  isScrollLocked = false;
  document.body.classList.remove('is-page-scrolling');
}

function beginSectionScroll(destinationSectionIndex) {
  isScrollLocked = true;
  document.body.classList.add('is-page-scrolling');

  if (destinationSectionIndex !== undefined) {
    setHeaderCompact(destinationSectionIndex === 1);
  }
}

function completeScrollStep() {
  unlockScrollStep();
}

function syncCurrentHash() {
  if (!isLinkJumpAnimating) {
    const hash = resolveCurrentHash();
    window.history.replaceState(null, '', hash);
    setCurrentNavLink(hash);
  }
}

function setCurrentNavLink(hash) {
  siteNavigation.querySelectorAll('a').forEach((link) => {
    link.classList.toggle('is-current', link.getAttribute('href') === hash);
  });
}

function resolveCurrentHash() {
  const section = getActiveSectionIndex();

  if (section === 0) {
    return '#top';
  }

  if (section >= 2) {
    return '#links';
  }

  const slides = ['#about', '#services', '#portfolio'];
  return slides[activeSlideIndex] || '#about';
}

function normalizeWheelDelta(value, deltaMode = 0) {
  if (deltaMode === 1) {
    return Math.abs(value) * 16;
  }

  if (deltaMode === 2) {
    return Math.abs(value) * getViewportHeight();
  }

  return Math.abs(value);
}

function resolveWheelStep(event) {
  const deltaX = event.deltaX ?? (event.wheelDeltaX ? -event.wheelDeltaX : 0);
  const deltaY = event.deltaY ?? (event.wheelDelta ? -event.wheelDelta : event.detail ?? 0);
  const absDeltaX = Math.abs(deltaX);
  const absDeltaY = Math.abs(deltaY);

  if (absDeltaX < 0.1 && absDeltaY < 0.1) {
    return null;
  }

  const useHorizontal = absDeltaX > absDeltaY;
  const rawDelta = useHorizontal ? deltaX : deltaY;
  const magnitude = normalizeWheelDelta(rawDelta, event.deltaMode ?? 0);

  if (magnitude < wheelIntentThreshold) {
    return null;
  }

  return {
    axisDelta: rawDelta,
    direction: useHorizontal ? (rawDelta < 0 ? 1 : -1) : rawDelta > 0 ? 1 : -1,
    magnitude
  };
}

function queueWheelBurstRelease() {
  window.clearTimeout(wheelBurstReleaseTimer);
  wheelBurstReleaseTimer = window.setTimeout(() => {
    const isWheelBurstStillActive = performance.now() - lastWheelEventAt < wheelBurstQuietDelay;

    if (isScrollLocked || isWheelBurstStillActive) {
      queueWheelBurstRelease();
      return;
    }

    wheelBurstLocked = false;
  }, wheelBurstQuietDelay);
}

function stepByWheelGesture(direction) {
  if (
    !loaderHidden ||
    !sectionSlider ||
    isScrollLocked ||
    isLinkJumpAnimating ||
    siteHeader.classList.contains('is-menu-open')
  ) {
    return false;
  }

  const sectionIndex = getActiveSectionIndex();

  if (sectionIndex === 1) {
    document.body.classList.add('is-page-scrolling');

    if (direction > 0 && activeSlideIndex < presentationSlideCount - 1) {
      animatePresentationSlide(activeSlideIndex + 1);
      return true;
    }

    if (direction < 0 && activeSlideIndex > 0) {
      animatePresentationSlide(activeSlideIndex - 1);
      return true;
    }
  }

  if (direction > 0) {
    if (sectionIndex >= 2) {
      return false;
    }

    sectionSlider.slideNext();
    return true;
  }

  if (sectionIndex <= 0) {
    return false;
  }

  sectionSlider.slidePrev();
  return true;
}

function setupWheelGestureLock() {
  const handleWheel = (event) => {
    if (event.target && event.target.closest && event.target.closest('.portfolio-card, .portfolio-demo, .chat-widget__messages, .cli-body, .service-card')) {
      return;
    }

    const step = resolveWheelStep(event);

    if (!step) {
      return;
    }

    if (event.cancelable) {
      event.preventDefault();
    }

    event.stopImmediatePropagation();

    if (!loaderHidden || !sectionSlider) {
      return;
    }

    lastWheelEventAt = performance.now();

    if (wheelBurstLocked) {
      queueWheelBurstRelease();
      return;
    }

    if (isScrollLocked || isLinkJumpAnimating || siteHeader.classList.contains('is-menu-open')) {
      return;
    }

    if (!stepByWheelGesture(step.direction)) {
      return;
    }

    wheelBurstLocked = true;
    queueWheelBurstRelease();
  };

  window.onmousewheel = null;
  document.onmousewheel = null;
  window.addEventListener('wheel', handleWheel, { passive: false, capture: true });
  document.addEventListener('DOMMouseScroll', handleWheel, { passive: false, capture: true });
}

function resolveTouchStep(touchX, touchY) {
  const deltaX = touchGestureStartX - touchX;
  const deltaY = touchGestureStartY - touchY;
  const absDeltaX = Math.abs(deltaX);
  const absDeltaY = Math.abs(deltaY);

  if (absDeltaX < touchGestureThreshold && absDeltaY < touchGestureThreshold) {
    return null;
  }

  const useHorizontal = absDeltaX > absDeltaY;
  const primaryDelta = useHorizontal ? deltaX : deltaY;

  if (Math.abs(primaryDelta) < touchGestureThreshold) {
    return null;
  }

  return primaryDelta > 0 ? 1 : -1;
}

function setupTouchGestureLock() {
  window.addEventListener(
    'touchstart',
    (event) => {
      if (event.touches.length !== 1) {
        touchGestureHandled = false;
        return;
      }

      touchGestureStartX = event.touches[0].clientX;
      touchGestureStartY = event.touches[0].clientY;
      touchGestureHandled = false;
    },
    { passive: true }
  );

  window.addEventListener(
    'touchmove',
    (event) => {
      if (event.target && event.target.closest && event.target.closest('.portfolio-card, .portfolio-demo, .chat-widget__messages, .cli-body, .service-card')) {
        return;
      }
      if (event.touches.length !== 1 || !loaderHidden || !sectionSlider) {
        return;
      }

      const direction = resolveTouchStep(event.touches[0].clientX, event.touches[0].clientY);

      if (!direction) {
        return;
      }

      if (event.cancelable) {
        event.preventDefault();
      }

      if (touchGestureHandled || isScrollLocked || isLinkJumpAnimating) {
        touchGestureHandled = true;
        return;
      }

      touchGestureHandled = stepByWheelGesture(direction);
    },
    { passive: false, capture: true }
  );

  window.addEventListener(
    'touchend',
    () => {
      touchGestureHandled = false;
    },
    { passive: true }
  );

  window.addEventListener(
    'touchcancel',
    () => {
      touchGestureHandled = false;
    },
    { passive: true }
  );
}

function handleSectionBeforeSlide(prevIndex, nextIndex) {
  if (prevIndex === nextIndex) {
    return 'stop';
  }

  if ((!loaderHidden && !isProgrammaticSectionMove) || isScrollLocked) {
    return 'stop';
  }

  if (siteHeader.classList.contains('is-menu-open')) {
    return 'stop';
  }

  if (!isProgrammaticSectionMove && prevIndex === 1) {
    if (nextIndex > prevIndex && activeSlideIndex < presentationSlideCount - 1) {
      animatePresentationSlide(activeSlideIndex + 1);
      return 'stop';
    }

    if (nextIndex < prevIndex && activeSlideIndex > 0) {
      animatePresentationSlide(activeSlideIndex - 1);
      return 'stop';
    }
  }

  if (
    !isProgrammaticSectionMove &&
    prevIndex === 2 &&
    nextIndex === 1 &&
    pendingPresentationSlide === null
  ) {
    pendingPresentationSlide = presentationSlideCount - 1;
    setPresentationSlide(pendingPresentationSlide, false);
  }

  if (!isProgrammaticSectionMove) {
    triggerHaptic(12);
    beginSectionScroll(nextIndex);
    window.setTimeout(() => syncCurrentHash(), 16);
  }

  return undefined;
}

function setupSmoothScroll() {
  const initialDestination = pageByHash.get(window.location.hash);
  const startSection = initialDestination ? initialDestination.section - 1 : 0;

  sectionSlider = new SlideJS({
    parentSelector: '#fullpage',
    itemSelector: '.section',
    height: getViewportHeight,
    transitionDuration: 700,
    transitionTimingFunction: 'cubic-bezier(0.76, 0, 0.24, 1)',
    activeIndex: startSection,
    loop: false,
    beforeSlide: (prevIndex, nextIndex) => handleSectionBeforeSlide(prevIndex, nextIndex),
    afterSlide: (prevIndex, nextIndex) => {
      const direction = nextIndex > prevIndex ? 'down' : 'up';

      updateHeaderForSection(nextIndex);
      syncCurrentHash();

      if (nextIndex === 1) {
        let slideIndex = pendingPresentationSlide;

        if (slideIndex === null) {
          slideIndex = direction === 'up' ? presentationSlideCount - 1 : 0;
        }

        pendingPresentationSlide = null;

        if (isLinkJumpAnimating) {
          setPresentationSlide(slideIndex, false);
          finishNavigation();
          return;
        }

        if (
          (slideIndex === 0 && direction === 'down') ||
          (slideIndex === presentationSlideCount - 1 && direction === 'up')
        ) {
          setPresentationSlide(slideIndex, false);
        } else {
          animatePresentationSlide(slideIndex);
          return;
        }
      } else {
        pendingPresentationSlide = null;
        setPresentationSlide(0, false);

        if (isLinkJumpAnimating) {
          finishNavigation();
          return;
        }
      }

      completeScrollStep();
    }
  });

  setupWheelGestureLock();
  setupTouchGestureLock();

  if (initialDestination && initialDestination.slide !== undefined) {
    setPresentationSlide(initialDestination.slide, false);
  } else {
    setPresentationSlide(0, false);
  }

  updateHeaderForSection(startSection);
  setCurrentNavLink(resolveCurrentHash());
}

window.addEventListener('resize', () => {
  window.clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(() => {
    syncViewportMetrics();
    startBackground();
    setPresentationSlide(activeSlideIndex, false);
    sectionSlider?.adapt();
  }, 180);
});

window.visualViewport?.addEventListener('resize', () => {
  window.clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(() => {
    syncViewportMetrics();
    startBackground();
    setPresentationSlide(activeSlideIndex, false);
    sectionSlider?.adapt();
  }, 120);
});

window.visualViewport?.addEventListener('scroll', syncViewportMetrics, { passive: true });

document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    window.cancelAnimationFrame(animationFrame);
    animationFrame = window.requestAnimationFrame(draw);
  }
});

window.addEventListener('pageshow', (event) => {
  if (!event.persisted) {
    return;
  }

  isScrollLocked = false;
  isLinkJumpAnimating = false;
  document.body.classList.remove('is-page-scrolling');
  syncViewportMetrics();
  setupHeaderAngles();
  sectionSlider?.adapt();
  setPresentationSlide(activeSlideIndex, false);
  updateHeaderForSection(getActiveSectionIndex());
  setCurrentNavLink(resolveCurrentHash());

  const destination = pageByHash.get(window.location.hash);

  if (destination && sectionSlider.activeIndex !== destination.section - 1) {
    if (destination.slide !== undefined) {
      pendingPresentationSlide = destination.slide;
    }

    withProgrammaticSectionMove(() => {
      moveToSection(destination.section);
    });
  }
});

document.body.classList.add('is-loading');
syncViewportMetrics();
setupHeaderAngles();
setupFooterShape();
setupMobileMenu();
setupHeaderHoverZone();
setupMobileHeaderHover();
setupSmoothScroll();
setupSectionLinks();
setupKeyboardNav();
setupServiceModals();
setupKeyboardNav();
waitForPageLoad();
waitForFonts();
startBackground();

function setupServiceModals() {
  const backdrop = document.getElementById('service-backdrop');
  let expandedCardState = null;

  function expandCard(card) {
    if (expandedCardState) return;
    triggerHaptic(22);

    const badge = card.querySelector('.service-card__badge');
    const summary = card.querySelector('.service-card__summary');
    const sub = card.querySelector('.service-card__sub');
    const btn = card.querySelector('.service-card__btn');
    const details = card.querySelector('.service-card__details');
    const detailsTitle = card.querySelector('.service-card__details-title');
    const items = card.querySelectorAll('.service-card__item');
    const footerBtn = card.querySelector('.service-card__action-btn');
    const closeBtn = card.querySelector('.service-card__close');

    const badgeFirstRect = badge ? badge.getBoundingClientRect() : null;
    const firstRect = card.getBoundingClientRect();
    const parent = card.parentNode;
    const nextSibling = card.nextSibling;

    const placeholder = document.createElement('div');
    placeholder.className = 'service-card-placeholder';
    placeholder.style.width = firstRect.width + 'px';
    placeholder.style.height = firstRect.height + 'px';
    parent.insertBefore(placeholder, card);

    document.body.appendChild(card);
    card.classList.add('is-expanded');
    if (backdrop) backdrop.classList.add('is-active');

    const tw = Math.min(680, window.innerWidth * 0.92);
    const tmh = window.innerHeight * 0.85;

    card.style.position = 'fixed';
    card.style.zIndex = '1000';
    card.style.width = tw + 'px';
    card.style.height = 'auto';
    card.style.maxHeight = tmh + 'px';

    const badgeLastRect = badge ? badge.getBoundingClientRect() : null;
    const cardLastRect = card.getBoundingClientRect();

    let startBdx = 0, startBdy = 0;
    if (badgeFirstRect && badgeLastRect && cardLastRect) {
      startBdx = (badgeFirstRect.left - firstRect.left) - (badgeLastRect.left - cardLastRect.left);
      startBdy = (badgeFirstRect.top - firstRect.top) - (badgeLastRect.top - cardLastRect.top);
    }

    card.style.left = firstRect.left + 'px';
    card.style.top = firstRect.top + 'px';
    card.style.width = firstRect.width + 'px';
    card.style.height = firstRect.height + 'px';
    card.style.backgroundColor = '#000';
    card.style.borderColor = '#ffffff';
    card.style.overflow = 'hidden';
    card.style.transition = 'none';

    if (closeBtn) {
      closeBtn.style.transition = 'none';
      closeBtn.style.opacity = '0';
      closeBtn.style.transform = 'rotate(90deg) scale(0.5)';
    }

    if (badge && (startBdx !== 0 || startBdy !== 0)) {
      badge.style.transition = 'none';
      badge.style.transform = 'translate(' + startBdx + 'px,' + startBdy + 'px)';
    }
    if (summary) {
      summary.style.transition = 'none';
      summary.style.opacity = '1';
      summary.style.transform = 'translateY(0)';
      if (sub) { sub.style.transition = 'none'; sub.style.opacity = '1'; sub.style.transform = 'translateY(0)'; }
      if (btn) { btn.style.transition = 'none'; btn.style.opacity = '1'; btn.style.transform = 'translateY(0)'; }
    }
    if (details) {
      details.style.display = 'block';
      details.style.transition = 'none';
      details.style.opacity = '0';
      details.style.transform = 'translateY(18px)';

      if (detailsTitle) {
        detailsTitle.style.transition = 'none';
        detailsTitle.style.opacity = '0';
        detailsTitle.style.transform = 'translateY(10px)';
      }

      items.forEach(function(item) {
        item.style.transition = 'none';
        item.style.opacity = '0';
        item.style.transform = 'translateY(12px)';
      });

      if (footerBtn) {
        footerBtn.style.transition = 'none';
        footerBtn.style.opacity = '0';
        footerBtn.style.transform = 'translateY(12px)';
      }
    }

    void card.offsetWidth;
    const th = Math.min(card.scrollHeight, tmh);
    const tl = (window.innerWidth - tw) / 2;
    const tt = (window.innerHeight - th) / 2;

    card.style.width = firstRect.width + 'px';
    card.style.height = firstRect.height + 'px';
    void card.offsetWidth;

    expandedCardState = { card, parent, nextSibling, placeholder };

    requestAnimationFrame(function() {
      requestAnimationFrame(function() {
        card.style.transition = 'left .42s cubic-bezier(.76,0,.24,1), top .42s cubic-bezier(.76,0,.24,1), width .42s cubic-bezier(.76,0,.24,1), height .42s cubic-bezier(.76,0,.24,1)';
        card.style.left = tl + 'px';
        card.style.top = tt + 'px';
        card.style.width = tw + 'px';
        card.style.height = th + 'px';

        if (closeBtn) {
          closeBtn.style.transition = 'opacity .3s ease .25s, transform .35s cubic-bezier(.16,1,.3,1) .25s';
          closeBtn.style.opacity = '1';
          closeBtn.style.transform = 'rotate(0deg) scale(1)';
        }

        if (badge) {
          badge.style.transition = 'transform .42s cubic-bezier(.76,0,.24,1)';
          badge.style.transform = 'translate(0,0)';
        }
        if (summary) {
          summary.style.transition = 'opacity .22s ease, transform .22s cubic-bezier(.76,0,.24,1)';
          summary.style.opacity = '0';
          summary.style.transform = 'translateY(24px)';
          if (sub) { sub.style.transition = 'opacity .18s ease'; sub.style.opacity = '0'; }
          if (btn) { btn.style.transition = 'opacity .18s ease'; btn.style.opacity = '0'; }
        }
        if (details) {
          details.style.transition = 'opacity .32s ease .14s, transform .32s cubic-bezier(.16,1,.3,1) .14s';
          details.style.opacity = '1';
          details.style.transform = 'translateY(0)';

          if (detailsTitle) {
            detailsTitle.style.transition = 'opacity .32s ease .14s, transform .32s cubic-bezier(.16,1,.3,1) .14s';
            detailsTitle.style.opacity = '1';
            detailsTitle.style.transform = 'translateY(0)';
          }

          items.forEach(function(item, idx) {
            const delay = 0.18 + idx * 0.07;
            item.style.transition = 'opacity .32s ease ' + delay + 's, transform .32s cubic-bezier(.16,1,.3,1) ' + delay + 's';
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
          });

          if (footerBtn) {
            const footerDelay = 0.18 + items.length * 0.07;
            footerBtn.style.transition = 'opacity .32s ease ' + footerDelay + 's, transform .32s cubic-bezier(.16,1,.3,1) ' + footerDelay + 's, background-color .25s ease, color .25s ease, border-color .25s ease';
            footerBtn.style.opacity = '1';
            footerBtn.style.transform = 'translateY(0)';
          }
        }

        setTimeout(function() {
          if (expandedCardState && expandedCardState.card === card) {
            card.style.overflowY = 'auto';
            if (footerBtn) {
              footerBtn.style.transition = '';
            }
          }
        }, 430);
      });
    });

    isScrollLocked = true;
  }

  function collapseCard(card) {
    if (!card || !expandedCardState) return;
    triggerHaptic(14);
    var state = expandedCardState;
    var parent = state.parent;
    var nextSibling = state.nextSibling;
    var placeholder = state.placeholder;

    var details = card.querySelector('.service-card__details');
    var detailsTitle = card.querySelector('.service-card__details-title');
    var summary = card.querySelector('.service-card__summary');
    var sub = card.querySelector('.service-card__sub');
    var btn = card.querySelector('.service-card__btn');
    var badge = card.querySelector('.service-card__badge');
    var closeBtn = card.querySelector('.service-card__close');
    var items = card.querySelectorAll('.service-card__item');
    var footerBtn = card.querySelector('.service-card__action-btn');
    var targetRect = placeholder.getBoundingClientRect();

    if (closeBtn) {
      closeBtn.style.transition = 'opacity .18s ease';
      closeBtn.style.opacity = '0';
    }

    if (badge) {
      var badgeCurrent = badge.getBoundingClientRect();
      var cardCurrent = card.getBoundingClientRect();
      var localRbdx = (targetRect.width - badgeCurrent.width) / 2 - (badgeCurrent.left - cardCurrent.left);
      var localRbdy = 20 - (badgeCurrent.top - cardCurrent.top);
      badge.style.transition = 'transform .4s cubic-bezier(.76,0,.24,1)';
      badge.style.transform = 'translate(' + localRbdx + 'px,' + localRbdy + 'px)';
    }

    card.style.position = 'fixed';
    card.style.zIndex = '1000';
    card.style.backgroundColor = '#000';
    card.style.borderColor = '#ffffff';
    card.style.borderWidth = '2px';
    card.style.borderStyle = 'solid';
    card.style.overflow = 'hidden';

    if (details) {
      details.style.transition = 'opacity .15s ease, transform .15s ease';
      details.style.opacity = '0';
      details.style.transform = 'translateY(18px)';

      if (detailsTitle) {
        detailsTitle.style.transition = 'opacity .15s ease, transform .15s ease';
        detailsTitle.style.opacity = '0';
        detailsTitle.style.transform = 'translateY(10px)';
      }

      items.forEach(function(item) {
        item.style.transition = 'opacity .15s ease, transform .15s ease';
        item.style.opacity = '0';
        item.style.transform = 'translateY(12px)';
      });

      if (footerBtn) {
        footerBtn.style.transition = 'opacity .15s ease, transform .15s ease';
        footerBtn.style.opacity = '0';
        footerBtn.style.transform = 'translateY(12px)';
      }
    }

    if (summary) {
      summary.style.transition = 'none';
      summary.style.opacity = '0';
      summary.style.transform = 'translateY(28px)';
      if (sub) { sub.style.transition = 'none'; sub.style.opacity = '0'; }
      if (btn) { btn.style.transition = 'none'; btn.style.opacity = '0'; }

      void summary.offsetWidth;

      summary.style.transition = 'opacity .38s ease .18s, transform .38s cubic-bezier(.16,1,.3,1) .18s';
      summary.style.opacity = '1';
      summary.style.transform = 'translateY(0)';

      if (sub) {
        sub.style.transition = 'opacity .32s ease .22s';
        sub.style.opacity = '1';
      }
      if (btn) {
        btn.style.transition = 'opacity .32s ease .26s';
        btn.style.opacity = '1';
      }
    }

    if (backdrop) backdrop.classList.remove('is-active');

    card.style.transition = 'left .4s cubic-bezier(.76,0,.24,1), top .4s cubic-bezier(.76,0,.24,1), width .4s cubic-bezier(.76,0,.24,1), height .4s cubic-bezier(.76,0,.24,1)';
    card.style.left = targetRect.left + 'px';
    card.style.top = targetRect.top + 'px';
    card.style.width = targetRect.width + 'px';
    card.style.height = targetRect.height + 'px';

    var done = false;
    function finish() {
      if (done) return;
      done = true;
      card.removeEventListener('transitionend', onEnd);

      card.classList.remove('is-expanded');

      card.style.position = '';
      card.style.zIndex = '';
      card.style.left = '';
      card.style.top = '';
      card.style.width = '';
      card.style.height = '';
      card.style.maxHeight = '';
      card.style.transition = '';
      card.style.backgroundColor = '';
      card.style.border = '';
      card.style.borderColor = '';
      card.style.borderWidth = '';
      card.style.borderStyle = '';
      card.style.overflow = '';
      card.style.overflowY = '';

      if (badge) { badge.style.transform = ''; badge.style.transition = ''; }
      if (closeBtn) { closeBtn.style.opacity = ''; closeBtn.style.transition = ''; }
      if (details) {
        details.style.display = ''; details.style.opacity = ''; details.style.transform = ''; details.style.transition = '';
        if (detailsTitle) { detailsTitle.style.opacity = ''; detailsTitle.style.transform = ''; detailsTitle.style.transition = ''; }
        items.forEach(function(item) { item.style.opacity = ''; item.style.transform = ''; item.style.transition = ''; });
        if (footerBtn) { footerBtn.style.opacity = ''; footerBtn.style.transform = ''; footerBtn.style.transition = ''; }
      }
      if (summary) {
        summary.style.opacity = ''; summary.style.transform = ''; summary.style.transition = '';
        if (sub) { sub.style.opacity = ''; sub.style.transition = ''; }
        if (btn) { btn.style.opacity = ''; btn.style.transition = ''; }
      }

      if (nextSibling && nextSibling.parentNode === parent) {
        parent.insertBefore(card, nextSibling);
      } else {
        parent.appendChild(card);
      }
      if (placeholder && placeholder.parentNode) {
        placeholder.parentNode.removeChild(placeholder);
      }

      isScrollLocked = false;
      expandedCardState = null;
    }

    function onEnd(e) {
      if (e.target === card && (e.propertyName === 'width' || e.propertyName === 'left')) finish();
    }
    card.addEventListener('transitionend', onEnd);
    setTimeout(finish, 450);
  }

  document.addEventListener('click', function(e) {
    var close = e.target.closest('.service-card__close');
    if (close) {
      e.preventDefault();
      e.stopPropagation();
      var card2 = close.closest('.service-card');
      if (card2) collapseCard(card2);
      return;
    }

    var card = e.target.closest('.service-card');
    if (card && !card.classList.contains('is-expanded') && !expandedCardState) {
      e.preventDefault();
      e.stopPropagation();
      expandCard(card);
      return;
    }
  });

  if (backdrop) {
    backdrop.addEventListener('click', function() {
      if (expandedCardState) collapseCard(expandedCardState.card);
    });
  }

  window.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && expandedCardState) collapseCard(expandedCardState.card);
  });
}

function setupKeyboardNav() {
  window.addEventListener('keydown', function(e) {
    const activeEl = document.activeElement;
    const isInput = activeEl && (['INPUT', 'TEXTAREA', 'SELECT'].includes(activeEl.tagName) || activeEl.isContentEditable);
    if (isInput) return;

    if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === 'PageDown') {
      if (stepByWheelGesture(1)) {
        e.preventDefault();
      }
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft' || e.key === 'PageUp') {
      if (stepByWheelGesture(-1)) {
        e.preventDefault();
      }
    }
  });
}

function setupPortfolioDemos() {
  // 1. WebGL generator demo animation with dense Material Symbols on pure #000
  const miniCanvas = document.getElementById('portfolio-mini-canvas');
  if (miniCanvas) {
    const gl = miniCanvas.getContext('webgl', { alpha: false, antialias: true });
    
    if (gl) {
      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      
      const miniIcons = [
        'grid_view', 'memory', 'dns', 'settings', 'code',
        'terminal', 'data_object', 'webhook', 'lock', 'security',
        'api', 'cloud', 'storage', 'hub', 'bolt',
        'bug_report', 'rocket_launch', 'extension', 'deployed_code', 'architecture'
      ];
      
      const vertShader = compileSymbolsShader(gl.VERTEX_SHADER, symbolsVertexShader, gl);
      const fragShader = compileSymbolsShader(gl.FRAGMENT_SHADER, symbolsFragmentShader, gl);
      const miniProgram = gl.createProgram();
      gl.attachShader(miniProgram, vertShader);
      gl.attachShader(miniProgram, fragShader);
      gl.linkProgram(miniProgram);

      const atlasCell = 64;
      const atlasCols = 5;
      const atlasRows = Math.ceil(miniIcons.length / atlasCols);
      const atlasCanvas = document.createElement('canvas');
      const atlasCtx = atlasCanvas.getContext('2d');
      atlasCanvas.width = atlasCols * atlasCell;
      atlasCanvas.height = atlasRows * atlasCell;

      const miniTexture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, miniTexture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

      function updateMiniAtlas() {
        if (!gl || !miniTexture) return;
        atlasCtx.clearRect(0, 0, atlasCanvas.width, atlasCanvas.height);
        atlasCtx.fillStyle = '#ffffff';
        atlasCtx.textAlign = 'center';
        atlasCtx.textBaseline = 'middle';
        atlasCtx.font = '400 40px "Material Symbols Outlined"';

        if ('fontKerning' in atlasCtx) {
          atlasCtx.fontKerning = 'none';
        }
        if ('fontVariantLigatures' in atlasCtx) {
          atlasCtx.fontVariantLigatures = 'normal';
        }

        miniIcons.forEach((icon, idx) => {
          const col = idx % atlasCols;
          const row = Math.floor(idx / atlasCols);
          atlasCtx.fillText(icon, col * atlasCell + atlasCell / 2, row * atlasCell + atlasCell / 2);
        });

        gl.bindTexture(gl.TEXTURE_2D, miniTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlasCanvas);
      }

      updateMiniAtlas();
      if (document.fonts) {
        document.fonts.ready.then(() => {
          updateMiniAtlas();
        });
      }

      const uResLoc = gl.getUniformLocation(miniProgram, 'u_resolution');
      const uOffLoc = gl.getUniformLocation(miniProgram, 'u_offset');
      const aPosLoc = gl.getAttribLocation(miniProgram, 'a_position');
      const aTexLoc = gl.getAttribLocation(miniProgram, 'a_texCoord');
      const aColLoc = gl.getAttribLocation(miniProgram, 'a_color');

      const miniBuffer = gl.createBuffer();
      let miniVertexCount = 0;
      let gridCellSize = 24;

      function rebuildMiniBuffer(width, height) {
        const vertices = [];
        const cols = Math.ceil(width / gridCellSize) + 2;
        const rows = Math.ceil(height / gridCellSize) + 2;
        
        let iconIdx = 0;
        for (let r = -1; r < rows; r++) {
          for (let c = -1; c < cols; c++) {
            const x = c * gridCellSize;
            const y = r * gridCellSize;
            const iconIndex = iconIdx % miniIcons.length;
            const col = iconIndex % atlasCols;
            const row = Math.floor(iconIndex / atlasCols);
            const u0 = (col * atlasCell) / atlasCanvas.width;
            const v0 = (row * atlasCell) / atlasCanvas.height;
            const u1 = ((col + 1) * atlasCell) / atlasCanvas.width;
            const v1 = ((row + 1) * atlasCell) / atlasCanvas.height;
            
            const alpha = 0.3;
            const rgb = [1.0, 1.0, 1.0];

            const x0 = x, y0 = y, x1 = x + gridCellSize, y1 = y + gridCellSize;
            vertices.push(
              x0, y0, u0, v0, ...rgb, alpha,
              x1, y0, u1, v0, ...rgb, alpha,
              x0, y1, u0, v1, ...rgb, alpha,
              x0, y1, u0, v1, ...rgb, alpha,
              x1, y0, u1, v0, ...rgb, alpha,
              x1, y1, u1, v1, ...rgb, alpha
            );
            iconIdx++;
          }
        }

        miniVertexCount = vertices.length / 8;
        gl.bindBuffer(gl.ARRAY_BUFFER, miniBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
      }

      let lastMiniDraw = 0;
      let driftTime = 0;

      function drawMiniCanvas(now) {
        if (!miniCanvas || !gl) return;

        if (document.hidden || getActiveSectionIndex() !== 1 || activeSlideIndex !== 2) {
          requestAnimationFrame(drawMiniCanvas);
          return;
        }

        if (now - lastMiniDraw < 30) {
          requestAnimationFrame(drawMiniCanvas);
          return;
        }
        lastMiniDraw = now;

        const width = miniCanvas.clientWidth || 280;
        const height = miniCanvas.clientHeight || 110;
        if (miniCanvas.width !== width || miniCanvas.height !== height) {
          miniCanvas.width = width;
          miniCanvas.height = height;
          rebuildMiniBuffer(width, height);
        }

        driftTime += 0.015;
        const offsetX = Math.sin(driftTime * 0.2) * 6;
        const offsetY = Math.cos(driftTime * 0.15) * 5;

        gl.viewport(0, 0, width, height);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(miniProgram);
        gl.uniform2f(uResLoc, width, height);
        gl.uniform2f(uOffLoc, offsetX, offsetY);
        gl.bindTexture(gl.TEXTURE_2D, miniTexture);
        gl.bindBuffer(gl.ARRAY_BUFFER, miniBuffer);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        const stride = 8 * 4;
        gl.enableVertexAttribArray(aPosLoc);
        gl.vertexAttribPointer(aPosLoc, 2, gl.FLOAT, false, stride, 0);
        gl.enableVertexAttribArray(aTexLoc);
        gl.vertexAttribPointer(aTexLoc, 2, gl.FLOAT, false, stride, 2 * 4);
        gl.enableVertexAttribArray(aColLoc);
        gl.vertexAttribPointer(aColLoc, 4, gl.FLOAT, false, stride, 4 * 4);

        gl.drawArrays(gl.TRIANGLES, 0, miniVertexCount);
        requestAnimationFrame(drawMiniCanvas);
      }

      requestAnimationFrame(drawMiniCanvas);
    }
  }

  // 2. Real mus-downloader Music Downloader CLI Simulator
  const musCliDemo = document.getElementById('mus-cli-demo');
  const musCliBody = document.getElementById('mus-cli-body');
  let isDownloading = false;

  if (musCliDemo && musCliBody) {
    musCliDemo.style.cursor = 'pointer';
    musCliDemo.addEventListener('click', function() {
      if (isDownloading) return;
      isDownloading = true;
      triggerHaptic(15);

      const dynamicLines = musCliBody.querySelectorAll('.cli-line.dynamic');
      dynamicLines.forEach(line => line.remove());

      const steps = [
        { text: '[+] Fetching metadata...', delay: 300 },
        { text: '[>] Downloading FLAC...', delay: 850 },
        { text: '[✓] Saved to ./downloads/track.flac', delay: 1450 }
      ];

      steps.forEach(function(step) {
        setTimeout(function() {
          const logLine = document.createElement('div');
          logLine.className = 'cli-line status dynamic';
          logLine.textContent = step.text;
          musCliBody.appendChild(logLine);
          musCliBody.scrollTop = musCliBody.scrollHeight;

          if (step.text.includes('[✓]')) {
            isDownloading = false;
          }
        }, step.delay);
      });
    });
  }

  // 3. Telegram Casino Bot Slot Machine Simulator
  const chatMessages = document.getElementById('bot-chat-messages');
  const cmdBtns = document.querySelectorAll('.chat-cmd-btn');
  const slotSymbols = ['diamond', 'looks_3', 'nutrition', 'local_pizza', 'notifications', 'bakery_dining'];
  let isSpinning = false;

  if (chatMessages && cmdBtns.length > 0) {
    cmdBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        const cmd = btn.getAttribute('data-cmd');
        if (!cmd || isSpinning) return;

        isSpinning = true;
        triggerHaptic(20);

        const userMsgEl = document.createElement('div');
        userMsgEl.className = 'chat-msg user';
        userMsgEl.innerHTML = `<span class="chat-msg__author">You</span><span class="chat-msg__text">${cmd}</span>`;
        chatMessages.appendChild(userMsgEl);

        const spinMsgEl = document.createElement('div');
        spinMsgEl.className = 'chat-msg bot';
        spinMsgEl.innerHTML = `<span class="chat-msg__author">CasinoBot</span><span class="chat-msg__text"><span class="slot-icon">casino</span> [ <span class="slot-icon">bakery_dining</span> | <span class="slot-icon">local_pizza</span> | <span class="slot-icon">nutrition</span> ] Крутим...</span>`;
        chatMessages.appendChild(spinMsgEl);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        setTimeout(function() {
          const isWin = Math.random() < 0.35;
          let s1, s2, s3;
          if (isWin) {
            s1 = s2 = s3 = slotSymbols[Math.floor(Math.random() * slotSymbols.length)];
          } else {
            s1 = slotSymbols[Math.floor(Math.random() * slotSymbols.length)];
            s2 = slotSymbols[Math.floor(Math.random() * slotSymbols.length)];
            s3 = slotSymbols[Math.floor(Math.random() * slotSymbols.length)];
            if (s1 === s2 && s2 === s3) s3 = slotSymbols[(slotSymbols.indexOf(s3) + 1) % slotSymbols.length];
          }

          let outcomeText = '';
          if (isWin) {
            outcomeText = `<span class="slot-icon">casino</span> [ <span class="slot-icon">${s1}</span> | <span class="slot-icon">${s2}</span> | <span class="slot-icon">${s3}</span> ] ДЖЕКПОТ!`;
          } else {
            outcomeText = `<span class="slot-icon">casino</span> [ <span class="slot-icon">${s1}</span> | <span class="slot-icon">${s2}</span> | <span class="slot-icon">${s3}</span> ] Увы! Попробуй ещё`;
          }

          spinMsgEl.querySelector('.chat-msg__text').innerHTML = outcomeText;
          chatMessages.scrollTop = chatMessages.scrollHeight;
          if (isWin) {
            triggerHaptic([40, 60, 40, 60, 80]);
          } else {
            triggerHaptic(8);
          }
          isSpinning = false;
        }, 400);
      });
    });
  }

  // 4. Mobile Portfolio Slider & Pagination Dots
  const portfolioGrid = document.getElementById('portfolio-grid');
  const portfolioDots = document.querySelectorAll('.portfolio-dot');

  if (portfolioGrid && portfolioDots.length > 0) {
    portfolioDots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        triggerHaptic(10);
        const index = parseInt(dot.getAttribute('data-index') || '0', 10);
        const cardWidth = portfolioGrid.clientWidth;
        portfolioGrid.scrollTo({
          left: index * cardWidth,
          behavior: 'smooth'
        });
      });
    });

    portfolioGrid.addEventListener('scroll', function() {
      const cardWidth = portfolioGrid.clientWidth;
      if (cardWidth <= 0) return;
      const activeIdx = Math.round(portfolioGrid.scrollLeft / cardWidth);
      portfolioDots.forEach(function(dot, idx) {
        dot.classList.toggle('is-active', idx === activeIdx);
      });
    }, { passive: true });

    portfolioGrid.addEventListener('touchstart', function(e) {
      e.stopPropagation();
    }, { passive: true });

    portfolioGrid.addEventListener('touchmove', function(e) {
      e.stopPropagation();
    }, { passive: true });
  }

  // Stop scroll propagation on portfolio scrollable elements
  const scrollableElements = document.querySelectorAll('.portfolio-grid, .portfolio-card, .portfolio-demo, .chat-widget__messages, .cli-body');
  scrollableElements.forEach(function(el) {
    el.addEventListener('wheel', function(e) {
      e.stopPropagation();
    }, { passive: true });

    el.addEventListener('touchmove', function(e) {
      e.stopPropagation();
    }, { passive: true });
  });
}

setupKeyboardNav();
setupPortfolioDemos();

const topSection = document.querySelector('#top');
if (topSection) {
  topSection.addEventListener('pointermove', (event) => {
    bubblesEffect.onPointerMove(event.clientX, event.clientY);
  }, { passive: true });

  topSection.addEventListener('pointerdown', (event) => {
    triggerHaptic(6);
    bubblesEffect.onPointerDown(event.clientX, event.clientY);
  }, { passive: true });
}

const linksSection = document.querySelector('#links');
if (linksSection && lifeEffect) {
  linksSection.addEventListener('pointermove', (event) => {
    const rect = linksSection.getBoundingClientRect();
    lifeEffect.onPointerMove(event.clientX - rect.left, event.clientY - rect.top);
  }, { passive: true });

  linksSection.addEventListener('pointerdown', (event) => {
    if (event.target.closest('.site-footer__links a')) return;
    triggerHaptic(6);
    const rect = linksSection.getBoundingClientRect();
    lifeEffect.onPointerDown(event.clientX - rect.left, event.clientY - rect.top);
  }, { passive: true });
}


