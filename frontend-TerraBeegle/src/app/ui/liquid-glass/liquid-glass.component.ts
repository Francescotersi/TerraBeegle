import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

let nextLiquidGlassId = 0;

@Component({
  selector: 'app-liquid-glass',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="liquid-glass-card"
      [style.width]="width()"
      [style.height]="height()"
      [style.border-radius]="borderRadius()"
      [style.background]="background()"
      [style.--lg-filter-url]="'url(#' + filterId + ')'"
      [style.--lg-blur]="blur()"
      [style.--lg-radius]="borderRadius()"
      [ngStyle]="customStyle()"
    >
      <svg
        width="0"
        height="0"
        style="position: absolute; pointer-events: none;"
        aria-hidden="true"
      >
        <filter
          [attr.id]="filterId"
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.02"
            numOctaves="3"
            result="noise"
          >
            <animate
              attributeName="baseFrequency"
              dur="14s"
              values="0.016;0.026;0.016"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            [attr.scale]="scale()"
            xChannelSelector="R"
            yChannelSelector="G"
            result="refracted"
          />
          <feGaussianBlur
            in="refracted"
            stdDeviation="0.8"
          />
        </filter>
      </svg>

      <!-- Riflesso bordo superiore ed effetto luce satinata -->
      <div class="glass-specular"></div>

      <!-- Contenuto inserito -->
      <div class="glass-content">
        <ng-content />
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
    }

    .liquid-glass-card {
      position: relative;
      width: 100%;
      border-radius: var(--lg-radius, 24px);
      overflow: hidden;
      background: rgba(255, 255, 255, 0.18);

      /* Distorsione ottica liquida accentuata + blur minimale */
      backdrop-filter: var(--lg-filter-url) blur(var(--lg-blur, 2px)) saturate(180%);
      -webkit-backdrop-filter: var(--lg-filter-url) blur(var(--lg-blur, 2px)) saturate(180%);

      border: 1px solid rgba(255, 255, 255, 0.65);
      box-shadow:
        0 16px 36px rgba(0, 0, 0, 0.08),
        inset 0 1px 1px rgba(255, 255, 255, 0.8),
        inset 0 -1px 1px rgba(255, 255, 255, 0.25);
      transition: box-shadow 0.3s ease, border-color 0.3s ease;
    }

    .glass-specular {
      position: absolute;
      inset: 0;
      border-radius: inherit;
      pointer-events: none;
      box-shadow: inset 1px 1px 2px rgba(255, 255, 255, 0.6), inset -1px -1px 2px rgba(255, 255, 255, 0.15);
    }

    .glass-content {
      position: relative;
      z-index: 2;
      width: 100%;
      height: 100%;
    }

    /* Fallback morbido per browser senza supporto a SVG in backdrop-filter */
    @supports not (backdrop-filter: url(#test)) {
      .liquid-glass-card {
        backdrop-filter: blur(24px) saturate(180%);
        -webkit-backdrop-filter: blur(24px) saturate(180%);
      }
    }
  `,
})
export class LiquidGlassComponent {
  readonly width = input<string>('100%');
  readonly height = input<string>('auto');
  readonly borderRadius = input<string>('24px');
  readonly blur = input<string>('2px');
  readonly scale = input<number>(85);
  readonly background = input<string>('rgba(255, 255, 255, 0.18)');
  readonly customStyle = input<Record<string, string>>({});

  protected readonly filterId = `tb-liquid-filter-${nextLiquidGlassId++}`;
}
