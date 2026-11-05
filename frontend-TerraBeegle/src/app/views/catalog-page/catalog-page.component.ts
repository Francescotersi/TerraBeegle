import { Component, signal, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { GridComponent, GridComponentProps } from '../grid/grid.component';
import { MOCK_GAMES } from '../../mocks/games.mock';
import { GameService } from '../../services/game.service';

@Component({
  imports: [GridComponent],
  standalone: true,
  selector: 'app-catalog-page',
  template: `
    @if (isLoading()) {
      <div class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading games...</span>
        </div>
      </div>
    } @else if (errorMessage()) {
      <div class="alert alert-danger mx-auto my-4 text-center" style="max-width: 600px;">
        {{ errorMessage() }}
      </div>
    } @else {
      @if (isUsingMock()) {
        <div
          class="alert alert-warning py-2 px-3 mx-auto my-3 text-center d-flex align-items-center justify-content-center gap-2"
          style="max-width: 620px; border-radius: 10px;"
          role="status"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span class="small fw-medium">
            API non disponibile: visualizzazione dei giochi mock di esempio.
          </span>
        </div>
      }
      <app-grid-component
        title="Games Catalog"
        [games]="catalogGames()"
        emptyMessage="No games found in the catalog."
      >
      </app-grid-component>
    }
  `,
})
export class CatalogPage implements OnInit {
  private readonly gameService = inject(GameService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly catalogGames = signal<GridComponentProps[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly errorMessage = signal<string | null>(null);
  readonly isUsingMock = signal<boolean>(false);

  ngOnInit(): void {
    this.loadCatalogGames();
  }

  loadCatalogGames(page: number = 1): void {
    // Durante il prerendering server-side (SSR), carica direttamente i mock per evitare chiamate HTTP relative non gestite
    if (!isPlatformBrowser(this.platformId)) {
      this.catalogGames.set(MOCK_GAMES);
      this.isLoading.set(false);
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.isUsingMock.set(false);

    this.gameService
      .getGames({ page, pageSize: 25, sortBy: 'rating', ascending: false })
      .subscribe({
        next: (response) => {
          if (response?.results && response.results.length > 0) {
            const mappedGames = response.results.map((g) => this.gameService.toGridProps(g));
            this.catalogGames.set(mappedGames);
          } else {
            console.warn('API returned empty results, loading mock games catalog.');
            this.catalogGames.set(MOCK_GAMES);
            this.isUsingMock.set(true);
          }
          this.isLoading.set(false);
        },
        error: (err) => {
          console.warn('Backend API unavailable. Loading mock games instead:', err);
          this.catalogGames.set(MOCK_GAMES);
          this.isUsingMock.set(true);
          this.isLoading.set(false);
        },
      });
  }
}
