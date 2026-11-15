import { Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GameCardDTO, GameDetailsDTO } from '../../../../models-services/game.model';
import { GameService } from '../../../../services/game.service';
import { LiquidGlassComponent } from '../../../../ui/liquid-glass/liquid-glass.component';
import { GAME_DETAILS_STYLES } from '../../styles/game-details.styles';
import { joinNames, websiteLabel } from '../../utils/game-details.utils';

// Right column: extra facts, "Where to find it", and "Content for this game" (DLCs & expansions)
@Component({
  selector: 'app-game-info',
  standalone: true,
  imports: [LiquidGlassComponent, RouterLink],
  template: `
    @let g = game();
    <div class="d-flex flex-column gap-3 gap-lg-4">
      <app-liquid-glass borderRadius="20px" blur="3px" [scale]="85" background="var(--tb-glass-bg)">
        <section class="p-3 p-md-4">
          <h2 class="section-title">Details</h2>
          <dl class="facts mb-0">
            @if (g.gameModes?.length) {
              <dt>Game modes</dt>
              <dd>{{ joinNames(g.gameModes) }}</dd>
            }
            @if (g.perspectives?.length) {
              <dt>Perspective</dt>
              <dd>{{ joinNames(g.perspectives) }}</dd>
            }
            @if (g.themes?.length) {
              <dt>Themes</dt>
              <dd>{{ joinNames(g.themes) }}</dd>
            }
            @if (g.franchises?.length) {
              <dt>Franchise</dt>
              <dd>{{ joinNames(g.franchises) }}</dd>
            }
            @if (g.pegiRatingDescription?.length) {
              <dt>PEGI content</dt>
              <dd>{{ g.pegiRatingDescription!.join(', ') }}</dd>
            }
            @if (releaseDates().length) {
              <dt>Releases</dt>
              <dd>
                <ul class="list-unstyled mb-0">
                  @for (release of releaseDates(); track $index) {
                    <li>{{ release.platformName }} · <span class="text-body-secondary">{{ release.human }}</span></li>
                  }
                </ul>
              </dd>
            }
          </dl>
        </section>
      </app-liquid-glass>

      @if (linkGroups().length) {
        <app-liquid-glass borderRadius="20px" blur="3px" [scale]="85" background="var(--tb-glass-bg)">
          <section class="p-3 p-md-4">
            <h2 class="section-title">Where to find it</h2>
            @for (group of linkGroups(); track group.title; let isFirst = $first) {
              @if (!isFirst) {
                <hr class="links-divider" />
              }
              <h3 class="links-subtitle">{{ group.title }}</h3>
              <div class="d-flex flex-wrap gap-2">
                @for (link of group.links; track link.url) {
                  <a class="link-chip" [href]="link.url" target="_blank" rel="noopener noreferrer">{{ link.label }}</a>
                }
              </div>
            }
          </section>
        </app-liquid-glass>
      }

      @if (contents().length) {
        <app-liquid-glass borderRadius="20px" blur="3px" [scale]="85" background="var(--tb-glass-bg)">
          <section class="p-3 p-md-4">
            <div class="d-flex align-items-center justify-content-between gap-2 mb-3">
              <h2 class="section-title mb-0">Content for this game</h2>
              @if (contents().length > 4) {
                <button
                  type="button"
                  class="dlc-toggle-btn"
                  (click)="showAllContents.set(!showAllContents())"
                >
                  {{ showAllContents() ? 'Show less' : 'View all (' + contents().length + ')' }}
                </button>
              }
            </div>

            <div class="dlc-list">
              @for (item of visibleContents(); track item.apiGameId) {
                <a
                  class="dlc-row"
                  [routerLink]="['/game', item.slug || item.apiGameId]"
                  (click)="rememberContentSlug(item)"
                >
                  <span class="dlc-name">{{ item.name }}</span>
                  <span class="dlc-type">{{ item.typeLabel }}</span>
                </a>
              }
            </div>
          </section>
        </app-liquid-glass>
      }
    </div>
  `,
  styles: [
    GAME_DETAILS_STYLES,
    `
      .links-subtitle {
        font-size: 0.78rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--tb-text-muted);
        margin-bottom: 0.55rem;
      }
      .links-divider {
        border: 0;
        border-top: 1px solid var(--tb-glass-border);
        opacity: 1;
        margin: 0.9rem 0;
      }
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
      .dlc-row:hover {
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
export class GameInfoComponent {
  private readonly gameService = inject(GameService);
  readonly game = input.required<GameDetailsDTO>();

  protected readonly joinNames = joinNames;
  protected readonly showAllContents = signal(false);

  // One row per platform, without duplicates
  protected readonly releaseDates = computed(() => {
    const seen = new Set<string>();
    return (this.game().releaseDates ?? []).filter((release) => {
      const key = `${release.platformName}|${release.human}`;
      if (!release.platformName || !release.human || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  });

  // Grouped by backend categories: Official Website, Stores, Websites
  protected readonly linkGroups = computed(() => {
    const g = this.game();
    const seenUrls = new Set<string>();

    const collectLinks = (sites: typeof g.stores): { label: string; url: string }[] => {
      const items: { label: string; url: string }[] = [];
      for (const site of sites ?? []) {
        if (!site.url || seenUrls.has(site.url)) continue;
        seenUrls.add(site.url);
        items.push({ label: websiteLabel(site), url: site.url });
      }
      return items;
    };

    const groups: { title: string; links: { label: string; url: string }[] }[] = [];

    if (g.officialWebsite) {
      seenUrls.add(g.officialWebsite);
      groups.push({
        title: 'Official Website',
        links: [{ label: 'Official website', url: g.officialWebsite }],
      });
    }

    const storeLinks = collectLinks(g.stores);
    if (storeLinks.length) {
      groups.push({ title: 'Stores', links: storeLinks });
    }

    const websiteLinks = collectLinks(g.websites);
    if (websiteLinks.length) {
      groups.push({ title: 'Websites', links: websiteLinks });
    }

    return groups;
  });

  // Combines expansions and DLCs for "Content for this game", deduplicated by game ID
  protected readonly contents = computed(() => {
    const g = this.game();
    const seenIds = new Set<number>();
    const items: (GameCardDTO & { typeLabel: string })[] = [];

    const appendGroup = (list: GameCardDTO[] | null | undefined, fallbackType: string): void => {
      for (const item of list ?? []) {
        if (!item?.apiGameId || seenIds.has(item.apiGameId)) continue;
        seenIds.add(item.apiGameId);
        items.push({ ...item, typeLabel: item.gameType || fallbackType });
      }
    };

    appendGroup(g.expansions, 'Expansion');
    appendGroup(g.dlcs, 'DLC');
    return items;
  });

  protected readonly visibleContents = computed(() =>
    this.showAllContents() ? this.contents() : this.contents().slice(0, 4)
  );

  protected rememberContentSlug(item: GameCardDTO): void {
    this.gameService.rememberGameSlug(item.slug, item.apiGameId);
  }
}
