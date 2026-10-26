import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LiquidGlassComponent } from './liquid-glass.component';

@Component({
  standalone: true,
  imports: [LiquidGlassComponent],
  template: `
    <app-liquid-glass
      [width]="320"
      [height]="76"
      [borderRadius]="38"
      [borderWidth]="0.07"
      [distortionScale]="-180"
      [displace]="0.5"
      [backgroundOpacity]="0.1"
      [customClass]="'custom-test-surface'"
    >
      <div id="test-projected-content">Liquid Glass Content</div>
    </app-liquid-glass>
  `,
})
class TestHostComponent {}

describe('LiquidGlassComponent', () => {
  let component: LiquidGlassComponent;
  let fixture: ComponentFixture<LiquidGlassComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LiquidGlassComponent, TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LiquidGlassComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default inputs matching Desktop LiquidGlass specification', () => {
    expect(component.borderRadius).toBe(20);
    expect(component.borderWidth).toBe(0.07);
    expect(component.brightness).toBe(50);
    expect(component.opacity).toBe(0.93);
    expect(component.blur).toBe(11);
    expect(component.distortionScale).toBe(-180);
    expect(component.redOffset).toBe(0);
    expect(component.greenOffset).toBe(10);
    expect(component.blueOffset).toBe(20);
    expect(component.xChannel).toBe('R');
    expect(component.yChannel).toBe('G');
    expect(component.refraction).toBe(true);
    expect(component.renderer).toBe('auto');
  });

  it('should generate a valid SVG displacement map data URL', () => {
    expect(component.mapUrl).toBeDefined();
    expect(component.mapUrl.startsWith('data:image/svg+xml')).toBe(true);

    const decodedSvg = decodeURIComponent(
      component.mapUrl.replace('data:image/svg+xml,', '')
    );
    expect(decodedSvg).toContain('<svg');
    expect(decodedSvg).toContain('linearGradient');
    expect(decodedSvg).toContain('stop-color="red"');
    expect(decodedSvg).toContain('stop-color="blue"');
    expect(decodedSvg).toContain('feGaussianBlur');
  });

  it('should compute containerStyle with customStyle, borderRadius, and CSS variables', () => {
    component.borderRadius = 38;
    component.backgroundOpacity = 0.1;
    component.saturation = 1.2;
    component.customStyle = { zIndex: 5 };

    const style = component.containerStyle;
    expect(style['borderRadius']).toBe('38px');
    expect(style['--glass-frost']).toBe(0.1);
    expect(style['--glass-saturation']).toBe(1.2);
    expect(style['--filter-id']).toContain(component.filterId);
    expect(style['zIndex']).toBe(5);
  });

  it('should update displacement map when inputs change', () => {
    component.borderRadius = 32;
    component.borderWidth = 0.15;
    component.blur = 16;

    component.ngOnChanges({
      borderRadius: {
        currentValue: 32,
        previousValue: 20,
        firstChange: false,
        isFirstChange: () => false,
      },
      borderWidth: {
        currentValue: 0.15,
        previousValue: 0.07,
        firstChange: false,
        isFirstChange: () => false,
      },
    });

    const decodedSvg = decodeURIComponent(
      component.mapUrl.replace('data:image/svg+xml,', '')
    );
    expect(decodedSvg).toContain('rx="32"');
    expect(decodedSvg).toContain('stdDeviation="16"');
  });

  it('should project content when used as a wrapper component', () => {
    const hostFixture = TestBed.createComponent(TestHostComponent);
    hostFixture.detectChanges();

    const compiled = hostFixture.nativeElement as HTMLElement;
    const content = compiled.querySelector('#test-projected-content');
    expect(content).toBeTruthy();
    expect(content?.textContent).toContain('Liquid Glass Content');

    const glassEl = compiled.querySelector('.glass-surface') as HTMLElement;
    expect(glassEl).toBeTruthy();
    expect(glassEl.classList.contains('custom-test-surface')).toBe(true);
    expect(glassEl.style.width).toBe('320px');
    expect(glassEl.style.height).toBe('76px');
    expect(glassEl.style.borderRadius).toBe('38px');
  });

  it('should support fallback mode when refraction is false', () => {
    component.refraction = false;
    expect(component.isFallbackActive).toBe(true);
    expect(component.isSvgActive).toBe(false);
    expect(component.isWebGLActive).toBe(false);
  });

  it('should generate valid filter and gradient IDs using uniqueId', () => {
    expect(component.filterId).toContain('glass-filter-');
    expect(component.redGradId).toContain('red-grad-');
    expect(component.blueGradId).toContain('blue-grad-');
    expect(component.softId).toContain('soft-');
  });
});
