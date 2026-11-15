import { Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GameCardDTO, GameDetailsDTO } from '../../../../models-services/game.model';
import { GameService } from '../../../../services/game.service';
import { LiquidGlassComponent } from '../../../../ui/liquid-glass/liquid-glass.component';
import { GAME_DETAILS_STYLES } from '../../styles/game-details.styles';

interface ContentRow {
  key: string;
  name: string;
  typeLabel: string;
  game?: GameCardDTO;
}

interface ContentSection {
  id: string;
  title: string;
  items: ContentRow[];
}

/** Displays DLCs, expansions, and related game editions/franchises in compact lists. */
@Component({
  selector: 'app-game-contents',
  standalone: true,
  imports: [LiquidGlassComponent, RouterLink],
  template: `
    @if (sections().length) {
      <div class="d-flex flex-column gap-3 gap-lg-4">
        @for (section of sections(); track section.id) {
          <app-liquid-glass borderRadius="20px" blur="3px" [scale]="85" background="var(--tb-glass-bg)">
            <section class="p-3 p-md-4">
              <div class="d-flex align-items-center justify-content-between gap-2 mb-3">
                <h2 class="section-title mb-0">{{ section.title }}</h2>
                @if (section.items.length > 4) {
                  <button
                    type="button"
                    class="dlc-toggle-btn"
                    (click)="toggleSection(section.id)"
                  >
                    {{ isExpanded(section.id) ? 'Show less' : 'View all (' + section.items.length + ')' }}
                  </button>
                }
              </div>

              <div class="dlc-list">
                @for (item of visibleItems(section); track item.key) {
                  @if (item.game; as linkedGame) {
                    <a
                      class="dlc-row"
                      [routerLink]="['/game', linkedGame.slug || linkedGame.apiGameId]"
                      (click)="rememberContentSlug(linkedGame)"
                    >
                      <span class="dlc-name">{{ item.name }}</span>
                      <span class="dlc-type">{{ item.typeLabel }}</span>
                    </a>
                  } @else {
                    <div class="dlc-row dlc-row--static">
                      <span class="dlc-name">{{ item.name }}</span>
                      <span class="dlc-type">{{ item.typeLabel }}</span>
                    </div>
                  }
                }
              </div>
            </section>
          </app-liquid-glass>
        }
      </div>
    }
  `,
  styles: [
    GAME_DETAILS_STYLES,
    `
      .dlc-toggle-btn {
        padding: 0.28rem 0.65rem;
        border-radius: 8px;
        border: 1px solid var(--tb-glass-border);
        background: var(--tb-glass-inner-bg);
        color: var(--tb-text);
        font-size: 0.76rem;
        font-weight: 600;
        cursor: pointer;
        flex-shrink: 0;
        transition: border-color 0.2s ease, color 0.2s ease;
      }
      .dlc-toggle-btn:hover {
        border-color: var(--tb-accent);
        color: var(--tb-accent);
      }
      .dlc-list {
        display: flex;
        flex-direction: column;
        gap: 2px;
        border-radius: 12px;
        overflow: hidden;
        border: 1px solid var(--tb-glass-border);
      }
      .dlc-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
        padding: 0.55rem 0.85rem;
        background: var(--tb-glass-inner-bg);
        color: var(--tb-text);
        text-decoration: none;
        font-size: 0.86rem;
        transition: background-color 0.18s ease, color 0.18s ease, padding-left 0.18s ease;
      }
      .dlc-row:not(.dlc-row--static):hover {
        background: color-mix(in srgb, var(--tb-accent) 14%, var(--tb-glass-inner-bg));
        color: var(--tb-accent);
        padding-left: 1.05rem;
      }
      .dlc-name {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-weight: 500;
      }
      .dlc-type {
        flex-shrink: 0;
        font-size: 0.7rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--tb-text-muted);
      }
    `,
  ],
})
export class GameContentsComponent {
  private readonly gameService = inject(GameService);
  readonly game = input.required<GameDetailsDTO>();

  private readonly expandedSections = signal<Record<string, boolean>>({});

  protected readonly sections = computed<ContentSection[]>(() => {
    const g = this.game();
    const result: ContentSection[] = [];

    const toGameRows = (list: GameCardDTO[] | null | undefined, fallbackType: string): ContentRow[] => {
      const seen = new Set<number>();
      const rows: ContentRow[] = [];
      for (const item of list ?? []) {
        if (!item?.apiGameId || seen.has(item.apiGameId)) continue;
        seen.add(item.apiGameId);
        rows.push({
          key: `game-${item.apiGameId}`,
          name: item.name,
          typeLabel: item.gameType || fallbackType,
          game: item,
        });
      }
      return rows;
    };

    const contentSeen = new Set<number>();
    const contentRows: ContentRow[] = [];
    for (const [list, fallback] of [
      [g.expansions, 'Expansion'],
      [g.dlcs, 'DLC'],
    ] as const) {
      for (const item of list ?? []) {
        if (!item?.apiGameId || contentSeen.has(item.apiGameId)) continue;
        contentSeen.add(item.apiGameId);
        contentRows.push({
          key: `content-${item.apiGameId}`,
          name: item.name,
          typeLabel: item.gameType || fallback,
          game: item,
        });
      }
    }
    if (contentRows.length) {
      result.push({ id: 'content', title: 'Content for this game', items: contentRows });
    }

    const isDlcOrExpansion = /dlc|expansion/i.test(g.gameType ?? '');
    if (isDlcOrExpansion && g.parentGame?.apiGameId) {
      result.push({
        id: 'parent-game',
        title: 'Parent game',
        items: [
          {
            key: `parent-${g.parentGame.apiGameId}`,
            name: g.parentGame.name,
            typeLabel: g.parentGame.gameType || 'Base game',
            game: g.parentGame,
          },
        ],
      });
    }

    if (g.versionParent?.apiGameId) {
      result.push({
        id: 'version-parent',
        title: 'Version parent',
        items: [
          {
            key: `version-${g.versionParent.apiGameId}`,
            name: g.versionParent.name,
            typeLabel: g.versionParent.gameType || 'Original',
            game: g.versionParent,
          },
        ],
      });
    }

    const cardGroups: [string, string, GameCardDTO[] | null | undefined, string][] = [
      ['standalone-expansions', 'Standalone expansions', g.standaloneExpansions, 'Standalone'],
      ['expanded-games', 'Expanded games', g.expandedGames, 'Expanded'],
      ['remakes', 'Remakes', g.remakes, 'Remake'],
      ['remasters', 'Remasters', g.remasters, 'Remaster'],
      ['bundles', 'Bundles', g.bundles, 'Bundle'],
    ];

    for (const [id, title, list, fallback] of cardGroups) {
      const items = toGameRows(list, fallback);
      if (items.length) {
        result.push({ id, title, items });
      }
    }

    const franchiseRows: ContentRow[] = (g.franchises ?? [])
      .filter((f) => Boolean(f?.name))
      .map((f) => ({
        key: `franchise-${f.id}`,
        name: f.name,
        typeLabel: 'Franchise',
      }));
    if (franchiseRows.length) {
      result.push({ id: 'franchise', title: 'Franchise', items: franchiseRows });
    }

    return result;
  });

  protected isExpanded(sectionId: string): boolean {
    return Boolean(this.expandedSections()[sectionId]);
  }

  protected toggleSection(sectionId: string): void {
    this.expandedSections.update((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  }

  protected visibleItems(section: ContentSection): ContentRow[] {
    return this.isExpanded(section.id) ? section.items : section.items.slice(0, 4);
  }

  protected rememberContentSlug(item: GameCardDTO): void {
    this.gameService.rememberGameSlug(item.slug, item.apiGameId);
  }
}
