/**
 * 3D Raymarched Menger Sponge
 * Pure WebGL GPU Raymarching with brutalist pixel-grid aesthetic
 * Matching the site's palette: #000000, #cedb1a (lime), #ffffff
 */

const QUAD_VERTEX_SHADER = `
  attribute vec2 a_position;
  varying vec2 vUv;

  void main() {
    vUv = (a_position + 1.0) * 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const MENGER_FRAGMENT_SHADER = `
  precision highp float;
  varying vec2 vUv;

  uniform vec2 u_resolution;
  uniform float u_time;
  uniform mat3 u_rot;
  uniform float u_pixelSize;
  uniform float u_pixelGap;
  uniform vec3 u_colorLime;
  uniform vec3 u_colorWhite;
  uniform vec3 u_bgColor;

  mat3 transpose3(mat3 m) {
    return mat3(m[0][0], m[1][0], m[2][0],
                m[0][1], m[1][1], m[2][1],
                m[0][2], m[1][2], m[2][2]);
  }

  // Ordered-dither building blocks (no bit ops in GLSL ES 1.00, so the 2x2
  // matrix is evaluated arithmetically and 4x4 is built recursively)
  float bayer2k(vec2 p) {
    return mod(2.0 * p.x + 3.0 * p.y, 4.0);
  }

  float bayer4(vec2 p) {
    return (4.0 * bayer2k(floor(p * 0.5)) + bayer2k(mod(p, 2.0))) / 16.0;
  }

  float sdBox(vec3 p, vec3 b) {
    vec3 d = abs(p) - b;
    return min(max(d.x, max(d.y, d.z)), 0.0) + length(max(d, 0.0));
  }

  float sdCross(vec3 p, float b) {
    vec3 da = abs(p);
    float c1 = max(da.x, da.y);
    float c2 = max(da.y, da.z);
    float c3 = max(da.z, da.x);
    return min(c1, min(c2, c3)) - b;
  }

  // Exact iterative Menger Sponge SDF
  float sdMenger(vec3 p) {
    float d = sdBox(p, vec3(1.0));
    float s = 1.0;
    for (int m = 0; m < 3; m++) {
      vec3 a = mod(p * s + 1.0, 2.0) - 1.0;
      float c = -sdCross(a, 1.0 / 3.0) / s;
      d = max(d, c);
      s *= 3.0;
    }
    return d;
  }

  vec3 calcNormal(vec3 p) {
    float h = 0.001;
    vec2 k = vec2(1.0, -1.0);
    return normalize(
      k.xyy * sdMenger(p + k.xyy * h) +
      k.yyx * sdMenger(p + k.yyx * h) +
      k.yxy * sdMenger(p + k.yxy * h) +
      k.xxx * sdMenger(p + k.xxx * h)
    );
  }

  void main() {
    vec2 pixelCoord = vUv * u_resolution;
    float totalSize = u_pixelSize + u_pixelGap;

    // 1. Grid block coordinates
    vec2 blockId = floor(pixelCoord / totalSize);
    vec2 posInBlock = pixelCoord - (blockId * totalSize);

    // 2. Pixel grid gap (empty border between cells)
    if (posInBlock.x > u_pixelSize || posInBlock.y > u_pixelSize) {
      gl_FragColor = vec4(u_bgColor, 1.0);
      return;
    }

    // 3. Sample center of pixel block
    vec2 centerCoord = (blockId + 0.5) * totalSize;
    vec2 uv = (centerCoord * 2.0 - u_resolution) / min(u_resolution.x, u_resolution.y);

    // Shift down to anchor sponge against the footer (3/4 visible above footer line)
    // On mobile (tall screens), scale shift with aspect ratio so it docks into footer notch
    float yShift = 0.42;
    if (u_resolution.y > u_resolution.x) {
      yShift += (u_resolution.y / u_resolution.x - 1.0) * 0.52;
    }
    uv.y += yShift;

    // Camera setup - enlarged back up, fixed in VIEW space
    vec3 roView = vec3(0.0, 0.0, 3.65);
    vec3 rdView = normalize(vec3(uv, -1.8));

    // u_rot is the sponge's orientation in view space (local -> camera).
    // Raymarch in local space, so push the camera through the inverse rotation
    // (a rotation matrix transposes to its inverse).
    mat3 rotInv = transpose3(u_rot);
    vec3 ro = rotInv * roView;
    vec3 rd = rotInv * rdView;

    // Raymarch
    float t = 0.0;
    float d = 0.0;
    int hitSteps = 0;
    bool hit = false;

    for (int i = 0; i < 56; i++) {
      vec3 pos = ro + rd * t;
      d = sdMenger(pos);
      if (d < 0.0015) {
        hit = true;
        hitSteps = i;
        break;
      }
      t += d;
      if (t > 11.0) break;
    }

    if (!hit) {
      gl_FragColor = vec4(u_bgColor, 1.0);
      return;
    }

    vec3 hitPos = ro + rd * t;
    // Normal back into view space: the key light is bolted to the screen,
    // so it stays in one place while the sponge turns underneath it.
    vec3 n = u_rot * calcNormal(hitPos);

    // Fixed key light on screen: upper-left, slightly toward the viewer
    vec3 lightDir = normalize(vec3(-0.45, 0.82, 0.6));

    // Wrapped diffuse + hemisphere fill: no facet is ever left unlit
    float ndl = dot(n, lightDir);
    float wrap = clamp(ndl * 0.5 + 0.5, 0.0, 1.0);
    float hemi = clamp(0.5 + 0.5 * n.y, 0.0, 1.0);

    // Crevice shading: deep in the tunnels the surface darkens (never to black)
    float ao = clamp(1.0 - float(hitSteps) / 64.0, 0.0, 1.0);
    ao = 0.30 + 0.70 * pow(ao, 1.3);

    // Rim along sharp fractal boundaries — keeps the silhouette crisp
    float rim = pow(clamp(1.0 - max(dot(-rdView, n), 0.0), 0.0, 1.0), 3.0);

    // Diffuse only: flat mosaic facets have one constant normal each, so a
    // specular term would flip whole faces to white when they pass the mirror
    // angle. Face brightness follows the light bolted to the screen instead.
    float lum = (0.14 + 0.86 * wrap) * (0.78 + 0.22 * hemi) * ao + rim * 0.18;

    // Ordered 4x4 dither on the block grid: breaks the big flat facets into a
    // two-tone dot pattern instead of one dead solid band.
    lum += (bayer4(blockId) - 0.5) * 0.09;

    // Quantize into crisp brutalist bands.
    // Facets get 4 posterized lime steps (form still reads) and never drop to
    // pure black: only the empty pixel gaps and the tunnels drilled straight
    // through the sponge stay #000000.
    vec3 col;
    if (lum > 0.84) {
      col = u_colorWhite;
    } else if (lum > 0.64) {
      col = u_colorLime;
    } else if (lum > 0.46) {
      col = u_colorLime * 0.72;
    } else if (lum > 0.30) {
      col = u_colorLime * 0.48;
    } else {
      col = u_colorLime * 0.26;
    }

    gl_FragColor = vec4(col, 1.0);
  }
`;

// 3x3 rotation matrices, column-major (same layout GLSL/webgl expects)
function mat3Mul(a, b) {
  const out = new Float32Array(9);
  for (let c = 0; c < 3; c++) {
    const b0 = b[c * 3];
    const b1 = b[c * 3 + 1];
    const b2 = b[c * 3 + 2];
    out[c * 3] = a[0] * b0 + a[3] * b1 + a[6] * b2;
    out[c * 3 + 1] = a[1] * b0 + a[4] * b1 + a[7] * b2;
    out[c * 3 + 2] = a[2] * b0 + a[5] * b1 + a[8] * b2;
  }
  return out;
}

function mat3RotX(angle) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return new Float32Array([1, 0, 0, 0, c, s, 0, -s, c]);
}

function mat3RotY(angle) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return new Float32Array([c, 0, -s, 0, 1, 0, s, 0, c]);
}

export class MengerEffect {
  constructor(canvas) {
    this.canvas = canvas;
    this.gl = canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false
    });

    if (!this.gl) {
      console.warn('WebGL not supported for MengerEffect');
      return;
    }

    this.width = 0;
    this.height = 0;
    this.pixelSize = 6.0;
    this.pixelGap = 1.0;

    // Orientation as a full local->view matrix. Every increment (idle spin or
    // drag) is applied on the LEFT, i.e. in screen space, so the sponge always
    // turns relative to the camera and never around its own tilted axes.
    this.rot = mat3Mul(mat3RotY(0.65), mat3RotX(0.52));
    this.velX = 0.0025;   // rad/frame about the screen's horizontal axis (pitch)
    this.velY = 0.007;    // rad/frame about the screen's vertical axis (yaw)
    this.baseSpinX = 0.0025;
    this.baseSpinY = 0.007;

    this.isDragging = false;
    this.lastPointerX = 0;
    this.lastPointerY = 0;
    this.lastPointerTime = performance.now();
    this.dragDistance = 0;

    this.initShaders();
    this.initBuffers();
  }

  compileShader(type, source) {
    const gl = this.gl;
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  initShaders() {
    const gl = this.gl;
    const vs = this.compileShader(gl.VERTEX_SHADER, QUAD_VERTEX_SHADER);
    const fs = this.compileShader(gl.FRAGMENT_SHADER, MENGER_FRAGMENT_SHADER);

    this.program = gl.createProgram();
    gl.attachShader(this.program, vs);
    gl.attachShader(this.program, fs);
    gl.linkProgram(this.program);

    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(this.program));
      return;
    }

    this.uResolution = gl.getUniformLocation(this.program, 'u_resolution');
    this.uTime = gl.getUniformLocation(this.program, 'u_time');
    this.uRot = gl.getUniformLocation(this.program, 'u_rot');
    this.uPixelSize = gl.getUniformLocation(this.program, 'u_pixelSize');
    this.uPixelGap = gl.getUniformLocation(this.program, 'u_pixelGap');
    this.uColorLime = gl.getUniformLocation(this.program, 'u_colorLime');
    this.uColorWhite = gl.getUniformLocation(this.program, 'u_colorWhite');
    this.uBgColor = gl.getUniformLocation(this.program, 'u_bgColor');
    this.aPosition = gl.getAttribLocation(this.program, 'a_position');
  }

  initBuffers() {
    const gl = this.gl;
    this.quadBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );
  }

  resize(width, height) {
    if (!this.gl) return;
    if (width <= 0 || height <= 0) return;
    this.width = Math.round(width);
    this.height = Math.round(height);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(this.width * dpr);
    this.canvas.height = Math.round(this.height * dpr);

    // Adapt pixel block size on smaller screens
    if (this.width < 600) {
      this.pixelSize = 5.0;
      this.pixelGap = 1.0;
    } else {
      this.pixelSize = 6.0;
      this.pixelGap = 1.0;
    }
  }

  onPointerMove(clientX, clientY) {
    if (!this.isDragging) return;

    const dx = clientX - this.lastPointerX;
    const dy = clientY - this.lastPointerY;
    const now = performance.now();
    const dt = Math.max(now - this.lastPointerTime, 8);

    // Screen-space rotation: dx yaws about the camera's vertical axis,
    // dy pitches about the camera's horizontal axis — the sponge follows the
    // finger and tips up/down as seen from the camera.
    this.rot = mat3Mul(
      mat3RotX(dy * 0.0055),
      mat3Mul(mat3RotY(dx * 0.0055), this.rot)
    );

    // Track throw velocity (flick impulse in both X and Y)
    const instantVelY = (dx / dt) * 0.16;
    const instantVelX = (dy / dt) * 0.16;
    this.velY = this.velY * 0.35 + instantVelY * 0.65;
    this.velX = this.velX * 0.35 + instantVelX * 0.65;

    this.dragDistance += Math.hypot(dx, dy);
    this.lastPointerX = clientX;
    this.lastPointerY = clientY;
    this.lastPointerTime = now;
  }

  onPointerDown(clientX, clientY) {
    this.isDragging = true;
    this.lastPointerX = clientX;
    this.lastPointerY = clientY;
    this.lastPointerTime = performance.now();
    this.dragDistance = 0;
  }

  onPointerUp() {
    if (!this.isDragging) return;
    this.isDragging = false;

    // If it was a quick click/tap without drag, give it a push impulse
    if (this.dragDistance < 6) {
      const dir = Math.random() > 0.5 ? 1 : -1;
      this.velY = dir * (0.045 + Math.random() * 0.035);
      this.velX = (Math.random() - 0.5) * 0.03;
    } else {
      const maxVel = 0.085;
      this.velY = Math.max(-maxVel, Math.min(maxVel, this.velY));
      this.velX = Math.max(-maxVel, Math.min(maxVel, this.velX));
    }
  }

  updateAndDraw(time) {
    if (!this.gl) return;
    if (this.width === 0 || this.height === 0 || this.canvas.width === 0 || this.canvas.height === 0) {
      const parent = this.canvas.parentElement;
      const w = this.canvas.clientWidth || parent?.clientWidth || window.innerWidth;
      const h = this.canvas.clientHeight || parent?.clientHeight || window.innerHeight;
      if (w > 0 && h > 0) {
        this.resize(w, h);
      } else {
        return;
      }
    }

    const gl = this.gl;
    const tSeconds = (time || performance.now()) * 0.001;

    // Auto-rotation and inertia physics (screen-relative, same as dragging)
    if (!this.isDragging) {
      this.rot = mat3Mul(
        mat3RotX(this.velX),
        mat3Mul(mat3RotY(this.velY), this.rot)
      );

      // Friction: smoothly ease throw momentum back to base idle spin
      this.velY += (this.baseSpinY - this.velY) * 0.022;
      this.velX += (this.baseSpinX - this.velX) * 0.022;
    }

    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(this.program);

    gl.uniform2f(this.uResolution, this.canvas.width, this.canvas.height);
    gl.uniform1f(this.uTime, tSeconds);
    gl.uniformMatrix3fv(this.uRot, false, this.rot);

    const scale = (this.canvas.width / (this.width || 1)) || 1.0;
    gl.uniform1f(this.uPixelSize, this.pixelSize * scale);
    gl.uniform1f(this.uPixelGap, this.pixelGap * scale);

    gl.uniform3f(this.uColorLime, 0.808, 0.859, 0.102); // #cedb1a
    gl.uniform3f(this.uColorWhite, 1.0, 1.0, 1.0);       // #ffffff
    gl.uniform3f(this.uBgColor, 0.0, 0.0, 0.0);          // #000000

    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
    gl.enableVertexAttribArray(this.aPosition);
    gl.vertexAttribPointer(this.aPosition, 2, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
}
