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
      [style.overflow]="overflow()"
      [style.--lg-bg]="background()"
      [style.--lg-filter-url]="'url(#' + filterId() + ')'"
      [style.--lg-blur]="blur()"
      [style.--lg-radius]="borderRadius()"
      [ngStyle]="customStyle()"
    >
      @if (!sharedFilterId()) {
        <svg
          width="0"
          height="0"
          style="position: absolute; pointer-events: none;"
          aria-hidden="true"
        >
          <filter
            [attr.id]="internalFilterId"
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
      }

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
    }

    .glass-specular {
      position: absolute;
      inset: 0;
      border-radius: inherit;
      overflow: hidden;
      pointer-events: none;
      z-index: 1;
      background: var(--lg-bg, var(--tb-glass-bg));

      /* Distorsione ottica liquida accentuata + blur minimale */
      backdrop-filter: var(--lg-filter-url) blur(var(--lg-blur, 2px)) saturate(180%);
      -webkit-backdrop-filter: var(--lg-filter-url) blur(var(--lg-blur, 2px)) saturate(180%);

      border: 1px solid var(--tb-glass-border);
      box-shadow:
        0 18px 40px var(--tb-glass-shadow),
        0 4px 12px rgba(0, 0, 0, 0.06),
        inset 0 1px 2px rgba(255, 255, 255, 0.95),
        inset 0 -1px 2px rgba(0, 0, 0, 0.06);
      transition: box-shadow 0.3s ease, border-color 0.3s ease, background-color 0.3s ease;
      transform: translateZ(0);
    }

    :host-context([data-bs-theme="dark"]) .glass-specular {
      box-shadow:
        0 16px 36px var(--tb-glass-shadow),
        inset 1px 1px 2px rgba(46, 217, 231, 0.2),
        inset -1px -1px 2px rgba(0, 0, 0, 0.4);
    }

    .glass-content {
      position: relative;
      z-index: 2;
      width: 100%;
      height: 100%;
    }

  `,
})
export class LiquidGlassComponent {
  readonly width = input<string>('100%');
  readonly height = input<string>('auto');
  readonly borderRadius = input<string>('24px');
  readonly blur = input<string>('2px');
  readonly scale = input<number>(85);
  readonly background = input<string>('var(--tb-glass-bg)');
  readonly overflow = input<string>('hidden');
  readonly customStyle = input<Record<string, string>>({});
  readonly sharedFilterId = input<string | null>(null);

  protected readonly internalFilterId = `tb-liquid-filter-${nextLiquidGlassId++}`;

  protected readonly filterId = computed(() => {
    return this.sharedFilterId() || this.internalFilterId;
  });
}
