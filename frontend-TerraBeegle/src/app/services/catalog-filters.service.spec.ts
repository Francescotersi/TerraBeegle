import { TestBed } from '@angular/core/testing';
import { convertToParamMap, provideRouter, Router } from '@angular/router';
import { CatalogFiltersService } from './catalog-filters.service';

describe('CatalogFiltersService themes', () => {
  it('preserves themes in URLs and API parameters alongside other filters', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const service = TestBed.inject(CatalogFiltersService);
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const filters = service.parse(convertToParamMap({ themes: ['17', '18'], genres: ['12'], search: 'Elden' }));
    service.filters.set(filters);
    expect(service.toSearchParams(filters, 1, 24)).toMatchObject({ themes: [17, 18], genres: [12], name: 'Elden' });
    expect(service.hasFilters(filters)).toBe(true);
    service.toggle('themes', 17);
    expect(navigate).toHaveBeenLastCalledWith(['/'], expect.objectContaining({
      queryParams: expect.objectContaining({ themes: [18], genres: [12], search: 'Elden' }),
    }));
    service.clear();
    expect(navigate).toHaveBeenLastCalledWith(['/'], expect.objectContaining({
      queryParams: expect.objectContaining({ themes: null, genres: null, search: 'Elden' }),
    }));
  });
  it('keeps both score bounds, including zero maxima, and converts user ratings to IGDB scores', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const service = TestBed.inject(CatalogFiltersService);
    const filters = service.parse(convertToParamMap({ rating: '6.3', ratingMax: '8.7', critic: '50', criticMax: '90' }));
    expect(service.toSearchParams(filters, 1, 24)).toMatchObject({
      ratingMin: 63, ratingMax: 87, criticRatingMin: 50, criticRatingMax: 90,
    });
    const zero = service.parse(convertToParamMap({ ratingMax: '0', criticMax: '0' }));
    expect(service.toSearchParams(zero, 1, 24)).toMatchObject({ ratingMax: 0, criticRatingMax: 0 });
    expect(service.hasFilters(zero)).toBe(true);
    const reversed = service.parse(convertToParamMap({ rating: '9', ratingMax: '3' }));
    expect(reversed).toMatchObject({ ratingMin: 3, ratingMax: 9 });
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    service.filters.set(filters);
    service.clear();
    expect(navigate).toHaveBeenLastCalledWith(['/'], expect.objectContaining({
      queryParams: expect.objectContaining({ rating: null, ratingMax: null, critic: null, criticMax: null }),
    }));
  });

});
