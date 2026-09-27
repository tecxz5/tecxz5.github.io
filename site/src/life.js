/**
 * Conway's Game of Life
 * Pure WebGL GPU Cellular Automaton
 * Trae.ai pixel block grid aesthetic + Ping-Pong FBO
 */

const QUAD_VERTEX_SHADER = `
  attribute vec2 a_position;
  varying vec2 vUv;

  void main() {
    vUv = (a_position + 1.0) * 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

// 1. Simulation Shader (calculates Conway's Game of Life rules on FBO)
const SIM_FRAGMENT_SHADER = `
  precision highp float;
  varying vec2 vUv;

  uniform sampler2D u_texture;
  uniform vec2 u_texelSize;
  uniform vec2 u_mouse;
  uniform float u_mouseActive;
  uniform float u_time;

  float rand(vec2 co) {
    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    vec4 current = texture2D(u_texture, vUv);
    float self = current.r > 0.5 ? 1.0 : 0.0;

    // Toroidal 8-neighbor sample
    float count = 0.0;
    count += texture2D(u_texture, fract(vUv + vec2(-1.0, -1.0) * u_texelSize)).r > 0.5 ? 1.0 : 0.0;
    count += texture2D(u_texture, fract(vUv + vec2( 0.0, -1.0) * u_texelSize)).r > 0.5 ? 1.0 : 0.0;
    count += texture2D(u_texture, fract(vUv + vec2( 1.0, -1.0) * u_texelSize)).r > 0.5 ? 1.0 : 0.0;
    count += texture2D(u_texture, fract(vUv + vec2(-1.0,  0.0) * u_texelSize)).r > 0.5 ? 1.0 : 0.0;
    count += texture2D(u_texture, fract(vUv + vec2( 1.0,  0.0) * u_texelSize)).r > 0.5 ? 1.0 : 0.0;
    count += texture2D(u_texture, fract(vUv + vec2(-1.0,  1.0) * u_texelSize)).r > 0.5 ? 1.0 : 0.0;
    count += texture2D(u_texture, fract(vUv + vec2( 0.0,  1.0) * u_texelSize)).r > 0.5 ? 1.0 : 0.0;
    count += texture2D(u_texture, fract(vUv + vec2( 1.0,  1.0) * u_texelSize)).r > 0.5 ? 1.0 : 0.0;

    float nextState = 0.0;
    float isBirth = 0.0;

    if (self > 0.5) {
      if (count == 2.0 || count == 3.0) {
        nextState = 1.0;
      }
    } else {
      if (count == 3.0) {
        nextState = 1.0;
        isBirth = 1.0;
      }
    }

    // Brush input: seed life near cursor
    if (u_mouseActive > 0.5) {
      vec2 diff = (vUv - u_mouse) / u_texelSize;
      if (dot(diff, diff) < 8.0) {
        if (rand(vUv + u_time) > 0.3) {
          nextState = 1.0;
          isBirth = 1.0;
        }
      }
    }

    // Phosphor decay in G channel
    float prevG = current.g;
    float decay = nextState > 0.5 ? 1.0 : max(prevG - 0.065, 0.0);

    gl_FragColor = vec4(nextState, decay, isBirth, 1.0);
  }
`;

// 2. Display Shader (renders pixel grid blocks to screen)
const DISPLAY_FRAGMENT_SHADER = `
  precision highp float;
  varying vec2 vUv;

  uniform sampler2D u_stateTexture;
  uniform vec2 u_resolution;
  uniform vec2 u_gridSize;
  uniform float u_pixelSize;
  uniform float u_pixelGap;
  uniform vec3 u_colorLime;
  uniform vec3 u_colorWhite;
  uniform vec3 u_bgColor;

  void main() {
    vec2 pixelCoord = vUv * u_resolution;
    float totalSize = u_pixelSize + u_pixelGap;

    vec2 blockId = floor(pixelCoord / totalSize);
    vec2 blockPos = blockId * totalSize;
    vec2 posInBlock = pixelCoord - blockPos;

    // Check pixel block bounds vs grid size
    if (blockId.x >= u_gridSize.x || blockId.y >= u_gridSize.y) {
      gl_FragColor = vec4(u_bgColor, 1.0);
      return;
    }

    // Empty gap between pixel blocks
    if (posInBlock.x > u_pixelSize || posInBlock.y > u_pixelSize) {
      gl_FragColor = vec4(u_bgColor, 1.0);
      return;
    }

    // Sample state from cellular grid (flip Y for WebGL texture orientation)
    vec2 cellUv = (blockId + 0.5) / u_gridSize;
    vec4 state = texture2D(u_stateTexture, cellUv);

    float alive = state.r;
    float decay = state.g;
    float isBirth = state.b;

    vec3 finalColor = u_bgColor;

    if (alive > 0.5) {
      if (isBirth > 0.5) {
        finalColor = u_colorWhite;
      } else {
        finalColor = u_colorLime;
      }
    } else if (decay > 0.02) {
      finalColor = mix(u_bgColor, u_colorLime * 0.42, decay);
    } else {
      // Subtle background dot at center of empty pixel block
      vec2 dCenter = abs(posInBlock - vec2(u_pixelSize * 0.5));
      if (dCenter.x < 1.0 && dCenter.y < 1.0) {
        finalColor = vec3(0.035);
      }
    }

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

export class LifeEffect {
  constructor(canvas) {
    this.canvas = canvas;
    this.gl = null;
    this.width = 0;
    this.height = 0;

    this.pixelSize = 10.0;
    this.pixelGap = 2.0;
    this.cols = 0;
    this.rows = 0;

    this.fboA = null;
    this.fboB = null;
    this.textureA = null;
    this.textureB = null;
    this.currentFBO = 0; // 0: A is source, 1: B is source

    this.simProgram = null;
    this.displayProgram = null;
    this.quadBuffer = null;

    this.stepInterval = 75; // ~13.3 gens per sec
    this.lastStepTime = 0;
    this.lastGliderTime = 0;
    this.activePatternIndex = 0;

    this.mouse = {
      x: -1,
      y: -1,
      uvX: -1,
      uvY: -1,
      active: false,
      activeTimer: 0
    };

    this.initGL();
  }

  createShader(type, source) {
    const gl = this.gl;
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('LifeEffect shader compile error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  createProgram(vsSource, fsSource) {
    const gl = this.gl;
    const vs = this.createShader(gl.VERTEX_SHADER, vsSource);
    const fs = this.createShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return null;

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('LifeEffect program link error:', gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return null;
    }
    return program;
  }

  initGL() {
    if (!this.canvas) return;
    const gl = this.canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false,
      powerPreference: 'high-performance'
    }) || this.canvas.getContext('experimental-webgl');

    if (!gl) {
      console.warn('WebGL is not available for LifeEffect');
      return;
    }
    this.gl = gl;

    // Fullscreen quad buffer
    this.quadBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
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

    // Compile programs
    this.simProgram = this.createProgram(QUAD_VERTEX_SHADER, SIM_FRAGMENT_SHADER);
    this.displayProgram = this.createProgram(QUAD_VERTEX_SHADER, DISPLAY_FRAGMENT_SHADER);
  }

  createFBO(width, height) {
    const gl = this.gl;
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    // Initial state data: seed lively colonies across the grid
    const size = width * height * 4;
    const data = new Uint8Array(size);
    for (let i = 0; i < size; i += 4) {
      const isAlive = Math.random() < 0.16 ? 255 : 0;
      data[i] = isAlive;     // R: alive
      data[i + 1] = isAlive; // G: decay
      data[i + 2] = 0;       // B: isBirth
      data[i + 3] = 255;     // A
    }

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);

    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, null);

    return { fbo, texture, data };
  }

  resize(width, height) {
    if (!this.gl) return;
    this.width = Math.floor(width);
    this.height = Math.floor(height);

    this.pixelSize = this.width < 720 ? 8.0 : 10.0;
    this.pixelGap = 2.0;
    const totalSize = this.pixelSize + this.pixelGap;

    this.cols = Math.max(1, Math.ceil(this.width / totalSize));
    this.rows = Math.max(1, Math.ceil(this.height / totalSize));

    this.canvas.width = this.width;
    this.canvas.height = this.height;

    const gl = this.gl;
    if (this.fboA) gl.deleteFramebuffer(this.fboA);
    if (this.fboB) gl.deleteFramebuffer(this.fboB);
    if (this.textureA) gl.deleteTexture(this.textureA);
    if (this.textureB) gl.deleteTexture(this.textureB);

    const a = this.createFBO(this.cols, this.rows);
    const b = this.createFBO(this.cols, this.rows);

    this.fboA = a.fbo;
    this.textureA = a.texture;
    this.fboB = b.fbo;
    this.textureB = b.texture;
    this.currentFBO = 0;

    // Seed some initial gliders in top half flying downwards
    this.stampGlider(Math.floor(this.cols * 0.2), Math.floor(this.rows * 0.75), 1, -1);
    this.stampGlider(Math.floor(this.cols * 0.75), Math.floor(this.rows * 0.7), -1, -1);
    this.stampPulsar(Math.floor(this.cols * 0.5), Math.floor(this.rows * 0.65));
  }

  stampPixels(startX, startY, pattern) {
    if (!this.gl || !this.textureA || !this.textureB) return;
    const gl = this.gl;
    const pHeight = pattern.length;
    const pWidth = pattern[0].length;

    const pData = new Uint8Array(pWidth * pHeight * 4);
    for (let r = 0; r < pHeight; r++) {
      for (let c = 0; c < pWidth; c++) {
        const idx = (r * pWidth + c) * 4;
        const val = pattern[r][c] ? 255 : 0;
        pData[idx] = val;
        pData[idx + 1] = val;
        pData[idx + 2] = val;
        pData[idx + 3] = 255;
      }
    }

    const currentTexture = this.currentFBO === 0 ? this.textureA : this.textureB;
    gl.bindTexture(gl.TEXTURE_2D, currentTexture);

    const safeX = Math.max(0, Math.min(this.cols - pWidth, startX));
    const safeY = Math.max(0, Math.min(this.rows - pHeight, startY));

    gl.texSubImage2D(
      gl.TEXTURE_2D,
      0,
      safeX,
      safeY,
      pWidth,
      pHeight,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      pData
    );
    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  stampGlider(cx, cy, dirX = 1, dirY = 1) {
    let pattern = [
      [0, 1, 0],
      [0, 0, 1],
      [1, 1, 1]
    ];
    if (dirX < 0) pattern = pattern.map(row => row.slice().reverse());
    if (dirY < 0) pattern = pattern.slice().reverse();
    this.stampPixels(cx, cy, pattern);
  }

  stampPulsar(cx, cy) {
    const pattern = [
      [0,0,1,1,1,0,0,0,1,1,1,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0],
      [1,0,0,0,0,1,0,1,0,0,0,0,1],
      [1,0,0,0,0,1,0,1,0,0,0,0,1],
      [1,0,0,0,0,1,0,1,0,0,0,0,1],
      [0,0,1,1,1,0,0,0,1,1,1,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,1,1,1,0,0,0,1,1,1,0,0],
      [1,0,0,0,0,1,0,1,0,0,0,0,1],
      [1,0,0,0,0,1,0,1,0,0,0,0,1],
      [1,0,0,0,0,1,0,1,0,0,0,0,1],
      [0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,1,1,1,0,0,0,1,1,1,0,0]
    ];
    this.stampPixels(cx - 6, cy - 6, pattern);
  }

  stampLWSS(cx, cy) {
    const pattern = [
      [0, 1, 0, 0, 1],
      [1, 0, 0, 0, 0],
      [1, 0, 0, 0, 1],
      [1, 1, 1, 1, 0]
    ];
    this.stampPixels(cx - 2, cy - 2, pattern);
  }

  updateAndDraw(now) {
    if (!this.gl || !this.fboA || !this.fboB) return;
    const gl = this.gl;

    // Check if mouse activity has expired
    if (this.mouse.active && now - this.mouse.activeTimer > 160) {
      this.mouse.active = false;
    }

    // Autonomous glider injection
    if (now - this.lastGliderTime > 6000) {
      this.lastGliderTime = now;
      const startX = Math.floor(Math.random() * (this.cols - 10));
      const startY = Math.floor(Math.random() * (this.rows * 0.3));
      this.stampGlider(startX, startY, Math.random() < 0.5 ? 1 : -1, 1);
    }

    // Step simulation on interval
    if (now - this.lastStepTime > this.stepInterval) {
      this.stepSimulation(now);
      this.lastStepTime = now;
    }

    // Render final display to screen canvas
    this.renderDisplay();
  }

  stepSimulation(now) {
    const gl = this.gl;
    const srcTexture = this.currentFBO === 0 ? this.textureA : this.textureB;
    const destFBO = this.currentFBO === 0 ? this.fboB : this.fboA;

    gl.bindFramebuffer(gl.FRAMEBUFFER, destFBO);
    gl.viewport(0, 0, this.cols, this.rows);

    gl.useProgram(this.simProgram);

    // Uniforms
    const uTexture = gl.getUniformLocation(this.simProgram, 'u_texture');
    const uTexelSize = gl.getUniformLocation(this.simProgram, 'u_texelSize');
    const uMouse = gl.getUniformLocation(this.simProgram, 'u_mouse');
    const uMouseActive = gl.getUniformLocation(this.simProgram, 'u_mouseActive');
    const uTime = gl.getUniformLocation(this.simProgram, 'u_time');

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, srcTexture);
    gl.uniform1i(uTexture, 0);

    gl.uniform2f(uTexelSize, 1.0 / this.cols, 1.0 / this.rows);
    gl.uniform2f(uMouse, this.mouse.uvX, 1.0 - this.mouse.uvY);
    gl.uniform1f(uMouseActive, this.mouse.active ? 1.0 : 0.0);
    gl.uniform1f(uTime, now * 0.001);

    // Draw quad
    const aPos = gl.getAttribLocation(this.simProgram, 'a_position');
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    // Swap FBO
    this.currentFBO = 1 - this.currentFBO;

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  renderDisplay() {
    const gl = this.gl;
    const currentTexture = this.currentFBO === 0 ? this.textureA : this.textureB;

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.width, this.height);

    gl.useProgram(this.displayProgram);

    const uStateTexture = gl.getUniformLocation(this.displayProgram, 'u_stateTexture');
    const uResolution = gl.getUniformLocation(this.displayProgram, 'u_resolution');
    const uGridSize = gl.getUniformLocation(this.displayProgram, 'u_gridSize');
    const uPixelSize = gl.getUniformLocation(this.displayProgram, 'u_pixelSize');
    const uPixelGap = gl.getUniformLocation(this.displayProgram, 'u_pixelGap');
    const uColorLime = gl.getUniformLocation(this.displayProgram, 'u_colorLime');
    const uColorWhite = gl.getUniformLocation(this.displayProgram, 'u_colorWhite');
    const uBgColor = gl.getUniformLocation(this.displayProgram, 'u_bgColor');

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, currentTexture);
    gl.uniform1i(uStateTexture, 0);

    gl.uniform2f(uResolution, this.width, this.height);
    gl.uniform2f(uGridSize, this.cols, this.rows);
    gl.uniform1f(uPixelSize, this.pixelSize);
    gl.uniform1f(uPixelGap, this.pixelGap);
    gl.uniform3f(uColorLime, 0.808, 0.859, 0.102); // #cedb1a
    gl.uniform3f(uColorWhite, 1.0, 1.0, 1.0);       // #ffffff
    gl.uniform3f(uBgColor, 0.0, 0.0, 0.0);          // #000000

    const aPos = gl.getAttribLocation(this.displayProgram, 'a_position');
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  onPointerMove(clientX, clientY) {
    if (this.width === 0 || this.height === 0) return;
    this.mouse.x = clientX;
    this.mouse.y = clientY;
    this.mouse.uvX = clientX / this.width;
    this.mouse.uvY = clientY / this.height;
    this.mouse.active = true;
    this.mouse.activeTimer = performance.now();
  }

  onPointerDown(clientX, clientY) {
    if (this.cols === 0 || this.rows === 0) return;
    const totalSize = this.pixelSize + this.pixelGap;
    const cx = Math.floor(clientX / totalSize);
    const cy = Math.floor((this.height - clientY) / totalSize);

    const patterns = ['glider', 'pulsar', 'lwss'];
    const p = patterns[this.activePatternIndex % patterns.length];
    this.activePatternIndex++;

    if (p === 'glider') {
      this.stampGlider(cx, cy, Math.random() < 0.5 ? 1 : -1, 1);
    } else if (p === 'pulsar') {
      this.stampPulsar(cx, cy);
    } else {
      this.stampLWSS(cx, cy);
    }
  }
}
