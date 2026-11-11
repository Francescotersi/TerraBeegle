import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlertComponent } from './alert.component';
import { AlertService } from '../../services/alert.service';

describe('AlertComponent', () => {
  let component: AlertComponent;
  let fixture: ComponentFixture<AlertComponent>;
  let alertService: AlertService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AlertComponent);
    component = fixture.componentInstance;
    alertService = TestBed.inject(AlertService);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not display alert when null', () => {
    fixture.detectChanges();
    const alertEl = fixture.nativeElement.querySelector('.alert');
    expect(alertEl).toBeNull();
  });

  it('should display compact red alert with English message when triggered', async () => {
    alertService.showAlert('Please log in to manage your favorites.');
    fixture.detectChanges();
    await fixture.whenStable();

    const alertEl = fixture.nativeElement.querySelector('.alert-danger');
    expect(alertEl).toBeTruthy();
    expect(alertEl.textContent).toContain('Please log in to manage your favorites.');
  });

  it('should display green success alert with a check mark', async () => {
    alertService.showSuccess('Profile updated successfully.');
    fixture.detectChanges();
    await fixture.whenStable();

    const alertEl = fixture.nativeElement.querySelector('.alert-success');
    expect(alertEl).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.alert-danger')).toBeNull();
    expect(alertEl.querySelector('polyline')).toBeTruthy();
    expect(alertEl.textContent).toContain('Profile updated successfully.');
  });

  it('should dismiss alert when clicking close button', async () => {
    alertService.showAlert('Please log in to manage your wishlist.');
    fixture.detectChanges();
    await fixture.whenStable();

    const closeBtn = fixture.nativeElement.querySelector('.btn-close');
    expect(closeBtn).toBeTruthy();
    closeBtn.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const alertEl = fixture.nativeElement.querySelector('.alert');
    expect(alertEl).toBeNull();
  });
});
