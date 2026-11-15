import { TestBed } from '@angular/core/testing';
import { DonutCardComponent, RankedItem } from './donut-card.component';

describe('DonutCardComponent', () => {
  function render(items: RankedItem[]) {
    const fixture = TestBed.createComponent(DonutCardComponent);
    fixture.componentRef.setInput('title', 'Favorite genres');
    fixture.componentRef.setInput('items', items);
    fixture.componentRef.setInput('centerValue', 24);
    fixture.componentRef.setInput('centerLabel', 'Favorites');
    fixture.detectChanges();
    return fixture;
  }

  it('draws one segment and one legend row per item, the total in the center', () => {
    const fixture = render([{ label: 'RPG', count: 3 }, { label: 'Adventure', count: 1 }]);
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelectorAll('svg.donut path').length).toBe(2);
    expect(element.querySelectorAll('.legend-row').length).toBe(2);
    expect(element.querySelector('.center-value')?.textContent?.trim()).toBe('24');
    expect(fixture.componentInstance.slices().map((slice) => slice.percentage)).toEqual([75, 25]);
  });

  it('shows the hovered segment in the center', () => {
    const fixture = render([{ label: 'RPG', count: 3 }, { label: 'Adventure', count: 1 }]);
    fixture.componentInstance.activeIndex.set(1);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('.center-value')?.textContent?.trim()).toBe('1');
    expect(element.querySelector('.center-label')?.textContent?.trim()).toBe('Adventure');
  });

  it('keeps the 5 largest and folds the rest into "Other"', () => {
    const items = Array.from({ length: 10 }, (_, i) => ({ label: `Theme ${i}`, count: 10 - i }));
    const slices = render(items).componentInstance.slices();
    expect(slices.length).toBe(6);
    expect(slices[5]).toEqual(expect.objectContaining({ label: 'Other', count: 15, colorIndex: 5 }));
    expect(slices.reduce((sum, slice) => sum + slice.percentage, 0)).toBeCloseTo(100);
  });

  it('shows the empty message without data', () => {
    const fixture = render([]);
    fixture.componentRef.setInput('emptyMessage', 'No genre data yet.');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No genre data yet.');
  });
});
