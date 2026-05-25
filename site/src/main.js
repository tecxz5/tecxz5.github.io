import Lenis from 'lenis';
import Snap from 'lenis/snap';

const canvas = document.querySelector('#scribble-bg');
const symbolsCanvas = document.querySelector('#symbols-bg');
const loader = document.querySelector('#loader');
const siteHeader = document.querySelector('#site-header');
const siteHeaderHoverZone = document.querySelector('#site-header-hover-zone');
const siteLogo = siteHeader.querySelector('.site-header__logo');
const siteNavigation = siteHeader.querySelector('.site-header__nav');
const presentationStage = document.querySelector('#presentation');
const presentationTrack = document.querySelector('#presentation-track');
const siteFooter = document.querySelector('#links');
const ctx = canvas.getContext('2d');
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
let lastSpawn = 0;
let paths = [];
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
let presentationAnimationFrame;
let presentationAngle = -8;
let lenis;
let snapController;
let snapCleanup = [];
let activePage = 0;
let isPageAnimating = false;
let menuRestoreTimer;
let isLinkJumpAnimating = false;
let touchGestureStartY = 0;
let wheelGestureDelta = 0;
let wheelGestureDirection = 0;
let wheelGestureResetTimer;
let isWheelGestureLocked = false;
let wheelGestureUnlockTimer;
const symbolPatternSeed = 5185;

const loaderExitDelay = 1500;
const maxPaths = 72;
const directions = [
  [1, 0],
  [0, 1],
  [-1, 0],
  [0, -1],
  [1, 1],
  [-1, 1],
  [1, -1],
  [-1, -1]
];
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
  const topHeight = randomBetween(16, 22);
  const bottomHeight = randomBetween(14, 20);

  siteFooter.style.setProperty('--footer-top-height', `${topHeight.toFixed(1)}vh`);
  siteFooter.style.setProperty('--footer-bottom-height', `${bottomHeight.toFixed(1)}vh`);
}

function setupSectionLinks() {
  const pageByHash = new Map([
    ['#top', 0],
    ['#about', 1],
    ['#services', 2],
    ['#portfolio', 3],
    ['#links', 4]
  ]);

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const hash = link.getAttribute('href');

      if (!pageByHash.has(hash)) {
        return;
      }

      event.preventDefault();
      setMenuOpen(false);

      const targetPage = pageByHash.get(hash);
      const pageDistance = Math.abs(targetPage - activePage);

      isLinkJumpAnimating = true;
      siteHeader.classList.remove('is-compact', 'is-hovered');
      animateToPage(targetPage, {
        duration: 0.36 + pageDistance * 0.12,
        onComplete: () => {
          isLinkJumpAnimating = false;
          updatePresentationScroll();
          window.history.replaceState(null, '', hash);
        }
      });
    });
  });
}

function setMenuOpen(isOpen) {
  window.clearTimeout(menuRestoreTimer);
  siteHeader.classList.remove('is-menu-restoring');
  siteHeader.classList.toggle('is-menu-open', isOpen);
  siteHeader.classList.remove('is-hovered');
  siteLogo.setAttribute('aria-expanded', String(isOpen));
  siteLogo.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'tecxz5');
}

function setupMobileMenu() {
  function openMenuAfterRestore() {
    let isRestored = false;

    const finishRestore = () => {
      if (isRestored) {
        return;
      }

      isRestored = true;
      window.clearTimeout(menuRestoreTimer);
      siteHeader.removeEventListener('transitionend', handleRestoreEnd);
      setMenuOpen(true);
    };

    const handleRestoreEnd = (event) => {
      if (event.target === siteHeader && event.propertyName === 'height') {
        finishRestore();
      }
    };

    siteHeader.classList.add('is-menu-restoring');
    siteLogo.setAttribute('aria-expanded', 'false');
    siteLogo.setAttribute('aria-label', 'Открыть меню');
    siteHeader.addEventListener('transitionend', handleRestoreEnd);
    menuRestoreTimer = window.setTimeout(finishRestore, 520);
  }

  siteLogo.addEventListener('click', (event) => {
    if (window.innerWidth > 720) {
      return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();

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

  siteNavigation.addEventListener('click', (event) => {
    if (event.target.closest('a')) {
      setMenuOpen(false);
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
    }
  });
}

function setupHeaderHoverZone() {
  if (window.matchMedia('(max-width: 720px)').matches) {
    return;
  }

  siteHeaderHoverZone.addEventListener('mouseenter', () => {
    siteHeader.classList.add('is-hovered');
  });

  siteHeaderHoverZone.addEventListener('mouseleave', () => {
    siteHeader.classList.remove('is-hovered');
  });

  siteHeader.addEventListener('mouseleave', () => {
    siteHeader.classList.remove('is-hovered');
  });
}

function smoothStep(progress) {
  return progress * progress * (3 - 2 * progress);
}

function resizeCanvas() {
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  const rect = canvas.parentElement.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;

  canvas.width = Math.floor(width * pixelRatio);
  canvas.height = Math.floor(height * pixelRatio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
}

function resizeSymbolsCanvas() {
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  const width = presentationTrack.scrollWidth;
  const height = window.innerHeight;

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

function createPath(now) {
  const rect = canvas.parentElement.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;
  const points = [
    {
      x: randomBetween(-width * 0.08, width * 1.08),
      y: randomBetween(-height * 0.08, height * 1.08)
    }
  ];
  const segmentCount = Math.floor(randomBetween(2, 6));
  const segmentLength = randomBetween(34, 120);

  for (let index = 0; index < segmentCount; index += 1) {
    const previous = points[points.length - 1];
    const [dx, dy] = randomItem(directions);
    const length = segmentLength * randomBetween(0.65, 1.35);

    points.push({
      x: previous.x + dx * length,
      y: previous.y + dy * length
    });
  }

  return {
    points,
    bornAt: now,
    life: randomBetween(6200, 10500),
    delay: randomBetween(0, 900),
    accent: Math.random() < 0.14,
    width: Math.random() < 0.18 ? 1.4 : 1,
    driftX: randomBetween(-7, 7),
    driftY: randomBetween(-7, 7)
  };
}

function getPathLength(points) {
  return points.reduce((total, point, index) => {
    if (index === 0) {
      return 0;
    }

    const previous = points[index - 1];
    return total + Math.hypot(point.x - previous.x, point.y - previous.y);
  }, 0);
}

function drawPartialPath(path, progress, alpha) {
  const points = path.points;
  const totalLength = getPathLength(points);
  let remainingLength = totalLength * progress;

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1];
    const current = points[index];
    const segmentLength = Math.hypot(current.x - previous.x, current.y - previous.y);

    if (remainingLength >= segmentLength) {
      ctx.lineTo(current.x, current.y);
      remainingLength -= segmentLength;
      continue;
    }

    const segmentProgress = segmentLength === 0 ? 0 : remainingLength / segmentLength;
    ctx.lineTo(
      previous.x + (current.x - previous.x) * segmentProgress,
      previous.y + (current.y - previous.y) * segmentProgress
    );
    break;
  }

  ctx.strokeStyle = path.accent
    ? `rgba(206, 219, 26, ${alpha * 0.58})`
    : `rgba(255, 255, 255, ${alpha * 0.12})`;
  ctx.lineWidth = path.width;
  ctx.lineCap = 'square';
  ctx.lineJoin = 'miter';
  ctx.stroke();
}

function drawPath(path, now) {
  const elapsed = now - path.bornAt - path.delay;

  if (elapsed <= 0) {
    return true;
  }

  const progress = Math.min(elapsed / path.life, 1);
  const drawIn = smoothStep(Math.min(progress / 0.28, 1));
  const fadeOut = 1 - smoothStep(Math.max(0, (progress - 0.62) / 0.38));
  const alpha = Math.max(0, fadeOut);
  const driftProgress = smoothStep(progress);

  ctx.save();
  ctx.translate(path.driftX * driftProgress, path.driftY * driftProgress);
  drawPartialPath(path, drawIn, alpha);
  ctx.restore();

  return progress < 1;
}

function spawnPaths(now, count) {
  for (let index = 0; index < count; index += 1) {
    paths.push(createPath(now));
  }

  paths = paths.slice(-maxPaths);
}

function draw(now) {
  const width = canvas.parentElement.clientWidth;
  const height = canvas.parentElement.clientHeight;

  ctx.clearRect(0, 0, width, height);
  drawSymbols(now);

  if (now - lastSpawn > randomBetween(900, 1600)) {
    spawnPaths(now, Math.floor(randomBetween(4, 9)));
    lastSpawn = now;
  }

  paths = paths.filter((path) => drawPath(path, now));

  if (!backgroundReady) {
    backgroundReady = true;
    markLoaded('background');
  }

  animationFrame = window.requestAnimationFrame(draw);
}

function compileSymbolsShader(type, source) {
  const shader = symbolsGl.createShader(type);
  symbolsGl.shaderSource(shader, source);
  symbolsGl.compileShader(shader);

  if (!symbolsGl.getShaderParameter(shader, symbolsGl.COMPILE_STATUS)) {
    throw new Error(symbolsGl.getShaderInfoLog(shader));
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
  const height = symbolGrid.height || window.innerHeight;
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

function drawSymbols(now) {
  if (!symbolsGl || !symbolsProgram || !symbolsVertexCount) {
    return;
  }

  const { cell } = symbolGrid;
  const width = symbolGrid.width || window.innerWidth;
  const height = symbolGrid.height || window.innerHeight;
  const drift = now / 1000;
  const offsetX = Math.sin(drift * 0.18) * cell * 0.34;
  const offsetY = Math.cos(drift * 0.14) * cell * 0.28;

  symbolsGl.viewport(0, 0, symbolsCanvas.width, symbolsCanvas.height);
  symbolsGl.clearColor(0, 0, 0, 0);
  symbolsGl.clear(symbolsGl.COLOR_BUFFER_BIT);
  symbolsGl.useProgram(symbolsProgram);
  symbolsGl.uniform2f(symbolsGl.getUniformLocation(symbolsProgram, 'u_resolution'), width, height);
  symbolsGl.uniform2f(symbolsGl.getUniformLocation(symbolsProgram, 'u_offset'), offsetX, offsetY);
  symbolsGl.bindTexture(symbolsGl.TEXTURE_2D, symbolsTexture);
  symbolsGl.bindBuffer(symbolsGl.ARRAY_BUFFER, symbolsBuffer);
  symbolsGl.enable(symbolsGl.BLEND);
  symbolsGl.blendFunc(symbolsGl.SRC_ALPHA, symbolsGl.ONE_MINUS_SRC_ALPHA);

  const stride = 8 * 4;
  const positionLocation = symbolsGl.getAttribLocation(symbolsProgram, 'a_position');
  const texCoordLocation = symbolsGl.getAttribLocation(symbolsProgram, 'a_texCoord');
  const colorLocation = symbolsGl.getAttribLocation(symbolsProgram, 'a_color');

  symbolsGl.enableVertexAttribArray(positionLocation);
  symbolsGl.vertexAttribPointer(positionLocation, 2, symbolsGl.FLOAT, false, stride, 0);
  symbolsGl.enableVertexAttribArray(texCoordLocation);
  symbolsGl.vertexAttribPointer(texCoordLocation, 2, symbolsGl.FLOAT, false, stride, 2 * 4);
  symbolsGl.enableVertexAttribArray(colorLocation);
  symbolsGl.vertexAttribPointer(colorLocation, 4, symbolsGl.FLOAT, false, stride, 4 * 4);
  symbolsGl.drawArrays(symbolsGl.TRIANGLES, 0, symbolsVertexCount);
}

function startBackground() {
  window.cancelAnimationFrame(animationFrame);
  resizeCanvas();
  resizeSymbolsCanvas();
  paths = [];
  resetSymbols();
  lastSpawn = performance.now();
  spawnPaths(lastSpawn, 18);
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

function updatePresentationScroll() {
  const rect = presentationStage.getBoundingClientRect();
  const scrollable = presentationStage.offsetHeight - window.innerHeight;
  const progress = Math.min(Math.max(-rect.top / scrollable, 0), 1);
  const maxTranslate = presentationTrack.scrollWidth - window.innerWidth;
  const isPresentationVisible = rect.top < window.innerHeight * 0.32 && rect.bottom > window.innerHeight * 0.32;

  if (!isLinkJumpAnimating) {
    siteHeader.classList.toggle('is-compact', isPresentationVisible);
  }

  presentationTrack.style.transform = `translateX(${-maxTranslate * progress}px)`;

  presentationAnimationFrame = undefined;
}

function requestPresentationUpdate() {
  if (presentationAnimationFrame) {
    return;
  }

  presentationAnimationFrame = window.requestAnimationFrame(updatePresentationScroll);
}

function getPageTargets() {
  const presentationTop = presentationStage.offsetTop;
  const presentationScrollable = presentationStage.offsetHeight - window.innerHeight;
  const footer = document.querySelector('.site-footer');

  return [
    0,
    presentationTop,
    presentationTop + presentationScrollable / 2,
    presentationTop + presentationScrollable,
    footer.offsetTop
  ];
}

function getNearestPageIndex() {
  const targets = getPageTargets();
  const scrollY = window.scrollY;
  let nearestIndex = 0;
  let nearestDistance = Infinity;

  targets.forEach((target, index) => {
    const distance = Math.abs(target - scrollY);

    if (distance < nearestDistance) {
      nearestIndex = index;
      nearestDistance = distance;
    }
  });

  return nearestIndex;
}

function animateToPage(index, options = {}) {
  const targets = getPageTargets();
  const targetIndex = Math.min(Math.max(index, 0), targets.length - 1);
  const duration = options.duration ?? 0.72;

  isPageAnimating = true;
  document.body.classList.add('is-page-scrolling');
  activePage = targetIndex;

  lenis.scrollTo(targets[targetIndex], {
    duration,
    lock: true,
    onComplete: () => {
    isPageAnimating = false;
    document.body.classList.remove('is-page-scrolling');
    activePage = targetIndex;
    snapController.currentSnapIndex = targetIndex;
    updatePresentationScroll();
    options.onComplete?.();
    }
  });

  updatePresentationScroll();
}

function refreshSnapPoints() {
  snapCleanup.forEach((cleanup) => cleanup());
  snapCleanup = [];

  if (!snapController) {
    return;
  }

  getPageTargets().forEach((target) => {
    snapCleanup.push(snapController.add(target));
  });

  snapController.currentSnapIndex = activePage;
}

function canStepSlides() {
  return (
    loaderHidden &&
    !isPageAnimating &&
    !isLinkJumpAnimating &&
    !siteHeader.classList.contains('is-menu-open')
  );
}

function stepSlides(direction) {
  if (!canStepSlides()) {
    return;
  }

  if (direction > 0) {
    snapController.next();
  } else {
    snapController.previous();
  }
}

function setupSmoothScroll() {
  lenis = new Lenis({
    autoRaf: true,
    smoothWheel: true,
    syncTouch: true,
    duration: 0.74,
    wheelMultiplier: 1.08,
    touchMultiplier: 1.02,
    syncTouchLerp: 0.14,
    touchInertiaExponent: 1.2,
    prevent: (node) => node.closest('.site-header.is-menu-open') !== null,
    virtualScroll: ({ event }) => event.type !== 'wheel'
  });

  snapController = new Snap(lenis, {
    type: 'lock',
    duration: 0.58,
    debounce: 70,
    easing: (time) => 1 - Math.pow(1 - time, 3),
    onSnapStart: () => {
      isPageAnimating = true;
      document.body.classList.add('is-page-scrolling');
    },
    onSnapComplete: (item) => {
      const targets = getPageTargets();
      activePage = targets.findIndex((target) => Math.abs(target - item.value) < 2);
      snapController.currentSnapIndex = activePage;
      isPageAnimating = false;
      document.body.classList.remove('is-page-scrolling');
      requestPresentationUpdate();
    }
  });

  refreshSnapPoints();
  activePage = getNearestPageIndex();
  snapController.stop();

  lenis.on('scroll', () => {
    requestPresentationUpdate();
  });

  window.addEventListener(
    'wheel',
    (event) => {
      if (!canStepSlides() || Math.abs(event.deltaY) < 4) {
        return;
      }

      event.preventDefault();

      if (isWheelGestureLocked) {
        return;
      }

      const direction = event.deltaY > 0 ? 1 : -1;

      if (direction !== wheelGestureDirection) {
        wheelGestureDelta = 0;
        wheelGestureDirection = direction;
      }

      wheelGestureDelta += Math.abs(event.deltaY);
      window.clearTimeout(wheelGestureResetTimer);

      if (wheelGestureDelta >= 24) {
        isWheelGestureLocked = true;
        wheelGestureDelta = 0;
        wheelGestureDirection = 0;
        stepSlides(direction);
        window.clearTimeout(wheelGestureUnlockTimer);
        wheelGestureUnlockTimer = window.setTimeout(() => {
          isWheelGestureLocked = false;
        }, 420);
        return;
      }

      wheelGestureResetTimer = window.setTimeout(() => {
        wheelGestureDelta = 0;
        wheelGestureDirection = 0;
      }, 120);
    },
    { passive: false }
  );

  window.addEventListener(
    'touchstart',
    (event) => {
      touchGestureStartY = event.touches[0].clientY;
    },
    { passive: true }
  );

  window.addEventListener(
    'touchend',
    (event) => {
      if (
        loaderHidden === false ||
        isPageAnimating ||
        isLinkJumpAnimating ||
        siteHeader.classList.contains('is-menu-open')
      ) {
        return;
      }

      const deltaY = touchGestureStartY - event.changedTouches[0].clientY;

      if (Math.abs(deltaY) < 36) {
        return;
      }

      stepSlides(deltaY > 0 ? 1 : -1);
    },
    { passive: true }
  );
}

window.addEventListener('resize', () => {
  window.clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(() => {
    startBackground();
    updatePresentationScroll();
    lenis?.resize();
    snapController?.resize();
    refreshSnapPoints();
    activePage = getNearestPageIndex();
  }, 180);
});

window.addEventListener('pageshow', () => {
  setupHeaderAngles();
  updatePresentationScroll();
});

window.addEventListener('scroll', requestPresentationUpdate, { passive: true });

document.body.classList.add('is-loading');
setupHeaderAngles();
setupFooterShape();
updatePresentationScroll();
setupMobileMenu();
setupHeaderHoverZone();
setupSmoothScroll();
setupSectionLinks();
waitForPageLoad();
waitForFonts();
startBackground();
