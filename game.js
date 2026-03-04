// ============================================================
// 像素空战 - Pixel Air War (竖版闯关射击)
// ============================================================

// --- 核心配置 ---
const CONFIG = {
  CANVAS_WIDTH: 400,
  CANVAS_HEIGHT: 700,
  MAX_REVIVES: 3,
  STAR_COUNT: 60,
  PLAYER_BASE_SPEED: 400,
  PLAYER_BASE_FIRE_RATE: 6,
  PLAYER_BASE_HP: 100,
  PLAYER_BASE_ATK: 10,
  PLAYER_BASE_CRIT: 0.05,
  SKILL_COOLDOWN: 15,
  SHIELD_DURATION: 20,
  SPEED_BOOST_DURATION: 5,
  LEVEL_INTRO_TIME: 2.5,
};

// --- 关卡定义 ---
const LEVELS = [
  {
    id: 1, name: '空域试炼', subtitle: '教学关', theme: 'sky',
    bgColor1: '#1a3a5c', bgColor2: '#0a1a2e',
    waves: 5, enemyTypes: [1, 2], baseSpawnRate: 2.0,
    hazard: null,
    bossName: '双翼战机', bossHp: 200, bossScore: 2000,
    baseGold: 300,
  },
  {
    id: 2, name: '熔岩战区', subtitle: '火山地带', theme: 'lava',
    bgColor1: '#3d1008', bgColor2: '#1a0800',
    waves: 7, enemyTypes: [2, 3, 5], baseSpawnRate: 1.6,
    hazard: 'lava',
    bossName: '熔岩巨虎机甲', bossHp: 350, bossScore: 3000,
    baseGold: 500,
  },
  {
    id: 3, name: '沙漠围剿', subtitle: '沙尘暴', theme: 'desert',
    bgColor1: '#4a3520', bgColor2: '#2a1a0a',
    waves: 8, enemyTypes: [3, 4, 6], baseSpawnRate: 1.3,
    hazard: 'sandstorm',
    bossName: '沙暴指挥舰', bossHp: 500, bossScore: 4000,
    baseGold: 650,
  },
  {
    id: 4, name: '外星母舰', subtitle: '宇宙空间', theme: 'space',
    bgColor1: '#0a0020', bgColor2: '#05000a',
    waves: 10, enemyTypes: [4, 5, 6, 7], baseSpawnRate: 1.0,
    hazard: 'laser',
    bossName: '外星核心母舰', bossHp: 800, bossScore: 6000,
    baseGold: 800,
  },
];

// --- 难度倍率 ---
const DIFFICULTY = [
  { name: '普通', hpMult: 1.0, atkMult: 1.0, spdMult: 1.0, goldMult: 1.0, extraPattern: false },
  { name: '困难', hpMult: 1.5, atkMult: 1.3, spdMult: 1.2, goldMult: 1.5, extraPattern: true },
  { name: '地狱', hpMult: 2.5, atkMult: 1.8, spdMult: 1.5, goldMult: 2.0, extraPattern: true },
];

// --- 升级定义 ---
const UPGRADES = {
  atk:     { name: '攻击力', icon: '🔥', desc: '子弹伤害增加', maxLevel: 20, baseCost: 100, costGrowth: 1.4, perLevel: 3 },
  hp:      { name: '生命值', icon: '❤️', desc: 'HP上限增加',   maxLevel: 20, baseCost: 80,  costGrowth: 1.35, perLevel: 10 },
  crit:    { name: '暴击率', icon: '💥', desc: '概率双倍伤害', maxLevel: 15, baseCost: 150, costGrowth: 1.5, perLevel: 0.03 },
  speed:   { name: '攻速',   icon: '⚡', desc: '提高射击频率', maxLevel: 15, baseCost: 120, costGrowth: 1.45, perLevel: 0.4 },
  cooldown:{ name: '技能CD', icon: '🔄', desc: '缩短技能冷却', maxLevel: 10, baseCost: 200, costGrowth: 1.6, perLevel: 0.8 },
};

// --- 敌机定义 ---
const ENEMY_DEFS = {
  1: { name: '小型无人机',  hp: 15, speed: 80,  score: 100, fireRate: 2.5, movePattern: 'straight', color: '#f44336', bulletColor: '#ff6666' },
  2: { name: '巡逻战机',    hp: 25, speed: 60,  score: 150, fireRate: 1.8, movePattern: 'zigzag',   color: '#9c27b0', bulletColor: '#cc66ff' },
  3: { name: '重装轰炸机',  hp: 60, speed: 40,  score: 250, fireRate: 2.5, movePattern: 'slow',     color: '#4caf50', bulletColor: '#88ff88' },
  4: { name: '自爆机',      hp: 10, speed: 150, score: 180, fireRate: 99,  movePattern: 'chase',    color: '#ff9800', bulletColor: '#ffcc00' },
  5: { name: '隐形刺客机',  hp: 20, speed: 90,  score: 200, fireRate: 1.2, movePattern: 'stealth',  color: '#666666', bulletColor: '#aaaaaa' },
  6: { name: '沙漠坦克',    hp: 80, speed: 30,  score: 300, fireRate: 1.5, movePattern: 'slow',     color: '#8d6e63', bulletColor: '#ffaa66' },
  7: { name: 'UFO战机',     hp: 35, speed: 70,  score: 350, fireRate: 0.8, movePattern: 'orbit',    color: '#7c4dff', bulletColor: '#aa88ff' },
};

// ============================================================
// 全局初始化
// ============================================================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const W = CONFIG.CANVAS_WIDTH;
const H = CONFIG.CANVAS_HEIGHT;
canvas.width = W;
canvas.height = H;

const container = document.getElementById('gameContainer');
container.style.width = W + 'px';
container.style.height = H + 'px';

// UI 元素
const uiOverlay = document.getElementById('uiOverlay');
const screens = {
  menu: document.getElementById('menuScreen'),
  levelSelect: document.getElementById('levelSelectScreen'),
  difficulty: document.getElementById('difficultyScreen'),
  upgrade: document.getElementById('upgradeScreen'),
  levelIntro: document.getElementById('levelIntroScreen'),
  death: document.getElementById('deathScreen'),
  levelComplete: document.getElementById('levelCompleteScreen'),
  gameOver: document.getElementById('gameOverScreen'),
};
const touchControls = document.getElementById('touchControls');

// ============================================================
// 存档系统
// ============================================================
class SaveSystem {
  static KEY = 'pixel_air_war_save';

  static getDefault() {
    return {
      gold: 0,
      unlockedLevel: 1,
      upgrades: { atk: 0, hp: 0, crit: 0, speed: 0, cooldown: 0 },
      bestScores: {},
      bestRatings: {},
    };
  }

  static load() {
    try {
      const raw = localStorage.getItem(SaveSystem.KEY);
      if (raw) {
        const data = JSON.parse(raw);
        const def = SaveSystem.getDefault();
        return { ...def, ...data, upgrades: { ...def.upgrades, ...(data.upgrades || {}) } };
      }
    } catch (e) { /* ignore */ }
    return SaveSystem.getDefault();
  }

  static save(data) {
    try { localStorage.setItem(SaveSystem.KEY, JSON.stringify(data)); } catch (e) { /* ignore */ }
  }
}

// ============================================================
// 像素绘制工具
// ============================================================
function drawPixelRect(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.floor(x), Math.floor(y), w, h);
}

function drawPixelSprite(x, y, sprite, scale = 2) {
  for (let row = 0; row < sprite.length; row++) {
    for (let col = 0; col < sprite[row].length; col++) {
      if (sprite[row][col]) {
        ctx.fillStyle = sprite[row][col];
        ctx.fillRect(Math.floor(x + col * scale), Math.floor(y + row * scale), scale, scale);
      }
    }
  }
}

function drawPixelText(text, x, y, color = '#fff', size = 2) {
  ctx.fillStyle = color;
  ctx.font = `bold ${size * 6}px monospace`;
  ctx.textAlign = 'center';
  ctx.fillText(text, Math.floor(x), Math.floor(y));
}

function drawPixelTextLeft(text, x, y, color = '#fff', size = 2) {
  ctx.fillStyle = color;
  ctx.font = `bold ${size * 6}px monospace`;
  ctx.textAlign = 'left';
  ctx.fillText(text, Math.floor(x), Math.floor(y));
}

function drawBar(x, y, w, h, ratio, fgColor, bgColor = '#111', borderColor = '#333') {
  drawPixelRect(x - 1, y - 1, w + 2, h + 2, borderColor);
  drawPixelRect(x, y, w, h, bgColor);
  if (ratio > 0) drawPixelRect(x, y, Math.max(1, w * Math.min(1, ratio)), h, fgColor);
}

// ============================================================
// 精灵图定义
// ============================================================
const _ = null;
const CL = {
  W: '#ffffff', B: '#2196f3', D: '#1565c0', R: '#f44336', O: '#ff9800',
  Y: '#ffd700', G: '#4caf50', DG: '#2e7d32', P: '#9c27b0', C: '#00e5ff',
  GR: '#666666', DGR: '#444444', LB: '#64b5f6', LG: '#81c784',
  DR: '#c62828', BK: '#111111', PK: '#ff80ab', V: '#7c4dff',
  BR: '#8d6e63', DBR: '#5d4037', OR: '#ff6600', LY: '#ffee88',
};

const SPRITES = {
  player: [
    [_,_,_,CL.C,_,_,_],
    [_,_,CL.C,CL.C,CL.C,_,_],
    [_,CL.C,CL.B,CL.C,CL.B,CL.C,_],
    [_,CL.B,CL.B,CL.D,CL.B,CL.B,_],
    [CL.GR,CL.B,CL.D,CL.D,CL.D,CL.B,CL.GR],
    [CL.GR,CL.B,CL.D,CL.D,CL.D,CL.B,CL.GR],
    [_,CL.B,CL.B,CL.B,CL.B,CL.B,_],
    [_,_,CL.B,_,CL.B,_,_],
  ],
  enemy1: [
    [_,_,CL.R,CL.R,CL.R,_,_],
    [_,CL.R,CL.DR,CL.DR,CL.DR,CL.R,_],
    [CL.R,CL.DR,CL.Y,CL.DR,CL.Y,CL.DR,CL.R],
    [CL.R,CL.DR,CL.DR,CL.DR,CL.DR,CL.DR,CL.R],
    [_,CL.R,CL.DR,CL.DR,CL.DR,CL.R,_],
    [_,_,CL.R,_,CL.R,_,_],
  ],
  enemy2: [
    [_,CL.P,_,_,_,CL.P,_],
    [CL.P,CL.P,CL.P,CL.P,CL.P,CL.P,CL.P],
    [CL.P,CL.V,CL.Y,CL.V,CL.Y,CL.V,CL.P],
    [_,CL.P,CL.V,CL.V,CL.V,CL.P,_],
    [_,_,CL.P,CL.P,CL.P,_,_],
    [_,CL.P,_,_,_,CL.P,_],
  ],
  enemy3: [
    [_,_,CL.G,CL.G,CL.G,CL.G,CL.G,_,_],
    [_,CL.G,CL.DG,CL.DG,CL.DG,CL.DG,CL.DG,CL.G,_],
    [CL.G,CL.DG,CL.R,CL.DG,CL.DG,CL.DG,CL.R,CL.DG,CL.G],
    [CL.G,CL.G,CL.DG,CL.DG,CL.DG,CL.DG,CL.DG,CL.G,CL.G],
    [CL.G,_,CL.G,CL.G,CL.G,CL.G,CL.G,_,CL.G],
    [_,_,CL.G,_,CL.G,_,CL.G,_,_],
  ],
  enemy4: [
    [_,CL.O,_,_,_,CL.O,_],
    [CL.O,CL.O,CL.O,CL.O,CL.O,CL.O,CL.O],
    [CL.O,CL.Y,CL.R,CL.Y,CL.R,CL.Y,CL.O],
    [_,CL.O,CL.O,CL.O,CL.O,CL.O,_],
    [_,CL.O,_,CL.O,_,CL.O,_],
    [CL.O,_,_,_,_,_,CL.O],
  ],
  enemy5: [
    [_,_,CL.GR,CL.GR,CL.GR,_,_],
    [_,CL.GR,CL.DGR,CL.DGR,CL.DGR,CL.GR,_],
    [CL.GR,CL.DGR,CL.W,CL.DGR,CL.W,CL.DGR,CL.GR],
    [CL.GR,CL.DGR,CL.DGR,CL.DGR,CL.DGR,CL.DGR,CL.GR],
    [_,CL.GR,CL.DGR,CL.DGR,CL.DGR,CL.GR,_],
    [_,_,CL.GR,_,CL.GR,_,_],
  ],
  enemy6: [
    [CL.BR,CL.BR,CL.BR,CL.BR,CL.BR,CL.BR,CL.BR,CL.BR,CL.BR],
    [CL.BR,CL.DBR,CL.DBR,CL.DBR,CL.DBR,CL.DBR,CL.DBR,CL.DBR,CL.BR],
    [CL.BR,CL.DBR,CL.R,CL.DBR,CL.DBR,CL.DBR,CL.R,CL.DBR,CL.BR],
    [CL.GR,CL.BR,CL.DBR,CL.DBR,CL.GR,CL.DBR,CL.DBR,CL.BR,CL.GR],
    [CL.GR,CL.GR,CL.BR,CL.BR,CL.BR,CL.BR,CL.BR,CL.GR,CL.GR],
    [_,CL.GR,CL.GR,_,_,_,CL.GR,CL.GR,_],
  ],
  enemy7: [
    [_,_,CL.V,CL.V,CL.V,_,_],
    [_,CL.V,CL.V,CL.LB,CL.V,CL.V,_],
    [CL.V,CL.V,CL.LB,CL.W,CL.LB,CL.V,CL.V],
    [_,CL.V,CL.V,CL.LB,CL.V,CL.V,_],
    [_,_,CL.V,CL.V,CL.V,_,_],
  ],
  boss1: [
    [_,_,_,_,CL.DR,CL.DR,CL.DR,CL.DR,CL.DR,CL.DR,_,_,_,_],
    [_,_,CL.DR,CL.DR,CL.R,CL.R,CL.R,CL.R,CL.R,CL.R,CL.DR,CL.DR,_,_],
    [_,CL.DR,CL.R,CL.R,CL.R,CL.R,CL.R,CL.R,CL.R,CL.R,CL.R,CL.R,CL.DR,_],
    [CL.DR,CL.R,CL.R,CL.Y,CL.Y,CL.R,CL.R,CL.R,CL.R,CL.Y,CL.Y,CL.R,CL.R,CL.DR],
    [CL.DR,CL.R,CL.Y,CL.W,CL.Y,CL.R,CL.R,CL.R,CL.R,CL.Y,CL.W,CL.Y,CL.R,CL.DR],
    [CL.DR,CL.R,CL.R,CL.Y,CL.Y,CL.R,CL.DGR,CL.DGR,CL.R,CL.Y,CL.Y,CL.R,CL.R,CL.DR],
    [CL.GR,CL.DR,CL.R,CL.R,CL.R,CL.DGR,CL.BK,CL.BK,CL.DGR,CL.R,CL.R,CL.R,CL.DR,CL.GR],
    [CL.GR,CL.DR,CL.R,CL.R,CL.R,CL.R,CL.DGR,CL.DGR,CL.R,CL.R,CL.R,CL.R,CL.DR,CL.GR],
    [_,CL.GR,CL.DR,CL.R,CL.R,CL.R,CL.R,CL.R,CL.R,CL.R,CL.R,CL.DR,CL.GR,_],
    [_,_,CL.GR,CL.DR,CL.R,CL.R,CL.R,CL.R,CL.R,CL.R,CL.DR,CL.GR,_,_],
    [_,CL.GR,_,CL.GR,CL.DR,CL.R,CL.R,CL.R,CL.R,CL.DR,CL.GR,_,CL.GR,_],
    [CL.GR,_,_,_,CL.GR,CL.DR,CL.DR,CL.DR,CL.DR,CL.GR,_,_,_,CL.GR],
  ],
  boss2: [
    [_,_,_,CL.OR,CL.OR,CL.OR,CL.OR,CL.OR,CL.OR,CL.OR,CL.OR,_,_,_],
    [_,CL.OR,CL.OR,CL.R,CL.R,CL.R,CL.R,CL.R,CL.R,CL.R,CL.R,CL.OR,CL.OR,_],
    [CL.OR,CL.R,CL.R,CL.Y,CL.Y,CL.R,CL.R,CL.R,CL.R,CL.Y,CL.Y,CL.R,CL.R,CL.OR],
    [CL.OR,CL.R,CL.Y,CL.W,CL.Y,CL.R,CL.BK,CL.BK,CL.R,CL.Y,CL.W,CL.Y,CL.R,CL.OR],
    [CL.GR,CL.OR,CL.R,CL.R,CL.R,CL.BK,CL.R,CL.R,CL.BK,CL.R,CL.R,CL.R,CL.OR,CL.GR],
    [CL.GR,CL.GR,CL.OR,CL.R,CL.R,CL.R,CL.R,CL.R,CL.R,CL.R,CL.R,CL.OR,CL.GR,CL.GR],
    [_,CL.GR,CL.GR,CL.OR,CL.OR,CL.OR,CL.OR,CL.OR,CL.OR,CL.OR,CL.OR,CL.GR,CL.GR,_],
    [_,_,CL.GR,_,_,CL.OR,CL.OR,CL.OR,CL.OR,CL.OR,_,_,CL.GR,_],
    [_,CL.GR,_,_,CL.GR,CL.OR,_,_,_,CL.OR,CL.GR,_,_,CL.GR],
  ],
  boss3: [
    [_,_,CL.BR,_,_,_,_,_,_,_,_,_,CL.BR,_,_],
    [_,CL.BR,CL.BR,CL.BR,_,_,_,_,_,CL.BR,CL.BR,CL.BR,_,_,_],
    [CL.BR,CL.DBR,CL.DBR,CL.BR,CL.BR,CL.BR,CL.BR,CL.BR,CL.BR,CL.BR,CL.DBR,CL.DBR,CL.BR,_,_],
    [CL.BR,CL.DBR,CL.Y,CL.DBR,CL.DBR,CL.DBR,CL.DBR,CL.DBR,CL.DBR,CL.DBR,CL.Y,CL.DBR,CL.BR,_,_],
    [_,CL.BR,CL.DBR,CL.DBR,CL.R,CL.DBR,CL.DBR,CL.DBR,CL.R,CL.DBR,CL.DBR,CL.BR,_,_,_],
    [_,_,CL.BR,CL.BR,CL.BR,CL.BR,CL.BR,CL.BR,CL.BR,CL.BR,CL.BR,_,_,_,_],
    [_,CL.GR,_,_,CL.BR,CL.BR,CL.BR,CL.BR,CL.BR,_,_,CL.GR,_,_,_],
    [CL.GR,_,_,_,_,CL.BR,_,CL.BR,_,CL.BR,_,_,_,CL.GR,_],
  ],
  boss4: [
    [_,_,_,_,_,CL.V,CL.V,CL.V,CL.V,CL.V,_,_,_,_,_,_],
    [_,_,_,CL.V,CL.V,CL.V,CL.LB,CL.LB,CL.V,CL.V,CL.V,_,_,_,_,_],
    [_,_,CL.V,CL.V,CL.LB,CL.LB,CL.W,CL.W,CL.LB,CL.LB,CL.V,CL.V,_,_,_,_],
    [_,CL.V,CL.V,CL.LB,CL.LB,CL.W,CL.C,CL.C,CL.W,CL.LB,CL.LB,CL.V,CL.V,_,_,_],
    [CL.V,CL.V,CL.LB,CL.LB,CL.W,CL.C,CL.W,CL.W,CL.C,CL.W,CL.LB,CL.LB,CL.V,CL.V,_,_],
    [CL.GR,CL.V,CL.V,CL.LB,CL.LB,CL.W,CL.W,CL.W,CL.W,CL.LB,CL.LB,CL.V,CL.V,CL.GR,_,_],
    [_,CL.GR,CL.V,CL.V,CL.V,CL.LB,CL.LB,CL.LB,CL.LB,CL.V,CL.V,CL.V,CL.GR,_,_,_],
    [_,_,CL.GR,CL.V,CL.V,CL.V,CL.V,CL.V,CL.V,CL.V,CL.V,CL.GR,_,_,_,_],
    [_,CL.GR,_,CL.GR,CL.V,CL.V,CL.V,CL.V,CL.V,CL.V,CL.GR,_,CL.GR,_,_,_],
    [CL.GR,_,_,_,CL.GR,CL.GR,CL.V,CL.V,CL.GR,CL.GR,_,_,_,CL.GR,_,_],
  ],
};

// ============================================================
// 粒子系统
// ============================================================
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
    this.vy += 30 * dt;
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
    this.particles = this.particles.filter(p => { p.update(dt); return p.life > 0; });
  }

  draw() { this.particles.forEach(p => p.draw()); }
}

// ============================================================
// 背景系统（主题化）
// ============================================================
class Background {
  constructor() {
    this.theme = 'sky';
    this.stars = [];
    this.clouds = [];
    this.hazardElements = [];
    this.scrollY = 0;
    this.initStars();
  }

  initStars() {
    this.stars = [];
    for (let i = 0; i < CONFIG.STAR_COUNT; i++) {
      this.stars.push({
        x: Math.random() * W, y: Math.random() * H,
        speed: 20 + Math.random() * 60,
        size: Math.random() < 0.3 ? 2 : 1,
        brightness: 0.3 + Math.random() * 0.7,
      });
    }
  }

  setTheme(theme) {
    this.theme = theme;
    this.clouds = [];
    this.hazardElements = [];
    if (theme === 'sky') {
      for (let i = 0; i < 5; i++) {
        this.clouds.push({ x: Math.random() * W, y: Math.random() * H, w: 40 + Math.random() * 60, speed: 15 + Math.random() * 20 });
      }
    } else if (theme === 'lava') {
      for (let i = 0; i < 20; i++) {
        this.hazardElements.push({ x: Math.random() * W, y: Math.random() * H, speed: 30 + Math.random() * 50, size: 1 + Math.random() * 2, life: Math.random() });
      }
    } else if (theme === 'desert') {
      for (let i = 0; i < 30; i++) {
        this.hazardElements.push({ x: Math.random() * W, y: Math.random() * H, speed: 40 + Math.random() * 80, vx: -20 + Math.random() * 40, size: 1, alpha: 0.2 + Math.random() * 0.3 });
      }
    }
  }

  update(dt) {
    this.scrollY += dt * 50;
    this.stars.forEach(s => {
      s.y += s.speed * dt;
      if (s.y > H) { s.y = -2; s.x = Math.random() * W; }
    });
    if (this.theme === 'sky') {
      this.clouds.forEach(c => {
        c.y += c.speed * dt;
        if (c.y > H + 30) { c.y = -40; c.x = Math.random() * W; }
      });
    } else if (this.theme === 'lava') {
      this.hazardElements.forEach(e => {
        e.y -= e.speed * dt;
        e.life -= dt * 0.5;
        if (e.y < -5 || e.life < 0) {
          e.y = H + 5; e.x = Math.random() * W;
          e.life = 0.5 + Math.random() * 0.5;
        }
      });
    } else if (this.theme === 'desert') {
      this.hazardElements.forEach(e => {
        e.y += e.speed * dt;
        e.x += e.vx * dt;
        if (e.y > H) { e.y = -2; e.x = Math.random() * W; }
      });
    }
  }

  draw() {
    const level = LEVELS.find(l => l.theme === this.theme) || LEVELS[0];
    const gradient = ctx.createLinearGradient(0, 0, 0, H);
    gradient.addColorStop(0, level.bgColor1);
    gradient.addColorStop(1, level.bgColor2);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);

    if (this.theme === 'sky') {
      this.clouds.forEach(c => {
        ctx.globalAlpha = 0.15;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(c.x, c.y, c.w / 2, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(c.x - c.w * 0.2, c.y - 5, c.w * 0.3, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });
    } else if (this.theme === 'lava') {
      this.hazardElements.forEach(e => {
        ctx.globalAlpha = e.life * 0.8;
        const colors = ['#ff4400', '#ff6600', '#ffaa00'];
        ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
        ctx.fillRect(Math.floor(e.x), Math.floor(e.y), e.size, e.size);
        ctx.globalAlpha = 1;
      });
      ctx.globalAlpha = 0.05;
      ctx.fillStyle = '#ff2200';
      ctx.fillRect(0, H - 50, W, 50);
      ctx.globalAlpha = 1;
    } else if (this.theme === 'desert') {
      this.hazardElements.forEach(e => {
        ctx.globalAlpha = e.alpha;
        ctx.fillStyle = '#d4a574';
        ctx.fillRect(Math.floor(e.x), Math.floor(e.y), e.size, e.size);
        ctx.globalAlpha = 1;
      });
    }

    this.stars.forEach(s => {
      let brightness = s.brightness;
      if (this.theme === 'sky') brightness *= 0.3;
      else if (this.theme === 'lava') brightness *= 0.2;
      else if (this.theme === 'desert') brightness *= 0.15;
      const c = Math.floor(brightness * 255);
      ctx.fillStyle = `rgb(${c},${c},${Math.min(255, c + 40)})`;
      ctx.fillRect(Math.floor(s.x), Math.floor(s.y), s.size, s.size);
    });
  }
}

// ============================================================
// 子弹
// ============================================================
class Bullet {
  constructor(x, y, vx, vy, w, h, color, damage = 10, isPlayer = true) {
    this.x = x; this.y = y;
    this.vx = vx; this.vy = vy;
    this.w = w; this.h = h;
    this.color = color;
    this.damage = damage;
    this.isPlayer = isPlayer;
    this.alive = true;
    this.pierce = 0;
    this.isLaser = false;
    this.isHoming = false;
    this.homingTarget = null;
  }

  update(dt, enemies) {
    if (this.isHoming && enemies) {
      let closest = null, closestDist = 300;
      enemies.forEach(e => {
        if (!e.alive) return;
        const d = Math.hypot(e.x - this.x, e.y - this.y);
        if (d < closestDist) { closestDist = d; closest = e; }
      });
      if (closest) {
        const angle = Math.atan2(closest.y - this.y, closest.x - this.x);
        const speed = Math.hypot(this.vx, this.vy);
        this.vx += Math.cos(angle) * 800 * dt;
        this.vy += Math.sin(angle) * 800 * dt;
        const curSpeed = Math.hypot(this.vx, this.vy);
        if (curSpeed > speed) {
          this.vx = (this.vx / curSpeed) * speed;
          this.vy = (this.vy / curSpeed) * speed;
        }
      }
    }
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    if (this.y < -20 || this.y > H + 20 || this.x < -20 || this.x > W + 20) this.alive = false;
  }

  draw() {
    if (this.isLaser) {
      ctx.globalAlpha = 0.6;
      drawPixelRect(this.x - this.w, this.y - this.h / 2, this.w * 2, this.h, this.color);
      ctx.globalAlpha = 1;
      drawPixelRect(this.x - this.w / 2, this.y - this.h / 2, this.w, this.h, '#ffffff');
    } else {
      drawPixelRect(this.x - this.w / 2, this.y - this.h / 2, this.w, this.h, this.color);
      ctx.globalAlpha = 0.3;
      drawPixelRect(this.x - this.w / 2 - 1, this.y - this.h / 2 - 1, this.w + 2, this.h + 2, this.color);
      ctx.globalAlpha = 1;
    }
  }

  getRect() {
    return { x: this.x - this.w / 2, y: this.y - this.h / 2, w: this.w, h: this.h };
  }
}

// ============================================================
// 玩家
// ============================================================
class Player {
  constructor() { this.reset(); }

  reset() {
    this.x = W / 2;
    this.y = H - 100;
    this.alive = true;
    this.hp = CONFIG.PLAYER_BASE_HP;
    this.maxHp = CONFIG.PLAYER_BASE_HP;
    this.atk = CONFIG.PLAYER_BASE_ATK;
    this.critRate = CONFIG.PLAYER_BASE_CRIT;
    this.fireRate = CONFIG.PLAYER_BASE_FIRE_RATE;
    this.speed = CONFIG.PLAYER_BASE_SPEED;

    this.fireLevel = 1;
    this.shieldLayers = 0;
    this.shieldTimer = 0;
    this.invincible = false;
    this.invincibleTimer = 0;
    this.speedBoosted = false;
    this.speedBoostTimer = 0;
    this.skillCooldown = 0;
    this.skillMaxCooldown = CONFIG.SKILL_COOLDOWN;

    this.fireTimer = 0;
    this.sprite = SPRITES.player;
    this.spriteW = this.sprite[0].length * 2;
    this.spriteH = this.sprite.length * 2;
    this.thrustFrame = 0;
  }

  applyUpgrades(upgrades) {
    this.maxHp = CONFIG.PLAYER_BASE_HP + upgrades.hp * UPGRADES.hp.perLevel;
    this.hp = this.maxHp;
    this.atk = CONFIG.PLAYER_BASE_ATK + upgrades.atk * UPGRADES.atk.perLevel;
    this.critRate = CONFIG.PLAYER_BASE_CRIT + upgrades.crit * UPGRADES.crit.perLevel;
    this.fireRate = CONFIG.PLAYER_BASE_FIRE_RATE + upgrades.speed * UPGRADES.speed.perLevel;
    this.skillMaxCooldown = Math.max(5, CONFIG.SKILL_COOLDOWN - upgrades.cooldown * UPGRADES.cooldown.perLevel);
  }

  update(dt, targetX, targetY) {
    if (!this.alive) return;

    const currentSpeed = this.speedBoosted ? this.speed * 2 : this.speed;
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 2) {
      const moveSpeed = Math.min(dist * 8, currentSpeed);
      this.x += (dx / dist) * moveSpeed * dt;
      this.y += (dy / dist) * moveSpeed * dt;
    }

    this.x = Math.max(this.spriteW / 2, Math.min(W - this.spriteW / 2, this.x));
    this.y = Math.max(this.spriteH / 2, Math.min(H - this.spriteH / 2, this.y));

    if (this.invincible) {
      this.invincibleTimer -= dt;
      if (this.invincibleTimer <= 0) this.invincible = false;
    }

    if (this.shieldLayers > 0) {
      this.shieldTimer -= dt;
      if (this.shieldTimer <= 0) this.shieldLayers = 0;
    }

    if (this.speedBoosted) {
      this.speedBoostTimer -= dt;
      if (this.speedBoostTimer <= 0) this.speedBoosted = false;
    }

    if (this.skillCooldown > 0) this.skillCooldown -= dt;
    this.fireTimer -= dt;
    this.thrustFrame += dt * 10;
  }

  takeDamage(amount) {
    if (this.invincible) return 0;
    if (this.shieldLayers > 0) {
      this.shieldLayers--;
      if (this.shieldLayers <= 0) this.shieldTimer = 0;
      return -1; // shield absorbed
    }
    this.hp -= amount;
    if (this.hp <= 0) { this.hp = 0; this.alive = false; }
    return amount;
  }

  heal(amount) {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  shoot() {
    if (!this.alive || this.fireTimer > 0) return [];
    this.fireTimer = 1 / this.fireRate;

    const bullets = [];
    const dmg = this.atk;
    const isCrit = Math.random() < this.critRate;
    const finalDmg = isCrit ? dmg * 2 : dmg;
    const color = isCrit ? '#ffd700' : '#00e5ff';

    switch (this.fireLevel) {
      case 1:
        bullets.push(new Bullet(this.x, this.y - 10, 0, -550, 3, 8, color, finalDmg, true));
        break;
      case 2:
        bullets.push(new Bullet(this.x - 5, this.y - 8, 0, -550, 3, 8, color, finalDmg, true));
        bullets.push(new Bullet(this.x + 5, this.y - 8, 0, -550, 3, 8, color, finalDmg, true));
        break;
      case 3: {
        bullets.push(new Bullet(this.x, this.y - 10, 0, -550, 3, 8, color, finalDmg, true));
        const b1 = new Bullet(this.x - 8, this.y - 5, -60, -520, 3, 6, color, finalDmg * 0.8, true);
        const b2 = new Bullet(this.x + 8, this.y - 5, 60, -520, 3, 6, color, finalDmg * 0.8, true);
        b1.pierce = 1; b2.pierce = 1;
        bullets.push(b1, b2);
        break;
      }
      case 4: {
        const laser = new Bullet(this.x, this.y - 20, 0, -600, 6, 20, '#00ffff', finalDmg * 1.5, true);
        laser.isLaser = true;
        bullets.push(laser);
        break;
      }
      case 5: {
        for (let i = -2; i <= 2; i++) {
          const b = new Bullet(this.x + i * 8, this.y - 8, i * 40, -500, 4, 6, '#ffd700', finalDmg * 0.7, true);
          bullets.push(b);
        }
        this.fireTimer *= 0.6;
        break;
      }
    }
    return bullets;
  }

  useSkill(enemies) {
    if (this.skillCooldown > 0) return [];
    this.skillCooldown = this.skillMaxCooldown;
    const bullets = [];
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 / 8) * i - Math.PI / 2;
      const b = new Bullet(this.x, this.y, Math.cos(angle) * 300, Math.sin(angle) * 300, 5, 5, '#ff00ff', this.atk * 3, true);
      b.isHoming = true;
      bullets.push(b);
    }
    return bullets;
  }

  draw() {
    if (!this.alive) return;
    if (this.invincible && Math.floor(this.invincibleTimer * 10) % 2 === 0) return;

    const sx = this.x - this.spriteW / 2;
    const sy = this.y - this.spriteH / 2;

    if (this.shieldLayers > 0) {
      const shieldColors = ['#00e5ff', '#00ff88', '#ffd700'];
      const sc = shieldColors[Math.min(this.shieldLayers - 1, 2)];
      const pulse = Math.sin(Date.now() / 200) * 2;
      ctx.globalAlpha = 0.2 + Math.sin(Date.now() / 300) * 0.1;
      ctx.strokeStyle = sc;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.spriteW / 2 + 4 + pulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    drawPixelSprite(sx, sy, this.sprite, 2);

    if (this.speedBoosted) {
      ctx.globalAlpha = 0.4;
      drawPixelRect(this.x - 1, this.y + this.spriteH / 2, 2, 8, '#00e5ff');
      ctx.globalAlpha = 1;
    }

    const thrustColors = ['#ff6600', '#ffaa00', '#ff4400', '#ffdd00'];
    const tSize = 2 + Math.sin(this.thrustFrame) * 1;
    const tColor = thrustColors[Math.floor(this.thrustFrame) % thrustColors.length];
    drawPixelRect(this.x - 2, this.y + this.spriteH / 2, 4, tSize * 2, tColor);
    ctx.globalAlpha = 0.5;
    drawPixelRect(this.x - 1, this.y + this.spriteH / 2 + tSize, 2, tSize, '#ffff00');
    ctx.globalAlpha = 1;
  }

  getRect() {
    return { x: this.x - this.spriteW / 2 + 3, y: this.y - this.spriteH / 2 + 2, w: this.spriteW - 6, h: this.spriteH - 4 };
  }

  makeInvincible(duration = 3) {
    this.invincible = true;
    this.invincibleTimer = duration;
  }
}

// ============================================================
// 敌机
// ============================================================
class Enemy {
  constructor(x, y, type, diffMult) {
    this.x = x; this.y = y;
    this.type = type;
    this.alive = true;
    this.hitFlash = 0;

    const def = ENEMY_DEFS[type] || ENEMY_DEFS[1];
    this.hp = def.hp * (diffMult ? diffMult.hpMult : 1);
    this.maxHp = this.hp;
    this.baseSpeed = def.speed * (diffMult ? diffMult.spdMult : 1);
    this.speed = this.baseSpeed;
    this.score = def.score;
    this.fireRate = def.fireRate / (diffMult ? diffMult.atkMult : 1);
    this.movePattern = def.movePattern;
    this.bulletColor = def.bulletColor;
    this.fireTimer = 1 + Math.random() * 2;
    this.moveTimer = Math.random() * Math.PI * 2;
    this.stealthAlpha = 1;
    this.stealthPhase = 0;
    this.orbitAngle = Math.random() * Math.PI * 2;
    this.orbitCenterX = x;

    const spriteKey = `enemy${Math.min(type, 7)}`;
    this.sprite = SPRITES[spriteKey] || SPRITES.enemy1;
    this.spriteW = this.sprite[0].length * 2;
    this.spriteH = this.sprite.length * 2;
  }

  update(dt, playerX, playerY) {
    this.moveTimer += dt * 2;
    this.hitFlash = Math.max(0, this.hitFlash - dt);

    switch (this.movePattern) {
      case 'straight':
        this.y += this.speed * dt;
        break;
      case 'zigzag':
        this.y += this.speed * dt;
        this.x += Math.sin(this.moveTimer) * 60 * dt;
        break;
      case 'slow':
        this.y += this.speed * dt;
        this.x += Math.sin(this.moveTimer * 0.5) * 20 * dt;
        break;
      case 'chase': {
        const angle = Math.atan2(playerY - this.y, playerX - this.x);
        this.x += Math.cos(angle) * this.speed * dt;
        this.y += Math.sin(angle) * this.speed * dt;
        break;
      }
      case 'stealth':
        this.y += this.speed * dt;
        this.x += Math.sin(this.moveTimer) * 40 * dt;
        this.stealthPhase += dt;
        this.stealthAlpha = 0.15 + Math.abs(Math.sin(this.stealthPhase * 0.8)) * 0.85;
        break;
      case 'orbit':
        this.orbitAngle += dt * 1.5;
        this.x = this.orbitCenterX + Math.cos(this.orbitAngle) * 50;
        this.y += this.speed * 0.5 * dt;
        break;
    }

    this.x = Math.max(this.spriteW / 2, Math.min(W - this.spriteW / 2, this.x));
    this.fireTimer -= dt;
    if (this.y > H + 30) this.alive = false;
  }

  shoot(playerX, playerY) {
    if (this.fireTimer > 0 || this.movePattern === 'chase') return [];
    this.fireTimer = this.fireRate + Math.random() * 0.5;

    const angle = Math.atan2(playerY - this.y, playerX - this.x);
    const speed = 200;
    const b = new Bullet(this.x, this.y + this.spriteH / 2, Math.cos(angle) * speed, Math.sin(angle) * speed, 4, 4, this.bulletColor, 10, false);
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

    const alpha = this.movePattern === 'stealth' ? this.stealthAlpha : 1;
    ctx.globalAlpha = alpha;

    if (this.hitFlash > 0) {
      ctx.globalAlpha = 0.7 * alpha;
      drawPixelRect(sx - 1, sy - 1, this.spriteW + 2, this.spriteH + 2, '#ffffff');
      ctx.globalAlpha = alpha;
    }

    drawPixelSprite(sx, sy, this.sprite, 2);

    if (this.hp < this.maxHp && this.maxHp > 20) {
      const barW = this.spriteW;
      const ratio = this.hp / this.maxHp;
      drawBar(sx, sy - 5, barW, 3, ratio, ratio > 0.5 ? '#4caf50' : '#f44336');
    }

    ctx.globalAlpha = 1;
  }

  getRect() {
    return { x: this.x - this.spriteW / 2, y: this.y - this.spriteH / 2, w: this.spriteW, h: this.spriteH };
  }
}

// ============================================================
// Boss系统
// ============================================================
class Boss {
  constructor(levelIndex, diffMult) {
    this.levelIndex = levelIndex;
    const levelDef = LEVELS[levelIndex];
    this.x = W / 2;
    this.y = -80;
    this.targetY = 70;
    this.alive = true;
    this.entering = true;

    this.hp = levelDef.bossHp * (diffMult ? diffMult.hpMult : 1);
    this.maxHp = this.hp;
    this.score = levelDef.bossScore;
    this.name = levelDef.bossName;

    const spriteKey = `boss${levelIndex + 1}`;
    this.sprite = SPRITES[spriteKey] || SPRITES.boss1;
    this.spriteScale = levelIndex === 3 ? 3 : 3;
    this.spriteW = this.sprite[0].length * this.spriteScale;
    this.spriteH = this.sprite.length * this.spriteScale;

    this.fireTimer = 0;
    this.patternTimer = 0;
    this.pattern = 0;
    this.patternCount = levelIndex === 3 ? 4 : 3;
    this.hitFlash = 0;
    this.moveTimer = 0;
    this.shakeAmount = 0;
    this.enraged = false;
    this.phase = 1;
    this.chargeTimer = 0;
    this.charging = false;
    this.chargeTargetY = 0;
    this.diffMult = diffMult || DIFFICULTY[0];
    this.spawnTimer = 0;
    this.shieldActive = false;
    this.shieldTimer = 0;
    this.laserAngle = 0;
  }

  update(dt) {
    if (this.entering) {
      this.y += (this.targetY - this.y) * 2 * dt;
      if (Math.abs(this.y - this.targetY) < 1) { this.y = this.targetY; this.entering = false; }
      return;
    }

    const hpRatio = this.hp / this.maxHp;
    if (!this.enraged && hpRatio < 0.3) this.enraged = true;
    if (this.levelIndex === 3) {
      if (hpRatio > 0.6) this.phase = 1;
      else if (hpRatio > 0.3) this.phase = 2;
      else this.phase = 3;
    }

    if (this.charging) {
      this.chargeTimer -= dt;
      this.y += (this.chargeTargetY - this.y) * 4 * dt;
      if (this.chargeTimer <= 0) { this.charging = false; this.chargeTargetY = this.targetY; }
      this.y += (this.targetY - this.y) * 2 * dt;
    } else {
      this.moveTimer += dt;
      const moveRange = this.enraged ? 130 : 100;
      this.x = W / 2 + Math.sin(this.moveTimer * (this.enraged ? 1.2 : 0.8)) * moveRange;
      this.y = this.targetY + Math.sin(this.moveTimer * 0.5) * 20;
    }

    this.x = Math.max(this.spriteW / 2 + 5, Math.min(W - this.spriteW / 2 - 5, this.x));

    this.fireTimer -= dt;
    this.patternTimer += dt;
    const patternDuration = this.enraged ? 3 : 4;
    if (this.patternTimer > patternDuration) {
      this.patternTimer = 0;
      this.pattern = (this.pattern + 1) % this.patternCount;
    }

    if (this.hitFlash > 0) this.hitFlash -= dt;
    if (this.shakeAmount > 0) this.shakeAmount *= 0.95;

    if (this.shieldActive) {
      this.shieldTimer -= dt;
      if (this.shieldTimer <= 0) this.shieldActive = false;
    }

    this.laserAngle += dt * 2;
  }

  shoot(playerX, playerY) {
    if (this.entering || this.fireTimer > 0 || this.shieldActive) return [];
    const bullets = [];
    const fireRateMult = this.enraged ? 0.6 : 1;

    if (this.levelIndex === 0) {
      bullets.push(...this._boss1Pattern(playerX, playerY, fireRateMult));
    } else if (this.levelIndex === 1) {
      bullets.push(...this._boss2Pattern(playerX, playerY, fireRateMult));
    } else if (this.levelIndex === 2) {
      bullets.push(...this._boss3Pattern(playerX, playerY, fireRateMult));
    } else if (this.levelIndex === 3) {
      bullets.push(...this._boss4Pattern(playerX, playerY, fireRateMult));
    }

    return bullets;
  }

  _boss1Pattern(px, py, frm) {
    const bullets = [];
    if (this.pattern === 0) {
      this.fireTimer = 0.5 * frm;
      for (let i = -2; i <= 2; i++) {
        bullets.push(new Bullet(this.x + i * 12, this.y + this.spriteH / 2, i * 40, 250, 4, 4, '#ff4444', 10, false));
      }
    } else if (this.pattern === 1) {
      this.fireTimer = 0.12 * frm;
      const a = this.patternTimer * 5;
      bullets.push(new Bullet(this.x, this.y + this.spriteH / 2, Math.cos(a) * 200, Math.sin(a) * 100 + 160, 5, 5, '#ff6600', 10, false));
    } else {
      if (!this.charging && Math.random() < 0.02) {
        this.charging = true;
        this.chargeTargetY = py - 60;
        this.chargeTimer = 1.5;
      }
      this.fireTimer = 0.3 * frm;
      const angle = Math.atan2(py - this.y, px - this.x);
      bullets.push(new Bullet(this.x, this.y + this.spriteH / 2, Math.cos(angle) * 280, Math.sin(angle) * 280, 5, 5, '#ff0000', 15, false));
    }
    return bullets;
  }

  _boss2Pattern(px, py, frm) {
    const bullets = [];
    if (this.pattern === 0) {
      this.fireTimer = 0.8 * frm;
      for (let i = 0; i < 3; i++) {
        const angle = Math.atan2(py - this.y, px - this.x) + (i - 1) * 0.3;
        const b = new Bullet(this.x, this.y + this.spriteH / 2, Math.cos(angle) * 180, Math.sin(angle) * 180, 6, 6, '#ff6600', 12, false);
        b.isHoming = true;
        bullets.push(b);
      }
    } else if (this.pattern === 1) {
      this.fireTimer = 0.4 * frm;
      const count = this.enraged ? 12 : 8;
      for (let i = 0; i < count; i++) {
        const a = (Math.PI * 2 / count) * i + this.patternTimer;
        bullets.push(new Bullet(this.x, this.y + this.spriteH / 2, Math.cos(a) * 160, Math.sin(a) * 160, 4, 4, '#ff4400', 10, false));
      }
    } else {
      this.fireTimer = 0.08 * frm;
      const laserX = this.x + Math.sin(this.patternTimer * 3) * 150;
      bullets.push(new Bullet(laserX, this.y + this.spriteH / 2, 0, 400, 8, 4, '#ffaa00', 8, false));
    }
    return bullets;
  }

  _boss3Pattern(px, py, frm) {
    const bullets = [];
    if (this.pattern === 0) {
      this.fireTimer = 0.6 * frm;
      for (let i = 0; i < 5; i++) {
        const a = (Math.PI * 2 / 5) * i + this.patternTimer * 2;
        bullets.push(new Bullet(this.x, this.y + this.spriteH / 2, Math.cos(a) * 140, Math.sin(a) * 140 + 60, 4, 4, '#d4a574', 10, false));
      }
    } else if (this.pattern === 1) {
      this.fireTimer = 0.1 * frm;
      const a = this.patternTimer * 4;
      bullets.push(new Bullet(this.x, this.y + this.spriteH / 2, Math.cos(a) * 180, Math.sin(a) * 80 + 150, 4, 4, '#ffcc66', 10, false));
    } else {
      if (!this.shieldActive) {
        this.shieldActive = true;
        this.shieldTimer = 3;
      }
      this.fireTimer = 0.5;
    }
    return bullets;
  }

  _boss4Pattern(px, py, frm) {
    const bullets = [];
    if (this.phase === 1) {
      this.fireTimer = 0.4 * frm;
      const offsets = [-this.spriteW / 2 - 5, this.spriteW / 2 + 5];
      offsets.forEach(ox => {
        const angle = Math.atan2(py - this.y, px - (this.x + ox));
        bullets.push(new Bullet(this.x + ox, this.y + this.spriteH / 3, Math.cos(angle) * 220, Math.sin(angle) * 220, 5, 5, '#aa88ff', 12, false));
      });
    } else if (this.phase === 2) {
      this.fireTimer = 0.15 * frm;
      const a = this.laserAngle;
      bullets.push(new Bullet(this.x, this.y, Math.cos(a) * 200, Math.sin(a) * 200, 6, 6, '#ff00ff', 10, false));
      bullets.push(new Bullet(this.x, this.y, Math.cos(a + Math.PI) * 200, Math.sin(a + Math.PI) * 200, 6, 6, '#ff00ff', 10, false));
    } else {
      this.fireTimer = 0.08 * frm;
      const count = 6;
      for (let i = 0; i < count; i++) {
        const a = (Math.PI * 2 / count) * i + this.patternTimer * 3;
        bullets.push(new Bullet(this.x, this.y, Math.cos(a) * 170, Math.sin(a) * 170, 4, 4, '#cc44ff', 8, false));
      }
      if (Math.sin(this.patternTimer * 2) > 0.95) {
        for (let i = 0; i < 16; i++) {
          const a = (Math.PI * 2 / 16) * i;
          bullets.push(new Bullet(this.x, this.y, Math.cos(a) * 120, Math.sin(a) * 120, 5, 5, '#ff0088', 15, false));
        }
      }
    }
    return bullets;
  }

  takeDamage(dmg) {
    if (this.shieldActive) return false;
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

    if (this.shieldActive) {
      ctx.globalAlpha = 0.3;
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(this.x, this.y, Math.max(this.spriteW, this.spriteH) / 2 + 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    if (this.hitFlash > 0) {
      ctx.globalAlpha = 0.6;
      drawPixelRect(sx - 2, sy - 2, this.spriteW + 4, this.spriteH + 4, '#ffffff');
      ctx.globalAlpha = 1;
    }

    drawPixelSprite(sx, sy, this.sprite, this.spriteScale);

    const barW = 140;
    const barH = 8;
    const barX = W / 2 - barW / 2;
    const barY = 12;
    const hpRatio = this.hp / this.maxHp;

    drawPixelRect(barX - 1, barY - 1, barW + 2, barH + 2, '#333');
    drawPixelRect(barX, barY, barW, barH, '#111');
    let barColor = hpRatio > 0.5 ? '#4caf50' : hpRatio > 0.25 ? '#ff9800' : '#f44336';
    drawPixelRect(barX, barY, barW * hpRatio, barH, barColor);
    drawPixelText(this.name, W / 2, barY + barH + 14, '#ff4444', 1.5);

    if (this.enraged) {
      const flash = Math.sin(Date.now() / 150) > 0;
      if (flash) drawPixelText('ENRAGED!', W / 2, barY + barH + 28, '#ff0000', 1.2);
    }
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

// ============================================================
// 道具系统（5种）
// ============================================================
class PowerUp {
  constructor(x, y, type) {
    this.x = x; this.y = y;
    this.type = type;
    this.alive = true;
    this.timer = 0;
    this.speed = 60;
    this.size = 12;
  }

  update(dt) {
    this.y += this.speed * dt;
    this.timer += dt;
    if (this.y > H + 20) this.alive = false;
  }

  draw() {
    const pulse = Math.sin(this.timer * 6) * 2;
    const s = this.size + pulse;
    const defs = {
      fire:   { color: '#ff4400', icon: '🔥', bg: '#ff6600' },
      shield: { color: '#00aaff', icon: '🛡', bg: '#0088cc' },
      heal:   { color: '#44cc44', icon: '+',  bg: '#22aa22' },
      bomb:   { color: '#ff9800', icon: 'B',  bg: '#cc7700' },
      speed:  { color: '#ffee00', icon: '⚡', bg: '#ccbb00' },
    };
    const def = defs[this.type] || defs.fire;

    ctx.globalAlpha = 0.3;
    drawPixelRect(this.x - s / 2 - 2, this.y - s / 2 - 2, s + 4, s + 4, def.bg);
    ctx.globalAlpha = 1;
    drawPixelRect(this.x - s / 2, this.y - s / 2, s, s, def.color);

    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    ctx.fillText(def.icon, this.x, this.y + 4);
  }

  getRect() {
    return { x: this.x - this.size / 2, y: this.y - this.size / 2, w: this.size, h: this.size };
  }
}

// ============================================================
// 关卡特殊机制（危险区域）
// ============================================================
class HazardSystem {
  constructor() {
    this.type = null;
    this.elements = [];
    this.timer = 0;
    this.sandstormAlpha = 0;
    this.laserWarnings = [];
  }

  init(type) {
    this.type = type;
    this.elements = [];
    this.timer = 0;
    this.sandstormAlpha = 0;
    this.laserWarnings = [];
  }

  update(dt, particles) {
    if (!this.type) return;
    this.timer += dt;

    if (this.type === 'lava') {
      if (Math.random() < dt * 0.3) {
        this.elements.push({ x: Math.random() * W, y: H + 10, vy: -200 - Math.random() * 100, life: 1.5, radius: 15 + Math.random() * 10, warned: false, exploded: false });
      }
      this.elements.forEach(e => {
        e.life -= dt;
        if (e.life > 0.5) {
          e.y += e.vy * dt;
          e.vy *= 0.98;
        } else if (!e.exploded) {
          e.exploded = true;
          if (particles) particles.emit(e.x, e.y, 15, ['#ff4400', '#ff6600', '#ffaa00']);
        }
      });
      this.elements = this.elements.filter(e => e.life > 0);
    } else if (this.type === 'sandstorm') {
      this.sandstormAlpha = 0.1 + Math.sin(this.timer * 0.5) * 0.15;
    } else if (this.type === 'laser') {
      if (Math.random() < dt * 0.15) {
        const isHorizontal = Math.random() < 0.5;
        this.laserWarnings.push({
          horizontal: isHorizontal,
          pos: isHorizontal ? Math.random() * H * 0.7 + H * 0.1 : Math.random() * W,
          warnTime: 1.5, activeTime: 0.8, timer: 0,
        });
      }
      this.laserWarnings.forEach(l => {
        l.timer += dt;
      });
      this.laserWarnings = this.laserWarnings.filter(l => l.timer < l.warnTime + l.activeTime);
    }
  }

  checkDamage(playerRect) {
    if (!this.type) return 0;
    let dmg = 0;

    if (this.type === 'lava') {
      this.elements.forEach(e => {
        if (e.exploded && e.life > 0 && e.life < 0.3) {
          const dx = (playerRect.x + playerRect.w / 2) - e.x;
          const dy = (playerRect.y + playerRect.h / 2) - e.y;
          if (Math.sqrt(dx * dx + dy * dy) < e.radius) { dmg += 15; e.life = 0; }
        }
      });
    } else if (this.type === 'laser') {
      const px = playerRect.x + playerRect.w / 2;
      const py = playerRect.y + playerRect.h / 2;
      this.laserWarnings.forEach(l => {
        if (l.timer > l.warnTime && l.timer < l.warnTime + l.activeTime) {
          if (l.horizontal && Math.abs(py - l.pos) < 8) dmg += 20;
          else if (!l.horizontal && Math.abs(px - l.pos) < 8) dmg += 20;
        }
      });
    }

    return dmg;
  }

  draw() {
    if (!this.type) return;

    if (this.type === 'lava') {
      this.elements.forEach(e => {
        if (e.life > 0.5) {
          ctx.globalAlpha = 0.4;
          ctx.strokeStyle = '#ff4400';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.globalAlpha = 1;
          drawPixelRect(e.x - 2, e.y - 2, 4, 4, '#ff6600');
        } else if (e.life > 0) {
          ctx.globalAlpha = e.life * 2;
          ctx.fillStyle = '#ff4400';
          ctx.beginPath();
          ctx.arc(e.x, e.y, e.radius * (1 - e.life), 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      });
    } else if (this.type === 'sandstorm') {
      ctx.globalAlpha = this.sandstormAlpha;
      ctx.fillStyle = '#d4a574';
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
    } else if (this.type === 'laser') {
      this.laserWarnings.forEach(l => {
        if (l.timer < l.warnTime) {
          const flash = Math.sin(l.timer * 10) > 0;
          if (flash) {
            ctx.globalAlpha = 0.3;
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 2;
            if (l.horizontal) {
              ctx.beginPath(); ctx.moveTo(0, l.pos); ctx.lineTo(W, l.pos); ctx.stroke();
            } else {
              ctx.beginPath(); ctx.moveTo(l.pos, 0); ctx.lineTo(l.pos, H); ctx.stroke();
            }
            ctx.globalAlpha = 1;
          }
        } else {
          const progress = (l.timer - l.warnTime) / l.activeTime;
          ctx.globalAlpha = 0.8 * (1 - progress);
          ctx.fillStyle = '#ff0044';
          if (l.horizontal) {
            ctx.fillRect(0, l.pos - 4, W, 8);
          } else {
            ctx.fillRect(l.pos - 4, 0, 8, H);
          }
          ctx.globalAlpha = 1;
        }
      });
    }
  }
}

// ============================================================
// 碰撞检测 & 效果
// ============================================================
function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

class ScreenShake {
  constructor() { this.amount = 0; this.timer = 0; }
  trigger(amount, duration) { this.amount = Math.max(this.amount, amount); this.timer = duration; }
  update(dt) { if (this.timer > 0) { this.timer -= dt; } else { this.amount = 0; } }
  apply() {
    if (this.amount > 0) {
      ctx.translate((Math.random() - 0.5) * this.amount * 2, (Math.random() - 0.5) * this.amount * 2);
    }
  }
}

class SlowMotionEffect {
  constructor() { this.active = false; this.timer = 0; this.duration = 2; this.centerX = 0; this.centerY = 0; this.flashAlpha = 0; }
  trigger(x, y) { this.active = true; this.timer = this.duration; this.centerX = x; this.centerY = y; this.flashAlpha = 1; }
  getTimeScale() {
    if (!this.active) return 1;
    const progress = 1 - this.timer / this.duration;
    if (progress < 0.3) return 0.2;
    return 0.2 + 0.8 * ((progress - 0.3) / 0.7);
  }
  update(realDt) {
    if (!this.active) return;
    this.timer -= realDt; this.flashAlpha *= 0.95;
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
  }
}

// ============================================================
// 评分系统
// ============================================================
function calculateRating(levelIndex, difficulty, clearTime, hitsTaken, maxCombo, kills) {
  let score = 0;

  const timeBonus = Math.max(0, 200 - clearTime * 2);
  score += timeBonus;
  score += Math.max(0, 100 - hitsTaken * 10);
  score += Math.min(maxCombo * 5, 150);
  score += kills * 2;
  score += difficulty * 50;

  if (score >= 350) return 'S';
  if (score >= 250) return 'A';
  if (score >= 150) return 'B';
  return 'C';
}

function calculateGold(levelIndex, difficulty, rating) {
  const base = LEVELS[levelIndex].baseGold;
  const diffMult = DIFFICULTY[difficulty].goldMult;
  const ratingMult = { S: 2.0, A: 1.5, B: 1.2, C: 1.0 };
  return Math.floor(base * diffMult * (ratingMult[rating] || 1));
}

// ============================================================
// 游戏主类
// ============================================================
class Game {
  constructor() {
    this.state = 'menu';
    this.saveData = SaveSystem.load();

    this.selectedLevel = 0;
    this.selectedDifficulty = 0;
    this.currentWave = 0;
    this.totalWaves = 0;
    this.waveTimer = 0;
    this.wavePause = false;
    this.wavePauseTimer = 0;
    this.bossSpawned = false;
    this.levelStartTime = 0;
    this.hitsTaken = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.comboTimer = 0;
    this.goldEarned = 0;

    this.score = 0;
    this.kills = 0;
    this.bossKills = 0;
    this.revivesLeft = CONFIG.MAX_REVIVES;
    this.bombs = 1;

    this.player = new Player();
    this.enemies = [];
    this.bullets = [];
    this.powerUps = [];
    this.particles = new ParticleSystem();
    this.background = new Background();
    this.slowMotion = new SlowMotionEffect();
    this.screenShake = new ScreenShake();
    this.hazards = new HazardSystem();
    this.currentBoss = null;

    this.enemySpawnTimer = 0;
    this.mouseX = W / 2;
    this.mouseY = H - 100;
    this.lastTime = 0;
    this.levelIntroTimer = 0;

    this.damageNumbers = [];

    this.setupInputs();
    this.setupUI();
  }

  // --- 输入 ---
  setupInputs() {
    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      return { x: (e.clientX - rect.left) * (W / rect.width), y: (e.clientY - rect.top) * (H / rect.height) };
    };

    canvas.addEventListener('mousemove', (e) => { const p = getPos(e); this.mouseX = p.x; this.mouseY = p.y; });
    canvas.addEventListener('touchmove', (e) => { e.preventDefault(); const t = e.touches[0]; const p = getPos(t); this.mouseX = p.x; this.mouseY = p.y - 60; }, { passive: false });
    canvas.addEventListener('touchstart', (e) => { e.preventDefault(); const t = e.touches[0]; const p = getPos(t); this.mouseX = p.x; this.mouseY = p.y - 60; }, { passive: false });

    document.addEventListener('keydown', (e) => {
      if (this.state !== 'playing') return;
      if (e.code === 'Space') { e.preventDefault(); this.useBomb(); }
      if (e.code === 'KeyE') { e.preventDefault(); this.useSkill(); }
    });

    document.getElementById('btnBomb').addEventListener('click', () => { if (this.state === 'playing') this.useBomb(); });
    document.getElementById('btnBomb').addEventListener('touchstart', (e) => { e.preventDefault(); if (this.state === 'playing') this.useBomb(); });
    document.getElementById('btnSkill').addEventListener('click', () => { if (this.state === 'playing') this.useSkill(); });
    document.getElementById('btnSkill').addEventListener('touchstart', (e) => { e.preventDefault(); if (this.state === 'playing') this.useSkill(); });
  }

  // --- UI 绑定 ---
  setupUI() {
    document.getElementById('btnStory').addEventListener('click', () => this.showScreen('levelSelect'));
    document.getElementById('btnBackMenu').addEventListener('click', () => this.showScreen('menu'));
    document.getElementById('btnBackLevels').addEventListener('click', () => this.showScreen('levelSelect'));
    document.getElementById('btnUpgrade').addEventListener('click', () => { this.renderUpgradeScreen(); this.showScreen('upgrade'); });
    document.getElementById('btnBackDiff').addEventListener('click', () => this.showScreen('difficulty'));
    document.getElementById('btnStartLevel').addEventListener('click', () => this.startLevel());
    document.getElementById('btnRevive').addEventListener('click', () => this.revive());
    document.getElementById('btnGiveUp').addEventListener('click', () => this.gameOver());
    document.getElementById('btnNextLevel').addEventListener('click', () => this.nextLevel());
    document.getElementById('btnBackToMenu').addEventListener('click', () => this.showScreen('menu'));
    document.getElementById('btnRestart').addEventListener('click', () => this.showScreen('levelSelect'));
    document.getElementById('btnReturnMenu').addEventListener('click', () => this.showScreen('menu'));

    document.querySelectorAll('.diff-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.selectedDifficulty = parseInt(btn.dataset.diff);
      });
    });
  }

  // --- 界面切换 ---
  showScreen(name) {
    Object.values(screens).forEach(s => s.classList.add('hidden'));
    uiOverlay.classList.add('active');
    touchControls.classList.add('hidden');

    if (name === 'menu') {
      this.state = 'menu';
      screens.menu.classList.remove('hidden');
    } else if (name === 'levelSelect') {
      this.state = 'menu';
      this.renderLevelSelect();
      screens.levelSelect.classList.remove('hidden');
    } else if (name === 'difficulty') {
      screens.difficulty.classList.remove('hidden');
      const level = LEVELS[this.selectedLevel];
      document.getElementById('diffLevelName').textContent = `第${level.id}关: ${level.name}`;
    } else if (name === 'upgrade') {
      screens.upgrade.classList.remove('hidden');
    }
  }

  renderLevelSelect() {
    const grid = document.getElementById('levelGrid');
    grid.innerHTML = '';
    LEVELS.forEach((level, i) => {
      const unlocked = i < this.saveData.unlockedLevel;
      const card = document.createElement('div');
      card.className = 'level-card' + (unlocked ? '' : ' locked');
      const bestRating = this.saveData.bestRatings[i] || '-';
      card.innerHTML = `
        <div class="level-num">第${level.id}关</div>
        <div class="level-name">${level.name}</div>
        <div class="level-theme">${level.subtitle}</div>
        <div class="level-stars">${unlocked ? '最佳: ' + bestRating : '🔒'}</div>
      `;
      if (unlocked) {
        card.addEventListener('click', () => {
          this.selectedLevel = i;
          this.selectedDifficulty = 0;
          document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('selected'));
          document.querySelector('.diff-btn[data-diff="0"]').classList.add('selected');
          this.showScreen('difficulty');
        });
      }
      grid.appendChild(card);
    });
  }

  renderUpgradeScreen() {
    const list = document.getElementById('upgradeList');
    list.innerHTML = '';
    document.getElementById('upgradeGold').textContent = `💰 ${this.saveData.gold}`;

    Object.entries(UPGRADES).forEach(([key, def]) => {
      const currentLevel = this.saveData.upgrades[key] || 0;
      const maxed = currentLevel >= def.maxLevel;
      const cost = maxed ? 0 : Math.floor(def.baseCost * Math.pow(def.costGrowth, currentLevel));
      const canAfford = this.saveData.gold >= cost;

      const item = document.createElement('div');
      item.className = 'upgrade-item';
      item.innerHTML = `
        <span class="up-name">${def.icon} ${def.name}</span>
        <span class="up-level">Lv.${currentLevel}/${def.maxLevel}</span>
        <span class="up-cost">${maxed ? 'MAX' : '💰' + cost}</span>
      `;

      if (!maxed && canAfford) {
        const btn = document.createElement('button');
        btn.className = 'btn btn-sm btn-gold';
        btn.textContent = '升级';
        btn.addEventListener('click', () => {
          this.saveData.gold -= cost;
          this.saveData.upgrades[key] = currentLevel + 1;
          SaveSystem.save(this.saveData);
          this.renderUpgradeScreen();
        });
        item.appendChild(btn);
      }

      list.appendChild(item);
    });
  }

  // --- 关卡流程 ---
  startLevel() {
    const level = LEVELS[this.selectedLevel];
    const diff = DIFFICULTY[this.selectedDifficulty];

    this.state = 'levelIntro';
    this.levelIntroTimer = CONFIG.LEVEL_INTRO_TIME;

    document.getElementById('introLevelNum').textContent = `第${level.id}关`;
    document.getElementById('introLevelName').textContent = level.name;
    document.getElementById('introLevelTheme').textContent = level.subtitle;
    Object.values(screens).forEach(s => s.classList.add('hidden'));
    screens.levelIntro.classList.remove('hidden');

    this.score = 0;
    this.kills = 0;
    this.bossKills = 0;
    this.hitsTaken = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.comboTimer = 0;
    this.revivesLeft = CONFIG.MAX_REVIVES;
    this.bombs = 1;
    this.currentWave = 0;
    this.totalWaves = level.waves;
    this.waveTimer = 0;
    this.wavePause = true;
    this.wavePauseTimer = 1;
    this.bossSpawned = false;
    this.goldEarned = 0;
    this.levelStartTime = 0;
    this.damageNumbers = [];

    this.player.reset();
    this.player.applyUpgrades(this.saveData.upgrades);
    this.enemies = [];
    this.bullets = [];
    this.powerUps = [];
    this.currentBoss = null;
    this.particles = new ParticleSystem();

    this.background.setTheme(level.theme);
    this.hazards.init(level.hazard);

    this.mouseX = W / 2;
    this.mouseY = H - 100;

    this.enemySpawnTimer = 0;
  }

  beginPlaying() {
    this.state = 'playing';
    this.levelStartTime = performance.now() / 1000;
    Object.values(screens).forEach(s => s.classList.add('hidden'));
    uiOverlay.classList.remove('active');
    touchControls.classList.remove('hidden');
  }

  completeLevel() {
    this.state = 'levelComplete';
    const clearTime = performance.now() / 1000 - this.levelStartTime;
    const rating = calculateRating(this.selectedLevel, this.selectedDifficulty, clearTime, this.hitsTaken, this.maxCombo, this.kills);
    const gold = calculateGold(this.selectedLevel, this.selectedDifficulty, rating);
    this.goldEarned = gold;

    this.saveData.gold += gold;
    if (this.selectedLevel + 1 >= this.saveData.unlockedLevel && this.selectedLevel < LEVELS.length - 1) {
      this.saveData.unlockedLevel = this.selectedLevel + 2;
    }
    const prevRating = this.saveData.bestRatings[this.selectedLevel];
    const ratingOrder = { C: 0, B: 1, A: 2, S: 3 };
    if (!prevRating || ratingOrder[rating] > ratingOrder[prevRating]) {
      this.saveData.bestRatings[this.selectedLevel] = rating;
    }
    SaveSystem.save(this.saveData);

    document.getElementById('resultTime').textContent = Math.floor(clearTime) + 's';
    document.getElementById('resultHits').textContent = this.hitsTaken;
    document.getElementById('resultCombo').textContent = this.maxCombo;
    document.getElementById('resultKills').textContent = this.kills;
    document.getElementById('resultGold').textContent = '+' + gold;

    const ratingEl = document.getElementById('ratingDisplay');
    ratingEl.textContent = rating;
    ratingEl.className = 'rating rating-' + rating.toLowerCase();

    const nextBtn = document.getElementById('btnNextLevel');
    nextBtn.style.display = this.selectedLevel < LEVELS.length - 1 ? '' : 'none';

    screens.levelComplete.classList.remove('hidden');
    uiOverlay.classList.add('active');
    touchControls.classList.add('hidden');
  }

  nextLevel() {
    if (this.selectedLevel < LEVELS.length - 1) {
      this.selectedLevel++;
      this.startLevel();
    } else {
      this.showScreen('menu');
    }
  }

  die() {
    this.player.alive = false;
    this.state = 'dead';
    this.particles.emit(this.player.x, this.player.y, 40, ['#00e5ff', '#2196f3', '#ffffff', '#ff9800']);
    this.screenShake.trigger(8, 0.5);

    document.getElementById('deathScore').textContent = this.score;
    document.getElementById('reviveCount').textContent = `剩余复活次数: ${this.revivesLeft}`;
    document.getElementById('btnRevive').style.display = this.revivesLeft > 0 ? '' : 'none';

    screens.death.classList.remove('hidden');
    uiOverlay.classList.add('active');
    touchControls.classList.add('hidden');
  }

  revive() {
    if (this.revivesLeft <= 0) return;
    this.revivesLeft--;
    this.player.alive = true;
    this.player.hp = this.player.maxHp * 0.5;
    this.player.makeInvincible(4);
    this.state = 'playing';

    this.bullets = this.bullets.filter(b => {
      if (!b.isPlayer) {
        return Math.hypot(b.x - this.player.x, b.y - this.player.y) > 150;
      }
      return true;
    });

    screens.death.classList.add('hidden');
    uiOverlay.classList.remove('active');
    touchControls.classList.remove('hidden');
  }

  gameOver() {
    this.state = 'gameover';
    const gold = Math.floor(this.score * 0.1);
    this.saveData.gold += gold;
    SaveSystem.save(this.saveData);

    document.getElementById('finalScore').textContent = this.score;
    document.getElementById('killCount').textContent = this.kills;
    document.getElementById('bossKillCount').textContent = this.bossKills;
    document.getElementById('earnedGold').textContent = gold;

    Object.values(screens).forEach(s => s.classList.add('hidden'));
    screens.gameOver.classList.remove('hidden');
    uiOverlay.classList.add('active');
    touchControls.classList.add('hidden');
  }

  // --- 炸弹 & 技能 ---
  useBomb() {
    if (this.bombs <= 0) return;
    this.bombs--;
    this.screenShake.trigger(6, 0.4);
    this.particles.emit(W / 2, H / 2, 80, ['#ffffff', '#ffff00', '#ff9800', '#ff4444']);

    this.enemies.forEach(e => {
      const killed = e.takeDamage(999);
      if (killed || !e.alive) {
        this.score += e.score;
        this.kills++;
        this.addCombo();
        this.particles.emit(e.x, e.y, 15, ['#ff4444', '#ff9800', '#ffff00']);
      }
    });
    this.enemies = this.enemies.filter(e => e.alive);

    if (this.currentBoss && this.currentBoss.alive) {
      this.currentBoss.takeDamage(this.player.atk * 5);
    }
    this.bullets = this.bullets.filter(b => b.isPlayer);
  }

  useSkill() {
    if (this.player.skillCooldown > 0) return;
    const skillBullets = this.player.useSkill(this.enemies);
    this.bullets.push(...skillBullets);
    this.screenShake.trigger(3, 0.2);
    this.particles.emit(this.player.x, this.player.y, 20, ['#ff00ff', '#cc44ff', '#ffffff']);
  }

  // --- 连击 ---
  addCombo() {
    this.combo++;
    this.comboTimer = 3;
    if (this.combo > this.maxCombo) this.maxCombo = this.combo;
  }

  // --- 生成敌机 ---
  spawnWaveEnemies() {
    const level = LEVELS[this.selectedLevel];
    const diff = DIFFICULTY[this.selectedDifficulty];
    const count = 3 + Math.floor(this.currentWave * 0.8) + this.selectedDifficulty;

    for (let i = 0; i < count; i++) {
      const types = level.enemyTypes;
      const type = types[Math.floor(Math.random() * types.length)];
      const x = 30 + Math.random() * (W - 60);
      const delay = i * 0.4;
      setTimeout(() => {
        if (this.state === 'playing') {
          this.enemies.push(new Enemy(x, -20 - Math.random() * 30, type, diff));
        }
      }, delay * 1000);
    }
  }

  spawnBoss() {
    if (this.bossSpawned) return;
    this.bossSpawned = true;
    const diff = DIFFICULTY[this.selectedDifficulty];
    this.currentBoss = new Boss(this.selectedLevel, diff);
  }

  spawnPowerUp(x, y) {
    const r = Math.random();
    let type;
    if (r < 0.25) type = 'fire';
    else if (r < 0.45) type = 'shield';
    else if (r < 0.65) type = 'heal';
    else if (r < 0.82) type = 'bomb';
    else type = 'speed';
    this.powerUps.push(new PowerUp(x, y, type));
  }

  addDamageNumber(x, y, amount, color = '#fff') {
    this.damageNumbers.push({ x, y, text: Math.floor(amount).toString(), color, life: 0.8, vy: -60 });
  }

  // --- 更新 ---
  update(realDt) {
    this.slowMotion.update(realDt);
    const timeScale = this.slowMotion.getTimeScale();
    const dt = realDt * timeScale;

    this.background.update(dt);
    this.particles.update(dt);
    this.screenShake.update(dt);

    this.damageNumbers.forEach(d => { d.life -= realDt; d.y += d.vy * realDt; });
    this.damageNumbers = this.damageNumbers.filter(d => d.life > 0);

    if (this.state === 'levelIntro') {
      this.levelIntroTimer -= realDt;
      if (this.levelIntroTimer <= 0) this.beginPlaying();
      return;
    }

    if (this.state !== 'playing') return;

    // 连击衰减
    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) this.combo = 0;
    }

    // 波次管理
    if (this.currentWave < this.totalWaves) {
      if (this.wavePause) {
        this.wavePauseTimer -= dt;
        if (this.wavePauseTimer <= 0) {
          this.wavePause = false;
          this.currentWave++;
          this.spawnWaveEnemies();
          this.waveTimer = 0;
        }
      } else {
        this.waveTimer += dt;
        const level = LEVELS[this.selectedLevel];
        const waveInterval = level.baseSpawnRate;

        this.enemySpawnTimer -= dt;
        if (this.enemySpawnTimer <= 0 && this.waveTimer < 8) {
          const types = level.enemyTypes;
          const type = types[Math.floor(Math.random() * types.length)];
          const diff = DIFFICULTY[this.selectedDifficulty];
          this.enemies.push(new Enemy(30 + Math.random() * (W - 60), -20, type, diff));
          this.enemySpawnTimer = waveInterval + Math.random() * 0.5;
        }

        if (this.waveTimer > 10 && this.enemies.length === 0) {
          this.wavePause = true;
          this.wavePauseTimer = 1.5;
        }
      }
    } else if (!this.bossSpawned) {
      if (this.enemies.length === 0) {
        this.spawnBoss();
      }
    }

    // 玩家
    this.player.update(dt, this.mouseX, this.mouseY);
    const newBullets = this.player.shoot();
    this.bullets.push(...newBullets);

    // 敌机
    this.enemies.forEach(e => {
      e.update(dt, this.player.x, this.player.y);
      const eBullets = e.shoot(this.player.x, this.player.y);
      this.bullets.push(...eBullets);
    });

    // Boss
    if (this.currentBoss && this.currentBoss.alive) {
      this.currentBoss.update(dt);
      const bossBullets = this.currentBoss.shoot(this.player.x, this.player.y);
      this.bullets.push(...bossBullets);
    }

    // 子弹
    const allEnemyTargets = [...this.enemies, ...(this.currentBoss && this.currentBoss.alive ? [this.currentBoss] : [])];
    this.bullets.forEach(b => b.update(dt, b.isPlayer ? allEnemyTargets : null));
    this.bullets = this.bullets.filter(b => b.alive);

    // 道具
    this.powerUps.forEach(p => p.update(dt));
    this.powerUps = this.powerUps.filter(p => p.alive);

    // 危险区域
    this.hazards.update(dt, this.particles);

    // --- 碰撞检测 ---
    const playerRect = this.player.getRect();

    // 玩家子弹 vs 敌机
    this.bullets.forEach(b => {
      if (!b.isPlayer || !b.alive) return;
      const bRect = b.getRect();

      this.enemies.forEach(e => {
        if (!e.alive) return;
        if (rectsOverlap(bRect, e.getRect())) {
          if (b.pierce <= 0) b.alive = false;
          else b.pierce--;
          const killed = e.takeDamage(b.damage);
          this.addDamageNumber(b.x, b.y - 10, b.damage, b.damage > this.player.atk ? '#ffd700' : '#fff');
          this.particles.emit(b.x, b.y, 3, ['#ffffff', '#ffff00']);
          if (killed) {
            this.score += e.score;
            this.kills++;
            this.addCombo();
            this.particles.emit(e.x, e.y, 20, ['#ff4444', '#ff9800', '#ffff00', '#ffffff']);
            this.screenShake.trigger(2, 0.15);
            if (Math.random() < 0.18) this.spawnPowerUp(e.x, e.y);
          }
        }
      });

      if (this.currentBoss && this.currentBoss.alive && !this.currentBoss.entering) {
        if (rectsOverlap(bRect, this.currentBoss.getRect())) {
          if (b.pierce <= 0) b.alive = false;
          else b.pierce--;
          const killed = this.currentBoss.takeDamage(b.damage);
          this.particles.emit(b.x, b.y, 2, ['#ffffff', '#ff4444']);
          if (killed) {
            this.score += this.currentBoss.score;
            this.bossKills++;
            this.particles.emit(this.currentBoss.x, this.currentBoss.y, 80, ['#ff4444', '#ff9800', '#ffff00', '#ffffff', '#ff00aa']);
            this.slowMotion.trigger(this.currentBoss.x, this.currentBoss.y);
            this.screenShake.trigger(10, 1);
            this.bombs = Math.min(this.bombs + 1, 3);
            this.player.fireLevel = Math.min(this.player.fireLevel + 1, 5);
            this.currentBoss = null;

            setTimeout(() => {
              if (this.state === 'playing') this.completeLevel();
            }, 2000);
          }
        }
      }
    });

    // 敌弹 vs 玩家
    if (this.player.alive && !this.player.invincible) {
      this.bullets.forEach(b => {
        if (b.isPlayer || !b.alive) return;
        if (rectsOverlap(b.getRect(), playerRect)) {
          b.alive = false;
          const result = this.player.takeDamage(10);
          if (result === -1) {
            this.particles.emit(this.player.x, this.player.y, 15, ['#00aaff', '#00e5ff']);
            this.screenShake.trigger(2, 0.1);
          } else if (result > 0) {
            this.hitsTaken++;
            this.particles.emit(this.player.x, this.player.y, 8, ['#ff4444', '#ff6666']);
            this.screenShake.trigger(3, 0.15);
            if (!this.player.alive) this.die();
          }
        }
      });

      // 敌机碰撞
      this.enemies.forEach(e => {
        if (!e.alive) return;
        if (rectsOverlap(e.getRect(), playerRect)) {
          e.alive = false;
          this.particles.emit(e.x, e.y, 15, ['#ff4444', '#ff9800']);
          const result = this.player.takeDamage(20);
          if (result === -1) {
            this.particles.emit(this.player.x, this.player.y, 20, ['#00aaff', '#00e5ff']);
          } else {
            this.hitsTaken++;
            this.screenShake.trigger(4, 0.2);
            if (!this.player.alive) this.die();
          }
        }
      });

      // 危险区域伤害
      const hazardDmg = this.hazards.checkDamage(playerRect);
      if (hazardDmg > 0) {
        const result = this.player.takeDamage(hazardDmg);
        if (result > 0) {
          this.hitsTaken++;
          this.screenShake.trigger(3, 0.15);
          if (!this.player.alive) this.die();
        }
      }
    }

    // 玩家拾取道具
    if (this.player.alive) {
      this.powerUps.forEach(p => {
        if (!p.alive) return;
        if (rectsOverlap(p.getRect(), playerRect)) {
          p.alive = false;
          switch (p.type) {
            case 'fire':
              this.player.fireLevel = Math.min(this.player.fireLevel + 1, 5);
              break;
            case 'shield':
              this.player.shieldLayers = Math.min(this.player.shieldLayers + 1, 3);
              this.player.shieldTimer = CONFIG.SHIELD_DURATION;
              break;
            case 'heal':
              this.player.heal(20);
              break;
            case 'bomb':
              this.bombs = Math.min(this.bombs + 1, 3);
              break;
            case 'speed':
              this.player.speedBoosted = true;
              this.player.speedBoostTimer = CONFIG.SPEED_BOOST_DURATION;
              break;
          }
          this.particles.emit(p.x, p.y, 10, ['#ffffff', '#00e5ff', '#4caf50']);
        }
      });
    }

    this.enemies = this.enemies.filter(e => e.alive);
    this.powerUps = this.powerUps.filter(p => p.alive);
    this.bullets = this.bullets.filter(b => b.alive);
  }

  // --- HUD ---
  drawHUD() {
    // HP条
    const hpRatio = this.player.hp / this.player.maxHp;
    drawBar(10, H - 28, 100, 10, hpRatio, hpRatio > 0.5 ? '#4caf50' : hpRatio > 0.25 ? '#ff9800' : '#f44336');
    drawPixelTextLeft(`${Math.ceil(this.player.hp)}/${this.player.maxHp}`, 12, H - 20, '#fff', 1);

    // 护盾
    if (this.player.shieldLayers > 0) {
      for (let i = 0; i < this.player.shieldLayers; i++) {
        drawPixelRect(115 + i * 12, H - 28, 10, 10, '#00aaff');
      }
      drawPixelTextLeft(`${Math.ceil(this.player.shieldTimer)}s`, 115, H - 18, '#00aaff', 0.8);
    }

    // 分数
    drawPixelTextLeft(`SCORE: ${this.score}`, 10, 22, '#ffd700', 1.8);

    // 波次 / Boss
    if (!this.bossSpawned) {
      drawPixelText(`WAVE ${this.currentWave}/${this.totalWaves}`, W / 2, 50, '#aaa', 1.3);
    }

    // 炸弹
    for (let i = 0; i < this.bombs; i++) {
      drawPixelRect(W - 70 + i * 14, H - 28, 10, 10, '#ff9800');
      drawPixelText('B', W - 65 + i * 14, H - 18, '#000', 0.8);
    }

    // 火力等级
    const fireLvColors = ['#aaa', '#00e5ff', '#00ff88', '#ffd700', '#ff4444', '#ff00ff'];
    drawPixelTextLeft(`FIRE Lv.${this.player.fireLevel}`, 10, 42, fireLvColors[this.player.fireLevel], 1.3);

    // 技能CD
    if (this.player.skillCooldown > 0) {
      const cdRatio = this.player.skillCooldown / this.player.skillMaxCooldown;
      drawPixelTextLeft(`SKILL: ${Math.ceil(this.player.skillCooldown)}s`, W - 95, 22, '#888', 1.2);
    } else {
      drawPixelTextLeft('SKILL: OK', W - 95, 22, '#00ff88', 1.2);
    }

    // 连击
    if (this.combo > 1) {
      const comboAlpha = Math.min(1, this.comboTimer);
      ctx.globalAlpha = comboAlpha;
      drawPixelText(`${this.combo} COMBO!`, W / 2, 75, '#ffd700', 2);
      ctx.globalAlpha = 1;
    }

    // Boss警告
    if (this.currentBoss && this.currentBoss.entering) {
      const flash = Math.sin(Date.now() / 100) > 0;
      if (flash) drawPixelText('⚠ WARNING: BOSS ⚠', W / 2, H / 2 - 30, '#ff0000', 2.5);
      ctx.globalAlpha = 0.15;
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
    }

    // 伤害数字
    this.damageNumbers.forEach(d => {
      ctx.globalAlpha = Math.max(0, d.life);
      drawPixelText(d.text, d.x, d.y, d.color, 1.3);
      ctx.globalAlpha = 1;
    });

    // 速度提升
    if (this.player.speedBoosted) {
      drawPixelTextLeft(`SPEED x2 ${Math.ceil(this.player.speedBoostTimer)}s`, W / 2 - 40, H - 45, '#ffee00', 1.2);
    }
  }

  // --- 绘制 ---
  draw() {
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    this.screenShake.apply();

    this.background.draw();
    this.hazards.draw();
    this.powerUps.forEach(p => p.draw());
    this.enemies.forEach(e => e.draw());

    if (this.currentBoss && this.currentBoss.alive) this.currentBoss.draw();

    this.bullets.forEach(b => b.draw());
    this.player.draw();
    this.particles.draw();
    this.slowMotion.draw();

    if (this.state === 'playing' || this.state === 'dead') this.drawHUD();

    ctx.restore();

    // 扫描线效果
    ctx.fillStyle = 'rgba(0,0,0,0.03)';
    for (let y = 0; y < H; y += 3) ctx.fillRect(0, y, W, 1);
  }

  // --- 主循环 ---
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
game.run();
