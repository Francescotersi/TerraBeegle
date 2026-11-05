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
  ChangeDetectionStrategy
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ThemeService } from '../../services/theme.service';

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

    /* Ottimizzazioni grafiche Mobile */
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
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BackgroundComponent implements AfterViewInit, OnDestroy {
  @ViewChild('waveCanvas', { static: false })
  private waveCanvasRef!: ElementRef<HTMLCanvasElement>;

  @Input() speed: number = 1.0;
  @Input() amplitude: number = 1.0;
  @Input() opacity: number = 0.75;
  @Input() loopIntensity: number = 1.0;

  private readonly ngZone = inject(NgZone);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly themeService = inject(ThemeService, { optional: true });

  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private animFrameId: number | null = null;
  private time: number = 0;
  private lastTime: number = 0;
  private width: number = 0;
  private height: number = 0;
  private canvasWidth: number = 0;
  private canvasHeight: number = 0;
  private isMobile: boolean = false;
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

    // Animazione 60fps fuori dalla zone di Angular per prestazioni massime
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

  /**
   * Pausa automatica in background: azzera il consumo di CPU e batteria quando la scheda non è visibile
   */
  private onVisibilityChange(): void {
    if (typeof document === 'undefined') return;
    if (document.hidden) {
      this.stopAnimationLoop();
    } else {
      this.lastTime = performance.now();
      this.startAnimationLoop();
    }
  }

  /**
   * Downsampling dinamico su mobile: dimezza la risoluzione interna del canvas per risparmiare il 75% di GPU
   */
  private onResize(): void {
    if (!this.isBrowser || !this.waveCanvasRef) return;

    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.isMobile = this.width < 768;

    // Scala interna: 0.5x su mobile (82k pixel invece di 1M+), 1.0x su desktop
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

  private createWaveGradient(
    ctx: CanvasRenderingContext2D,
    w: number,
    alphaMultiplier: number = 1
  ): CanvasGradient {
    const grad = ctx.createLinearGradient(0, 0, w, 0);
    if (this.isDark) {
      grad.addColorStop(0.00, `rgba(46, 217, 231, ${0.75 * alphaMultiplier})`);
      grad.addColorStop(0.35, `rgba(243, 73, 164, ${0.65 * alphaMultiplier})`);
      grad.addColorStop(0.70, `rgba(103, 16, 134, ${0.55 * alphaMultiplier})`);
      grad.addColorStop(1.00, `rgba(255, 230, 41, ${0.70 * alphaMultiplier})`);
    } else {
      grad.addColorStop(0.00, `rgba(251, 120, 120, ${0.72 * alphaMultiplier})`);   // Corallo morbido delicato
      grad.addColorStop(0.25, `rgba(253, 164, 130, ${0.65 * alphaMultiplier})`);   // Pesca dorato
      grad.addColorStop(0.50, `rgba(251, 175, 90, ${0.58 * alphaMultiplier})`);    // Albicocca caldo
      grad.addColorStop(0.75, `rgba(251, 191, 36, ${0.68 * alphaMultiplier})`);    // Oro ambrato
      grad.addColorStop(1.00, `rgba(245, 158, 11, ${0.70 * alphaMultiplier})`);    // Ambra caldo
    }
    return grad;
  }

  private createSecondaryGradient(
    ctx: CanvasRenderingContext2D,
    w: number,
    alphaMultiplier: number = 1
  ): CanvasGradient {
    const grad = ctx.createLinearGradient(0, 0, w, 0);
    if (this.isDark) {
      grad.addColorStop(0.00, `rgba(243, 73, 164, ${0.70 * alphaMultiplier})`);
      grad.addColorStop(0.40, `rgba(46, 217, 231, ${0.55 * alphaMultiplier})`);
      grad.addColorStop(0.75, `rgba(99, 102, 241, ${0.60 * alphaMultiplier})`);
      grad.addColorStop(1.00, `rgba(255, 230, 41, ${0.65 * alphaMultiplier})`);
    } else {
      grad.addColorStop(0.00, `rgba(249, 130, 100, ${0.68 * alphaMultiplier})`);   // Pesca-corallo morbido
      grad.addColorStop(0.35, `rgba(253, 186, 116, ${0.58 * alphaMultiplier})`);   // Albicocca tenue
      grad.addColorStop(0.70, `rgba(254, 215, 140, ${0.62 * alphaMultiplier})`);   // Oro satinato/miele
      grad.addColorStop(1.00, `rgba(251, 191, 36, ${0.65 * alphaMultiplier})`);    // Oro luminoso
    }
    return grad;
  }

  private getWavePoint(
    u: number,
    t: number,
    isTop: boolean,
    strandIndex: number,
    w: number,
    h: number
  ): { x: number; y: number } {
    const centerY = h * 0.50;
    const direction = isTop ? -1 : 1;
    const ampBase = (h * (this.isDark ? 0.22 : 0.26)) * this.amplitude;

    const f1 = 2.4;
    const f2 = 5.2;
    const f3 = 8.6;

    const phase = t * 0.8 + (strandIndex * 1.5) + (isTop ? 0 : Math.PI * 0.5);

    const yOffset = Math.sin(u * f1 * Math.PI * 2 + phase) * 0.65
                  + Math.sin(u * f2 * Math.PI * 2 - phase * 0.7) * 0.35
                  + Math.cos(u * f3 * Math.PI * 2 + phase * 0.5) * 0.15;

    const loopFreq = 3.8;
    const loopPhase = phase * 0.6 + u * loopFreq * Math.PI * 2;
    const loopX = Math.cos(loopPhase) * (w * 0.025) * this.loopIntensity;
    const loopY = Math.sin(loopPhase * 1.2) * (ampBase * 0.35) * this.loopIntensity;

    return {
      x: u * w + loopX,
      y: centerY + direction * (Math.abs(yOffset) * ampBase + loopY)
    };
  }

  /**
   * Disegno unificato: genera nastro riempito e contorno luminoso riutilizzando gli stessi punti
   */
  private drawRibbonWithStroke(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    t: number,
    isTop: boolean,
    strandIndex: number,
    fillGrad: CanvasGradient,
    strokeGrad: CanvasGradient,
    steps: number
  ): void {
    const points: { x: number; y: number }[] = [];

    for (let i = 0; i <= steps; i++) {
      points.push(this.getWavePoint(i / steps, t, isTop, strandIndex, w, h));
    }

    // 1. Corpo del nastro
    ctx.beginPath();
    ctx.moveTo(points[0].x, h * 0.5);

    for (let i = 0; i < points.length - 1; i++) {
      const xc = (points[i].x + points[i + 1].x) * 0.5;
      const yc = (points[i].y + points[i + 1].y) * 0.5;
      ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }
    ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
    ctx.lineTo(w, h * 0.5);
    ctx.closePath();

    ctx.fillStyle = fillGrad;
    ctx.fill();

    // 2. Tratto ridge luminoso (riutilizza i punti già calcolati in memoria)
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.strokeStyle = strokeGrad;
    ctx.lineWidth = this.isMobile ? 1.5 : (this.isDark ? 2.5 : 3.5);
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  private drawCenterHorizon(ctx: CanvasRenderingContext2D, w: number, h: number, t: number): void {
    const centerY = h * 0.5;
    const steps = this.isMobile ? 20 : 40;
    ctx.beginPath();
    ctx.moveTo(0, centerY);

    for (let i = 1; i <= steps; i++) {
      const u = i / steps;
      const yWobble = centerY + Math.sin(u * Math.PI * 4 + t * 0.5) * (this.isMobile ? 2 : 3);
      ctx.lineTo(u * w, yWobble);
    }

    const grad = ctx.createLinearGradient(0, 0, w, 0);
    if (this.isDark) {
      grad.addColorStop(0.0, 'rgba(46, 217, 231, 0.35)');
      grad.addColorStop(0.5, 'rgba(243, 73, 164, 0.25)');
      grad.addColorStop(1.0, 'rgba(255, 230, 41, 0.35)');
    } else {
      grad.addColorStop(0.0, 'rgba(251, 120, 120, 0.35)');
      grad.addColorStop(0.5, 'rgba(251, 175, 90, 0.25)');
      grad.addColorStop(1.0, 'rgba(251, 191, 36, 0.35)');
    }

    ctx.strokeStyle = grad;
    ctx.lineWidth = this.isMobile ? 1 : 1.5;
    ctx.stroke();
  }

  private renderFrame(currentTime: number): void {
    const ctx = this.ctx;
    const w = this.canvasWidth;
    const h = this.canvasHeight;
    if (!ctx || !w || !h) return;

    const delta = Math.min(0.1, (currentTime - this.lastTime) / 1000 || 0.016);
    this.lastTime = currentTime;
    const speedFactor = this.isDark ? 0.60 : 0.95;
    this.time += delta * speedFactor * this.speed;

    ctx.clearRect(0, 0, w, h);

    // 1. Aloni d'atmosfera sfumata (profondità aura)
    const leftCol = this.isDark ? '46, 217, 231' : '254, 165, 130';
    const leftGlow = ctx.createRadialGradient(w * 0.1, h * 0.45, 0, w * 0.1, h * 0.45, w * 0.35);
    leftGlow.addColorStop(0, `rgba(${leftCol}, ${0.45 * this.opacity})`);
    leftGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = leftGlow;
    ctx.fillRect(0, 0, w, h);

    const rightCol = this.isDark ? '243, 73, 164' : '254, 215, 140';
    const rightGlow = ctx.createRadialGradient(w * 0.9, h * 0.35, 0, w * 0.9, h * 0.35, w * 0.38);
    rightGlow.addColorStop(0, `rgba(${rightCol}, ${0.55 * this.opacity})`);
    rightGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = rightGlow;
    ctx.fillRect(0, 0, w, h);

    // 2. Gradienti d'onda
    const fill1 = this.createWaveGradient(ctx, w, 0.55 * this.opacity);
    const fill2 = this.createSecondaryGradient(ctx, w, 0.45 * this.opacity);
    const stroke1 = this.createWaveGradient(ctx, w, 0.70 * this.opacity);
    const stroke2 = this.createSecondaryGradient(ctx, w, 0.60 * this.opacity);

    // 3. Ciclo consolidato dei nastri (ridotto a 60 step su mobile per leggerezza)
    const steps = this.isMobile ? 60 : 160;
    const waves = [
      { isTop: true,  strand: 0, t: this.time,              fill: fill1, stroke: stroke1 },
      { isTop: true,  strand: 1, t: this.time * 1.15 + 1.2, fill: fill2, stroke: stroke2 },
      { isTop: false, strand: 0, t: this.time * 0.9 + 2.0,  fill: fill2, stroke: stroke2 },
      { isTop: false, strand: 1, t: this.time * 1.1 + 3.2,  fill: fill1, stroke: stroke1 },
    ];

    for (const wave of waves) {
      this.drawRibbonWithStroke(ctx, w, h, wave.t, wave.isTop, wave.strand, wave.fill, wave.stroke, steps);
    }

    // 4. Orizzonte centrale
    this.drawCenterHorizon(ctx, w, h, this.time);
  }
}
