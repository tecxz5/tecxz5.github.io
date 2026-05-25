const canvas = document.querySelector('#scribble-bg');
const loader = document.querySelector('#loader');
const siteHeader = document.querySelector('#site-header');
const siteLogo = siteHeader.querySelector('.site-header__logo');
const siteNavigation = siteHeader.querySelector('.site-header__nav');
const ctx = canvas.getContext('2d');

let resizeTimer;
let animationFrame;
let backgroundReady = false;
let loaderHidden = false;
let loaderExitTimer;
let lastSpawn = 0;
let paths = [];

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

function setupHeaderAngles() {
  const isMobile = window.innerWidth <= 720;
  const topAngle = randomBetween(0, 8);
  const bottomAngle = randomBetween(-8, 0);
  const topShift = 0;
  const bottomShift = 0;

  siteHeader.style.setProperty('--header-top-angle', `${topAngle.toFixed(2)}deg`);
  siteHeader.style.setProperty('--header-bottom-angle', `${bottomAngle.toFixed(2)}deg`);
  siteHeader.style.setProperty('--header-top-shift', `${topShift.toFixed(0)}px`);
  siteHeader.style.setProperty('--header-bottom-shift', `${bottomShift.toFixed(0)}px`);
}

function setMenuOpen(isOpen) {
  siteHeader.classList.toggle('is-menu-open', isOpen);
  siteLogo.setAttribute('aria-expanded', String(isOpen));
  siteLogo.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'tecxz5');
}

function setupMobileMenu() {
  siteLogo.addEventListener('click', (event) => {
    if (window.innerWidth > 720) {
      return;
    }

    event.preventDefault();
    setMenuOpen(!siteHeader.classList.contains('is-menu-open'));
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

function smoothStep(progress) {
  return progress * progress * (3 - 2 * progress);
}

function resizeCanvas() {
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  const width = window.innerWidth;
  const height = window.innerHeight;

  canvas.width = Math.floor(width * pixelRatio);
  canvas.height = Math.floor(height * pixelRatio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
}

function createPath(now) {
  const width = window.innerWidth;
  const height = window.innerHeight;
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
  const width = window.innerWidth;
  const height = window.innerHeight;

  ctx.clearRect(0, 0, width, height);

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

function startBackground() {
  window.cancelAnimationFrame(animationFrame);
  resizeCanvas();
  paths = [];
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

  document.fonts.ready.then(() => markLoaded('fonts'));
}

window.addEventListener('resize', () => {
  window.clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(startBackground, 180);
});

window.addEventListener('pageshow', () => {
  setupHeaderAngles();
});

document.body.classList.add('is-loading');
setupHeaderAngles();
setupMobileMenu();
waitForPageLoad();
waitForFonts();
startBackground();
