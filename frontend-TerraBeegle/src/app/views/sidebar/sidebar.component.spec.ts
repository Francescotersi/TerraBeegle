import { CatalogFiltersService } from '../../services/catalog-filters.service';
import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { convertToParamMap, provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { SidebarComponent } from './sidebar.component';
import { GameService } from '../../services/game.service';

describe('SidebarComponent themes', () => {
  it('loads theme options and sends the selected theme to the catalog URL', () => {
    TestBed.configureTestingModule({ imports: [SidebarComponent], providers: [
      provideRouter([]),
      { provide: PLATFORM_ID, useValue: 'browser' },
      { provide: GameService, useValue: {
        getGenres: () => of([]), getPlatforms: () => of([]),
        getThemes: () => of([{ id: 17, name: 'Fantasy', slug: 'fantasy' }]),
      } },
    ] });
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(SidebarComponent);
    fixture.detectChanges();
    const buttons = [...fixture.nativeElement.querySelectorAll('button')] as HTMLButtonElement[];
    const fantasy = buttons.find(button => button.textContent?.trim() === 'Fantasy');
    expect(fantasy).toBeTruthy();
    fantasy!.click();
    expect(navigate).toHaveBeenCalledWith(['/'], expect.objectContaining({
      queryParams: expect.objectContaining({ themes: [17] }),
    }));
  });
  it('clamps crossing handles, applies both bounds on release and resets from URL filters', () => {
    TestBed.configureTestingModule({ imports: [SidebarComponent], providers: [
      provideRouter([]), { provide: PLATFORM_ID, useValue: 'browser' },
      { provide: GameService, useValue: {
        getGenres: () => of([]), getPlatforms: () => of([]), getThemes: () => of([]),
      } },
    ] });
    const filters = TestBed.inject(CatalogFiltersService);
    filters.filters.set(filters.parse(convertToParamMap({ rating: '2', ratingMax: '8' })));
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(SidebarComponent);
    fixture.detectChanges();
    const minimum = fixture.nativeElement.querySelector('[aria-label="Minimum user rating"]') as HTMLInputElement;
    const maximum = fixture.nativeElement.querySelector('[aria-label="Maximum user rating"]') as HTMLInputElement;
    expect(minimum.value).toBe('2');
    expect(maximum.value).toBe('8');
    minimum.value = '9';
    minimum.dispatchEvent(new Event('input'));
    expect(minimum.value).toBe('8');
    minimum.dispatchEvent(new Event('change'));
    expect(navigate).toHaveBeenCalledWith(['/'], expect.objectContaining({
      queryParams: expect.objectContaining({ rating: 8, ratingMax: 8 }),
    }));
    maximum.value = '1';
    maximum.dispatchEvent(new Event('input'));
    expect(maximum.value).toBe('8');
    filters.filters.set(filters.parse(convertToParamMap({})));
    fixture.detectChanges();
    expect(minimum.value).toBe('0');
    expect(maximum.value).toBe('10');
  });

});
