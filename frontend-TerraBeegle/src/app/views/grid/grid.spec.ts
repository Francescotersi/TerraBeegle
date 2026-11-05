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

  it('should render the lucky-ape-27 heart checkbox in game details when hovered', async () => {
    const testGame = createMockGame({
      rawgGameId: 99,
      name: 'Super Test Game',
      released: '2024-01-01',
      rating: 4.9,
      metacritic: 90,
    });

    componentRef.setInput('games', [testGame]);
    fixture.detectChanges();
    await fixture.whenStable();

    // Trigger hover on game
    const card = fixture.nativeElement.querySelector('.game-card') as HTMLElement;
    card.dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();
    await fixture.whenStable();

    const heartContainer = fixture.nativeElement.querySelector('.heart-container');
    expect(heartContainer).toBeTruthy();

    const checkbox = heartContainer.querySelector('input.checkbox') as HTMLInputElement;
    expect(checkbox).toBeTruthy();
    expect(checkbox.checked).toBe(false);

    const svgOutline = heartContainer.querySelector('.svg-outline');
    const svgFilled = heartContainer.querySelector('.svg-filled');
    const svgCelebrate = heartContainer.querySelector('.svg-celebrate');
    expect(svgOutline).toBeTruthy();
    expect(svgFilled).toBeTruthy();
    expect(svgCelebrate).toBeTruthy();
  });

  it('should keep the checkbox checked when closing and reopening the hover', async () => {
    const testGame = createMockGame({
      rawgGameId: 42,
      name: 'Persistence Test Game',
      released: '2024-01-01',
      rating: 4.8,
      metacritic: 85,
    });

    componentRef.setInput('games', [testGame]);
    // Simulate user having game in favorites
    (component as any).favoritedIds.set(new Set([42]));
    fixture.detectChanges();
    await fixture.whenStable();

    // 1. Open hover
    const card = fixture.nativeElement.querySelector('.game-card') as HTMLElement;
    card.dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();
    await fixture.whenStable();

    let checkbox = fixture.nativeElement.querySelector('.heart-container input.checkbox') as HTMLInputElement;
    expect(checkbox).toBeTruthy();
    expect(checkbox.checked).toBe(true);

    // 2. Close hover (mouseleave)
    card.dispatchEvent(new MouseEvent('mouseleave'));
    fixture.detectChanges();
    await fixture.whenStable();

    // Details panel is unmounted
    expect(fixture.nativeElement.querySelector('.heart-container')).toBeNull();

    // 3. Reopen hover (mouseenter)
    card.dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();
    await fixture.whenStable();

    // Checkbox is mounted again and MUST be checked
    checkbox = fixture.nativeElement.querySelector('.heart-container input.checkbox') as HTMLInputElement;
    expect(checkbox).toBeTruthy();
    expect(checkbox.checked).toBe(true);

    const heartContainer = fixture.nativeElement.querySelector('.heart-container');
    expect(heartContainer.classList.contains('is-active')).toBe(true);
  });
});
