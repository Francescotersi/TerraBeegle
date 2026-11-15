import { Component, ElementRef, HostListener, computed, effect, inject, signal } from '@angular/core';
import { CatalogFiltersService, MAX_YEAR, MIN_TO_YEAR, MIN_YEAR } from '../../services/catalog-filters.service';

/** Release year dropdowns and dual-range sliders for user rating and critic score filters. */
@Component({
  selector: 'app-sidebar-range-filters',
  standalone: true,
  template: `
    <div class="category-group mb-3 mt-3">
      <span class="filter-label">Release year</span>
      <div class="d-flex align-items-center gap-2">
        <div class="year-select-wrap">
          <button
            type="button"
            class="year-select-trigger sidebar-search"
            aria-label="Released from year"
            [attr.aria-expanded]="openYearMenu() === 'yearMin'"
            (click)="toggleYearMenu('yearMin', $event)"
          >
            <span>{{ filters().yearMin ?? 'From' }}</span>
            <span class="year-caret" aria-hidden="true">▾</span>
          </button>
          @if (openYearMenu() === 'yearMin') {
            <ul class="year-dropdown list-unstyled mb-0" role="listbox" aria-label="From year">
              <li>
                <button
                  type="button"
                  class="year-option"
                  [class.active]="filters().yearMin === null"
                  (click)="selectYear('yearMin', null)"
                >
                  From
                </button>
              </li>
              @for (year of years; track year) {
                <li>
                  <button
                    type="button"
                    class="year-option"
                    [class.active]="filters().yearMin === year"
                    (click)="selectYear('yearMin', year)"
                  >
                    {{ year }}
                  </button>
                </li>
              }
            </ul>
          }
        </div>

        <span class="text-body-secondary small">–</span>

        <div class="year-select-wrap">
          <button
            type="button"
            class="year-select-trigger sidebar-search"
            aria-label="Released until year"
            [attr.aria-expanded]="openYearMenu() === 'yearMax'"
            (click)="toggleYearMenu('yearMax', $event)"
          >
            <span>{{ filters().yearMax ?? 'To' }}</span>
            <span class="year-caret" aria-hidden="true">▾</span>
          </button>
          @if (openYearMenu() === 'yearMax') {
            <ul class="year-dropdown list-unstyled mb-0" role="listbox" aria-label="To year">
              <li>
                <button
                  type="button"
                  class="year-option"
                  [class.active]="filters().yearMax === null"
                  (click)="selectYear('yearMax', null)"
                >
                  To
                </button>
              </li>
              @for (year of toYears(); track year) {
                <li>
                  <button
                    type="button"
                    class="year-option"
                    [class.active]="filters().yearMax === year"
                    (click)="selectYear('yearMax', year)"
                  >
                    {{ year }}
                  </button>
                </li>
              }
            </ul>
          }
        </div>
      </div>
    </div>

    <div class="category-group mb-3" role="group" aria-label="User rating range">
      <div class="filter-label d-flex justify-content-between align-items-center">
        <span>User rating</span>
        <span class="rating-value">{{ ratingDraft() }} – {{ ratingMaxDraft() }}</span>
      </div>
      <div
        class="dual-slider"
        [style.--range-start]="(ratingDraft() * 10) + '%'"
        [style.--range-end]="(ratingMaxDraft() * 10) + '%'"
      >
        <div class="dual-slider-track" aria-hidden="true"></div>
        <input
          type="range"
          class="rating-slider range-min"
          min="0"
          max="10"
          step="0.1"
          aria-label="Minimum user rating"
          [value]="ratingDraft()"
          [style.z-index]="ratingDraft() > 5 ? 3 : 1"
          [attr.aria-valuemax]="ratingMaxDraft()"
          (input)="onScoreInput('rating', true, $event)"
          (change)="applyScoreRange('rating')"
        />
        <input
          type="range"
          class="rating-slider range-max"
          min="0"
          max="10"
          step="0.1"
          aria-label="Maximum user rating"
          [value]="ratingMaxDraft()"
          [attr.aria-valuemin]="ratingDraft()"
          (input)="onScoreInput('rating', false, $event)"
          (change)="applyScoreRange('rating')"
        />
      </div>
      <div class="rating-limits" aria-hidden="true"><span>0</span><span>10</span></div>
    </div>

    <div class="category-group mb-2" role="group" aria-label="Critic score range">
      <div class="filter-label d-flex justify-content-between align-items-center">
        <span>Critic score</span>
        <span class="rating-value">{{ criticDraft() }} – {{ criticMaxDraft() }}</span>
      </div>
      <div
        class="dual-slider"
        [style.--range-start]="(criticDraft() * 1) + '%'"
        [style.--range-end]="(criticMaxDraft() * 1) + '%'"
      >
        <div class="dual-slider-track" aria-hidden="true"></div>
        <input
          type="range"
          class="rating-slider range-min"
          min="0"
          max="100"
          step="1"
          aria-label="Minimum critic score"
          [value]="criticDraft()"
          [style.z-index]="criticDraft() > 50 ? 3 : 1"
          [attr.aria-valuemax]="criticMaxDraft()"
          (input)="onScoreInput('critic', true, $event)"
          (change)="applyScoreRange('critic')"
        />
        <input
          type="range"
          class="rating-slider range-max"
          min="0"
          max="100"
          step="1"
          aria-label="Maximum critic score"
          [value]="criticMaxDraft()"
          [attr.aria-valuemin]="criticDraft()"
          (input)="onScoreInput('critic', false, $event)"
          (change)="applyScoreRange('critic')"
        />
      </div>
      <div class="rating-limits" aria-hidden="true"><span>0</span><span>100</span></div>
    </div>
  `,
  styles: `
    :host { display: block; }
    .filter-label {
      display: block; margin-bottom: 0.4rem; padding-left: 0.5rem;
      font-size: 0.75rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.04em; color: var(--tb-text);
    }
    .sidebar-search {
      background-color: var(--tb-input-bg); border: 1px solid var(--tb-input-border);
      border-radius: 20px; font-size: 0.85rem; padding: 0.4rem 0.75rem; color: var(--tb-text);
      transition: background 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
    }
    .sidebar-search:focus {
      background-color: var(--tb-input-bg-focus); border-color: var(--tb-accent);
      box-shadow: 0 0 0 0.25rem var(--tb-accent-glow); color: var(--tb-text);
    }
    :host-context([data-bs-theme="light"]) .sidebar-search {
      background-color: rgba(255, 255, 255, 0.85); border-color: rgba(51, 65, 85, 0.32);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
    }
    .year-select-wrap { position: relative; flex: 1; min-width: 0; }
    .year-select-trigger {
      width: 100%; display: flex; align-items: center; justify-content: space-between;
      gap: 0.25rem; padding: 0.28rem 0.55rem; font-size: 0.8rem; border-radius: 14px; cursor: pointer;
    }
    .year-caret { font-size: 0.7rem; color: var(--tb-text-muted); }
    .year-dropdown {
      position: absolute; top: calc(100% + 4px); left: 0; right: 0; max-height: 155px;
      overflow-y: auto; z-index: 30; padding: 4px; border-radius: 12px;
      border: 1px solid var(--tb-glass-border); background: var(--tb-glass-bg);
      backdrop-filter: blur(14px); box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
      scrollbar-width: thin; scrollbar-color: var(--tb-accent) transparent;
    }
    .year-dropdown::-webkit-scrollbar { width: 4px; }
    .year-dropdown::-webkit-scrollbar-thumb { background: var(--tb-accent-glow); border-radius: 4px; }
    .year-option {
      width: 100%; text-align: left; padding: 0.2rem 0.45rem; border: 0; border-radius: 8px;
      background: transparent; color: var(--tb-text); font-size: 0.78rem; cursor: pointer;
      transition: background-color 0.12s ease-out, color 0.12s ease-out;
    }
    .year-option:hover:not(:disabled) { background: var(--tb-accent-subtle); color: var(--tb-accent); }
    .year-option.active { background: var(--tb-btn-gradient); color: #fff; font-weight: 600; }
    .year-option:disabled { opacity: 0.38; cursor: not-allowed; }
    .dual-slider { position: relative; height: 32px; }
    .dual-slider-track {
      position: absolute; inset: 13px 8px; border-radius: 999px;
      background: linear-gradient(to right,
        var(--tb-input-border) 0% var(--range-start),
        var(--tb-accent) var(--range-start) var(--range-end),
        var(--tb-input-border) var(--range-end) 100%);
    }
    .rating-slider {
      appearance: none; -webkit-appearance: none; position: absolute; inset: 0;
      width: 100%; height: 32px; margin: 0; background: transparent; pointer-events: none;
    }
    .range-max { z-index: 2; }
    .rating-slider::-webkit-slider-runnable-track { height: 6px; background: transparent; }
    .rating-slider::-moz-range-track { height: 6px; background: transparent; }
    .rating-slider::-webkit-slider-thumb {
      appearance: none; -webkit-appearance: none; width: 18px; height: 18px; margin-top: -6px;
      border: 2px solid var(--tb-accent); border-radius: 50%; background: var(--tb-accent);
      pointer-events: auto; cursor: grab;
    }
    .rating-slider::-moz-range-thumb {
      width: 14px; height: 14px; border: 2px solid var(--tb-accent); border-radius: 50%;
      background: var(--tb-accent); pointer-events: auto; cursor: grab;
    }
    .rating-slider:focus-visible { outline: none; }
    .rating-slider:focus-visible::-webkit-slider-thumb { outline: 2px solid var(--tb-text); outline-offset: 3px; }
    .rating-slider:focus-visible::-moz-range-thumb { outline: 2px solid var(--tb-text); outline-offset: 3px; }
    .rating-value { color: var(--tb-accent); font-variant-numeric: tabular-nums; white-space: nowrap; }
    .rating-limits { display: flex; justify-content: space-between; color: var(--tb-text-muted); font-size: .75rem; }
  `,
})
export class SidebarRangeFiltersComponent {
  private readonly filtersService = inject(CatalogFiltersService);
  private readonly hostEl = inject(ElementRef<HTMLElement>);

  protected readonly filters = this.filtersService.filters;
  protected readonly openYearMenu = signal<'yearMin' | 'yearMax' | null>(null);

  protected readonly years = Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }, (_, i) => MAX_YEAR - i);
  protected readonly toYears = computed(() => {
    const min = Math.max(MIN_TO_YEAR, this.filters().yearMin ?? MIN_TO_YEAR);
    return this.years.filter((year) => year >= min);
  });

  protected readonly ratingDraft = signal(this.filters().ratingMin ?? 0);
  protected readonly ratingMaxDraft = signal(this.filters().ratingMax ?? 10);
  protected readonly criticDraft = signal(this.filters().criticMin ?? 0);
  protected readonly criticMaxDraft = signal(this.filters().criticMax ?? 100);

  constructor() {
    effect(() => {
      const f = this.filters();
      this.ratingDraft.set(f.ratingMin ?? 0);
      this.ratingMaxDraft.set(f.ratingMax ?? 10);
      this.criticDraft.set(f.criticMin ?? 0);
      this.criticMaxDraft.set(f.criticMax ?? 100);
    });
  }

  protected onScoreInput(score: 'rating' | 'critic', isMinimum: boolean, event: Event): void {
    const input = event.target as HTMLInputElement;
    const minimum = score === 'rating' ? this.ratingDraft : this.criticDraft;
    const maximum = score === 'rating' ? this.ratingMaxDraft : this.criticMaxDraft;
    const value = isMinimum ? Math.min(input.valueAsNumber, maximum()) : Math.max(input.valueAsNumber, minimum());
    (isMinimum ? minimum : maximum).set(value);
    input.value = String(value);
  }

  protected applyScoreRange(score: 'rating' | 'critic'): void {
    if (score === 'rating') {
      this.filtersService.update({
        ratingMin: this.ratingDraft() || null,
        ratingMax: this.ratingMaxDraft() >= 10 ? null : this.ratingMaxDraft(),
      });
    } else {
      this.filtersService.update({
        criticMin: this.criticDraft() || null,
        criticMax: this.criticMaxDraft() >= 100 ? null : this.criticMaxDraft(),
      });
    }
  }

  protected toggleYearMenu(key: 'yearMin' | 'yearMax', event: Event): void {
    event.stopPropagation();
    this.openYearMenu.update((current) => (current === key ? null : key));
  }

  protected selectYear(key: 'yearMin' | 'yearMax', year: number | null): void {
    this.openYearMenu.set(null);
    const currentMax = this.filters().yearMax;
    if (key === 'yearMin' && year !== null && currentMax !== null && year > currentMax) {
      this.filtersService.update({ yearMin: year, yearMax: null });
      return;
    }
    this.filtersService.update({ [key]: year });
  }

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: Event): void {
    if (this.openYearMenu() && !this.hostEl.nativeElement.contains(event.target as Node)) {
      this.openYearMenu.set(null);
    }
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.openYearMenu.set(null);
  }
}
