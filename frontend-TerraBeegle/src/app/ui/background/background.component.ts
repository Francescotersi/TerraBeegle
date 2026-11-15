import {
  Component,
  ElementRef,
  ViewChild,
  Input,
  AfterViewInit,
  OnDestroy,
  NgZone,
  inject,
  PLATFORM_ID,
  ChangeDetectionStrategy,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ThemeService } from '../../services/theme.service';
import { renderWaveFrame } from './wave-canvas.utils';

/** Full-screen animated 2D canvas wave background that adapts to light and dark themes. */
@Component({
  selector: 'app-background',
  standalone: true,
  template: `
    <div class="wave-bg-container" aria-hidden="true">
      <canvas #waveCanvas class="wave-canvas"></canvas>
      <div class="ambient-sheen"></div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      position: fixed;
      inset: 0;
      width: 100vw;
      height: 100vh;
      z-index: 0;
      pointer-events: none;
      overflow: hidden;
    }

    .wave-bg-container {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      pointer-events: none;
      background: radial-gradient(circle at 12% 45%, rgba(254, 225, 210, 0.4) 0%, transparent 55%),
                  radial-gradient(circle at 88% 30%, rgba(254, 238, 210, 0.5) 0%, transparent 55%),
                  var(--tb-bg, #faf6fa);
      transition: background 0.4s ease;
    }

    :host-context([data-bs-theme="dark"]) .wave-bg-container,
    [data-bs-theme="dark"] .wave-bg-container {
      background: radial-gradient(circle at 12% 45%, rgba(46, 217, 231, 0.12) 0%, transparent 55%),
                  radial-gradient(circle at 88% 30%, rgba(243, 73, 164, 0.10) 0%, transparent 55%),
                  var(--tb-bg, #081226);
    }

    .wave-canvas {
      position: absolute;
      top: -5%;
      left: -5%;
      width: 110%;
      height: 110%;
      filter: blur(20px);
      opacity: 0.88;
      mix-blend-mode: multiply;
      transform: translateZ(0);
      will-change: transform;
      transition: filter 0.4s ease;
    }

    :host-context([data-bs-theme="dark"]) .wave-canvas,
    [data-bs-theme="dark"] .wave-canvas {
      filter: blur(28px);
      mix-blend-mode: screen;
      opacity: 0.9;
    }

    .ambient-sheen {
      position: absolute;
      inset: 0;
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      background: radial-gradient(ellipse at center, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.35) 100%);
      pointer-events: none;
    }

    :host-context([data-bs-theme="dark"]) .ambient-sheen,
    [data-bs-theme="dark"] .ambient-sheen {
      background: radial-gradient(ellipse at center, rgba(7, 31, 73, 0.12) 0%, rgba(8, 18, 38, 0.35) 100%);
    }

    @media (max-width: 768px) {
      .wave-canvas {
        filter: blur(18px);
      }
      .ambient-sheen {
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BackgroundComponent implements AfterViewInit, OnDestroy {
  @ViewChild('waveCanvas', { static: false })
  private waveCanvasRef!: ElementRef<HTMLCanvasElement>;

  @Input() speed = 1.0;
  @Input() amplitude = 1.0;
  @Input() opacity = 0.75;
  @Input() loopIntensity = 1.0;

  private readonly ngZone = inject(NgZone);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly themeService = inject(ThemeService, { optional: true });

  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private animFrameId: number | null = null;
  private time = 0;
  private lastTime = 0;
  private width = 0;
  private height = 0;
  private canvasWidth = 0;
  private canvasHeight = 0;
  private isMobile = false;
  private ctx: CanvasRenderingContext2D | null = null;

  private readonly boundResizeHandler = () => this.onResize();
  private readonly boundVisibilityHandler = () => this.onVisibilityChange();

  private get isDark(): boolean {
    return this.themeService?.currentTheme() === 'dark';
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;

    if (this.waveCanvasRef) {
      this.ctx = this.waveCanvasRef.nativeElement.getContext('2d');
    }

    this.onResize();

    window.addEventListener('resize', this.boundResizeHandler, { passive: true });
    document.addEventListener('visibilitychange', this.boundVisibilityHandler, { passive: true });

    this.ngZone.runOutsideAngular(() => {
      this.lastTime = performance.now();
      this.startAnimationLoop();
    });
  }

  ngOnDestroy(): void {
    this.stopAnimationLoop();
    if (this.isBrowser) {
      window.removeEventListener('resize', this.boundResizeHandler);
      document.removeEventListener('visibilitychange', this.boundVisibilityHandler);
    }
  }

  private onVisibilityChange(): void {
    if (typeof document === 'undefined') return;
    if (document.hidden) {
      this.stopAnimationLoop();
    } else {
      this.lastTime = performance.now();
      this.startAnimationLoop();
    }
  }

  private onResize(): void {
    if (!this.isBrowser || !this.waveCanvasRef) return;

    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.isMobile = this.width < 768;

    const scale = this.isMobile ? 0.5 : 1.0;
    this.canvasWidth = Math.floor(this.width * scale);
    this.canvasHeight = Math.floor(this.height * scale);

    const canvas = this.waveCanvasRef.nativeElement;
    canvas.width = this.canvasWidth;
    canvas.height = this.canvasHeight;
  }

  private startAnimationLoop(): void {
    if (this.animFrameId !== null) return;
    const loop = (currentTime: number) => {
      this.renderFrame(currentTime);
      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  private stopAnimationLoop(): void {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  private renderFrame(currentTime: number): void {
    const ctx = this.ctx;
    const w = this.canvasWidth;
    const h = this.canvasHeight;
    if (!ctx || !w || !h) return;

    const delta = Math.min(0.1, (currentTime - this.lastTime) / 1000 || 0.016);
    this.lastTime = currentTime;
    this.time += delta * (this.isDark ? 0.6 : 0.95) * this.speed;

    renderWaveFrame({
      ctx,
      w,
      h,
      time: this.time,
      isDark: this.isDark,
      isMobile: this.isMobile,
      amplitude: this.amplitude,
      opacity: this.opacity,
      loopIntensity: this.loopIntensity,
    });
  }
}
