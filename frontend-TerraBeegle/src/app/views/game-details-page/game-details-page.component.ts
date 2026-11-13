import { Component, DestroyRef, OnInit, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GameService } from '../../services/game.service';
import { GameDetailsDTO } from '../../models-services/game.model';
import { GridComponent, GridComponentProps } from '../grid/grid.component';
import { GridGameActionsService } from '../grid/services/grid-game-actions.service';
import { LiquidGlassComponent } from '../../ui/liquid-glass/liquid-glass.component';
import { SpinnerComponent } from '../../ui/spinner/spinner.component';
import { GameHeroComponent } from './components/game-hero/game-hero.component';
import { GameAboutComponent } from './components/game-about/game-about.component';
import { GameGalleryComponent } from './components/game-gallery/game-gallery.component';
import { GameInfoComponent } from './components/game-info/game-info.component';
import { GAME_DETAILS_STYLES } from './styles/game-details.styles';

// /game/:id — loads the game from GET /api/games/{id} and places its sections
@Component({
  selector: 'app-game-details-page',
  standalone: true,
  imports: [
    RouterLink,
    GridComponent,
    LiquidGlassComponent,
    SpinnerComponent,
    GameHeroComponent,
    GameAboutComponent,
    GameGalleryComponent,
    GameInfoComponent,
  ],
  // One instance for the page and its sections (the hero buttons); the similar games grid has its own
  template: `
    <div class="details-page pt-2 pt-md-4">
      <a routerLink="/" class="back-link d-inline-flex align-items-center gap-1 mb-3">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
        Back to catalog
      </a>

      @if (isLoading()) {
        <div class="d-flex justify-content-center py-5 my-4">
          <app-spinner size="lg" />
        </div>
      } @else if (errorMessage()) {
        <app-liquid-glass borderRadius="20px" blur="3px" [scale]="85" background="var(--tb-glass-bg)">
          <div class="text-center p-4 p-md-5">
            <h2 class="h4 fw-bold mb-2">Something went wrong</h2>
            <p class="text-body-secondary mb-4">{{ errorMessage() }}</p>
            <button type="button" class="btn btn-gradient px-4" (click)="reload()">Try again</button>
          </div>
        </app-liquid-glass>
      } @else if (game(); as g) {
        <app-game-hero [game]="g" />

        <div class="row g-3 g-lg-4 mt-1">
          <div class="col-12 col-xl-8 d-flex flex-column gap-3 gap-lg-4">
            <app-game-about [game]="g" />
            <app-game-gallery [images]="gallery()" [gameName]="g.name" />
          </div>

          <div class="col-12 col-xl-4">
            <app-game-info [game]="g" />
          </div>
        </div>

        @if (similarGames().length > 0) {
          <div class="mt-3">
            <app-grid-component title="Similar games" [games]="similarGames()" />
          </div>
        }
      }
    </div>
  `,
  styles: [
    GAME_DETAILS_STYLES,
    `
    .back-link {
      color: var(--tb-text-muted);
      font-weight: 600;
      font-size: 0.9rem;
      text-decoration: none;
      transition: color 0.2s ease, transform 0.2s ease;
    }
    .back-link:hover {
      color: var(--tb-accent);
      transform: translateX(-2px);
    }
  `,
  ],
})
export class GameDetailsPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly gameService = inject(GameService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly actions = inject(GridGameActionsService);

  protected readonly game = signal<GameDetailsDTO | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  private gameId = 0;

  // Screenshots first, then artworks
  protected readonly gallery = computed(() => {
    const g = this.game();
    return g ? [...(g.screenshots ?? []), ...(g.artworks ?? [])] : [];
  });

  protected readonly similarGames = computed<GridComponentProps[]>(() =>
    (this.game()?.similarGames ?? []).map((game) => this.gameService.toGridProps(game))
  );

  ngOnInit(): void {
    this.actions.loadUserCollections();

    // paramMap (not a snapshot), so opening a similar game from this page loads the new one
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.gameId = Number(params.get('id'));
      this.loadGame();
    });
  }

  // Reloads the current game (the "Try again" button)
  protected reload(): void {
    this.loadGame();
  }

  // Downloads the game details from GET /api/games/{id}
  private loadGame(): void {
    // During SSR the relative /api URL cannot be called; the browser loads the data after hydration
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (!Number.isInteger(this.gameId) || this.gameId <= 0) {
      this.isLoading.set(false);
      this.errorMessage.set('This game does not exist.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.gameService.getGameById(this.gameId).subscribe({
      next: (game) => {
        this.game.set(game);
        this.isLoading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.game.set(null);
        this.isLoading.set(false);
        this.errorMessage.set(
          error.status === 404
            ? 'This game does not exist.'
            : 'The game service is not available right now. Please try again in a moment.'
        );
      },
    });
  }
}
