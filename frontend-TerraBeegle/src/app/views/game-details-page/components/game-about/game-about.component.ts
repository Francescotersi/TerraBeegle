import { Component, ElementRef, computed, inject, input, viewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { GameDetailsDTO } from '../../../../models-services/game.model';
import { LiquidGlassComponent } from '../../../../ui/liquid-glass/liquid-glass.component';
import { createCarouselScroll } from '../../../../ui/carousel/carousel-scroll';
import { GAME_DETAILS_STYLES } from '../../styles/game-details.styles';

interface EmbeddableVideo {
  name: string;
  videoUrl: string;
  embedUrl: SafeResourceUrl | null;
}

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

      @if (videos().length) {
        <app-liquid-glass borderRadius="20px" blur="3px" [scale]="85" background="var(--tb-glass-bg)">
          <section class="p-3 p-md-4">
            <h2 class="section-title">Videos</h2>
            <div class="carousel-wrapper">
              <button
                type="button"
                class="carousel-btn prev"
                [class.is-hidden]="!videoCarousel.canPrev()"
                [inert]="!videoCarousel.canPrev()"
                aria-label="Previous videos"
                (click)="videoCarousel.scroll(-1)"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
              <div #videoTrack class="carousel-track" (scroll)="videoCarousel.onScroll()">
                @for (video of videos(); track video.videoUrl) {
                  <div class="video-slide" [class.single]="videos().length === 1">
                    @if (video.embedUrl) {
                      <div class="video-card">
                        <div class="ratio ratio-16x9 video-frame">
                          <iframe
                            [src]="video.embedUrl"
                            [title]="video.name"
                            loading="lazy"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowfullscreen
                          ></iframe>
                        </div>
                        <p class="video-title mb-0 mt-2">{{ video.name }}</p>
                      </div>
                    } @else {
                      <a class="link-chip" [href]="video.videoUrl" target="_blank" rel="noopener noreferrer">
                        ▶ {{ video.name }}
                      </a>
                    }
                  </div>
                }
              </div>
              <button
                type="button"
                class="carousel-btn next"
                [class.is-hidden]="!videoCarousel.canNext()"
                [inert]="!videoCarousel.canNext()"
                aria-label="Next videos"
                (click)="videoCarousel.scroll(1)"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
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
    .video-frame {
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid var(--tb-glass-border);
      background: #000;
    }
    .video-title {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--tb-text);
    }
    .video-slide {
      flex: 0 0 100%;
      scroll-snap-align: start;
    }
    @media (min-width: 768px) {
      .video-slide:not(.single) {
        flex: 0 0 calc(50% - 6px);
      }
    }
  `,
  ],
})
export class GameAboutComponent {
  readonly game = input.required<GameDetailsDTO>();
  private readonly sanitizer = inject(DomSanitizer);
  private readonly videoTrack = viewChild<ElementRef<HTMLElement>>('videoTrack');

  protected readonly videos = computed<EmbeddableVideo[]>(() =>
    (this.game().videos ?? []).map((video) => {
      const id = this.extractYouTubeId(video.videoUrl);
      return {
        name: video.name || 'Trailer',
        videoUrl: video.videoUrl,
        embedUrl: id
          ? this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${id}`)
          : null,
      };
    })
  );

  protected readonly videoCarousel = createCarouselScroll(this.videoTrack, 300, this.videos);

  private extractYouTubeId(url: string): string | null {
    try {
      const parsed = new URL(url);
      if (parsed.hostname.includes('youtu.be')) {
        return parsed.pathname.slice(1) || null;
      }
      if (parsed.hostname.includes('youtube.com')) {
        return (
          parsed.searchParams.get('v') ??
          parsed.pathname.match(/^\/(?:embed|shorts)\/([^/?]+)/)?.[1] ??
          null
        );
      }
      return null;
    } catch {
      return null;
    }
  }
}
