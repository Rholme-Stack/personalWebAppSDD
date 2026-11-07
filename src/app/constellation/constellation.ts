import {
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { BustService } from './bust.service';
import { BustLayout, bustLayout } from './layout';
import {
  DAMP_FOLLOW_TAU,
  DAMP_RETURN_TAU,
  autoYaw,
  damp,
  motionMode,
  pointerToYaw,
  scrollProgress,
} from './motion';
import { SEED, buildNodes, bustRadius, mulberry32 } from './nodes';
import { ConstellationRenderer } from './renderer';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const MOUSE_QUERY = '(hover: hover) and (pointer: fine)';

/** The 3D particle bust behind the page (feature 003). Decorative: it never takes focus or clicks. */
@Component({
  selector: 'app-constellation',
  styleUrl: './constellation.css',
  templateUrl: './constellation.html',
})
export class Constellation {
  private readonly bust = inject(BustService);
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  private readonly reducedMotion = signal(matches(REDUCED_MOTION_QUERY));
  private readonly hasMouse = signal(matches(MOUSE_QUERY));
  protected readonly ready = signal(false);
  readonly mode = computed(() =>
    motionMode({ reducedMotion: this.reducedMotion(), hasMouse: this.hasMouse() }),
  );

  // Per-frame state: plain fields, not signals, so the 60 fps loop does not trigger change detection.
  private renderer: ConstellationRenderer | null = null;
  private layout: BustLayout | null = null;
  private radius = 1;
  private yaw = 0;
  private pointerYaw: number | null = null;
  private startTime = 0;
  private lastTime = 0;
  private frameId = 0;
  private destroyed = false;
  private readonly cleanups: (() => void)[] = [];

  constructor() {
    afterNextRender(() => void this.start());
    inject(DestroyRef).onDestroy(() => this.stop());
  }

  private async start(): Promise<void> {
    const canvas = this.canvas().nativeElement;
    this.renderer = ConstellationRenderer.create(canvas, () => {
      console.warn('Constellation disabled: WebGL context lost');
      this.stop();
    });
    if (!this.renderer) {
      console.warn('Constellation disabled: WebGL2 is not available');
      return;
    }
    const positions = await this.bust.load();
    if (!positions || this.destroyed) {
      this.stop();
      return;
    }

    this.radius = bustRadius(positions);
    this.renderer.setNodes(buildNodes(positions, mulberry32(SEED)));
    this.resize();
    this.listen(window, 'resize', () => this.resize());
    this.listen(window, 'pointermove', (event) => this.onPointerMove(event as PointerEvent));
    this.listen(window, 'pointerout', (event) => {
      if (!(event as PointerEvent).relatedTarget) {
        this.pointerYaw = null;
      }
    });
    this.watchMedia(REDUCED_MOTION_QUERY, this.reducedMotion);
    this.watchMedia(MOUSE_QUERY, this.hasMouse);
    this.frameId = requestAnimationFrame(this.frame);
  }

  private readonly frame = (now: number): void => {
    if (!this.renderer || !this.layout) {
      return;
    }
    if (!this.startTime) {
      this.startTime = this.lastTime = now;
    }
    const dt = Math.min(0.1, (now - this.lastTime) / 1000);
    const time = (now - this.startTime) / 1000;
    this.lastTime = now;

    const mode = this.mode();
    if (mode === 'still') {
      this.yaw = 0;
    } else if (mode === 'auto') {
      this.yaw = autoYaw(time);
    } else {
      const tau = this.pointerYaw === null ? DAMP_RETURN_TAU : DAMP_FOLLOW_TAU;
      this.yaw = damp(this.yaw, this.pointerYaw ?? 0, dt, tau);
    }

    const root = document.documentElement;
    this.renderer.draw({
      yaw: this.yaw,
      progress: scrollProgress(window.scrollY, root.scrollHeight, window.innerHeight),
      time,
      layout: this.layout,
      mode,
    });
    if (!this.ready()) {
      this.ready.set(true);
    }
    this.frameId = requestAnimationFrame(this.frame);
  };

  private onPointerMove(event: PointerEvent): void {
    if (event.pointerType !== 'mouse') {
      return;
    }
    if (!this.hasMouse()) {
      // A touch screen with a mouse: switch to following it, from the current angle.
      this.yaw = Math.atan2(Math.sin(this.yaw), Math.cos(this.yaw));
      this.hasMouse.set(true);
    }
    this.pointerYaw = pointerToYaw(event.clientX, window.innerWidth);
  }

  private resize(): void {
    this.layout = bustLayout(window.innerWidth, window.innerHeight, this.radius);
    this.renderer?.resize(window.innerWidth, window.innerHeight, window.devicePixelRatio || 1);
  }

  private listen(target: EventTarget, type: string, handler: (event: Event) => void): void {
    target.addEventListener(type, handler, { passive: true });
    this.cleanups.push(() => target.removeEventListener(type, handler));
  }

  private watchMedia(query: string, state: ReturnType<typeof signal<boolean>>): void {
    const list = window.matchMedia?.(query);
    if (list) {
      this.listen(list, 'change', () => state.set(list.matches));
    }
  }

  private stop(): void {
    this.destroyed = true;
    cancelAnimationFrame(this.frameId);
    this.cleanups.splice(0).forEach((cleanup) => cleanup());
    this.renderer?.dispose();
    this.renderer = null;
    this.ready.set(false);
  }
}

function matches(query: string): boolean {
  return window.matchMedia?.(query).matches ?? false;
}
