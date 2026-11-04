import { Component, signal, OnInit, inject} from '@angular/core';
import { GridComponent, GridComponentProps } from '../grid/grid.component';
import { createMockGame } from '../../mocks/games.mock';
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
  readonly catalogGames = signal<GridComponentProps[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadCatalogGames();
  }

  loadCatalogGames(page: number = 1): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.gameService.getGames({ page, pageSize: 25, sortBy: 'rating', ascending: false }).subscribe({
      next: (response) => {
        const mappedGames = response.results.map((g) => this.gameService.toGridProps(g));
        this.catalogGames.set(mappedGames);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching catalog games:', err);
        this.errorMessage.set('Could not load games. Please try again later.');
        this.isLoading.set(false);
      }
    });
  }


  // readonly catalogGames = signal<GridComponentProps[]>([
  //   createMockGame({ rawgGameId: 1, name: 'The Witcher 3: Wild Hunt', released: '2015-05-19', rating: 4.8, metacritic: 93, genres: ['RPG', 'Adventure'], tags: ['open world', 'fantasy'] }),
  //   createMockGame({ rawgGameId: 2, name: 'Cyberpunk 2077', released: '2020-12-10', rating: 4.3, metacritic: 86, genres: ['Action', 'RPG'], tags: ['cyberpunk', 'sci-fi'] }),
  //   createMockGame({ rawgGameId: 3, name: 'Elden Ring', released: '2022-02-25', rating: 4.9, metacritic: 96, genres: ['RPG', 'Action'], tags: ['souls-like', 'dark fantasy'] }),
  //   createMockGame({ rawgGameId: 4, name: 'Hollow Knight', released: '2017-02-24', rating: 4.7, metacritic: 90, genres: ['Platformer', 'Adventure'], tags: ['metroidvania', 'indie'] }),
  //   createMockGame({ rawgGameId: 5, name: 'Red Dead Redemption 2', released: '2018-10-26', rating: 4.9, metacritic: 97, genres: ['Action', 'Adventure'], tags: ['western', 'open world'] }),
  //   createMockGame({ rawgGameId: 6, name: "Baldur's Gate 3", released: '2023-08-03', rating: 4.9, metacritic: 96, genres: ['RPG', 'Strategy'], tags: ['turn-based', 'choice matters'] }),
  //   createMockGame({ rawgGameId: 7, name: 'Hades', released: '2020-09-17', rating: 4.8, metacritic: 93, genres: ['Action', 'Indie'], tags: ['roguelike', 'mythology'] }),
  //   createMockGame({ rawgGameId: 8, name: 'God of War', released: '2018-04-20', rating: 4.8, metacritic: 94, genres: ['Action', 'Adventure'], tags: ['mythology', 'action'] }),
  //   createMockGame({ rawgGameId: 9, name: 'The Legend of Zelda: Breath of the Wild', released: '2017-03-03', rating: 4.9, metacritic: 97, genres: ['Adventure', 'Action'], tags: ['exploration', 'open world'] }),
  //   createMockGame({ rawgGameId: 10, name: 'Persona 5 Royal', released: '2020-03-31', rating: 4.8, metacritic: 95, genres: ['RPG'], tags: ['anime', 'turn-based'] }),
  //   createMockGame({ rawgGameId: 11, name: 'Sekiro: Shadows Die Twice', released: '2019-03-22', rating: 4.7, metacritic: 90, genres: ['Action', 'Adventure'], tags: ['souls-like', 'stealth'] }),
  //   createMockGame({ rawgGameId: 12, name: 'Dark Souls III', released: '2016-04-12', rating: 4.7, metacritic: 89, genres: ['RPG', 'Action'], tags: ['dark fantasy', 'difficult'] }),
  //   createMockGame({ rawgGameId: 13, name: 'Bloodborne', released: '2015-03-24', rating: 4.8, metacritic: 92, genres: ['RPG', 'Action'], tags: ['lovecraftian', 'horror'] }),
  //   createMockGame({ rawgGameId: 14, name: 'Monster Hunter: World', released: '2018-01-26', rating: 4.6, metacritic: 90, genres: ['Action', 'RPG'], tags: ['hunting', 'co-op'] }),
  //   createMockGame({ rawgGameId: 15, name: 'Grand Theft Auto V', released: '2013-09-17', rating: 4.7, metacritic: 97, genres: ['Action', 'Adventure'], tags: ['open world', 'multiplayer'] }),
  //   createMockGame({ rawgGameId: 16, name: 'Celeste', released: '2018-01-25', rating: 4.8, metacritic: 92, genres: ['Platformer', 'Indie'], tags: ['precision', 'pixel art'] }),
  //   createMockGame({ rawgGameId: 17, name: 'Disco Elysium', released: '2019-10-15', rating: 4.8, metacritic: 97, genres: ['RPG'], tags: ['detective', 'narrative'] }),
  //   createMockGame({ rawgGameId: 18, name: 'Mass Effect Legendary Edition', released: '2021-05-14', rating: 4.7, metacritic: 90, genres: ['RPG', 'Action'], tags: ['sci-fi', 'space'] }),
  //   createMockGame({ rawgGameId: 19, name: 'Fallout: New Vegas', released: '2010-10-19', rating: 4.7, metacritic: 84, genres: ['RPG', 'Action'], tags: ['post-apocalyptic', 'classic'] }),
  //   createMockGame({ rawgGameId: 20, name: 'DOOM Eternal', released: '2020-03-20', rating: 4.6, metacritic: 88, genres: ['Action', 'Shooter'], tags: ['fast-paced', 'demons'] }),
  //   createMockGame({ rawgGameId: 21, name: 'Portal 2', released: '2011-04-19', rating: 4.9, metacritic: 95, genres: ['Puzzle', 'Adventure'], tags: ['co-op', 'comedy'] }),
  //   createMockGame({ rawgGameId: 22, name: 'Half-Life: Alyx', released: '2020-03-23', rating: 4.8, metacritic: 93, genres: ['Action', 'VR'], tags: ['sci-fi', 'vr'] }),
  //   createMockGame({ rawgGameId: 23, name: 'Resident Evil 4 Remake', released: '2023-03-24', rating: 4.8, metacritic: 93, genres: ['Action', 'Horror'], tags: ['survival', 'remake'] }),
  //   createMockGame({ rawgGameId: 24, name: 'Ghost of Tsushima', released: '2020-07-17', rating: 4.7, metacritic: 87, genres: ['Action', 'Adventure'], tags: ['samurai', 'open world'] }),
  //   createMockGame({ rawgGameId: 25, name: 'Final Fantasy VII Remake', released: '2020-04-10', rating: 4.6, metacritic: 87, genres: ['RPG', 'Action'], tags: ['jrpg', 'remake'] }),
  // ]);
}
