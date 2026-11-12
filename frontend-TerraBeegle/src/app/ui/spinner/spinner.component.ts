import { Component, input, computed } from '@angular/core';

let nextSpinnerId = 0;

export type SpinnerSize = number | 'xs' | 'sm' | 'md' | 'lg' | 'btn';
export type SpinnerPalette = 'theme' | 'original';

@Component({
  selector: 'app-spinner',
  standalone: true,
  template: `
    <div
      class="tb-spinner-wrapper"
      [style.width.px]="dimensionPx()"
      [style.height.px]="dimensionPx()"
      role="status"
      aria-live="polite"
    >
      <div
        class="loader"
        [class.theme-palette]="palette() === 'theme'"
        [class.original-palette]="palette() === 'original'"
        [style.--size]="numericScale()"
      >
        <svg
          width="100"
          height="100"
          viewBox="0 0 100 100"
          aria-hidden="true"
        >
          <defs>
            <mask [attr.id]="internalMaskId" class="clipping-mask">
              <polygon points="0,0 100,0 100,100 0,100" fill="black"></polygon>
              <polygon points="25,25 75,25 50,75" fill="white"></polygon>
              <polygon points="50,25 75,75 25,75" fill="white"></polygon>
              <polygon points="35,35 65,35 50,65" fill="white"></polygon>
              <polygon points="35,35 65,35 50,65" fill="white"></polygon>
              <polygon points="35,35 65,35 50,65" fill="white"></polygon>
              <polygon points="35,35 65,35 50,65" fill="white"></polygon>
            </mask>
          </defs>
        </svg>
        <div
          class="box"
          [style.mask]="'url(#' + internalMaskId + ')'"
          [style.-webkit-mask]="'url(#' + internalMaskId + ')'"
        ></div>
      </div>
      <span class="visually-hidden">{{ text() || 'Loading...' }}</span>
    </div>

    @if (text()) {
      <div class="spinner-caption">{{ text() }}</div>
    }
  `,
  styles: `
    :host {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      vertical-align: middle;
      text-align: center;
    }

    .tb-spinner-wrapper {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      position: relative;
      flex-shrink: 0;
      overflow: visible;
    }

    /* Young Walrus 64 Base Styles */
    .loader {
      --time-animation: 2s;
      --size: 1;
      width: 100px;
      height: 100px;
      position: relative;
      border-radius: 50%;
      transform-origin: center center;
      transform: scale(var(--size));
      box-shadow:
        0 0 25px 0 var(--color-three),
        0 20px 50px 0 var(--color-four);
      flex-shrink: 0;
    }

    /* Palette originale (Andrew Manzyk - Uiverse) */
    .loader.original-palette {
      --color-one: #ffbf48;
      --color-two: #be4a1d;
      --color-three: #ffbf4780;
      --color-four: #bf4a1d80;
      --color-five: #ffbf4740;
      animation: colorize-orig calc(var(--time-animation) * 3) ease-in-out infinite;
    }

    /* Palette matching the TerraBeegle theme (light and dark) */
    .loader.theme-palette {
      --color-one: var(--tb-spinner-one, #2ED9E7);
      --color-two: var(--tb-spinner-two, #2C7BA1);
      --color-three: var(--tb-spinner-three, rgba(46, 217, 231, 0.45));
      --color-four: var(--tb-spinner-four, rgba(44, 123, 161, 0.45));
      --color-five: var(--tb-spinner-five, rgba(46, 217, 231, 0.2));
      animation: colorize-theme calc(var(--time-animation) * 3) ease-in-out infinite;
    }

    .loader::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 100px;
      height: 100px;
      border-radius: 50%;
      border-top: solid 1px var(--color-one);
      border-bottom: solid 1px var(--color-two);
      background: linear-gradient(180deg, var(--color-five), var(--color-four));
      box-shadow:
        inset 0 10px 10px 0 var(--color-three),
        inset 0 -10px 10px 0 var(--color-four);
      box-sizing: border-box;
    }

    .loader .box {
      width: 100px;
      height: 100px;
      background: linear-gradient(
        180deg,
        var(--color-one) 30%,
        var(--color-two) 70%
      );
      mask: url(#clipping);
      -webkit-mask: url(#clipping);
    }

    .loader svg {
      position: absolute;
      top: 0;
      left: 0;
      width: 100px;
      height: 100px;
      pointer-events: none;
    }

    .loader svg .clipping-mask,
    .loader svg mask {
      filter: contrast(15);
      animation: roundness calc(var(--time-animation) / 2) linear infinite;
    }

    .loader svg .clipping-mask polygon,
    .loader svg mask polygon {
      filter: blur(7px);
    }

    .loader svg .clipping-mask polygon:nth-child(1),
    .loader svg mask polygon:nth-child(1) {
      transform-origin: 75% 25%;
      transform: rotate(90deg);
    }

    .loader svg .clipping-mask polygon:nth-child(2),
    .loader svg mask polygon:nth-child(2) {
      transform-origin: 50% 50%;
      animation: rotation var(--time-animation) linear infinite reverse;
    }

    .loader svg .clipping-mask polygon:nth-child(3),
    .loader svg mask polygon:nth-child(3) {
      transform-origin: 50% 60%;
      animation: rotation var(--time-animation) linear infinite;
      animation-delay: calc(var(--time-animation) / -3);
    }

    .loader svg .clipping-mask polygon:nth-child(4),
    .loader svg mask polygon:nth-child(4) {
      transform-origin: 40% 40%;
      animation: rotation var(--time-animation) linear infinite reverse;
    }

    .loader svg .clipping-mask polygon:nth-child(5),
    .loader svg mask polygon:nth-child(5) {
      transform-origin: 40% 40%;
      animation: rotation var(--time-animation) linear infinite reverse;
      animation-delay: calc(var(--time-animation) / -2);
    }

    .loader svg .clipping-mask polygon:nth-child(6),
    .loader svg mask polygon:nth-child(6) {
      transform-origin: 60% 40%;
      animation: rotation var(--time-animation) linear infinite;
    }

    .loader svg .clipping-mask polygon:nth-child(7),
    .loader svg mask polygon:nth-child(7) {
      transform-origin: 60% 40%;
      animation: rotation var(--time-animation) linear infinite;
      animation-delay: calc(var(--time-animation) / -1.5);
    }

    .spinner-caption {
      margin-top: 1.15rem;
      font-size: 0.92rem;
      font-weight: 500;
      color: var(--tb-text-muted, #8ca3c7);
      letter-spacing: 0.02em;
    }

    @keyframes rotation {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }

    @keyframes roundness {
      0% {
        filter: contrast(15);
      }
      20% {
        filter: contrast(3);
      }
      40% {
        filter: contrast(3);
      }
      60% {
        filter: contrast(15);
      }
      100% {
        filter: contrast(15);
      }
    }

    /* Keyframes originale (Andrew Manzyk) */
    @keyframes colorize-orig {
      0% {
        filter: hue-rotate(0deg);
      }
      20% {
        filter: hue-rotate(-30deg);
      }
      40% {
        filter: hue-rotate(-60deg);
      }
      60% {
        filter: hue-rotate(-90deg);
      }
      80% {
        filter: hue-rotate(-45deg);
      }
      100% {
        filter: hue-rotate(0deg);
      }
    }

    /* Keyframes matching the TerraBeegle theme:
       smoothly cycles through the theme colors (cyan/blue in dark, rose/magenta in light) */
    @keyframes colorize-theme {
      0%, 100% {
        filter: hue-rotate(0deg);
      }
      30% {
        filter: hue-rotate(25deg);
      }
      60% {
        filter: hue-rotate(40deg);
      }
      85% {
        filter: hue-rotate(-12deg);
      }
    }
  `,
})
export class SpinnerComponent {
  readonly size = input<SpinnerSize>(1);
  readonly text = input<string | null>(null);
  readonly palette = input<SpinnerPalette>('theme');

  protected readonly internalMaskId = `young-walrus-mask-${++nextSpinnerId}`;

  protected readonly numericScale = computed(() => {
    const s = this.size();
    if (typeof s === 'number') {
      return s;
    }
    switch (s) {
      case 'xs':
        return 0.2;
      case 'btn':
      case 'sm':
        return 0.26;
      case 'md':
        return 0.65;
      case 'lg':
      default:
        return 1;
    }
  });

  protected readonly dimensionPx = computed(() => {
    return Math.round(100 * this.numericScale());
  });
}

