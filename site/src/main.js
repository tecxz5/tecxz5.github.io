const canvas = document.querySelector('#scribble-bg');
const gl = canvas.getContext('webgl', {
  alpha: true,
  antialias: true,
  premultipliedAlpha: false
});

let resizeTimer;
let animationFrame;
let activeScenes = [];
let finishedScenes = [];

const archivedOpacity = 0.72;
const activeLineCount = 4;
const initialLineOffset = 1800;

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
  return progress * progress * (3 - 2 * progress);
}

function fadeBetween(from, to, progress) {
  return from + (to - from) * smoothStep(progress);
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

function makePath(width, height) {
  const pointCount = Math.floor(randomBetween(9, 13));
  const startX = -width * 0.12;
  const endX = width * 1.12;
  const centerY = height * randomBetween(0.42, 0.58);
  const amplitude = height * randomBetween(0.1, 0.23);
  const waveA = randomBetween(1.6, 2.5);
  const waveB = randomBetween(4.8, 7.2);
  const points = [];

  for (let index = 0; index < pointCount; index += 1) {
    const progress = index / (pointCount - 1);
    const drift = Math.sin(progress * Math.PI * waveA) * amplitude;
    const wobble = Math.sin(progress * Math.PI * waveB) * amplitude * 0.34;

    points.push({
      x: startX + (endX - startX) * progress + randomBetween(-width * 0.018, width * 0.018),
      y: centerY + drift + wobble + randomBetween(-height * 0.038, height * 0.038)
    });
  }

  return smoothPath(points, 12);
}

function getCatmullPoint(p0, p1, p2, p3, progress) {
  const t2 = progress * progress;
  const t3 = t2 * progress;

  return {
    x:
      0.5 *
      ((2 * p1.x) +
        (-p0.x + p2.x) * progress +
        (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
        (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
    y:
      0.5 *
      ((2 * p1.y) +
        (-p0.y + p2.y) * progress +
        (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
        (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3)
  };
}

function smoothPath(points, stepsPerSegment) {
  const smoothed = [];

  for (let index = 0; index < points.length - 1; index += 1) {
    const p0 = points[Math.max(0, index - 1)];
    const p1 = points[index];
    const p2 = points[index + 1];
    const p3 = points[Math.min(points.length - 1, index + 2)];

    for (let step = 0; step < stepsPerSegment; step += 1) {
      smoothed.push(getCatmullPoint(p0, p1, p2, p3, step / stepsPerSegment));
    }
  }

  smoothed.push(points[points.length - 1]);
  return smoothed;
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

function addStroke(vertices, points, width, alpha, offsetX = 0, offsetY = 0) {
  for (let index = 0; index < points.length; index += 1) {
    const previous = points[Math.max(0, index - 1)];
    const current = points[index];
    const next = points[Math.min(points.length - 1, index + 1)];
    const dx = next.x - previous.x;
    const dy = next.y - previous.y;
    const length = Math.hypot(dx, dy) || 1;
    const normalX = -dy / length;
    const normalY = dx / length;
    const taper = Math.sin((index / Math.max(1, points.length - 1)) * Math.PI);
    const strokeWidth = width * (0.42 + taper * 0.58);

    vertices.push(
      current.x + offsetX + normalX * strokeWidth,
      current.y + offsetY + normalY * strokeWidth,
      alpha,
      current.x + offsetX - normalX * strokeWidth,
      current.y + offsetY - normalY * strokeWidth,
      alpha
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

function createScene() {
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  const width = window.innerWidth;
  const height = window.innerHeight;

  canvas.width = Math.floor(width * pixelRatio);
  canvas.height = Math.floor(height * pixelRatio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  gl.viewport(0, 0, canvas.width, canvas.height);

  return {
    width,
    height,
    path: makePath(width, height),
    startedAt: performance.now(),
    duration: randomBetween(9000, 13000),
    fadeTail: randomBetween(1400, 2200),
    mainWidth: randomBetween(2.2, 4.0),
    ghostWidth: randomBetween(0.8, 1.3),
    ghostOffsetX: randomBetween(-2, 2),
    ghostOffsetY: randomBetween(-2, 2)
  };
}

function createActiveScene(startOffset = 0) {
  return {
    ...createScene(),
    startedAt: performance.now() + startOffset
  };
}

function drawScenePath(pathScene, progress, opacity = 1) {
  const visible = getVisiblePath(pathScene.path, progress);
  const mainVertices = [];
  const ghostVertices = [];

  addStroke(mainVertices, visible, pathScene.mainWidth, 0.62 * opacity);
  addStroke(
    ghostVertices,
    visible,
    pathScene.ghostWidth,
    0.22 * opacity,
    pathScene.ghostOffsetX,
    pathScene.ghostOffsetY
  );

  drawVertices(mainVertices);
  drawVertices(ghostVertices);
}

function draw(now) {
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.useProgram(program);
  gl.uniform2f(resolutionLocation, canvas.clientWidth, canvas.clientHeight);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 12, 0);
  gl.enableVertexAttribArray(alphaLocation);
  gl.vertexAttribPointer(alphaLocation, 1, gl.FLOAT, false, 12, 8);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  finishedScenes.forEach((finishedScene) => {
    drawScenePath(finishedScene, 1, archivedOpacity);
  });

  activeScenes = activeScenes.map((activeScene) => {
    const elapsed = now - activeScene.startedAt;

    if (elapsed < 0) {
      return activeScene;
    }

    if (elapsed > activeScene.duration) {
      finishedScenes.push(activeScene);
      finishedScenes = finishedScenes.slice(-26);
      return createActiveScene();
    }

    const rawProgress = Math.min(elapsed / activeScene.duration, 1);
    const progress = smoothStep(rawProgress);
    const fadeStart = activeScene.duration - activeScene.fadeTail;
    const fadeProgress = Math.max(0, elapsed - fadeStart) / activeScene.fadeTail;
    const currentOpacity = fadeBetween(1, archivedOpacity, Math.min(fadeProgress, 1));

    drawScenePath(activeScene, progress, currentOpacity);
    return activeScene;
  });

  animationFrame = window.requestAnimationFrame(draw);
}

function start() {
  if (!gl) {
    canvas.style.display = 'none';
    return;
  }

  window.cancelAnimationFrame(animationFrame);
  finishedScenes = [];
  activeScenes = Array.from({ length: activeLineCount }, (_, index) =>
    createActiveScene(index * initialLineOffset)
  );
  animationFrame = window.requestAnimationFrame(draw);
}

window.addEventListener('resize', () => {
  window.clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(start, 180);
});

start();
