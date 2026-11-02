import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WishlistPageComponent } from './wishlist-page.component';

describe('WishlistPageComponent', () => {
  let component: WishlistPageComponent;
  let fixture: ComponentFixture<WishlistPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WishlistPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WishlistPageComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render grid component with wishlist games', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.wishlistGames().length).toBeGreaterThan(0);
    const gridEl = fixture.nativeElement.querySelector('app-grid-component');
    expect(gridEl).toBeTruthy();
  });
});

