import { Component, input, output } from '@angular/core';
import { GameGenreItem } from '../../models-services/game.model';

export interface SidebarCategorySection {
  key: 'genres' | 'themes' | 'platforms';
  label: string;
  items: GameGenreItem[];
  selectedIds: number[];
  emptyLabel: string;
  errorLabel: string;
}

/** Collapsible taxonomy accordion list (Genres, Themes, Platforms) for the catalog sidebar. */
@Component({
  selector: 'app-sidebar-category-list',
  standalone: true,
  template: `
    @for (section of sections(); track section.key) {
      <div class="category-group mb-2">
        <button
          class="category-btn d-flex justify-content-between align-items-center w-100 py-2 px-2 rounded-3 border-0"
          type="button"
          (click)="toggleSection.emit(section.key)"
          [attr.aria-expanded]="isSectionOpen(section.key)"
        >
          <span class="fw-bold small text-uppercase">
            {{ section.label }}
            @if (section.selectedIds.length) {
              <span class="count-badge">{{ section.selectedIds.length }}</span>
            }
          </span>
          <span class="chevron" [class.open]="isSectionOpen(section.key)">▾</span>
        </button>
        <div class="collapse" [class.show]="isSectionOpen(section.key)">
          <ul class="category-list list-unstyled mb-0 py-1">
            @for (item of section.items; track item.id) {
              <li class="category-item">
                <button
                  type="button"
                  class="sidebar-list-link d-flex align-items-center justify-content-between rounded-2"
                  [class.active]="section.selectedIds.includes(item.id)"
                  [attr.aria-pressed]="section.selectedIds.includes(item.id)"
                  (click)="toggleItem.emit({ key: section.key, id: item.id })"
                >
                  <span class="text-start">{{ item.name }}</span>
                  @if (section.selectedIds.includes(item.id)) {
                    <span aria-hidden="true">✓</span>
                  }
                </button>
              </li>
            }
            @if (section.items.length === 0) {
              <li class="text-muted small px-3 py-1">{{ listsError() ? section.errorLabel : section.emptyLabel }}</li>
            }
          </ul>
        </div>
      </div>
    }
  `,
  styles: `
    :host {
      display: block;
    }
    .category-btn {
      background: transparent;
      color: var(--tb-text);
      transition: background 0.2s ease, color 0.2s ease;
    }
    .category-btn:hover {
      background-color: var(--tb-accent-subtle);
      color: var(--tb-accent);
    }
    .chevron {
      font-size: 0.9rem;
      transition: transform 0.2s ease, color 0.2s ease;
      display: inline-block;
      transform: rotate(-90deg);
      color: var(--tb-text-muted);
    }
    .chevron.open {
      transform: rotate(0deg);
      color: var(--tb-accent);
    }
    .category-list {
      max-height: 180px;
      overflow-y: auto;
      overflow-x: hidden;
      scrollbar-width: thin;
      scrollbar-color: var(--tb-accent) transparent;
      padding-left: 0.5rem;
      padding-right: 0.25rem;
    }
    .category-list::-webkit-scrollbar {
      width: 4px;
    }
    .category-list::-webkit-scrollbar-thumb {
      background: var(--tb-accent-glow);
      border-radius: 4px;
    }
    .category-item {
      margin-bottom: 4px;
    }
    .sidebar-list-link {
      background: transparent;
      cursor: pointer;
      color: var(--tb-text-muted);
      font-size: 0.85rem;
      padding: 0.35rem 0.65rem;
      border: 1px solid var(--tb-glass-border);
      text-decoration: none;
      display: flex;
      width: 100%;
      transition:
        background-color 0.12s ease-out,
        border-color 0.12s ease-out,
        color 0.12s ease-out,
        transform 0.12s cubic-bezier(0.2, 0.8, 0.2, 1);
    }
    .sidebar-list-link:hover {
      background-color: var(--tb-accent-subtle);
      border-color: var(--tb-accent);
      color: var(--tb-accent);
      transform: translateX(4px);
    }
    .sidebar-list-link.active {
      background: var(--tb-btn-gradient) !important;
      border-color: transparent;
      color: #ffffff !important;
      font-weight: 600;
      box-shadow: 0 3px 10px var(--tb-btn-gradient-shadow);
    }
    .count-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 18px;
      height: 18px;
      margin-left: 6px;
      padding: 0 5px;
      border-radius: 999px;
      background: var(--tb-btn-gradient);
      color: #fff;
      font-size: 0.68rem;
      text-transform: none;
    }
  `,
})
export class SidebarCategoryListComponent {
  readonly sections = input.required<SidebarCategorySection[]>();
  readonly openSections = input.required<Record<string, boolean>>();
  readonly hasSearchQuery = input.required<boolean>();
  readonly listsError = input.required<boolean>();

  readonly toggleSection = output<string>();
  readonly toggleItem = output<{ key: 'genres' | 'themes' | 'platforms'; id: number }>();

  protected isSectionOpen(sectionKey: 'genres' | 'themes' | 'platforms'): boolean {
    if (this.hasSearchQuery()) {
      const section = this.sections().find((s) => s.key === sectionKey);
      return (section?.items.length ?? 0) > 0;
    }
    return !!this.openSections()[sectionKey];
  }
}
