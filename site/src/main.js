const canvas = document.querySelector('#scribble-bg');
const gl = canvas.getContext('webgl', {
  alpha: true,
  antialias: true,
  premultipliedAlpha: false
});

let resizeTimer;
let animationFrame;
let activeSignals = [];
let archivedSignals = [];

const activeSignalCount = 3;
const archivedOpacity = 0.34;
const initialSignalOffset = 2400;

const vertexShaderSource = `
  attribute vec2 a_position;
  attribute float a_alpha;

  uniform vec2 u_resolution;

  varying float v_alpha;

  void main() {
    vec2 clip = (a_position / u_resolution) * 2.0 - 1.0;
    gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
    v_alpha = a_alpha;
  }
`;

const fragmentShaderSource = `
  precision mediump float;

  varying float v_alpha;

  void main() {
    gl_FragColor = vec4(1.0, 1.0, 1.0, v_alpha);
  }
`;

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function smoothStep(progress) {
  return progress * progress * (3.0 - 2.0 * progress);
}

function compileShader(type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader));
  }

  return shader;
}

function createProgram() {
  const program = gl.createProgram();

  gl.attachShader(program, compileShader(gl.VERTEX_SHADER, vertexShaderSource));
  gl.attachShader(program, compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource));
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program));
  }

  return program;
}

const program = gl ? createProgram() : null;
const positionLocation = gl?.getAttribLocation(program, 'a_position');
const alphaLocation = gl?.getAttribLocation(program, 'a_alpha');
const resolutionLocation = gl?.getUniformLocation(program, 'u_resolution');
const buffer = gl?.createBuffer();

function makePulse(center, width, height) {
  return {
    center,
    width,
    height,
    polarity: Math.random() > 0.5 ? 1 : -1
  };
}

function makeSignalPath() {
  const pointCount = 220;
  const amplitude = randomBetween(0.08, 0.18);
  const phaseA = randomBetween(0, Math.PI * 2);
  const phaseB = randomBetween(0, Math.PI * 2);
  const phaseC = randomBetween(0, Math.PI * 2);
  const frequencyA = randomBetween(1.0, 2.2);
  const frequencyB = randomBetween(3.8, 7.4);
  const frequencyC = randomBetween(9.0, 15.0);
  const pulseCount = Math.floor(randomBetween(1, 4));
  const pulses = Array.from({ length: pulseCount }, () =>
    makePulse(randomBetween(0.14, 0.86), randomBetween(0.014, 0.04), randomBetween(0.12, 0.28))
  );

  return Array.from({ length: pointCount }, (_, index) => {
    const progress = index / (pointCount - 1);
    const x = -0.5 + progress;
    let y =
      Math.sin(progress * Math.PI * 2 * frequencyA + phaseA) * amplitude +
      Math.sin(progress * Math.PI * 2 * frequencyB + phaseB) * amplitude * 0.34 +
      Math.sin(progress * Math.PI * 2 * frequencyC + phaseC) * amplitude * 0.08;

    pulses.forEach((pulse) => {
      const distance = (progress - pulse.center) / pulse.width;
      y += Math.exp(-distance * distance) * pulse.height * pulse.polarity;
    });

    return { x, y };
  });
}

function getSignalAngle(signal, now) {
  if (typeof signal.frozenAngle === 'number') {
    return signal.frozenAngle;
  }

  const elapsed = Math.max(0, now - signal.startedAt);
  const seconds = elapsed / 1000;

  return (
    signal.baseRotation +
    seconds * signal.rotationSpeed +
    Math.sin(seconds * signal.rotationNoiseSpeed + signal.rotationNoisePhase) *
      signal.rotationNoise
  );
}

function transformSignalPath(signal, now) {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const scale = Math.min(width, height) * signal.scale;
  const centerX = width / 2 + signal.centerOffsetX * width;
  const centerY = height / 2 + signal.centerOffsetY * height;
  const angle = getSignalAngle(signal, now);
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  return signal.path.map((point) => {
    const x = point.x * scale * signal.stretchX;
    const y = point.y * scale * signal.stretchY;

    return {
      x: centerX + x * cos - y * sin,
      y: centerY + x * sin + y * cos
    };
  });
}

function getVisiblePath(points, progress) {
  const maxIndex = (points.length - 1) * progress;
  const fullPoints = Math.floor(maxIndex);
  const partial = maxIndex - fullPoints;
  const visible = points.slice(0, Math.max(2, fullPoints + 1));

  if (fullPoints < points.length - 1) {
    const current = points[fullPoints];
    const next = points[fullPoints + 1];

    visible.push({
      x: current.x + (next.x - current.x) * partial,
      y: current.y + (next.y - current.y) * partial
    });
  }

  return visible;
}

function addLine(vertices, points, width, alpha) {
  for (let index = 0; index < points.length; index += 1) {
    const previous = points[Math.max(0, index - 1)];
    const current = points[index];
    const next = points[Math.min(points.length - 1, index + 1)];
    const dx = next.x - previous.x;
    const dy = next.y - previous.y;
    const length = Math.hypot(dx, dy) || 1;
    const normalX = -dy / length;
    const normalY = dx / length;
    const headFade = Math.min(1, index / 8);
    const tailFade = Math.min(1, (points.length - 1 - index) / 8);
    const localAlpha = alpha * Math.min(headFade, tailFade);

    vertices.push(
      current.x + normalX * width,
      current.y + normalY * width,
      localAlpha,
      current.x - normalX * width,
      current.y - normalY * width,
      localAlpha
    );
  }
}

function drawVertices(vertices) {
  if (vertices.length === 0) {
    return;
  }

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertices.length / 3);
}

function resizeCanvas() {
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  const width = window.innerWidth;
  const height = window.innerHeight;

  canvas.width = Math.floor(width * pixelRatio);
  canvas.height = Math.floor(height * pixelRatio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  gl.viewport(0, 0, canvas.width, canvas.height);
}

function createSignal(startOffset = 0) {
  return {
    path: makeSignalPath(),
    startedAt: performance.now() + startOffset,
    duration: randomBetween(12000, 18000),
    fadeTail: randomBetween(1800, 2600),
    width: randomBetween(0.8, 1.45),
    glowWidth: randomBetween(4, 8),
    scale: randomBetween(0.62, 0.92),
    stretchX: randomBetween(1.15, 1.8),
    stretchY: randomBetween(0.65, 1.15),
    centerOffsetX: randomBetween(-0.04, 0.04),
    centerOffsetY: randomBetween(-0.08, 0.08),
    baseRotation: randomBetween(-Math.PI, Math.PI),
    rotationSpeed: randomBetween(-0.18, 0.18),
    rotationNoise: randomBetween(0.18, 0.44),
    rotationNoiseSpeed: randomBetween(0.09, 0.22),
    rotationNoisePhase: randomBetween(0, Math.PI * 2)
  };
}

function drawSignal(signal, progress, opacity, now) {
  const transformedPath = transformSignalPath(signal, now);
  const visible = getVisiblePath(transformedPath, progress);
  const glowVertices = [];
  const lineVertices = [];

  addLine(glowVertices, visible, signal.glowWidth, 0.055 * opacity);
  addLine(lineVertices, visible, signal.width, 0.82 * opacity);
  drawVertices(glowVertices);
  drawVertices(lineVertices);
}

function setupWebGlFrame() {
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.useProgram(program);
  gl.uniform2f(resolutionLocation, window.innerWidth, window.innerHeight);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 12, 0);
  gl.enableVertexAttribArray(alphaLocation);
  gl.vertexAttribPointer(alphaLocation, 1, gl.FLOAT, false, 12, 8);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
}

function draw(now) {
  setupWebGlFrame();

  archivedSignals.forEach((signal) => {
    drawSignal(signal, 1, archivedOpacity, now);
  });

  activeSignals = activeSignals.map((signal) => {
    const elapsed = now - signal.startedAt;

    if (elapsed < 0) {
      return signal;
    }

    if (elapsed > signal.duration) {
      signal.frozenAngle = getSignalAngle(signal, now);
      archivedSignals.push(signal);
      archivedSignals = archivedSignals.slice(-28);
      return createSignal();
    }

    const rawProgress = Math.min(elapsed / signal.duration, 1);
    const progress = smoothStep(rawProgress);
    const fadeStart = signal.duration - signal.fadeTail;
    const fadeProgress = Math.max(0, elapsed - fadeStart) / signal.fadeTail;
    const opacity = 1 + (archivedOpacity - 1) * smoothStep(Math.min(fadeProgress, 1));

    drawSignal(signal, progress, opacity, now);
    return signal;
  });

  animationFrame = window.requestAnimationFrame(draw);
}

function start() {
  if (!gl) {
    canvas.style.display = 'none';
    return;
  }

  window.cancelAnimationFrame(animationFrame);
  resizeCanvas();
  archivedSignals = [];
  activeSignals = Array.from({ length: activeSignalCount }, (_, index) =>
    createSignal(index * initialSignalOffset)
  );
  animationFrame = window.requestAnimationFrame(draw);
}

window.addEventListener('resize', () => {
  window.clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(start, 180);
});

start();
