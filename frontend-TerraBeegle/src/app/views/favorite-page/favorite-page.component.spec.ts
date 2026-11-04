import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FavoritePageComponent } from './favorite-page.component';

describe('FavoritePageComponent', () => {
  let component: FavoritePageComponent;
  let fixture: ComponentFixture<FavoritePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FavoritePageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FavoritePageComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render grid component with favorites', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.favoriteGames().length).toBeGreaterThan(0);
    const gridEl = fixture.nativeElement.querySelector('app-grid-component');
    expect(gridEl).toBeTruthy();
  });
});
