import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, ViewChild, inject } from '@angular/core';

type Block = {
  x: number;
  y: number;
  z: number;
  w: number;
  h: number;
  phase: number;
  speed: number;
  spin: number;
  floatAmp: number;
  baseAlpha: number;
  hub: boolean;
};

type Mode = { density: number; opacity: number; fps: number; largeBlocks: boolean };

const HERO: Mode = { density: 1, opacity: 1, fps: 60, largeBlocks: true };
const AMBIENT: Mode = { density: 0.45, opacity: 0.3, fps: 30, largeBlocks: false };

/**
 * Campo de cubos wireframe + spotlight que segue o pointer.
 * Portado do motion background de portfolio-davidpinho.vercel.app, com a paleta esmeralda deste currículo.
 */
@Component({
  selector: 'app-ambient-field',
  standalone: true,
  template: `
    <div
      #field
      class="ambient-field"
      aria-hidden="true"
      [attr.data-mode]="modeName"
    >
      <div #glow class="ambient-glow"></div>
      <div #spot class="ambient-spot"></div>
      <canvas #canvas class="ambient-canvas"></canvas>
      <div class="ambient-vignette"></div>
    </div>
  `,
})
export class AmbientFieldComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true }) private canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('glow', { static: true }) private glowRef!: ElementRef<HTMLElement>;
  @ViewChild('spot', { static: true }) private spotRef!: ElementRef<HTMLElement>;

  private readonly zone = inject(NgZone);
  modeName: 'hero' | 'ambient' = 'hero';

  private raf = 0;
  private running = false;
  private visible = true;
  private reduced = false;
  private coarse = false;
  private blocks: Block[] = [];
  private rgb: [number, number, number] = [62, 214, 163];
  private pointer = { x: 0, y: 0 };
  private cursor = { x: 0, y: 0 };
  private lastFrame = 0;
  private origin = 0;
  private width = 0;
  private height = 0;
  private mode: Mode = { ...HERO };
  private target: Mode = { ...HERO };
  private blend = 1;
  private scrollT = 0;

  private readonly onMove = (e: MouseEvent): void => {
    if (this.coarse) return;
    this.pointer.x = e.clientX;
    this.pointer.y = e.clientY;
  };
  private readonly onScroll = (): void => this.syncScroll();
  private readonly onResize = (): void => this.resize();
  private readonly onVisibility = (): void => {
    this.running = !document.hidden;
    if (this.running && this.visible && !this.reduced) this.kick();
    else this.stop();
  };

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.coarse = window.matchMedia('(hover: none)').matches;
    this.rgb = this.readRgb();
    this.pointer.x = window.innerWidth * 0.62;
    this.pointer.y = window.innerHeight * 0.28;
    this.cursor = { ...this.pointer };

    this.zone.runOutsideAngular(() => {
      this.resize();
      this.syncScroll();
      this.applySpotlight();
      this.draw(ctx, 0);
      if (!this.reduced) this.kick();

      window.addEventListener('mousemove', this.onMove, { passive: true });
      window.addEventListener('scroll', this.onScroll, { passive: true });
      window.addEventListener('resize', this.onResize, { passive: true });
      document.addEventListener('visibilitychange', this.onVisibility);
    });
  }

  ngOnDestroy(): void {
    this.stop();
    window.removeEventListener('mousemove', this.onMove);
    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('resize', this.onResize);
    document.removeEventListener('visibilitychange', this.onVisibility);
  }

  private readRgb(): [number, number, number] {
    const raw = getComputedStyle(document.documentElement).getPropertyValue('--ambient-rgb').trim();
    const parts = raw.split(',').map((n) => Number(n.trim()));
    if (parts.length === 3 && parts.every((n) => Number.isFinite(n))) {
      return [parts[0], parts[1], parts[2]];
    }
    return [62, 214, 163];
  }

  private seed(count: number, w: number, h: number): Block[] {
    const blocks: Block[] = [];
    const hubs = Math.max(3, Math.floor(count * 0.12));
    for (let i = 0; i < count; i++) {
      const hub = i < hubs;
      const z = hub ? 0.55 + 0.45 * Math.random() : 0.3 + 0.7 * Math.random();
      const size = hub
        ? (28 + 26 * Math.random()) * (0.7 + 0.4 * z)
        : Math.random() > 0.75
          ? (18 + 16 * Math.random()) * z
          : Math.random() > 0.4
            ? (12 + 10 * Math.random()) * z
            : (7 + 8 * Math.random()) * z;
      const dir = Math.random() > 0.5 ? 1 : -1;
      blocks.push({
        x: Math.random() * w,
        y: Math.random() * h,
        z,
        w: size,
        h: size * (0.7 + 0.55 * Math.random()),
        phase: Math.random() * Math.PI * 2,
        speed: hub ? 0.12 + 0.18 * Math.random() : 0.18 + 0.42 * Math.random(),
        spin: dir * (hub ? 0.12 + 0.18 * Math.random() : 0.18 + 0.55 * Math.random()),
        floatAmp: hub ? 14 + 18 * Math.random() : 18 + 32 * Math.random(),
        baseAlpha: hub ? 0.18 + 0.1 * Math.random() : 0.14 + 0.1 * Math.random(),
        hub,
      });
    }
    return blocks;
  }

  private resize(): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    canvas.width = Math.floor(this.width * dpr);
    canvas.height = Math.floor(this.height * dpr);
    canvas.style.width = `${this.width}px`;
    canvas.style.height = `${this.height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = this.coarse || this.width < 768 ? 18 : 36;
    this.blocks = this.seed(count, this.width, this.height);
  }

  private syncScroll(): void {
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    this.scrollT = window.scrollY / max;
    const hero = window.scrollY < window.innerHeight * 0.62;
    const next = hero ? HERO : AMBIENT;
    const name: 'hero' | 'ambient' = hero ? 'hero' : 'ambient';
    if (this.width < 768) {
      this.target = { ...AMBIENT, density: AMBIENT.density * 0.6 };
    } else {
      this.target = { ...next };
    }
    if (name !== this.modeName) {
      this.modeName = name;
      this.blend = 0;
      this.canvasRef.nativeElement.closest('.ambient-field')?.setAttribute('data-mode', name);
    }
    if (this.coarse || this.reduced) {
      this.pointer.x = this.width * (0.35 + 0.3 * this.scrollT);
      this.pointer.y = this.height * (0.22 + 0.18 * Math.sin(this.scrollT * Math.PI));
    }
  }

  private applySpotlight(): void {
    const x = `${this.cursor.x}px`;
    const y = `${this.cursor.y}px`;
    const gi = String((0.5 + 0.28 * this.scrollT) * this.mode.opacity);
    this.glowRef.nativeElement.style.setProperty('--lx', x);
    this.glowRef.nativeElement.style.setProperty('--ly', y);
    this.glowRef.nativeElement.style.setProperty('--gi', gi);
    this.spotRef.nativeElement.style.setProperty('--lx', x);
    this.spotRef.nativeElement.style.setProperty('--ly', y);
  }

  private pose(block: Block, t: number, pulse: number): { cx: number; cy: number; angle: number; scale: number } {
    const amp = block.floatAmp;
    const n =
      Math.sin(t * block.speed * pulse + block.phase) * amp +
      Math.sin(t * block.speed * 0.37 * pulse + 1.7 * block.phase) * amp * 0.35;
    const i =
      Math.cos(t * block.speed * 0.9 * pulse + block.phase) * amp * 0.85 +
      Math.sin(t * block.speed * 0.55 * pulse + block.phase) * amp * 0.4;
    return {
      cx: block.x + n,
      cy: block.y + i,
      angle: t * block.spin * pulse + block.phase + 0.18 * Math.sin(t * block.speed * 0.6 * pulse + block.phase),
      scale: 0.92 + 0.08 * block.z + 0.06 * Math.sin(t * block.speed * 1.1 * pulse + block.phase) + (block.hub ? 0.04 : 0),
    };
  }

  private cube(
    ctx: CanvasRenderingContext2D,
    block: Block,
    alpha: number,
    near: number,
    t: number,
    rgb: [number, number, number],
    large: boolean,
  ): void {
    if (block.hub && !large) return;
    const [r, g, b] = rgb;
    const stroke = block.hub ? 1.25 : 1;
    const hw = block.w / 2;
    const hh = block.h / 2;
    const left = -hw;
    const top = -hh;
    const fade = Math.min(0.42, alpha);
    const vx = 0.32 * block.w * block.z;
    const vy = 0.26 * block.h * block.z;

    ctx.beginPath();
    ctx.moveTo(left + block.w, top);
    ctx.lineTo(left + block.w + vx, top - vy);
    ctx.lineTo(left + block.w + vx, top + block.h - vy);
    ctx.lineTo(left + block.w, top + block.h);
    ctx.closePath();
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.18 * fade})`;
    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.7 * fade})`;
    ctx.lineWidth = stroke;
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(left, top);
    ctx.lineTo(left + 0.55 * vx, top - vy);
    ctx.lineTo(left + block.w + vx, top - vy);
    ctx.lineTo(left + block.w, top);
    ctx.closePath();
    ctx.fillStyle = `rgba(255, 255, 255, ${0.1 * fade + 0.06 * near})`;
    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.55 * fade})`;
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${fade * (block.hub ? 0.28 : 0.2)})`;
    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${fade * (block.hub ? 1.35 : 1.15)})`;
    ctx.beginPath();
    ctx.rect(left, top, block.w, block.h);
    ctx.fill();
    ctx.stroke();

    const pulse = block.hub ? 0.5 + 0.5 * Math.sin(1.6 * t + block.phase) : near;
    if (pulse > 0.2 || block.hub) {
      const radius = (block.hub ? 2 : 1) + pulse * (block.hub ? 2.2 : 1.3);
      ctx.beginPath();
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.25 + 0.45 * pulse})`;
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private draw(ctx: CanvasRenderingContext2D, t: number): void {
    const [r, g, b] = this.rgb;
    const { density, opacity, largeBlocks } = this.mode;
    const count = Math.max(4, Math.floor(this.blocks.length * density));
    const nodes: { x: number; y: number; hub: boolean; near: number }[] = [];
    const poses: { cx: number; cy: number; angle: number; scale: number }[] = [];

    for (let i = 0; i < count; i++) {
      const block = this.blocks[i];
      const pose = this.pose(block, t, 1);
      poses.push(pose);
      const near = Math.max(0, 1 - Math.hypot(this.cursor.x - pose.cx, this.cursor.y - pose.cy) / (280 + 150 * block.z));
      nodes.push({ x: pose.cx, y: pose.cy, hub: block.hub && largeBlocks, near });
    }

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const c = nodes[j];
        const dist = Math.hypot(a.x - c.x, a.y - c.y);
        const max = a.hub || c.hub ? 236 : 175;
        if (dist > max) continue;
        const alpha = (0.05 + 0.12 * (1 - dist / max) + 0.1 * Math.max(a.near, c.near)) * (a.hub || c.hub ? 1.3 : 1) * opacity;
        if (alpha < 0.03) continue;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.lineWidth = a.hub || c.hub ? 1.1 : 0.7;
        ctx.setLineDash(a.hub && c.hub ? [3, 5] : [2, 6]);
        ctx.lineDashOffset = -(14 * t);
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(c.x, c.y);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    for (let i = 0; i < count; i++) {
      const block = this.blocks[i];
      const pose = poses[i];
      const near = nodes[i].near;
      const alpha = Math.min(0.4, (block.baseAlpha + 0.16 * near) * opacity);
      if (!largeBlocks && !block.hub) {
        ctx.beginPath();
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.55 * alpha * 1.4})`;
        ctx.arc(pose.cx, pose.cy, 1.2, 0, Math.PI * 2);
        ctx.fill();
        if (block.w < 14) continue;
      }
      if (block.hub && !largeBlocks) {
        ctx.beginPath();
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.55 * alpha})`;
        ctx.arc(pose.cx, pose.cy, 1.2, 0, Math.PI * 2);
        ctx.fill();
        continue;
      }
      ctx.save();
      ctx.translate(pose.cx, pose.cy);
      ctx.rotate(pose.angle + 0.45 * near);
      ctx.scale(pose.scale * (1 + 0.08 * near), pose.scale * (1 + 0.08 * near));
      this.cube(ctx, block, alpha, near, t, this.rgb, largeBlocks);
      ctx.restore();
    }

    this.canvasRef.nativeElement.style.opacity = String(0.55 + 0.4 * opacity);
  }

  private tick = (now: number): void => {
    if (!this.running) return;
    const ctx = this.canvasRef.nativeElement.getContext('2d');
    if (!ctx) return;
    const fps = this.mode.fps;
    if (now - this.lastFrame < 1000 / fps - 0.5) {
      this.raf = requestAnimationFrame(this.tick);
      return;
    }
    const dt = Math.min(0.05, (now - this.lastFrame) / 1000 || 0.016);
    this.lastFrame = now;
    if (this.blend < 1) {
      this.blend = Math.min(1, this.blend + (1000 * dt) / 600);
      const e = 1 - Math.pow(1 - this.blend, 3);
      this.mode = {
        density: this.mode.density + (this.target.density - this.mode.density) * e,
        opacity: this.mode.opacity + (this.target.opacity - this.mode.opacity) * e,
        fps: this.mode.fps + (this.target.fps - this.mode.fps) * e,
        largeBlocks: this.blend > 0.5 ? this.target.largeBlocks : this.mode.largeBlocks,
      };
    }
    this.cursor.x += (this.pointer.x - this.cursor.x) * 0.06;
    this.cursor.y += (this.pointer.y - this.cursor.y) * 0.06;
    if (this.coarse) {
      const t = (now - this.origin) / 1000;
      const ax = this.width * 0.5 + Math.sin(0.12 * t) * this.width * 0.18;
      const ay = this.height * 0.35 + Math.cos(0.09 * t) * this.height * 0.12;
      this.cursor.x += (ax - this.cursor.x) * 0.02;
      this.cursor.y += (ay - this.cursor.y) * 0.02;
    }
    this.applySpotlight();
    ctx.clearRect(0, 0, this.width, this.height);
    this.draw(ctx, (now - this.origin) / 1000);
    this.raf = requestAnimationFrame(this.tick);
  };

  private kick(): void {
    this.stop();
    this.running = true;
    this.visible = true;
    this.lastFrame = 0;
    this.origin = performance.now();
    this.raf = requestAnimationFrame(this.tick);
  }

  private stop(): void {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }
}
