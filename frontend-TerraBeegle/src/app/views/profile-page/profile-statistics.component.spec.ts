import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ProfileStatisticsComponent } from './profile-statistics.component';
import { WishlistFavoritesService } from '../../services/wishlist-favorites.service';
import { AlertService } from '../../services/alert.service';
import { GameCardDTO } from '../../models-services/game.model';

describe('ProfileStatisticsComponent charts', () => {
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
  it('renders all four categories as donuts and counts real theme metadata', () => {
    const fixture = render([
      { genres: [{ id: 12, name: 'RPG', slug: 'rpg' }], platforms: [],
        themes: [{ id: 17, name: 'Fantasy', slug: 'fantasy' }] },
      { genres: [], platforms: [], themes: [{ id: 17, name: 'Fantasy', slug: 'fantasy' }] },
    ]);
    expect(fixture.nativeElement.querySelectorAll('.donut-chart').length).toBe(4);
    expect(fixture.componentInstance.themeItems()[0].count).toBe(2);
    expect(fixture.nativeElement.textContent).toContain('Favorite themes');
    expect(fixture.nativeElement.querySelectorAll('.bar-track').length).toBe(0);
  });
  it('groups small slices without leaving a gap in the donut', () => {
    const themes = Array.from({ length: 10 }, (_, id) => ({ id, name: `Theme ${id}`, slug: `theme-${id}` }));
    const fixture = render([{ genres: [], platforms: [], themes }]);
    const items = fixture.componentInstance.themeItems();
    expect(items.length).toBe(8);
    expect(items.find(item => item.label === 'Other')?.count).toBe(3);
    expect(items.reduce((sum, item) => sum + item.percentage, 0)).toBeCloseTo(100);
    expect(fixture.componentInstance.charts().find(chart => chart.unit === 'themes')?.total).toBe(10);
  });
  it('handles games without themes', () => {
    const fixture = render([{ genres: [], platforms: [], themes: null }]);
    expect(fixture.componentInstance.themeItems()).toEqual([]);
    expect(fixture.nativeElement.textContent).toContain('No themes data available.');
  });
});
