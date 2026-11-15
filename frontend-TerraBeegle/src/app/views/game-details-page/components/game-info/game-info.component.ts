import { Component, computed, input } from '@angular/core';
import { GameDetailsDTO } from '../../../../models-services/game.model';
import { LiquidGlassComponent } from '../../../../ui/liquid-glass/liquid-glass.component';
import { GAME_DETAILS_STYLES } from '../../styles/game-details.styles';
import { joinNames, websiteLabel } from '../../utils/game-details.utils';

/** Displays game metadata (modes, themes, releases) and categorized external links. */
@Component({
  selector: 'app-game-info',
  standalone: true,
  imports: [LiquidGlassComponent],
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
    `,
  ],
})
export class GameInfoComponent {
  readonly game = input.required<GameDetailsDTO>();

  protected readonly joinNames = joinNames;

  protected readonly releaseDates = computed(() => {
    const seen = new Set<string>();
    return (this.game().releaseDates ?? []).filter((release) => {
      const key = `${release.platformName}|${release.human}`;
      if (!release.platformName || !release.human || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  });

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
}
