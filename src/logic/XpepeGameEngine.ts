// --- file: src/logic/XpepeGameEngine.ts
// Dino runner engine (refactor):
// - Cactus întotdeauna pe sol (aliniere din DOM: container & ground)
// - Fizică cu dt, clamp pe dt, accelerație viteză
// - Păstrează stilurile/SVG existente în DOM prin className (ex: .cactus, .pterodactyl)
// - Start/Pause/Resume/Restart, Space/Up pentru săritură, Down pentru duck/fast-fall, R pentru restart
// - Score + HiScore în localStorage
// - Pterodactyl apare după un scor minim și zboară pe 3 înălțimi fixe
// - Coliziune cu hitbox padding

export type DinoGameOptions = {
  onScoreChange?: (score: number) => void;
  onGameOver?: (finalScore: number) => void;
  container?: HTMLElement | string; // default '#gameContainer'
  dino?: HTMLElement | string;      // default '#dino'
  ground?: HTMLElement | string;    // default '#ground'
  score?: HTMLElement | string;     // default '#score'
  overlay?: HTMLElement | string;   // default '#gameOver'
  enemyClasses?: { cactus?: string; bird?: string };
  autoStart?: boolean;
  hiScoreKey?: string;
};

type ObType = 'cactus' | 'bird';
type Phase = 'idle' | 'running' | 'paused' | 'gameover' | 'destroyed';

type Rect = { x: number; y: number; w: number; h: number };
const overlap = (A: Rect, B: Rect) => A.x < B.x + B.w && A.x + A.w > B.x && A.y < B.y + B.h && A.y + A.h > B.y;

const K = {
  GRAVITY: 2000,
  JUMP_V: 680,
  FAST_FALL: 2600,
  START_SPEED: 360,
  MAX_SPEED: 600,
  ACCEL_PER_SEC: 5,
  SCORE_PER_PX: 0.02,
  SPAWN_BASE: 1.55,      // sec
  HITBOX_PAD: 6
} as const;

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const clampDt = (ms: number) => clamp(ms / 1000, 0, 0.05);
const rnd = (a: number, b: number) => a + Math.random() * (b - a);

export default class DinoGame {
  // DOM
  private container!: HTMLElement;
  private dinoEl!: HTMLElement;
  private groundEl!: HTMLElement;
  private scoreEl!: HTMLElement;
  private overlayEl!: HTMLElement;

  // world (pixeli în coordonate container)
  private worldW = 800;
  private worldH = 300;
  private groundY = 260;
  private prevGroundY = 260; // topul solului (y) = worldH - groundHeight

  // player
  private dino = {
    x: 120,
    y: 0,
    w: 44,
    h: 50,
    baseH: 50,
    vy: 0,
    onGround: true,
    duck: false,
    dead: false,
    animT: 0
  };

  // gameplay
  private speed = K.START_SPEED;
  private score = 0;
  private hiscore = 0;
  private spawnT = 0;

  // obstacles
  private obstacles: Array<{ id: number; type: ObType; x: number; y: number; w: number; h: number; flapT: number; group: number; el: HTMLElement }> = [];
  private idGen = 1;

  // loop
  private last = performance.now();
  private raf: number | null = null;
  private phase: Phase = 'idle';

  // input
  private input = { jump: false, down: false, justJump: false };

  // opts
  private opts: Required<Pick<DinoGameOptions, 'hiScoreKey' | 'autoStart'>> & { enemyClasses: { cactus: string; bird: string } };
  private resizeObs?: ResizeObserver;

  constructor(opts: DinoGameOptions = {}) {
    this.opts = {
      onScoreChange: opts.onScoreChange,
      onGameOver: opts.onGameOver,
      container: (opts.container as any) ?? '#gameContainer',
      dino: (opts.dino as any) ?? '#dino',
      ground: (opts.ground as any) ?? '#ground',
      score: (opts.score as any) ?? '#score',
      overlay: (opts.overlay as any) ?? '#gameOver',
      enemyClasses: { cactus: opts.enemyClasses?.cactus ?? 'cactus', bird: opts.enemyClasses?.bird ?? 'pterodactyl' },
      autoStart: opts.autoStart ?? false,
      hiScoreKey: opts.hiScoreKey ?? 'xpepe_hiscore_dom'
    } as any;

    // map DOM
    this.container = this.resolveEl(this.opts.container, 'container');
    this.dinoEl = this.resolveEl(this.opts.dino, 'dino');
    this.groundEl = this.resolveEl(this.opts.ground, 'ground');
    this.scoreEl = this.resolveEl(this.opts.score, 'score');
    this.overlayEl = this.resolveEl(this.opts.overlay, 'overlay');

    // init world & player pos pe sol
    this.syncWorldFromDOM();
    this.dino.y = this.groundY - this.dino.h;
    Object.assign(this.dinoEl.style, {
      position: 'absolute',
      left: `${this.dino.x}px`,
      bottom: `${this.uiBottom(this.dino.y, this.dino.h)}px`,
      willChange: 'left,bottom'
    } as CSSStyleDeclaration);

    // hi-score UI
    this.hiscore = Number(localStorage.getItem(this.opts.hiScoreKey) || 0);
    this.updateScoreUI();

    // input + overlay
    this.attachInput();
    this.setOverlay('idle');
    if (this.opts.autoStart) { this.phase = 'running'; this.setOverlay(null); }

    // ținem world sync cu DOM (resize, schimbări CSS)
    this.resizeObs = new ResizeObserver(() => this.syncWorldFromDOM());
    this.resizeObs.observe(this.container);

    // loop
    this.loop = this.loop.bind(this);
    this.raf = requestAnimationFrame(this.loop);
  }

  /*** Public API ***/
  start() { if (this.phase === 'idle') { this.phase = 'running'; this.setOverlay(null); } }
  pauseGame() { if (this.phase === 'running') { this.phase = 'paused'; this.setOverlay('paused'); } }
  resumeGame() { if (this.phase === 'paused') { this.phase = 'running'; this.setOverlay(null); this.last = performance.now(); } }
  restartGame() { this.reset(); this.phase = this.opts.autoStart ? 'running' : 'idle'; this.setOverlay(this.phase === 'idle' ? 'idle' : null); this.last = performance.now(); }
  destroy() { this.phase = 'destroyed'; if (this.raf) cancelAnimationFrame(this.raf); this.raf = null; this.obstacles.forEach(o => o.el.remove()); this.obstacles = []; this.resizeObs?.disconnect(); }
  getScore() { return Math.floor(this.score); }
  getHiScore() { return Math.floor(this.hiscore); }

  /*** Private ***/
  private resolveEl(ref: HTMLElement | string, name: string): HTMLElement {
    if (typeof ref === 'string') {
      const el = document.querySelector(ref) as HTMLElement | null;
      if (!el) throw new Error(`Selector not found for ${name}: ${ref}`);
      return el;
    }
    return ref;
  }

  private uiBottom(y: number, h: number) { return this.worldH - (y + h); }

  private setOverlay(kind: 'idle' | 'paused' | 'gameover' | null) {
    if (!this.overlayEl) return;
    this.overlayEl.style.display = kind ? 'block' : 'none';
    this.overlayEl.setAttribute('data-state', kind ?? 'hidden');
  }

  private attachInput() {
    const key = (e: KeyboardEvent, down: boolean) => {
      const code = e.code;
      if (["ArrowUp", "Space", "KeyW"].includes(code)) { if (down) this.input.justJump = true; this.input.jump = down; e.preventDefault(); }
      if (["ArrowDown", "KeyS"].includes(code)) { this.input.down = down; e.preventDefault(); }
      if (down && code === 'KeyR') { this.restartGame(); }
      if (down && code === 'Space' && this.phase === 'gameover') { this.restartGame(); }
      if (down && code === 'Space' && this.phase === 'idle') { this.phase = 'running'; this.setOverlay(null); this.jump(); }
    };
    const kd = (e: KeyboardEvent) => key(e, true);
    const ku = (e: KeyboardEvent) => key(e, false);
    window.addEventListener('keydown', kd);
    window.addEventListener('keyup', ku);

    const pd = (e: PointerEvent) => { this.input.down = true; this.container.setPointerCapture(e.pointerId); };
    const pu = (e: PointerEvent) => { this.input.down = false; this.input.justJump = true; this.container.releasePointerCapture(e.pointerId); };
    this.container.addEventListener('pointerdown', pd);
    this.container.addEventListener('pointerup', pu);

    // cleanup la destroy (opțional: expune o metodă publică dacă e necesar)
  }

  private reset() {
    // cleanup obstacole
    for (const o of this.obstacles) o.el.remove();
    this.obstacles = [];

    // joc
    this.speed = K.START_SPEED;
    this.score = 0;
    this.spawnT = 0;

    // player
    this.dino.vy = 0;
    this.dino.duck = false;
    this.dino.dead = false;
    this.dino.onGround = true;
    this.dino.h = this.dino.baseH;
    this.syncWorldFromDOM();
    this.dino.y = this.groundY - this.dino.h;
    this.applyDinoStyle();
    this.updateScoreUI();
  }

  private applyDinoStyle() {
    this.dinoEl.classList.toggle('duck', this.dino.duck);
    this.dinoEl.style.left = `${this.dino.x}px`;
    this.dinoEl.style.bottom = `${this.uiBottom(this.dino.y, this.dino.h)}px`;
    this.dinoEl.style.width = `${this.dino.w}px`;
    this.dinoEl.style.height = `${this.dino.h}px`;
  }

  private jump() {
    if (this.dino.onGround && !this.dino.dead) {
      this.dino.onGround = false;
      this.dino.vy = -K.JUMP_V; // coord y cresc descendent spre jos, de aceea semn negativ pentru în sus
    }
  }

  private loop() {
    if (this.phase === 'destroyed') return;
    this.raf = requestAnimationFrame(this.loop);

    const now = performance.now();
    const dt = clampDt(now - this.last);
    this.last = now;

    if (this.phase !== 'running') return;

    // mapare world din DOM la fiecare frame (evită "floating" după resize/stil)
    this.syncWorldFromDOM();

    // viteză
    this.speed = clamp(this.speed + K.ACCEL_PER_SEC * dt, K.START_SPEED, K.MAX_SPEED);

    // dino fizică
    if (this.dino.onGround) {
      this.dino.duck = this.input.down;
      this.dino.h = this.dino.duck ? Math.max(24, Math.floor(this.dino.baseH * 0.6)) : this.dino.baseH;
      this.dino.y = this.groundY - this.dino.h;
    } else {
      this.dino.vy += (this.input.down ? K.FAST_FALL : K.GRAVITY) * dt;
    }
    if (this.input.justJump) { this.jump(); this.input.justJump = false; }
    if (!this.dino.onGround) {
      this.dino.y += this.dino.vy * dt;
      // plafon: nu permite ieșirea din ecran în sus
      if (this.dino.y < 0) { this.dino.y = 0; if (this.dino.vy < 0) this.dino.vy = 0; }
      if (this.dino.y >= this.groundY - this.dino.h) { // a atins solul
        this.dino.y = this.groundY - this.dino.h;
        this.dino.vy = 0;
        this.dino.onGround = true;
      }
    }
    this.dino.animT += dt;
    this.applyDinoStyle();

    // spawn
    this.spawnT -= dt;
    if (this.spawnT <= 0) {
      const allowBird = this.score > 150; // pterodactyl după 350 pt
      const type: ObType = (allowBird && Math.random() < 0.25) ? 'bird' : 'cactus';
      this.spawn(type);
      const base = K.SPAWN_BASE / (1 + (this.speed - K.START_SPEED) / 600);
      this.spawnT = rnd(base * 0.6, base * 1.4);
    }

    // update obstacole
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const ob = this.obstacles[i];
      ob.x -= this.speed * dt;
      if (ob.type === 'bird') { ob.flapT += dt; }
      if (ob.x + ob.w < 0) { ob.el.remove(); this.obstacles.splice(i, 1); continue; }
      this.applyObstacleStyle(ob);
    }

    // score
    this.score += this.speed * dt * K.SCORE_PER_PX;
    this.updateScoreUI();

    // coliziune
    const pad = K.HITBOX_PAD;
    const d: Rect = { x: this.dino.x + pad, y: this.dino.y + pad, w: this.dino.w - pad * 2, h: this.dino.h - pad * 2 };
    for (const o of this.obstacles) {
      const r: Rect = { x: o.x + pad, y: o.y + pad, w: o.w - pad * 2, h: o.h - pad * 2 };
      if (overlap(d, r)) { this.gameOver(); break; }
    }
  }

  private spawn(type: ObType) {
    if (type === 'cactus') {
      // 1-4 cactuși grupați, DAR pe sol, aliniați la groundY
      // const count = (Math.random() < 0.75) ? 1 : ((Math.random() < 0.5) ? 2 : 3); // old cactus spawn
      const count = rnd(1,5) | 0;;
      let offset = 0;
      for (let i = 0; i < count; i++) {
        const ob = this.createObstacle('cactus');
        ob.w = rnd(22, 34) | 0;
        ob.h = 44 | 0; // aici se futea inaltimea la cactusi.. nu stiu cine a venit cu idea sa faca asta random
        ob.x = this.worldW + offset;
        ob.y = this.groundY - ob.h; // EXACT pe sol
        offset += ob.w + rnd(6, 14);
        this.applyObstacleStyle(ob);
        this.obstacles.push(ob);
      }
    } else {
      // pterodactyl (3 niveluri fixe peste sol)
      const ob = this.createObstacle('bird');
      ob.w = 46; ob.h = 34;
      const levels = [this.groundY - 100, this.groundY - 70, this.groundY - 40];
      ob.y = levels[(Math.random() * levels.length) | 0];
      this.applyObstacleStyle(ob);
      this.obstacles.push(ob);
    }
  }

  private createObstacle(type: ObType) {
    const el = document.createElement('div');
    el.className = type === 'cactus' ? this.opts.enemyClasses.cactus : this.opts.enemyClasses.bird;
    el.style.position = 'absolute';
    this.container.appendChild(el);
    return { id: this.idGen++, type, x: this.worldW + 20, y: 0, w: 26, h: 46, flapT: 0, group: 0, el };
  }

  private applyObstacleStyle(o: { x: number; y: number; w: number; h: number; el: HTMLElement; type: ObType; flapT: number; group: number }) {
    o.el.style.left = `${o.x}px`;
    o.el.style.bottom = `${this.uiBottom(o.y, o.h)}px`;
    o.el.style.width = `${o.w}px`;
    o.el.style.height = `${o.h}px`;
    if (o.type === 'bird') {
      // simplu toggle de aripi pe un data-attr (poți anima în CSS)
      o.el.setAttribute('data-wing', (((o.flapT * 8) % 2) < 1) ? 'up' : 'down');
    }
  }

  private gameOver() {
    this.phase = 'gameover';
    this.dino.dead = true;
    if (this.score > this.hiscore) {
      this.hiscore = this.score;
      localStorage.setItem(this.opts.hiScoreKey, String(this.hiscore | 0));
    }
    this.updateScoreUI();
    this.setOverlay('gameover');
    this.opts.onGameOver?.(Math.floor(this.score));
  }

  private updateScoreUI() {
    if (!this.scoreEl) return;
    const s = String(Math.floor(this.score)).padStart(5, '0');
    const h = String(Math.floor(this.hiscore)).padStart(5, '0');
    this.scoreEl.textContent = `HI ${h}   ${s}`;
    this.opts.onScoreChange?.(Math.floor(this.score));
  }

  private syncWorldFromDOM = () => {
    const cr = this.container.getBoundingClientRect();
    this.worldW = Math.max(1, Math.round(cr.width));
    this.worldH = Math.max(1, Math.round(cr.height));

    this.prevGroundY = this.groundY;
    // Presupunem ground aliniat la bottom: "bottom:0" în container
    const gh = this.groundEl ? (this.groundEl as HTMLElement).offsetHeight : 0;
    this.groundY = Math.round(this.worldH - gh);

    // Dacă s-a schimbat groundY (ex: resize/CSS), realiniem entitățile la sol
    if (this.groundY !== this.prevGroundY) {
      // dino pe sol dacă este onGround
      if (this.dino.onGround) {
        this.dino.y = this.groundY - this.dino.h;
        this.applyDinoStyle();
      }
      // cactuși pe sol
      for (const o of this.obstacles) {
        if (o.type === 'cactus') {
          o.y = this.groundY - o.h + 10; // ajustare manuală -10px vizual
          this.applyObstacleStyle(o);
        }
      }
    }
  };
}
