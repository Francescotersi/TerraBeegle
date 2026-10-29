import { Component, signal, computed } from '@angular/core';
import { LiquidGlassComponent } from '../../ui/liquid-glass/liquid-glass.component';

interface GridComponentProps {
  rawgGameId: number;
  name: string;
  description: string;
  released: string;
  tba: boolean;
  website: string;
  rating: number;
  metacritic: number;
  coverImage: string;
  developer: string;
  publisher: string;
  platforms: number[];
  tags: string[];
  genres: string[];
}

@Component({
  imports: [LiquidGlassComponent],
  selector: 'app-grid-component',
  template: `
  <app-liquid-glass
    borderRadius="26px"
    blur="2px"
    [scale]="85"
  >
    <div class="p-4 grid-wrapper mx-auto">
      <h2 class="h3 fw-bold mb-4 text-center">Beegle's Games Catalog</h2>

      <div
        class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-4 g-3
        justify-content-center"
      >
        @for (game of visibleGames(); track game.rawgGameId) {
          
          <div class="col">
            <div class="card h-100 shadow-sm game-card">
              <img 
                [src]="game.coverImage"
                [alt]="game.name"
                class="card-img game-cover"
              />
              <div class="card-img-overlay d-flex flex-column justify-content-end p-2 card-overlay">
                <h6 class="card-title fw-bold mb-1 text-white" [title]="game.name">
                  {{ game.name }}
                </h6>

                <div class="card-details d-flex align-items-center justify-content-between">
                  <span class="badge bg-warning text-dark py-1 px-1 small">
                    ★ {{ game.rating }}
                  </span>
                  
                  @if (game.metacritic) {
                    <span class="badge bg-dark border border-secondary text-light py-1 px-1 small">
                      Metacritic: {{ game.metacritic }}
                    </span>
                  }

                </div>
              </div>
            </div>
          </div>
        }       
      </div>
      @if (hasMoreGames()) {
        <div class="text-center mt-5">
          <button 
            class="btn btn-show-more px-4 py-2 fw-semibold shadow-sm" 
            type="button"
            (click)="showMore()"
          >
            Show More
          </button>
        </div>
      }
    </div>
  </app-liquid-glass>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
      max-width: 1000px;
      margin: 0 auto;
    }

    app-liquid-glass {
      display: block;
      width: 100%;
    }

    .grid-wrapper {
      max-width: 1000px;
      width: 100%;
    }

    .btn-show-more {
      background: linear-gradient(135deg, #fb7185 0%, #f472b6 100%);
      border: 1px solid rgba(255, 255, 255, 0.6);
      backdrop-filter: blur(8px);
      border-radius: 20px;
      color: #fff;
      transition: all 0.2s ease;
      box-shadow: 0 2px 10px rgba(244, 114, 182, 0.3);
    }
    .btn-show-more:hover {
      background: linear-gradient(135deg, #f43f5e 0%, #ec4899 100%);
      box-shadow: 0 4px 16px rgba(244, 114, 182, 0.45);
      transform: translateY(-2px);
      color: #fff;
    }

    .game-card {
      aspect-ratio: 16 / 9;
      border-radius: 12px;
      overflow: hidden;
      cursor: pointer;
      position: relative;    
      border: none;
      transform: translateZ(0);
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
      will-change: transform;
      transform-origin: bottom center;
      transition: transform 0.25s cubic-bezier(0.2, 0, 0.2, 1), box-shadow 0.25s ease;
    }

    .game-card::before {
      content: '';
      position: absolute;
      inset: 0;
      z-index: 2;
      border-radius: inherit;
      pointer-events: none;
      -webkit-box-shadow: inset 2px 2px 0px -2px rgba(255, 255, 255, 0.7), 
                          inset 0 0 3px 1px rgba(255, 255, 255, 0.7);
      box-shadow: inset 6px 6px 0px -6px rgba(255, 255, 255, 0.7), 
                  inset 0 0 8px 1px rgba(255, 255, 255, 0.7);
    }

    .game-card:hover {
      transition-delay: 0.25s;
      transform: scale(1.05);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
      z-index: 10;
    }
        
    .game-cover {
      height: 100%;
      width: 100%;
      object-fit: cover;
    }

    .card-overlay {
      background: linear-gradient(
        to top,
        rgba(0, 0, 0, 0.8) 0%,
        rgba(0, 0, 0, 0.6) 20%,
        rgba(0, 0, 0, 0.4) 40%,
        rgba(0, 0, 0, 0.2) 60%,
        rgba(0, 0, 0, 0) 100%
      );
      transition: background 0.28s ease;
    }

    .card-details {
      max-height: 0;
      opacity: 0;
      transform: translateY(8px);
      overflow: hidden;
      transition: max-height 0.28s ease, opacity 0.22s ease, transform 0.25s ease;
    }
    .game-card:hover .card-details {
      max-height: 40px;
      opacity: 1;
      transition-delay: 0.25s;
      transform: translateY(0);
    }
  `,
})
export class GridComponent {
  private readonly step = 20;
  protected readonly visibleCount = signal(20);

  protected readonly visibleGames = computed(() => {
    return this.props.slice(0, this.visibleCount());
  });

  protected readonly hasMoreGames = computed(() => {
    return this.visibleCount() < this.props.length;
  });

  protected showMore(): void {
    this.visibleCount.update((count) => count + this.step);
  }


  //    test
  protected readonly props: GridComponentProps[] = [
    this.createGame({ rawgGameId: 1, name: 'The Witcher 3: Wild Hunt', released: '2015-05-19', rating: 4.8, metacritic: 93, tags: ['fantasy', 'open world', 'magic'], genres: ['RPG', 'Adventure'] }),
    this.createGame({ rawgGameId: 2, name: 'Cyberpunk 2077', released: '2020-12-10', rating: 4.3, metacritic: 86, tags: ['cyberpunk', 'future', 'neon'], genres: ['Action', 'RPG'] }),
    this.createGame({ rawgGameId: 3, name: 'Elden Ring', released: '2022-02-25', rating: 4.9, metacritic: 96, tags: ['souls-like', 'dark fantasy', 'boss battles'], genres: ['RPG', 'Action'] }),
    this.createGame({ rawgGameId: 4, name: 'Hollow Knight', released: '2017-02-24', rating: 4.7, metacritic: 90, tags: ['insects', 'exploration', 'metroidvania'], genres: ['Platformer', 'Adventure'] }),
    this.createGame({ rawgGameId: 5, name: 'Hollow Knight', released: '2017-02-24', rating: 4.7, metacritic: 90, tags: ['underground', 'mystery', 'indie'], genres: ['Platformer', 'Action'] }),
    this.createGame({ rawgGameId: 6, name: 'Hollow Knight', released: '2017-02-24', rating: 4.7, metacritic: 90, tags: ['knights', 'ruins', 'challenging'], genres: ['Adventure', 'Indie'] }),
    this.createGame({ rawgGameId: 7, name: 'Hollow Knight', released: '2017-02-24', rating: 4.7, metacritic: 90, tags: ['caverns', 'combat', 'hand-drawn'], genres: ['Action', 'Platformer'] }),
  ];

  //    test
  private createGame(game: Partial<GridComponentProps> & Pick<GridComponentProps, 'rawgGameId' | 'name' | 'released' | 'rating' | 'metacritic'>): GridComponentProps {
    return {
      description: '',
      tba: false,
      website: '',
      coverImage: 'https://imgs.search.brave.com/a1EsFjU-WvxTYpFAexmjkr9I7R1sdZ5L3-Gwc3AhY9A/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93YWxs/cGFwZXJhY2Nlc3Mu/Y29tL2Z1bGwvMTA0/NTg1NzUuanBn',
      developer: '',
      publisher: '',
      genres: [],
      platforms: [6, 48, 49],
      ...game,
      tags: game.tags ?? [],
    };
  }
}
