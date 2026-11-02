import { Component, signal } from '@angular/core';
import { GridComponent, GridComponentProps } from '../grid/grid.component';
import { createMockGame } from '../../mocks/games.mock';

@Component({
  selector: 'app-favorite-page',
  standalone: true,
  imports: [GridComponent],
  template: `
    <app-grid-component
      title="Favorites"
      [games]="favoriteGames()"
      emptyMessage="No favorite games yet. Browse the catalog and add your favorites!"
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
export class FavoritePageComponent {
  readonly favoriteGames = signal<GridComponentProps[]>([
    createMockGame({
      rawgGameId: 1,
      name: 'The Witcher 3: Wild Hunt',
      released: '2015-05-19',
      rating: 4.8,
      metacritic: 93,
      genres: ['RPG', 'Adventure'],
      tags: ['open world', 'fantasy'],
    }),
    createMockGame({
      rawgGameId: 3,
      name: 'Elden Ring',
      released: '2022-02-25',
      rating: 4.9,
      metacritic: 96,
      genres: ['RPG', 'Action'],
      tags: ['souls-like', 'dark fantasy'],
    }),
    createMockGame({
      rawgGameId: 4,
      name: 'Hollow Knight',
      released: '2017-02-24',
      rating: 4.7,
      metacritic: 90,
      genres: ['Platformer', 'Adventure'],
      tags: ['metroidvania', 'indie'],
    }),
  ]);
}
