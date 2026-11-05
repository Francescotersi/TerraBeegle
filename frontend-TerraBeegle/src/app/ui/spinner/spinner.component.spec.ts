import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SpinnerComponent } from './spinner.component';

describe('SpinnerComponent', () => {
  let component: SpinnerComponent;
  let fixture: ComponentFixture<SpinnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpinnerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the Young Walrus loader with mask and box', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const loader = compiled.querySelector('.loader');
    const svg = compiled.querySelector('svg');
    const mask = compiled.querySelector('mask');
    const box = compiled.querySelector('.box');

    expect(loader).toBeTruthy();
    expect(svg).toBeTruthy();
    expect(mask).toBeTruthy();
    expect(box).toBeTruthy();
  });

  it('should support custom text caption', () => {
    fixture.componentRef.setInput('text', 'Attendi per favore...');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const caption = compiled.querySelector('.spinner-caption');
    expect(caption?.textContent?.trim()).toBe('Attendi per favore...');
  });

  it('should scale dimension according to size preset', () => {
    fixture.componentRef.setInput('size', 'btn');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const wrapper = compiled.querySelector('.tb-spinner-wrapper') as HTMLElement;
    expect(wrapper.style.width).toBe('26px');
    expect(wrapper.style.height).toBe('26px');
  });
});

