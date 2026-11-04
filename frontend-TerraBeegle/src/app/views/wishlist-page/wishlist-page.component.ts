import { Component, signal } from '@angular/core';
import { GridComponent, GridComponentProps } from '../grid/grid.component';
import { createMockGame } from '../../mocks/games.mock';

@Component({
  selector: 'app-wishlist-page',
  standalone: true,
  imports: [GridComponent],
  template: `
    <app-grid-component
      title="Wishlist"
      [games]="wishlistGames()"
      emptyMessage="Your wishlist is empty. Add games you want to play later!"
    >
    </app-grid-component>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
    }
  `,
})
export class WishlistPageComponent {
  readonly wishlistGames = signal<GridComponentProps[]>([
    createMockGame({
      rawgGameId: 2,
      name: 'Cyberpunk 2077',
      released: '2020-12-10',
      rating: 4.3,
      metacritic: 86,
      genres: ['Action', 'RPG'],
      tags: ['cyberpunk', 'sci-fi'],
    }),
    createMockGame({
      rawgGameId: 6,
      name: "Baldur's Gate 3",
      released: '2023-08-03',
      rating: 4.9,
      metacritic: 96,
      genres: ['RPG', 'Strategy'],
      tags: ['turn-based', 'choice matters'],
    }),
    createMockGame({
      rawgGameId: 7,
      name: 'Hades',
      released: '2020-09-17',
      rating: 4.8,
      metacritic: 93,
      genres: ['Action', 'Indie'],
      tags: ['roguelike', 'mythology'],
    }),
  ]);
}

