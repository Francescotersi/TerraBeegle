import { Component, input } from '@angular/core';
import { GameDetailsDTO } from '../../../../models-services/game.model';
import { LiquidGlassComponent } from '../../../../ui/liquid-glass/liquid-glass.component';
import { GAME_DETAILS_STYLES } from '../../styles/game-details.styles';

// "About" (summary + storyline) and the trailers of the game
@Component({
  selector: 'app-game-about',
  standalone: true,
  imports: [LiquidGlassComponent],
  template: `
    @let g = game();
    <div class="d-flex flex-column gap-3 gap-lg-4">
      <app-liquid-glass borderRadius="20px" blur="3px" [scale]="85" background="var(--tb-glass-bg)">
        <section class="p-3 p-md-4">
          <h2 class="section-title">About</h2>
          @if (g.summary || g.storyline) {
            @if (g.summary) {
              <p class="text-block">{{ g.summary }}</p>
            }
            @if (g.storyline) {
              <h3 class="sub-title">Storyline</h3>
              <p class="text-block mb-0">{{ g.storyline }}</p>
            }
          } @else {
            <p class="text-body-secondary mb-0">No description available for this game.</p>
          }
        </section>
      </app-liquid-glass>

      @if (g.videos?.length) {
        <app-liquid-glass borderRadius="20px" blur="3px" [scale]="85" background="var(--tb-glass-bg)">
          <section class="p-3 p-md-4">
            <h2 class="section-title">Videos</h2>
            <div class="d-flex flex-wrap gap-2">
              @for (video of g.videos; track video.videoUrl) {
                <a class="link-chip" [href]="video.videoUrl" target="_blank" rel="noopener noreferrer">▶ {{ video.name || 'Trailer' }}</a>
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
    .sub-title {
      font-size: 0.95rem;
      font-weight: 700;
      margin: 1rem 0 0.5rem;
    }
    .text-block {
      line-height: 1.65;
      white-space: pre-line;
    }
  `,
  ],
})
export class GameAboutComponent {
  readonly game = input.required<GameDetailsDTO>();
}
