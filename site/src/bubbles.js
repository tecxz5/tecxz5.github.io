/**
 * Bubbles Effect
 * Pixel Grid + Rising Carbonated Soda Bubbles
 */

const VERTEX_SHADER = `
  attribute vec2 a_position;
  varying vec2 vUv;

  void main() {
    vUv = (a_position + 1.0) * 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  precision highp float;
  varying vec2 vUv;

  uniform vec2 uResolution;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uMouseRadius;
  uniform float uMouseStrength;

  uniform float uPixelSize;
  uniform float uPixelGap;
  uniform vec3 uColor1; // Neon Lime #cedb1a
  uniform vec3 uColor2; // Pure White #ffffff
  uniform vec3 uBgColor; // Deep Black #000000

  // Up to 48 active bubbles
  // Each bubble: vec4(x, y, radius, type)
  const int MAX_BUBBLES = 48;
  uniform vec4 uBubbles[MAX_BUBBLES];
  uniform int uBubbleCount;

  // Pop sparks: vec4(x, y, alpha, size)
  const int MAX_POPS = 24;
  uniform vec4 uPopParticles[MAX_POPS];
  uniform int uPopCount;

  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  void main() {
    vec2 pixelCoord = vUv * uResolution;
    float totalSize = uPixelSize + uPixelGap;

    // 1. Grid block coordinates
    vec2 blockId = floor(pixelCoord / totalSize);
    vec2 blockPos = blockId * totalSize;
    vec2 posInBlock = pixelCoord - blockPos;

    // 2. Pixel gap (empty space between blocks)
    if (posInBlock.x > uPixelSize || posInBlock.y > uPixelSize) {
      gl_FragColor = vec4(uBgColor, 1.0);
      return;
    }

    vec2 blockCenter = blockPos + vec2(uPixelSize * 0.5);
    vec2 blockCenterUV = blockCenter / uResolution;

    float rand = random(blockId);

    // 3. Evaluate bubbles
    float minEdgeDist = 999.0;
    bool isOutline = false;
    bool isHighlight = false;
    bool isGreen = false;
    float bubbleAlpha = 0.0;

    for (int i = 0; i < MAX_BUBBLES; i++) {
      if (i >= uBubbleCount) break;

      vec4 b = uBubbles[i];
      vec2 bPos = b.xy;
      float bRadius = b.z;
      float bType = b.w; // 0 = white, 1 = lime

      vec2 diff = blockCenter - bPos;
      float d = length(diff);

      // Check proximity to bubble
      if (d <= bRadius + totalSize * 0.75) {
        float edgeDiff = abs(d - bRadius);

        // Micro bubble (single or 2x2 blocks)
        if (bRadius <= totalSize * 1.35) {
          if (d <= bRadius + totalSize * 0.3) {
            isOutline = true;
            if (bType > 0.5) isGreen = true;
            bubbleAlpha = max(bubbleAlpha, 1.0);
          }
        } else {
          // Hollow ring bubble
          if (edgeDiff <= totalSize * 0.62) {
            isOutline = true;
            minEdgeDist = min(minEdgeDist, edgeDiff);
            if (bType > 0.5) isGreen = true;
            bubbleAlpha = max(bubbleAlpha, 1.0);
          }

          // Specular highlight: top-left quadrant of the bubble ring
          if (diff.x < -0.12 * bRadius && diff.y > 0.12 * bRadius && edgeDiff <= totalSize * 1.05) {
            isHighlight = true;
          }

          // Subtle translucent shimmer inside larger bubbles
          if (d < bRadius - totalSize * 0.75 && rand < 0.16) {
            isOutline = true;
            if (bType > 0.5) isGreen = true;
            bubbleAlpha = max(bubbleAlpha, 0.65);
          }
        }
      }
    }

    // 4. Pop spark particles
    for (int i = 0; i < MAX_POPS; i++) {
      if (i >= uPopCount) break;
      vec4 p = uPopParticles[i];
      float d = distance(blockCenter, p.xy);
      if (d < totalSize * 0.85) {
        isOutline = true;
        isHighlight = true;
        bubbleAlpha = max(bubbleAlpha, p.z);
      }
    }

    // 5. Mouse lighting interaction
    vec2 mouseDiff = blockCenterUV - uMouse;
    mouseDiff.x *= uResolution.x / uResolution.y;
    float mouseDist = length(mouseDiff);
    float mouseFactor = clamp((1.0 - smoothstep(0.0, uMouseRadius, mouseDist)) * uMouseStrength, 0.0, 1.0);

    // 6. Vertical edge fade
    float edgeFade = smoothstep(0.0, 0.06, vUv.y) * smoothstep(1.0, 0.94, vUv.y);

    // Render block color
    if (isOutline || isHighlight) {
      vec3 col;
      if (isHighlight) {
        col = uColor2; // Pure white highlight
      } else if (isGreen) {
        col = uColor1; // Cyber lime #cedb1a
        if (mouseFactor > 0.0) {
          col = mix(col, uColor2, mouseFactor);
        }
      } else {
        col = uColor2; // White
        if (mouseFactor > 0.0) {
          col = mix(col, uColor1, mouseFactor);
        }
      }

      col = mix(uBgColor, col, edgeFade * bubbleAlpha);
      gl_FragColor = vec4(col, 1.0);
    } else {
      gl_FragColor = vec4(uBgColor, 1.0);
    }
  }
`;

const MAX_BUBBLES = 48;
const MAX_POPS = 24;

export class BubblesEffect {
  constructor(canvas) {
    this.canvas = canvas;
    this.gl = null;
    this.program = null;
    this.positionBuffer = null;
    this.positionLocation = -1;
    this.uniformLocations = {};

    this.startTime = performance.now();
    this.lastTime = performance.now();
    this.lastAmbientSpawn = 0;
    this.targetMouse = { x: 0.5, y: 0.5 };
    this.currentMouse = { x: 0.5, y: 0.5 };
    this.mousePixel = { x: -9999, y: -9999 };
    this.lastPointerX = -9999;
    this.lastPointerY = -9999;

    this.mouseEase = 0.08;
    this.mouseRadius = 0.28;
    this.mouseStrength = 1.3;
    this.pixelSize = 5.0;
    this.pixelGap = 2.0;
    this.color1 = [206.0 / 255.0, 219.0 / 255.0, 26.0 / 255.0]; // #cedb1a
    this.color2 = [1.0, 1.0, 1.0]; // #ffffff
    this.bgColor = [0.0, 0.0, 0.0];
    this.dpr = 1.0;
    this.width = 0;
    this.height = 0;

    this.bubbles = [];
    this.vents = [];
    this.popParticles = [];
    this.bubbleData = new Float32Array(MAX_BUBBLES * 4);
    this.popData = new Float32Array(MAX_POPS * 4);

    this.initGL();
  }

  initGL() {
    const gl = this.canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'high-performance'
    }) || this.canvas.getContext('experimental-webgl');

    if (!gl) {
      console.warn('WebGL is not available for BubblesEffect');
      return;
    }

    this.gl = gl;

    const vertShader = this.createShader(gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragShader = this.createShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);

    if (!vertShader || !fragShader) return;

    const program = gl.createProgram();
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Failed to link bubble shader:', gl.getProgramInfoLog(program));
      return;
    }

    this.program = program;
    this.positionLocation = gl.getAttribLocation(program, 'a_position');

    const uniforms = [
      'uTime',
      'uResolution',
      'uMouse',
      'uMouseRadius',
      'uMouseStrength',
      'uPixelSize',
      'uPixelGap',
      'uColor1',
      'uColor2',
      'uBgColor',
      'uBubbles',
      'uBubbleCount',
      'uPopParticles',
      'uPopCount'
    ];

    for (const name of uniforms) {
      this.uniformLocations[name] = gl.getUniformLocation(program, name);
    }

    // Full-screen quad
    this.positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1.0, -1.0,
         1.0, -1.0,
        -1.0,  1.0,
        -1.0,  1.0,
         1.0, -1.0,
         1.0,  1.0
      ]),
      gl.STATIC_DRAW
    );
  }

  createShader(type, source) {
    const gl = this.gl;
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  resize(width, height) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.dpr = dpr;
    this.width = width;
    this.height = height;
    this.canvas.width = Math.floor(width * dpr);
    this.canvas.height = Math.floor(height * dpr);
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    if (this.gl) {
      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }

    this.setupVents();
    if (this.bubbles.length === 0) {
      this.populateInitial();
    }
  }

  setupVents() {
    const count = Math.max(3, Math.min(8, Math.floor(this.width / 180)));
    this.vents = [];
    for (let i = 0; i < count; i++) {
      this.vents.push({
        x: (this.width / (count + 1)) * (i + 1) + (Math.random() - 0.5) * 40,
        lastSpawn: 0,
        interval: 180 + Math.random() * 320,
        wobbleFreq: 1.8 + Math.random() * 2.2,
        wobbleAmp: 4 + Math.random() * 6,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  populateInitial() {
    const count = Math.min(28, Math.floor((this.width * this.height) / 36000));
    for (let i = 0; i < count; i++) {
      const radius = this.pickBubbleRadius();
      const b = this.createBubble(
        Math.random() * this.width,
        Math.random() * this.height,
        radius,
        Math.random() < 0.48 ? 1 : 0
      );
      this.bubbles.push(b);
    }
  }

  pickBubbleRadius() {
    const r = Math.random();
    if (r < 0.38) {
      return 4 + Math.random() * 3; // micro
    } else if (r < 0.72) {
      return 8 + Math.random() * 5; // small
    } else if (r < 0.92) {
      return 15 + Math.random() * 8; // medium
    } else {
      return 26 + Math.random() * 12; // large
    }
  }

  createBubble(x, y, radius, type) {
    const isMicro = radius <= 7;
    const baseSpeed = isMicro ? 75 + Math.random() * 45 : 45 + radius * 2.2 + Math.random() * 20;
    const popY = Math.random() < 0.88
      ? this.height - (15 + Math.random() * 55)
      : Math.random() * (this.height * 0.75);

    return {
      x,
      y,
      radius,
      type, // 0 = white, 1 = lime
      speed: baseSpeed,
      popY,
      wobbleFreq: 1.8 + Math.random() * 2.4,
      wobbleAmp: radius > 15 ? 4 + Math.random() * 6 : 2 + Math.random() * 3,
      wobblePhase: Math.random() * Math.PI * 2
    };
  }

  spawnBubble(x, y, radius, type) {
    if (this.bubbles.length >= MAX_BUBBLES) return;
    this.bubbles.push(this.createBubble(x, y, radius, type));
  }

  spawnPop(x, y, radius) {
    const count = radius > 15 ? 6 : radius > 8 ? 4 : 2;
    const speed = 40 + radius * 1.8;

    for (let i = 0; i < count; i++) {
      if (this.popParticles.length >= MAX_POPS) break;
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
      this.popParticles.push({
        x,
        y,
        vx: Math.cos(angle) * speed * (0.8 + Math.random() * 0.5),
        vy: Math.sin(angle) * speed * (0.8 + Math.random() * 0.5),
        alpha: 1.0,
        decay: 3.5 + Math.random() * 2.0
      });
    }
  }

  onPointerMove(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      const px = clientX - rect.left;
      const py = clientY - rect.top;

      // WebGL UV: (0,0) is bottom-left, (1,1) is top-right
      this.targetMouse.x = px / rect.width;
      this.targetMouse.y = 1.0 - py / rect.height;
      this.mousePixel.x = px;
      this.mousePixel.y = rect.height - py; // WebGL pixel Y

      // Spawn tiny fizzy bubbles under moving cursor
      const dist = Math.hypot(px - this.lastPointerX, py - this.lastPointerY);
      if (dist > 24) {
        this.lastPointerX = px;
        this.lastPointerY = py;
        this.spawnBubble(
          px + (Math.random() - 0.5) * 16,
          rect.height - py + (Math.random() - 0.5) * 12,
          4 + Math.random() * 3,
          Math.random() < 0.45 ? 1 : 0
        );
      }
    }
  }

  onPointerDown(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    const px = clientX - rect.left;
    const webglY = rect.height - (clientY - rect.top);

    // Pop bubbles close to tap
    const popRadius = 45;
    for (let i = this.bubbles.length - 1; i >= 0; i--) {
      const b = this.bubbles[i];
      if (Math.hypot(b.x - px, b.y - webglY) < popRadius + b.radius) {
        this.spawnPop(b.x, b.y, b.radius);
        this.bubbles.splice(i, 1);
      }
    }

    // Spawn a fountain burst of fizzy bubbles from tap location
    const burstCount = 5 + Math.floor(Math.random() * 5);
    for (let i = 0; i < burstCount; i++) {
      const radius = this.pickBubbleRadius() * 0.8;
      this.spawnBubble(
        px + (Math.random() - 0.5) * 28,
        webglY + (Math.random() - 0.5) * 16,
        radius,
        Math.random() < 0.5 ? 1 : 0
      );
    }
  }

  updateAndDraw(now) {
    if (!this.gl || !this.program) return;
    const gl = this.gl;
    const u = this.uniformLocations;
    const dpr = this.dpr;

    const dt = Math.min((now - this.lastTime) / 1000.0, 0.08);
    this.lastTime = now;

    // 1. Spawning from Nucleation Vents
    for (let i = 0; i < this.vents.length; i++) {
      const vent = this.vents[i];
      if (now - vent.lastSpawn > vent.interval) {
        vent.lastSpawn = now + (Math.random() - 0.5) * 80;
        const radius = this.pickBubbleRadius();
        const type = Math.random() < 0.48 ? 1 : 0;
        this.spawnBubble(
          vent.x + (Math.random() - 0.5) * 12,
          -radius - 4,
          radius,
          type
        );
      }
    }

    // 2. Free Ambient Bubbles
    if (now - this.lastAmbientSpawn > 220) {
      this.lastAmbientSpawn = now;
      const radius = this.pickBubbleRadius();
      const type = Math.random() < 0.45 ? 1 : 0;
      this.spawnBubble(
        Math.random() * this.width,
        -radius - 4,
        radius,
        type
      );
    }

    // 3. Update Bubbles
    for (let i = this.bubbles.length - 1; i >= 0; i--) {
      const b = this.bubbles[i];

      // Slight acceleration near the top
      const depthFactor = 1.0 + Math.max(0, b.y / this.height) * 0.25;
      b.y += b.speed * depthFactor * dt;

      b.wobblePhase += b.wobbleFreq * dt;
      const currentX = b.x + Math.sin(b.wobblePhase) * b.wobbleAmp;

      // Gentle mouse repulsion
      const mdx = currentX - this.mousePixel.x;
      const mdy = b.y - this.mousePixel.y;
      const mdist = Math.hypot(mdx, mdy);
      if (mdist < 75 && mdist > 1.0) {
        const push = (1.0 - mdist / 75) * 55 * dt;
        b.x += (mdx / mdist) * push;
      }

      // Check pop condition
      if (b.y >= b.popY || b.y >= this.height + 15) {
        this.spawnPop(currentX, b.y, b.radius);
        this.bubbles.splice(i, 1);
        continue;
      }
    }

    // 4. Update Pop Sparks
    for (let i = this.popParticles.length - 1; i >= 0; i--) {
      const p = this.popParticles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.alpha -= p.decay * dt;

      if (p.alpha <= 0.05) {
        this.popParticles.splice(i, 1);
      }
    }

    // 5. Pack Bubbles into Uniform Float32Array
    const bubbleCount = Math.min(this.bubbles.length, MAX_BUBBLES);
    for (let i = 0; i < bubbleCount; i++) {
      const b = this.bubbles[i];
      const currentX = b.x + Math.sin(b.wobblePhase) * b.wobbleAmp;
      this.bubbleData[i * 4 + 0] = currentX * dpr;
      this.bubbleData[i * 4 + 1] = b.y * dpr;
      this.bubbleData[i * 4 + 2] = b.radius * dpr;
      this.bubbleData[i * 4 + 3] = b.type;
    }

    // 6. Pack Pop Sparks
    const popCount = Math.min(this.popParticles.length, MAX_POPS);
    for (let i = 0; i < popCount; i++) {
      const p = this.popParticles[i];
      this.popData[i * 4 + 0] = p.x * dpr;
      this.popData[i * 4 + 1] = p.y * dpr;
      this.popData[i * 4 + 2] = Math.max(0.0, p.alpha);
      this.popData[i * 4 + 3] = 1.0;
    }

    // 7. Mouse interpolation
    this.currentMouse.x += (this.targetMouse.x - this.currentMouse.x) * this.mouseEase;
    this.currentMouse.y += (this.targetMouse.y - this.currentMouse.y) * this.mouseEase;

    const elapsedTime = (now - this.startTime) / 1000.0;

    // 8. Draw Frame
    gl.useProgram(this.program);

    gl.uniform1f(u.uTime, elapsedTime);
    gl.uniform2f(u.uResolution, this.canvas.width, this.canvas.height);
    gl.uniform2f(u.uMouse, this.currentMouse.x, this.currentMouse.y);
    gl.uniform1f(u.uMouseRadius, this.mouseRadius);
    gl.uniform1f(u.uMouseStrength, this.mouseStrength);
    gl.uniform1f(u.uPixelSize, this.pixelSize * dpr);
    gl.uniform1f(u.uPixelGap, this.pixelGap * dpr);
    gl.uniform3fv(u.uColor1, this.color1);
    gl.uniform3fv(u.uColor2, this.color2);
    gl.uniform3fv(u.uBgColor, this.bgColor);

    gl.uniform4fv(u.uBubbles, this.bubbleData);
    gl.uniform1i(u.uBubbleCount, bubbleCount);

    gl.uniform4fv(u.uPopParticles, this.popData);
    gl.uniform1i(u.uPopCount, popCount);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.enableVertexAttribArray(this.positionLocation);
    gl.vertexAttribPointer(this.positionLocation, 2, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
}
