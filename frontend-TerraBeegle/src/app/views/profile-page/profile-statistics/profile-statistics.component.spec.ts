import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ProfileStatisticsComponent } from './profile-statistics.component';
import { WishlistFavoritesService } from '../../../services/wishlist-favorites.service';
import { AlertService } from '../../../services/alert.service';
import { GameCardDTO } from '../../../models-services/game.model';

describe('ProfileStatisticsComponent', () => {
  function render(games: Partial<GameCardDTO>[]) {
    TestBed.configureTestingModule({ imports: [ProfileStatisticsComponent], providers: [
      { provide: PLATFORM_ID, useValue: 'browser' },
      { provide: WishlistFavoritesService, useValue: {
        getFavorites: () => of({ items: games, totalCount: games.length }),
      } },
      { provide: AlertService, useValue: { showAlert: vi.fn() } },
    ] });
    const fixture = TestBed.createComponent(ProfileStatisticsComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('shows the 4 donut cards in the grid with the counted data', () => {
    const fixture = render([
      { genres: [{ id: 12, name: 'RPG', slug: 'rpg' }], platforms: [],
        themes: [{ id: 17, name: 'Fantasy', slug: 'fantasy' }] },
      { genres: [{ id: 12, name: 'RPG', slug: 'rpg' }, { id: 31, name: 'Adventure', slug: 'adventure' }],
        platforms: [], themes: [{ id: 17, name: 'Fantasy', slug: 'fantasy' }] },
    ]);
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelectorAll('app-donut-card').length).toBe(4);
    expect(fixture.componentInstance.genreItems()).toEqual([
      { label: 'RPG', count: 2 },
      { label: 'Adventure', count: 1 },
    ]);
    expect(element.textContent).toContain('Favorite themes');
    expect(element.textContent).toContain('Playing style');
  });

  it('handles games without themes', () => {
    const fixture = render([{ genres: [], platforms: [], themes: null }]);
    expect(fixture.componentInstance.themeItems()).toEqual([]);
    expect(fixture.nativeElement.textContent).toContain('No theme data for your favorites yet.');
  });
});
