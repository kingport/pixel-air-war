// ============================================================
// 像素空战 - Pixel Air War
// ============================================================

// --- 配置 ---
const CONFIG = {
  CANVAS_WIDTH: 400,
  CANVAS_HEIGHT: 600,
  PIXEL_SCALE: 2,          // 像素缩放倍数，产生像素风格
  BOSS_INTERVAL: 90,       // Boss出现间隔（秒），可配置
  MAX_REVIVES: 3,
  STAR_COUNT: 60,
  PLAYER_SPEED: 5,
  PLAYER_FIRE_RATE: 8,     // 每秒射击次数
  SLOW_MOTION_DURATION: 2000, // 慢镜头持续时间（毫秒）
  SLOW_MOTION_FACTOR: 0.2,
};

// --- 全局状态 ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const W = CONFIG.CANVAS_WIDTH;
const H = CONFIG.CANVAS_HEIGHT;
canvas.width = W;
canvas.height = H;

const container = document.getElementById('gameContainer');
container.style.width = W + 'px';
container.style.height = H + 'px';

// UI Elements
const uiOverlay = document.getElementById('uiOverlay');
const startScreen = document.getElementById('startScreen');
const deathScreen = document.getElementById('deathScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const startBtn = document.getElementById('startBtn');
const reviveBtn = document.getElementById('reviveBtn');
const gameOverBtn = document.getElementById('gameOverBtn');
const restartBtn = document.getElementById('restartBtn');

// --- 像素绘制工具 ---
function drawPixelRect(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.floor(x), Math.floor(y), w, h);
}

function drawPixelSprite(x, y, sprite, scale = 2) {
  for (let row = 0; row < sprite.length; row++) {
    for (let col = 0; col < sprite[row].length; col++) {
      if (sprite[row][col]) {
        ctx.fillStyle = sprite[row][col];
        ctx.fillRect(
          Math.floor(x + col * scale),
          Math.floor(y + row * scale),
          scale, scale
        );
      }
    }
  }
}

// --- 像素字体 ---
function drawPixelText(text, x, y, color = '#fff', size = 2) {
  ctx.fillStyle = color;
  ctx.font = `${size * 6}px monospace`;
  ctx.textAlign = 'center';
  ctx.fillText(text, Math.floor(x), Math.floor(y));
}

function drawPixelTextLeft(text, x, y, color = '#fff', size = 2) {
  ctx.fillStyle = color;
  ctx.font = `${size * 6}px monospace`;
  ctx.textAlign = 'left';
  ctx.fillText(text, Math.floor(x), Math.floor(y));
}

// --- 精灵图定义（像素矩阵） ---
const C = {
  _: null,
  W: '#ffffff', B: '#2196f3', D: '#1565c0', R: '#f44336', O: '#ff9800',
  Y: '#ffd700', G: '#4caf50', DG: '#2e7d32', P: '#9c27b0', C: '#00e5ff',
  GR: '#666666', DGR: '#444444', LB: '#64b5f6', LG: '#81c784',
  DR: '#c62828', BK: '#111111', PK: '#ff80ab', V: '#7c4dff',
};

const SPRITES = {
  player: [
    [C._,C._,C._,C.C,C._,C._,C._],
    [C._,C._,C.C,C.C,C.C,C._,C._],
    [C._,C.C,C.B,C.C,C.B,C.C,C._],
    [C._,C.B,C.B,C.D,C.B,C.B,C._],
    [C.GR,C.B,C.D,C.D,C.D,C.B,C.GR],
    [C.GR,C.B,C.D,C.D,C.D,C.B,C.GR],
    [C._,C.B,C.B,C.B,C.B,C.B,C._],
    [C._,C._,C.B,C._,C.B,C._,C._],
  ],
  enemy1: [
    [C._,C._,C.R,C.R,C.R,C._,C._],
    [C._,C.R,C.DR,C.DR,C.DR,C.R,C._],
    [C.R,C.DR,C.Y,C.DR,C.Y,C.DR,C.R],
    [C.R,C.DR,C.DR,C.DR,C.DR,C.DR,C.R],
    [C._,C.R,C.DR,C.DR,C.DR,C.R,C._],
    [C._,C._,C.R,C._,C.R,C._,C._],
  ],
  enemy2: [
    [C._,C.P,C._,C._,C._,C.P,C._],
    [C.P,C.P,C.P,C.P,C.P,C.P,C.P],
    [C.P,C.V,C.Y,C.V,C.Y,C.V,C.P],
    [C._,C.P,C.V,C.V,C.V,C.P,C._],
    [C._,C._,C.P,C.P,C.P,C._,C._],
    [C._,C.P,C._,C._,C._,C.P,C._],
  ],
  enemy3: [
    [C._,C._,C.G,C.G,C.G,C._,C._],
    [C._,C.G,C.DG,C.DG,C.DG,C.G,C._],
    [C.G,C.DG,C.R,C.DG,C.R,C.DG,C.G],
    [C.G,C.G,C.DG,C.DG,C.DG,C.G,C.G],
    [C.G,C._,C.G,C.G,C.G,C._,C.G],
    [C._,C._,C.G,C._,C.G,C._,C._],
  ],
  enemy4: [
    [C._,C.O,C._,C._,C._,C.O,C._],
    [C.O,C.O,C.O,C.O,C.O,C.O,C.O],
    [C.O,C.Y,C.R,C.Y,C.R,C.Y,C.O],
    [C._,C.O,C.O,C.O,C.O,C.O,C._],
    [C._,C.O,C._,C.O,C._,C.O,C._],
    [C.O,C._,C._,C._,C._,C._,C.O],
  ],
  boss: [
    [C._,C._,C._,C._,C.DR,C.DR,C.DR,C.DR,C.DR,C.DR,C._,C._,C._,C._],
    [C._,C._,C.DR,C.DR,C.R,C.R,C.R,C.R,C.R,C.R,C.DR,C.DR,C._,C._],
    [C._,C.DR,C.R,C.R,C.R,C.R,C.R,C.R,C.R,C.R,C.R,C.R,C.DR,C._],
    [C.DR,C.R,C.R,C.Y,C.Y,C.R,C.R,C.R,C.R,C.Y,C.Y,C.R,C.R,C.DR],
    [C.DR,C.R,C.Y,C.W,C.Y,C.R,C.R,C.R,C.R,C.Y,C.W,C.Y,C.R,C.DR],
    [C.DR,C.R,C.R,C.Y,C.Y,C.R,C.DGR,C.DGR,C.R,C.Y,C.Y,C.R,C.R,C.DR],
    [C.GR,C.DR,C.R,C.R,C.R,C.DGR,C.BK,C.BK,C.DGR,C.R,C.R,C.R,C.DR,C.GR],
    [C.GR,C.DR,C.R,C.R,C.R,C.R,C.DGR,C.DGR,C.R,C.R,C.R,C.R,C.DR,C.GR],
    [C._,C.GR,C.DR,C.R,C.R,C.R,C.R,C.R,C.R,C.R,C.R,C.DR,C.GR,C._],
    [C._,C._,C.GR,C.DR,C.R,C.R,C.R,C.R,C.R,C.R,C.DR,C.GR,C._,C._],
    [C._,C.GR,C._,C.GR,C.DR,C.R,C.R,C.R,C.R,C.DR,C.GR,C._,C.GR,C._],
    [C.GR,C._,C._,C._,C.GR,C.DR,C.DR,C.DR,C.DR,C.GR,C._,C._,C._,C.GR],
  ],
};

// --- 粒子系统 ---
class Particle {
  constructor(x, y, color, vx, vy, life) {
    this.x = x; this.y = y;
    this.color = color;
    this.vx = vx; this.vy = vy;
    this.life = life;
    this.maxLife = life;
    this.size = Math.random() * 3 + 1;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.life -= dt;
    this.vy += 30 * dt; // gravity
  }

  draw() {
    const alpha = Math.max(0, this.life / this.maxLife);
    ctx.globalAlpha = alpha;
    drawPixelRect(this.x, this.y, this.size, this.size, this.color);
    ctx.globalAlpha = 1;
  }
}

class ParticleSystem {
  constructor() { this.particles = []; }

  emit(x, y, count, colors, spread = 100) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * spread;
      const color = colors[Math.floor(Math.random() * colors.length)];
      this.particles.push(new Particle(
        x, y, color,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        0.5 + Math.random() * 0.8
      ));
    }
  }

  update(dt) {
    this.particles = this.particles.filter(p => {
      p.update(dt);
      return p.life > 0;
    });
  }

  draw() {
    this.particles.forEach(p => p.draw());
  }
}

// --- 星空背景 ---
class StarField {
  constructor() {
    this.stars = [];
    for (let i = 0; i < CONFIG.STAR_COUNT; i++) {
      this.stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        speed: 20 + Math.random() * 60,
        size: Math.random() < 0.3 ? 2 : 1,
        brightness: 0.3 + Math.random() * 0.7,
      });
    }
  }

  update(dt) {
    this.stars.forEach(s => {
      s.y += s.speed * dt;
      if (s.y > H) { s.y = -2; s.x = Math.random() * W; }
    });
  }

  draw() {
    this.stars.forEach(s => {
      const c = Math.floor(s.brightness * 255);
      ctx.fillStyle = `rgb(${c},${c},${Math.min(255, c + 40)})`;
      ctx.fillRect(Math.floor(s.x), Math.floor(s.y), s.size, s.size);
    });
  }
}

// --- 子弹 ---
class Bullet {
  constructor(x, y, vy, w, h, color, damage = 1, isPlayer = true) {
    this.x = x; this.y = y;
    this.vy = vy; this.vx = 0;
    this.w = w; this.h = h;
    this.color = color;
    this.damage = damage;
    this.isPlayer = isPlayer;
    this.alive = true;
  }

  update(dt) {
    this.y += this.vy * dt;
    this.x += this.vx * dt;
    if (this.y < -10 || this.y > H + 10 || this.x < -10 || this.x > W + 10) this.alive = false;
  }

  draw() {
    drawPixelRect(this.x - this.w / 2, this.y - this.h / 2, this.w, this.h, this.color);
    // glow
    ctx.globalAlpha = 0.3;
    drawPixelRect(this.x - this.w / 2 - 1, this.y - this.h / 2 - 1, this.w + 2, this.h + 2, this.color);
    ctx.globalAlpha = 1;
  }

  getRect() {
    return { x: this.x - this.w / 2, y: this.y - this.h / 2, w: this.w, h: this.h };
  }
}

// --- 玩家 ---
class Player {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = W / 2;
    this.y = H - 80;
    this.w = 14; this.h = 16;
    this.alive = true;
    this.invincible = false;
    this.invincibleTimer = 0;
    this.fireTimer = 0;
    this.powerLevel = 1;
    this.sprite = SPRITES.player;
    this.spriteW = this.sprite[0].length * 2;
    this.spriteH = this.sprite.length * 2;
    this.thrustFrame = 0;
  }

  update(dt, targetX, targetY) {
    if (!this.alive) return;

    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 2) {
      const speed = Math.min(dist * 8, 400);
      this.x += (dx / dist) * speed * dt;
      this.y += (dy / dist) * speed * dt;
    }

    this.x = Math.max(this.spriteW / 2, Math.min(W - this.spriteW / 2, this.x));
    this.y = Math.max(this.spriteH / 2, Math.min(H - this.spriteH / 2, this.y));

    if (this.invincible) {
      this.invincibleTimer -= dt;
      if (this.invincibleTimer <= 0) this.invincible = false;
    }

    this.fireTimer -= dt;
    this.thrustFrame += dt * 10;
  }

  shoot() {
    if (!this.alive || this.fireTimer > 0) return [];
    this.fireTimer = 1 / CONFIG.PLAYER_FIRE_RATE;

    const bullets = [];
    if (this.powerLevel >= 3) {
      bullets.push(new Bullet(this.x, this.y - 10, -500, 3, 8, '#00e5ff', 1, true));
      bullets.push(new Bullet(this.x - 8, this.y - 5, -480, 3, 6, '#00e5ff', 1, true));
      bullets.push(new Bullet(this.x + 8, this.y - 5, -480, 3, 6, '#00e5ff', 1, true));
    } else if (this.powerLevel >= 2) {
      bullets.push(new Bullet(this.x - 5, this.y - 8, -500, 3, 8, '#00e5ff', 1, true));
      bullets.push(new Bullet(this.x + 5, this.y - 8, -500, 3, 8, '#00e5ff', 1, true));
    } else {
      bullets.push(new Bullet(this.x, this.y - 10, -500, 3, 8, '#00e5ff', 1, true));
    }
    return bullets;
  }

  draw() {
    if (!this.alive) return;
    if (this.invincible && Math.floor(this.invincibleTimer * 10) % 2 === 0) return;

    const sx = this.x - this.spriteW / 2;
    const sy = this.y - this.spriteH / 2;
    drawPixelSprite(sx, sy, this.sprite, 2);

    // thrust animation
    const thrustColors = ['#ff6600', '#ffaa00', '#ff4400', '#ffdd00'];
    const tSize = 2 + Math.sin(this.thrustFrame) * 1;
    const tColor = thrustColors[Math.floor(this.thrustFrame) % thrustColors.length];
    drawPixelRect(this.x - 2, this.y + this.spriteH / 2, 4, tSize * 2, tColor);
    ctx.globalAlpha = 0.5;
    drawPixelRect(this.x - 1, this.y + this.spriteH / 2 + tSize, 2, tSize, '#ffff00');
    ctx.globalAlpha = 1;
  }

  getRect() {
    return {
      x: this.x - this.spriteW / 2 + 3,
      y: this.y - this.spriteH / 2 + 2,
      w: this.spriteW - 6,
      h: this.spriteH - 4
    };
  }

  makeInvincible(duration = 3) {
    this.invincible = true;
    this.invincibleTimer = duration;
  }
}

// --- 敌机基类 ---
class Enemy {
  constructor(x, y, type) {
    this.x = x; this.y = y;
    this.type = type;
    this.alive = true;
    this.hitFlash = 0;

    const defs = {
      1: { hp: 2, speed: 80, score: 100, sprite: SPRITES.enemy1, fireRate: 1.5 },
      2: { hp: 3, speed: 60, score: 150, sprite: SPRITES.enemy2, fireRate: 1.2 },
      3: { hp: 4, speed: 100, score: 200, sprite: SPRITES.enemy3, fireRate: 2.0 },
      4: { hp: 5, speed: 50, score: 250, sprite: SPRITES.enemy4, fireRate: 0.8 },
    };

    const def = defs[type] || defs[1];
    this.hp = def.hp;
    this.maxHp = def.hp;
    this.speed = def.speed;
    this.score = def.score;
    this.sprite = def.sprite;
    this.fireRate = def.fireRate;
    this.fireTimer = Math.random() * 2;
    this.spriteW = this.sprite[0].length * 2;
    this.spriteH = this.sprite.length * 2;
    this.moveTimer = Math.random() * Math.PI * 2;
  }

  update(dt) {
    this.y += this.speed * dt;
    this.moveTimer += dt * 2;
    this.x += Math.sin(this.moveTimer) * 30 * dt;
    this.fireTimer -= dt;
    if (this.hitFlash > 0) this.hitFlash -= dt;

    if (this.y > H + 30) this.alive = false;
  }

  shoot(playerX, playerY) {
    if (this.fireTimer > 0) return [];
    this.fireTimer = this.fireRate + Math.random() * 0.5;

    const angle = Math.atan2(playerY - this.y, playerX - this.x);
    const speed = 200;
    const b = new Bullet(this.x, this.y + this.spriteH / 2, 0, 4, 4, '#ff4444', 1, false);
    b.vx = Math.cos(angle) * speed;
    b.vy = Math.sin(angle) * speed;
    return [b];
  }

  takeDamage(dmg) {
    this.hp -= dmg;
    this.hitFlash = 0.1;
    if (this.hp <= 0) { this.alive = false; return true; }
    return false;
  }

  draw() {
    if (!this.alive) return;
    const sx = this.x - this.spriteW / 2;
    const sy = this.y - this.spriteH / 2;

    if (this.hitFlash > 0) {
      ctx.globalAlpha = 0.7;
      drawPixelRect(sx - 1, sy - 1, this.spriteW + 2, this.spriteH + 2, '#ffffff');
      ctx.globalAlpha = 1;
    }

    drawPixelSprite(sx, sy, this.sprite, 2);
  }

  getRect() {
    return { x: this.x - this.spriteW / 2, y: this.y - this.spriteH / 2, w: this.spriteW, h: this.spriteH };
  }
}

// --- Boss ---
class Boss {
  constructor(level) {
    this.x = W / 2;
    this.y = -60;
    this.targetY = 60;
    this.alive = true;
    this.entering = true;
    this.level = level;
    this.hp = 80 + level * 40;
    this.maxHp = this.hp;
    this.score = 2000 + level * 500;
    this.sprite = SPRITES.boss;
    this.spriteW = this.sprite[0].length * 3;
    this.spriteH = this.sprite.length * 3;
    this.fireTimer = 0;
    this.patternTimer = 0;
    this.pattern = 0;
    this.hitFlash = 0;
    this.moveTimer = 0;
    this.shakeAmount = 0;
  }

  update(dt) {
    if (this.entering) {
      this.y += (this.targetY - this.y) * 2 * dt;
      if (Math.abs(this.y - this.targetY) < 1) {
        this.y = this.targetY;
        this.entering = false;
      }
      return;
    }

    this.moveTimer += dt;
    this.x = W / 2 + Math.sin(this.moveTimer * 0.8) * 100;
    this.y = this.targetY + Math.sin(this.moveTimer * 0.5) * 20;

    this.fireTimer -= dt;
    this.patternTimer += dt;
    if (this.patternTimer > 4) {
      this.patternTimer = 0;
      this.pattern = (this.pattern + 1) % 3;
    }

    if (this.hitFlash > 0) this.hitFlash -= dt;
    if (this.shakeAmount > 0) this.shakeAmount *= 0.95;
  }

  shoot() {
    if (this.entering || this.fireTimer > 0) return [];
    const bullets = [];

    if (this.pattern === 0) {
      this.fireTimer = 0.6;
      for (let i = -2; i <= 2; i++) {
        const b = new Bullet(this.x + i * 12, this.y + this.spriteH / 2, 250, 4, 4, '#ff4444', 1, false);
        b.vx = i * 30;
        bullets.push(b);
      }
    } else if (this.pattern === 1) {
      this.fireTimer = 0.15;
      const angle = this.patternTimer * 5;
      const b = new Bullet(this.x, this.y + this.spriteH / 2, 0, 5, 5, '#ff6600', 1, false);
      b.vx = Math.cos(angle) * 200;
      b.vy = Math.sin(angle) * 100 + 150;
      bullets.push(b);
    } else {
      this.fireTimer = 0.4;
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 / 8) * i + this.patternTimer;
        const b = new Bullet(this.x, this.y + this.spriteH / 2, 0, 4, 4, '#ff00aa', 1, false);
        b.vx = Math.cos(angle) * 150;
        b.vy = Math.sin(angle) * 150;
        bullets.push(b);
      }
    }

    return bullets;
  }

  takeDamage(dmg) {
    this.hp -= dmg;
    this.hitFlash = 0.08;
    this.shakeAmount = 3;
    if (this.hp <= 0) { this.alive = false; return true; }
    return false;
  }

  draw() {
    if (!this.alive) return;
    const shakeX = (Math.random() - 0.5) * this.shakeAmount;
    const shakeY = (Math.random() - 0.5) * this.shakeAmount;
    const sx = this.x - this.spriteW / 2 + shakeX;
    const sy = this.y - this.spriteH / 2 + shakeY;

    if (this.hitFlash > 0) {
      ctx.globalAlpha = 0.6;
      drawPixelRect(sx - 2, sy - 2, this.spriteW + 4, this.spriteH + 4, '#ffffff');
      ctx.globalAlpha = 1;
    }

    drawPixelSprite(sx, sy, this.sprite, 3);

    // HP Bar
    const barW = 120;
    const barH = 8;
    const barX = this.x - barW / 2;
    const barY = this.y - this.spriteH / 2 - 18;
    const hpRatio = this.hp / this.maxHp;

    drawPixelRect(barX - 1, barY - 1, barW + 2, barH + 2, '#333');
    drawPixelRect(barX, barY, barW, barH, '#111');

    let barColor;
    if (hpRatio > 0.5) barColor = '#4caf50';
    else if (hpRatio > 0.25) barColor = '#ff9800';
    else barColor = '#f44336';

    drawPixelRect(barX, barY, barW * hpRatio, barH, barColor);

    // Boss name
    drawPixelText(`BOSS Lv.${this.level}`, this.x, barY - 6, '#ff4444', 1.5);
  }

  getRect() {
    return {
      x: this.x - this.spriteW / 2 + 4,
      y: this.y - this.spriteH / 2 + 4,
      w: this.spriteW - 8,
      h: this.spriteH - 8
    };
  }
}

// --- 道具 ---
class PowerUp {
  constructor(x, y, type) {
    this.x = x; this.y = y;
    this.type = type; // 'power', 'heal', 'bomb'
    this.alive = true;
    this.timer = 0;
    this.speed = 60;
    this.size = 10;
  }

  update(dt) {
    this.y += this.speed * dt;
    this.timer += dt;
    if (this.y > H + 20) this.alive = false;
  }

  draw() {
    const pulse = Math.sin(this.timer * 6) * 2;
    const s = this.size + pulse;
    const colors = { power: '#00e5ff', heal: '#4caf50', bomb: '#ff9800' };
    const icons = { power: 'P', heal: '+', bomb: 'B' };

    ctx.globalAlpha = 0.3;
    drawPixelRect(this.x - s / 2 - 2, this.y - s / 2 - 2, s + 4, s + 4, colors[this.type]);
    ctx.globalAlpha = 1;
    drawPixelRect(this.x - s / 2, this.y - s / 2, s, s, colors[this.type]);
    drawPixelText(icons[this.type], this.x, this.y + 4, '#000', 1.2);
  }

  getRect() {
    return { x: this.x - this.size / 2, y: this.y - this.size / 2, w: this.size, h: this.size };
  }
}

// --- 碰撞检测 ---
function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

// --- 慢镜头画面效果 ---
class SlowMotionEffect {
  constructor() {
    this.active = false;
    this.timer = 0;
    this.duration = CONFIG.SLOW_MOTION_DURATION / 1000;
    this.centerX = 0;
    this.centerY = 0;
    this.flashAlpha = 0;
  }

  trigger(x, y) {
    this.active = true;
    this.timer = this.duration;
    this.centerX = x;
    this.centerY = y;
    this.flashAlpha = 1;
  }

  getTimeScale() {
    if (!this.active) return 1;
    const progress = 1 - this.timer / this.duration;
    if (progress < 0.3) return CONFIG.SLOW_MOTION_FACTOR;
    return CONFIG.SLOW_MOTION_FACTOR + (1 - CONFIG.SLOW_MOTION_FACTOR) * ((progress - 0.3) / 0.7);
  }

  update(realDt) {
    if (!this.active) return;
    this.timer -= realDt;
    this.flashAlpha *= 0.95;
    if (this.timer <= 0) this.active = false;
  }

  draw() {
    if (!this.active) return;

    if (this.flashAlpha > 0.01) {
      ctx.globalAlpha = this.flashAlpha * 0.6;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
    }

    const progress = 1 - this.timer / this.duration;
    if (progress < 0.5) {
      ctx.globalAlpha = 0.15 * (1 - progress * 2);
      const gradient = ctx.createRadialGradient(
        this.centerX, this.centerY, 0,
        this.centerX, this.centerY, 200
      );
      gradient.addColorStop(0, '#ff6600');
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
    }
  }
}

// --- 屏幕震动 ---
class ScreenShake {
  constructor() { this.amount = 0; this.timer = 0; }

  trigger(amount, duration) {
    this.amount = amount;
    this.timer = duration;
  }

  update(dt) {
    if (this.timer > 0) this.timer -= dt;
    else this.amount = 0;
  }

  apply() {
    if (this.amount > 0) {
      const dx = (Math.random() - 0.5) * this.amount * 2;
      const dy = (Math.random() - 0.5) * this.amount * 2;
      ctx.translate(dx, dy);
    }
  }
}

// ============================================================
// 游戏主类
// ============================================================
class Game {
  constructor() {
    this.state = 'menu'; // menu, playing, paused, dead, gameover
    this.score = 0;
    this.kills = 0;
    this.bossKills = 0;
    this.revivesLeft = CONFIG.MAX_REVIVES;
    this.bossTimer = CONFIG.BOSS_INTERVAL;
    this.bossLevel = 1;
    this.difficultyTimer = 0;
    this.difficulty = 1;

    this.player = new Player();
    this.enemies = [];
    this.bullets = [];
    this.powerUps = [];
    this.particles = new ParticleSystem();
    this.starField = new StarField();
    this.slowMotion = new SlowMotionEffect();
    this.screenShake = new ScreenShake();
    this.currentBoss = null;
    this.bombs = 1;

    this.enemySpawnTimer = 0;
    this.enemySpawnRate = 1.5;

    this.mouseX = W / 2;
    this.mouseY = H - 80;

    this.lastTime = 0;

    this.setupInputs();
  }

  setupInputs() {
    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = W / rect.width;
      const scaleY = H / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    };

    canvas.addEventListener('mousemove', (e) => {
      const p = getPos(e);
      this.mouseX = p.x;
      this.mouseY = p.y;
    });

    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const t = e.touches[0];
      const p = getPos(t);
      this.mouseX = p.x;
      this.mouseY = p.y - 50;
    }, { passive: false });

    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const t = e.touches[0];
      const p = getPos(t);
      this.mouseX = p.x;
      this.mouseY = p.y - 50;
    }, { passive: false });

    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && this.state === 'playing') {
        e.preventDefault();
        this.useBomb();
      }
    });
  }

  start() {
    this.state = 'playing';
    this.score = 0;
    this.kills = 0;
    this.bossKills = 0;
    this.revivesLeft = CONFIG.MAX_REVIVES;
    this.bossTimer = CONFIG.BOSS_INTERVAL;
    this.bossLevel = 1;
    this.difficultyTimer = 0;
    this.difficulty = 1;
    this.bombs = 1;

    this.player.reset();
    this.enemies = [];
    this.bullets = [];
    this.powerUps = [];
    this.currentBoss = null;
    this.particles = new ParticleSystem();

    this.enemySpawnTimer = 0;
    this.enemySpawnRate = 1.5;

    this.mouseX = W / 2;
    this.mouseY = H - 80;

    startScreen.classList.add('hidden');
    deathScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    uiOverlay.classList.remove('active');
  }

  revive() {
    if (this.revivesLeft <= 0) return;
    this.revivesLeft--;
    this.player.alive = true;
    this.player.makeInvincible(4);
    this.state = 'playing';

    // Clear nearby enemy bullets
    this.bullets = this.bullets.filter(b => {
      if (!b.isPlayer) {
        const dx = b.x - this.player.x;
        const dy = b.y - this.player.y;
        return Math.sqrt(dx * dx + dy * dy) > 120;
      }
      return true;
    });

    deathScreen.classList.add('hidden');
    uiOverlay.classList.remove('active');
  }

  gameOver() {
    this.state = 'gameover';
    document.getElementById('finalScore').textContent = this.score;
    document.getElementById('killCount').textContent = this.kills;
    document.getElementById('bossKillCount').textContent = this.bossKills;
    deathScreen.classList.add('hidden');
    gameOverScreen.classList.remove('hidden');
    uiOverlay.classList.add('active');
  }

  die() {
    this.player.alive = false;
    this.state = 'dead';
    this.particles.emit(this.player.x, this.player.y, 40,
      ['#00e5ff', '#2196f3', '#ffffff', '#ff9800']);
    this.screenShake.trigger(8, 0.5);

    document.getElementById('deathScore').textContent = this.score;
    document.getElementById('reviveCount').textContent =
      `剩余复活次数: ${this.revivesLeft}`;

    if (this.revivesLeft <= 0) {
      reviveBtn.style.display = 'none';
    } else {
      reviveBtn.style.display = '';
    }

    deathScreen.classList.remove('hidden');
    uiOverlay.classList.add('active');
  }

  useBomb() {
    if (this.bombs <= 0) return;
    this.bombs--;
    this.screenShake.trigger(6, 0.4);

    // Flash
    this.particles.emit(W / 2, H / 2, 80,
      ['#ffffff', '#ffff00', '#ff9800', '#ff4444']);

    // Damage all enemies
    this.enemies.forEach(e => {
      e.takeDamage(10);
      if (!e.alive) {
        this.score += e.score;
        this.kills++;
        this.particles.emit(e.x, e.y, 15, ['#ff4444', '#ff9800', '#ffff00']);
      }
    });
    this.enemies = this.enemies.filter(e => e.alive);

    if (this.currentBoss) {
      this.currentBoss.takeDamage(15);
    }

    // Clear enemy bullets
    this.bullets = this.bullets.filter(b => b.isPlayer);
  }

  spawnEnemy() {
    const type = Math.ceil(Math.random() * Math.min(4, Math.floor(this.difficulty) + 1));
    const x = 30 + Math.random() * (W - 60);
    this.enemies.push(new Enemy(x, -20, type));
  }

  spawnBoss() {
    if (this.currentBoss && this.currentBoss.alive) return;
    this.currentBoss = new Boss(this.bossLevel);
    this.bossLevel++;
  }

  spawnPowerUp(x, y) {
    const r = Math.random();
    let type;
    if (r < 0.4) type = 'power';
    else if (r < 0.7) type = 'heal';
    else type = 'bomb';
    this.powerUps.push(new PowerUp(x, y, type));
  }

  update(realDt) {
    this.slowMotion.update(realDt);
    const timeScale = this.slowMotion.getTimeScale();
    const dt = realDt * timeScale;

    this.starField.update(dt);
    this.particles.update(dt);
    this.screenShake.update(dt);

    if (this.state !== 'playing') return;

    // difficulty ramp
    this.difficultyTimer += dt;
    this.difficulty = 1 + this.difficultyTimer / 30;
    this.enemySpawnRate = Math.max(0.3, 1.5 - this.difficulty * 0.1);

    // boss timer
    this.bossTimer -= dt;
    if (this.bossTimer <= 0 && (!this.currentBoss || !this.currentBoss.alive)) {
      this.spawnBoss();
      this.bossTimer = CONFIG.BOSS_INTERVAL;
    }

    // spawn enemies
    this.enemySpawnTimer -= dt;
    if (this.enemySpawnTimer <= 0 && (!this.currentBoss || !this.currentBoss.entering)) {
      this.spawnEnemy();
      this.enemySpawnTimer = this.enemySpawnRate;
      if (this.currentBoss && this.currentBoss.alive) {
        this.enemySpawnTimer *= 2;
      }
    }

    // player
    this.player.update(dt, this.mouseX, this.mouseY);
    const newBullets = this.player.shoot();
    this.bullets.push(...newBullets);

    // enemies
    this.enemies.forEach(e => {
      e.update(dt);
      const eBullets = e.shoot(this.player.x, this.player.y);
      this.bullets.push(...eBullets);
    });
    this.enemies = this.enemies.filter(e => e.alive || e.y <= H + 30);

    // boss
    if (this.currentBoss && this.currentBoss.alive) {
      this.currentBoss.update(dt);
      const bossBullets = this.currentBoss.shoot();
      this.bullets.push(...bossBullets);
    }

    // bullets
    this.bullets.forEach(b => b.update(dt));
    this.bullets = this.bullets.filter(b => b.alive);

    // power ups
    this.powerUps.forEach(p => p.update(dt));
    this.powerUps = this.powerUps.filter(p => p.alive);

    // --- Collisions ---
    const playerRect = this.player.getRect();

    // Player bullets vs enemies
    this.bullets.forEach(b => {
      if (!b.isPlayer || !b.alive) return;
      const bRect = b.getRect();

      // vs enemies
      this.enemies.forEach(e => {
        if (!e.alive) return;
        if (rectsOverlap(bRect, e.getRect())) {
          b.alive = false;
          const killed = e.takeDamage(b.damage);
          this.particles.emit(b.x, b.y, 3, ['#ffffff', '#ffff00']);
          if (killed) {
            this.score += e.score;
            this.kills++;
            this.particles.emit(e.x, e.y, 20,
              ['#ff4444', '#ff9800', '#ffff00', '#ffffff']);
            this.screenShake.trigger(2, 0.15);
            if (Math.random() < 0.15) this.spawnPowerUp(e.x, e.y);
          }
        }
      });

      // vs boss
      if (this.currentBoss && this.currentBoss.alive && !this.currentBoss.entering) {
        if (rectsOverlap(bRect, this.currentBoss.getRect())) {
          b.alive = false;
          const killed = this.currentBoss.takeDamage(b.damage);
          this.particles.emit(b.x, b.y, 2, ['#ffffff', '#ff4444']);
          if (killed) {
            this.score += this.currentBoss.score;
            this.bossKills++;
            this.particles.emit(this.currentBoss.x, this.currentBoss.y, 80,
              ['#ff4444', '#ff9800', '#ffff00', '#ffffff', '#ff00aa']);
            this.slowMotion.trigger(this.currentBoss.x, this.currentBoss.y);
            this.screenShake.trigger(10, 1);
            this.bombs = Math.min(this.bombs + 1, 3);
            this.player.powerLevel = Math.min(this.player.powerLevel + 1, 3);
            this.currentBoss = null;
          }
        }
      }
    });

    // Enemy bullets vs player
    if (this.player.alive && !this.player.invincible) {
      this.bullets.forEach(b => {
        if (b.isPlayer || !b.alive) return;
        if (rectsOverlap(b.getRect(), playerRect)) {
          b.alive = false;
          this.die();
        }
      });

      // Enemy body vs player
      this.enemies.forEach(e => {
        if (!e.alive) return;
        if (rectsOverlap(e.getRect(), playerRect)) {
          e.alive = false;
          this.particles.emit(e.x, e.y, 15, ['#ff4444', '#ff9800']);
          this.die();
        }
      });
    }

    // Player vs powerups
    if (this.player.alive) {
      this.powerUps.forEach(p => {
        if (!p.alive) return;
        if (rectsOverlap(p.getRect(), playerRect)) {
          p.alive = false;
          if (p.type === 'power') {
            this.player.powerLevel = Math.min(this.player.powerLevel + 1, 3);
          } else if (p.type === 'heal') {
            this.player.makeInvincible(2);
          } else if (p.type === 'bomb') {
            this.bombs = Math.min(this.bombs + 1, 3);
          }
          this.particles.emit(p.x, p.y, 10, ['#ffffff', '#00e5ff', '#4caf50']);
        }
      });
    }

    this.enemies = this.enemies.filter(e => e.alive);
    this.powerUps = this.powerUps.filter(p => p.alive);
    this.bullets = this.bullets.filter(b => b.alive);
  }

  drawHUD() {
    // Score
    drawPixelTextLeft(`SCORE: ${this.score}`, 10, 22, '#ffd700', 1.8);

    // Bombs
    for (let i = 0; i < this.bombs; i++) {
      drawPixelRect(10 + i * 14, 30, 10, 10, '#ff9800');
      drawPixelText('B', 15 + i * 14, 40, '#000', 1);
    }

    // Revives
    drawPixelTextLeft(`❤ x${this.revivesLeft}`, W - 70, 22, '#ff4444', 1.5);

    // Power level
    const pwColors = ['#aaa', '#00e5ff', '#00ff88', '#ffd700'];
    drawPixelTextLeft(`PWR: ${'■'.repeat(this.player.powerLevel)}`, 10, 52, pwColors[this.player.powerLevel], 1.5);

    // Boss timer
    if (!this.currentBoss || !this.currentBoss.alive) {
      const remaining = Math.ceil(this.bossTimer);
      if (remaining <= 10) {
        drawPixelText(`BOSS IN ${remaining}s`, W / 2, H / 2 - 60,
          remaining <= 3 ? '#ff4444' : '#ff9800', 2);
      }
    }

    // Boss warning
    if (this.currentBoss && this.currentBoss.entering) {
      const flash = Math.sin(Date.now() / 100) > 0;
      if (flash) {
        drawPixelText('⚠ WARNING: BOSS ⚠', W / 2, H / 2 - 30, '#ff0000', 2.5);
      }
      ctx.globalAlpha = 0.15;
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
    }
  }

  draw() {
    // Clear
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    this.screenShake.apply();

    // Stars
    this.starField.draw();

    // Power ups
    this.powerUps.forEach(p => p.draw());

    // Enemies
    this.enemies.forEach(e => e.draw());

    // Boss
    if (this.currentBoss && this.currentBoss.alive) {
      this.currentBoss.draw();
    }

    // Bullets
    this.bullets.forEach(b => b.draw());

    // Player
    this.player.draw();

    // Particles
    this.particles.draw();

    // Slow motion effect
    this.slowMotion.draw();

    // HUD
    if (this.state === 'playing' || this.state === 'dead') {
      this.drawHUD();
    }

    ctx.restore();

    // Scanline effect for pixel feel
    ctx.fillStyle = 'rgba(0,0,0,0.03)';
    for (let y = 0; y < H; y += 3) {
      ctx.fillRect(0, y, W, 1);
    }
  }

  loop(timestamp) {
    const realDt = Math.min((timestamp - this.lastTime) / 1000, 0.05);
    this.lastTime = timestamp;

    this.update(realDt);
    this.draw();

    requestAnimationFrame((t) => this.loop(t));
  }

  run() {
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  }
}

// ============================================================
// 初始化
// ============================================================
const game = new Game();

startBtn.addEventListener('click', () => game.start());
reviveBtn.addEventListener('click', () => game.revive());
gameOverBtn.addEventListener('click', () => game.gameOver());
restartBtn.addEventListener('click', () => game.start());

game.run();
