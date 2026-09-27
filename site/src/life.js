/**
 * Conway's Game of Life
 * Cyberpunk pixel cellular automaton background effect
 */

export class LifeEffect {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas?.getContext('2d', { alpha: false });
    this.width = 0;
    this.height = 0;

    this.cellSize = 10;
    this.cellGap = 2;
    this.cols = 0;
    this.rows = 0;

    this.grid = null;
    this.nextGrid = null;
    this.ageGrid = null;
    this.birthGrid = null;

    this.stepInterval = 75; // ~13 gens per second
    this.lastStepTime = 0;
    this.lastGliderTime = 0;
    this.activePatternIndex = 0;

    this.mouse = { x: -1, y: -1, isDown: false, lastSpawnX: -1, lastSpawnY: -1 };
  }

  resize(width, height) {
    if (!this.canvas || !this.ctx) return;
    this.width = Math.floor(width);
    this.height = Math.floor(height);

    // Responsive cell size
    this.cellSize = this.width < 720 ? 8 : 10;
    this.cellGap = 2;

    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.cols = Math.ceil(this.width / this.cellSize);
    this.rows = Math.ceil(this.height / this.cellSize);

    const totalCells = this.cols * this.rows;
    this.grid = new Uint8Array(totalCells);
    this.nextGrid = new Uint8Array(totalCells);
    this.ageGrid = new Float32Array(totalCells);
    this.birthGrid = new Uint8Array(totalCells);

    this.seedInitialLife();
  }

  seedInitialLife() {
    if (!this.grid) return;

    // Sparse, organic cyber clusters
    for (let i = 0; i < this.grid.length; i++) {
      if (Math.random() < 0.12) {
        this.grid[i] = 1;
        this.ageGrid[i] = 1.0;
      } else {
        this.grid[i] = 0;
        this.ageGrid[i] = 0;
      }
    }

    // Spawn a few classic gliders and pulsars in the upper half
    this.spawnGlider(Math.floor(this.cols * 0.2), Math.floor(this.rows * 0.15), 1, 1);
    this.spawnGlider(Math.floor(this.cols * 0.7), Math.floor(this.rows * 0.25), -1, 1);
    this.spawnPulsar(Math.floor(this.cols * 0.5), Math.floor(this.rows * 0.3));
  }

  spawnGlider(cx, cy, dirX = 1, dirY = 1) {
    let pattern = [
      [0, 1, 0],
      [0, 0, 1],
      [1, 1, 1]
    ];

    if (dirX < 0) {
      pattern = pattern.map(row => row.slice().reverse());
    }
    if (dirY < 0) {
      pattern = pattern.slice().reverse();
    }

    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const x = (cx + c + this.cols) % this.cols;
        const y = (cy + r + this.rows) % this.rows;
        const idx = y * this.cols + x;
        this.grid[idx] = pattern[r][c];
        if (pattern[r][c]) {
          this.ageGrid[idx] = 1.0;
          this.birthGrid[idx] = 1;
        }
      }
    }
  }

  spawnPulsar(cx, cy) {
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

    for (let r = 0; r < pattern.length; r++) {
      for (let c = 0; c < pattern[r].length; c++) {
        if (!pattern[r][c]) continue;
        const x = (cx - 6 + c + this.cols) % this.cols;
        const y = (cy - 6 + r + this.rows) % this.rows;
        const idx = y * this.cols + x;
        this.grid[idx] = 1;
        this.ageGrid[idx] = 1.0;
      }
    }
  }

  spawnLWSS(cx, cy) {
    const pattern = [
      [0, 1, 0, 0, 1],
      [1, 0, 0, 0, 0],
      [1, 0, 0, 0, 1],
      [1, 1, 1, 1, 0]
    ];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 5; c++) {
        const x = (cx + c + this.cols) % this.cols;
        const y = (cy + r + this.rows) % this.rows;
        const idx = y * this.cols + x;
        this.grid[idx] = pattern[r][c];
        if (pattern[r][c]) {
          this.ageGrid[idx] = 1.0;
          this.birthGrid[idx] = 1;
        }
      }
    }
  }

  stepSimulation() {
    const cols = this.cols;
    const rows = this.rows;
    const grid = this.grid;
    const nextGrid = this.nextGrid;
    const birthGrid = this.birthGrid;
    let liveCount = 0;

    for (let y = 0; y < rows; y++) {
      const yCols = y * cols;
      const upYCols = ((y - 1 + rows) % rows) * cols;
      const downYCols = ((y + 1) % rows) * cols;

      for (let x = 0; x < cols; x++) {
        const leftX = (x - 1 + cols) % cols;
        const rightX = (x + 1) % cols;

        const neighbors =
          grid[upYCols + leftX] +
          grid[upYCols + x] +
          grid[upYCols + rightX] +
          grid[yCols + leftX] +
          grid[yCols + rightX] +
          grid[downYCols + leftX] +
          grid[downYCols + x] +
          grid[downYCols + rightX];

        const idx = yCols + x;
        const isAlive = grid[idx];

        if (isAlive) {
          if (neighbors === 2 || neighbors === 3) {
            nextGrid[idx] = 1;
            birthGrid[idx] = 0;
            liveCount++;
          } else {
            nextGrid[idx] = 0;
            birthGrid[idx] = 0;
          }
        } else {
          if (neighbors === 3) {
            nextGrid[idx] = 1;
            birthGrid[idx] = 1; // newborn
            liveCount++;
          } else {
            nextGrid[idx] = 0;
            birthGrid[idx] = 0;
          }
        }
      }
    }

    // Swap buffers
    const temp = this.grid;
    this.grid = this.nextGrid;
    this.nextGrid = temp;

    // Update phosphor age decay
    const ageGrid = this.ageGrid;
    const total = cols * rows;
    for (let i = 0; i < total; i++) {
      if (this.grid[i]) {
        ageGrid[i] = Math.min(1.0, ageGrid[i] + 0.35);
      } else {
        ageGrid[i] = Math.max(0, ageGrid[i] - 0.06);
      }
    }

    // Auto-revive if population drops too low
    if (liveCount < (total * 0.015)) {
      this.spawnGlider(Math.floor(Math.random() * cols), Math.floor(Math.random() * (rows * 0.4)));
    }
  }

  updateAndDraw(now) {
    if (!this.ctx || this.width === 0 || this.height === 0) return;

    if (now - this.lastStepTime > this.stepInterval) {
      this.stepSimulation();
      this.lastStepTime = now;
    }

    // Autonomous glider flights from edges
    if (now - this.lastGliderTime > 6000) {
      this.lastGliderTime = now;
      const startX = Math.floor(Math.random() * this.cols * 0.8);
      const startY = Math.floor(Math.random() * this.rows * 0.3);
      this.spawnGlider(startX, startY, Math.random() < 0.5 ? 1 : -1, 1);
    }

    const ctx = this.ctx;
    const cols = this.cols;
    const rows = this.rows;
    const size = this.cellSize;
    const innerSize = size - this.cellGap;
    const grid = this.grid;
    const ageGrid = this.ageGrid;
    const birthGrid = this.birthGrid;

    // 1. Deep black clear
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, this.width, this.height);

    // 2. Subtle grid matrix dots
    ctx.fillStyle = 'rgba(255, 255, 255, 0.035)';
    for (let y = 0; y < rows; y += 2) {
      for (let x = 0; x < cols; x += 2) {
        ctx.fillRect(x * size, y * size, 1, 1);
      }
    }

    // 3. Render cells with glow & phosphor trail
    for (let y = 0; y < rows; y++) {
      const yCols = y * cols;
      const py = y * size;

      for (let x = 0; x < cols; x++) {
        const idx = yCols + x;
        const alpha = ageGrid[idx];

        if (alpha > 0.01) {
          const px = x * size;
          const isAlive = grid[idx];

          if (isAlive) {
            if (birthGrid[idx]) {
              // Newborn flash (whitish lime)
              ctx.fillStyle = '#ffffff';
            } else {
              // Mature cell: neon lime #cedb1a
              ctx.fillStyle = `rgba(206, 219, 26, ${0.45 + alpha * 0.55})`;
            }
          } else {
            // Phosphor fade trail
            ctx.fillStyle = `rgba(130, 145, 15, ${alpha * 0.35})`;
          }

          ctx.fillRect(px, py, innerSize, innerSize);
        }
      }
    }
  }

  onPointerMove(clientX, clientY) {
    if (!this.grid) return;
    const cx = Math.floor(clientX / this.cellSize);
    const cy = Math.floor(clientY / this.cellSize);

    if (cx === this.mouse.lastSpawnX && cy === this.mouse.lastSpawnY) return;
    this.mouse.lastSpawnX = cx;
    this.mouse.lastSpawnY = cy;

    // Seed living cells in a 3x3 brush around cursor
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (Math.random() < 0.65) {
          const nx = (cx + dx + this.cols) % this.cols;
          const ny = (cy + dy + this.rows) % this.rows;
          if (nx >= 0 && nx < this.cols && ny >= 0 && ny < this.rows) {
            const idx = ny * this.cols + nx;
            this.grid[idx] = 1;
            this.ageGrid[idx] = 1.0;
            this.birthGrid[idx] = 1;
          }
        }
      }
    }
  }

  onPointerDown(clientX, clientY) {
    if (!this.grid) return;
    const cx = Math.floor(clientX / this.cellSize);
    const cy = Math.floor(clientY / this.cellSize);

    // Cycle through fun patterns on clicks
    const patterns = ['glider', 'pulsar', 'lwss'];
    const pattern = patterns[this.activePatternIndex % patterns.length];
    this.activePatternIndex++;

    if (pattern === 'glider') {
      this.spawnGlider(cx, cy, Math.random() < 0.5 ? 1 : -1, 1);
    } else if (pattern === 'pulsar') {
      this.spawnPulsar(cx, cy);
    } else {
      this.spawnLWSS(cx, cy);
    }
  }
}
