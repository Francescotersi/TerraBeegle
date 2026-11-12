import { Component, computed, input } from '@angular/core';
import { GameDetailsDTO } from '../../../../models-services/game.model';
import { LiquidGlassComponent } from '../../../../ui/liquid-glass/liquid-glass.component';
import { GAME_DETAILS_STYLES } from '../../styles/game-details.styles';
import { joinNames, websiteLabel } from '../../utils/game-details.utils';

// Right column: extra facts (modes, themes, releases...) and the links "Where to find it"
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

      @if (links().length) {
        <app-liquid-glass borderRadius="20px" blur="3px" [scale]="85" background="var(--tb-glass-bg)">
          <section class="p-3 p-md-4">
            <h2 class="section-title">Where to find it</h2>
            <div class="d-flex flex-wrap gap-2">
              @for (link of links(); track link.url) {
                <a class="link-chip" [href]="link.url" target="_blank" rel="noopener noreferrer">{{ link.label }}</a>
              }
            </div>
          </section>
        </app-liquid-glass>
      }
    </div>
  `,
  styles: [GAME_DETAILS_STYLES],
})
export class GameInfoComponent {
  readonly game = input.required<GameDetailsDTO>();

  protected readonly joinNames = joinNames;

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

  // Official website first, then stores, then the other links
  protected readonly links = computed(() => {
    const g = this.game();
    const links: { label: string; url: string }[] = [];
    if (g.officialWebsite) links.push({ label: 'Official website', url: g.officialWebsite });
    for (const site of [...(g.stores ?? []), ...(g.websites ?? [])]) {
      if (!links.some((link) => link.url === site.url)) {
        links.push({ label: websiteLabel(site), url: site.url });
      }
    }
    return links;
  });
}
