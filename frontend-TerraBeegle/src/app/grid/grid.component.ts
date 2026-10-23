import { Component, signal, computed } from '@angular/core';

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
  imports: [],
  selector: 'app-grid-component',
  template: `
    <div class="py-4">
      <h2 class="h3 fw-bold mb-4 text-center">super</h2>

      <div
        class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-5 g-4
        justify-content-start"
      >
        @for (game of paginatedGames(); track game.rawgGameId) {
          
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
      <nav class="mt-5" aria-label="Choose page">
        <ul class="pagination justify-content-center">
          <li class="page-item" [class.disabled]="currentPage() === 1">
            <a class="page-link" (click)="goToPage(currentPage() - 1)">Previous</a>
          </li>

          @for (page of pageNumbers(); track page) {
            <li class="page-item" [class.active]="currentPage() === page">
              <a class="page-link" (click)="goToPage(page)">{{ page }}</a>
            </li>
          }

          <li class="page-item" [class.disabled]="currentPage() === totalPages()">
            <a class="page-link" (click)="goToPage(currentPage() + 1)">Next</a>
          </li>
        </ul>
      </nav>
    </div>
  `,
  styles: `
    .game-card {
      aspect-ratio: 16 / 9;
      border-radius: 12px;
      overflow: hidden;
      cursor: pointer;
      position: relative;    
      transform: translateZ(0);
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
      will-change: transform;
      transform-origin: bottom center;
      transition: transform 0.25s cubic-bezier(0.2, 0, 0.2, 1), box-shadow 0.25s ease;
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

  protected readonly pageSize = 20;
  protected readonly currentPage = signal(1);

  protected readonly totalPages = computed(() => {
    return Math.ceil(this.props.length / this.pageSize);
  });

  protected readonly pageNumbers = computed(() => {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
  });

  protected readonly paginatedGames = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.props.slice(start, end);
  });

  protected goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
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
