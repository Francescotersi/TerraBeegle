import { Component, computed, input, signal } from '@angular/core';

// How many favorite games have a genre / platform / theme / playing style
export interface RankedItem {
  label: string;
  count: number;
}

// One segment of the donut (and one row of the legend)
interface Slice {
  label: string;
  count: number;
  percentage: number; // share of the ring, one decimal
  colorIndex: number; // 0-4 = shade by rank, 5 = "Other"
  path: string;
}

// The 5 largest get their own segment, the rest is folded into "Other"
const MAX_SLICES = 5;
// Donut geometry (SVG units, centered on 0,0)
const OUTER_RADIUS = 96;
const INNER_RADIUS = 62;

// One statistics card: title, a donut with a live center (hover shows the segment) and the legend beside it
@Component({
  selector: 'app-donut-card',
  standalone: true,
  template: `
    <section class="stats-card" [attr.aria-label]="title()">
      <header class="stats-header">
        <h2 class="stats-title">{{ title() }}</h2>
        <p class="stats-subtitle">{{ subtitle() }}</p>
      </header>

      <div class="stats-body">
        @if (slices().length) {
          <div class="donut-wrap">
            <svg class="donut" viewBox="-100 -100 200 200" role="img"
              [attr.aria-label]="title() + ': ' + ariaSummary()">
              @for (slice of slices(); track slice.label; let i = $index) {
                <path
                  class="slice"
                  [class.dimmed]="activeIndex() !== null && activeIndex() !== i"
                  [class.active]="activeIndex() === i"
                  [attr.d]="slice.path"
                  [style.fill]="'var(--shade-' + slice.colorIndex + ')'"
                  (mouseenter)="activeIndex.set(i)"
                  (mouseleave)="activeIndex.set(null)"
                />
              }
            </svg>
            <!-- Live center: the hovered segment, otherwise the total of the card -->
            <div class="donut-center" aria-live="polite">
              @if (activeSlice(); as slice) {
                <span class="center-value">{{ slice.count }}</span>
                <span class="center-label" [title]="slice.label">{{ slice.label }}</span>
              } @else {
                <span class="center-value">{{ centerValue() }}</span>
                <span class="center-label">{{ centerLabel() }}</span>
              }
            </div>
          </div>

          <ul class="legend">
            @for (slice of slices(); track slice.label; let i = $index) {
              <li
                class="legend-row"
                tabindex="0"
                [class.dimmed]="activeIndex() !== null && activeIndex() !== i"
                (mouseenter)="activeIndex.set(i)"
                (mouseleave)="activeIndex.set(null)"
                (focus)="activeIndex.set(i)"
                (blur)="activeIndex.set(null)"
              >
                <i class="swatch" [style.background]="'var(--shade-' + slice.colorIndex + ')'" aria-hidden="true"></i>
                <span class="legend-label" [title]="slice.label">{{ slice.label }}</span>
                <span class="legend-count">{{ slice.count }}</span>
                <span class="legend-percent">{{ slice.percentage.toFixed(1) }}%</span>
              </li>
            }
          </ul>
        } @else {
          <p class="empty-note">{{ emptyMessage() }}</p>
        }
      </div>
    </section>
  `,
  styleUrl: './donut-card.component.css',
})
export class DonutCardComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string>('');
  // Largest first (the order of the segments and of the shades)
  readonly items = input<RankedItem[]>([]);
  readonly centerValue = input<number>(0);
  readonly centerLabel = input<string>('');
  readonly emptyMessage = input<string>('No data yet.');

  readonly activeIndex = signal<number | null>(null);

  readonly slices = computed<Slice[]>(() => {
    const items = this.items();
    const visible = items.slice(0, MAX_SLICES);
    const rest = items.slice(MAX_SLICES).reduce((sum, item) => sum + item.count, 0);
    const parts = rest > 0 ? [...visible, { label: 'Other', count: rest }] : visible;
    const total = parts.reduce((sum, item) => sum + item.count, 0);
    if (!total) return [];

    let start = 0;
    return parts.map((item, index) => {
      const fraction = item.count / total;
      const end = start + fraction;
      const slice: Slice = {
        label: item.label,
        count: item.count,
        percentage: Math.round(fraction * 1000) / 10,
        colorIndex: rest > 0 && index === parts.length - 1 ? 5 : index,
        path: arcPath(start, end),
      };
      start = end;
      return slice;
    });
  });

  readonly activeSlice = computed(() => {
    const index = this.activeIndex();
    return index === null ? null : (this.slices()[index] ?? null);
  });

  // "RPG 40.2%, Adventure 25%..." for screen readers
  readonly ariaSummary = computed(() =>
    this.slices().map((slice) => `${slice.label} ${slice.percentage}%`).join(', ')
  );
}

// SVG path of one ring segment, from start to end (fractions of the full circle, starting at the top)
function arcPath(start: number, end: number): string {
  const R = OUTER_RADIUS;
  const r = INNER_RADIUS;
  // A full circle cannot be drawn with one arc: two half rings, the hole cut out with evenodd
  if (end - start >= 0.9999) {
    return `M 0 ${-R} A ${R} ${R} 0 1 1 0 ${R} A ${R} ${R} 0 1 1 0 ${-R} Z ` +
      `M 0 ${-r} A ${r} ${r} 0 1 0 0 ${r} A ${r} ${r} 0 1 0 0 ${-r} Z`;
  }
  const point = (fraction: number, radius: number) => {
    const angle = fraction * 2 * Math.PI - Math.PI / 2;
    return `${(radius * Math.cos(angle)).toFixed(3)} ${(radius * Math.sin(angle)).toFixed(3)}`;
  };
  const large = end - start > 0.5 ? 1 : 0;
  return `M ${point(start, R)} A ${R} ${R} 0 ${large} 1 ${point(end, R)} ` +
    `L ${point(end, r)} A ${r} ${r} 0 ${large} 0 ${point(start, r)} Z`;
}
