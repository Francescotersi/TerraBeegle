import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CatalogPage } from './catalog-page.component';

describe('CatalogPage', () => {
  let component: CatalogPage;
  let fixture: ComponentFixture<CatalogPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatalogPage],
    }).compileComponents();

    fixture = TestBed.createComponent(CatalogPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with catalog games and render the grid component', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.catalogGames().length).toBeGreaterThan(0);
    const gridEl = fixture.nativeElement.querySelector('app-grid-component');
    expect(gridEl).toBeTruthy();
  });
});
