import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentRef } from '@angular/core';
import { GridComponent, GridComponentProps } from './grid.component';
import { createMockGame } from '../../mocks/games.mock';

describe('GridComponent', () => {
  let component: GridComponent;
  let componentRef: ComponentRef<GridComponent>;
  let fixture: ComponentFixture<GridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GridComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GridComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render custom title', async () => {
    componentRef.setInput('title', 'My Custom Title');
    fixture.detectChanges();
    await fixture.whenStable();

    const titleEl = fixture.nativeElement.querySelector('h2');
    expect(titleEl?.textContent).toContain('My Custom Title');
  });

  it('should display emptyMessage when games list is empty', async () => {
    componentRef.setInput('games', []);
    componentRef.setInput('emptyMessage', 'No games currently available.');
    fixture.detectChanges();
    await fixture.whenStable();

    const emptyText = fixture.nativeElement.querySelector('.text-muted p');
    expect(emptyText?.textContent).toContain('No games currently available.');
  });

  it('should handle pagination and show more logic', async () => {
    // Generate 25 games
    const testGames: GridComponentProps[] = Array.from({ length: 25 }, (_, i) =>
      createMockGame({
        rawgGameId: i + 1,
        name: `Game ${i + 1}`,
        released: '2024-01-01',
        rating: 4.5,
        metacritic: 80,
      })
    );

    componentRef.setInput('games', testGames);
    fixture.detectChanges();
    await fixture.whenStable();

    // First page should show 20 games
    let cards = fixture.nativeElement.querySelectorAll('.game-card');
    expect(cards.length).toBe(20);

    // Show More button should be visible
    const showMoreBtn = fixture.nativeElement.querySelector('.btn-show-more');
    expect(showMoreBtn).toBeTruthy();

    // Click show more
    showMoreBtn.click();
    fixture.detectChanges();
    await fixture.whenStable();

    // All 25 games should now be rendered
    cards = fixture.nativeElement.querySelectorAll('.game-card');
    expect(cards.length).toBe(25);

    // Show More button should disappear
    const showMoreBtnAfter = fixture.nativeElement.querySelector('.btn-show-more');
    expect(showMoreBtnAfter).toBeNull();
  });
});
