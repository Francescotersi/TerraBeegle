import { TestBed } from '@angular/core/testing';
import { AlertService } from './alert.service';

describe('AlertService', () => {
  let service: AlertService;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({});
    service = TestBed.inject(AlertService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should be created with initial null alert', () => {
    expect(service).toBeTruthy();
    expect(service.currentAlert()).toBeNull();
  });

  it('should set an alert and auto-dismiss after 3000ms', () => {
    service.showAlert('Please log in to manage your favorites.');
    expect(service.currentAlert()).not.toBeNull();
    expect(service.currentAlert()?.message).toBe('Please log in to manage your favorites.');
    expect(service.currentAlert()?.type).toBe('danger');

    vi.advanceTimersByTime(1500);
    // Still visible after 1.5s
    expect(service.currentAlert()).not.toBeNull();

    vi.advanceTimersByTime(1500);
    // Dismissed after 3s
    expect(service.currentAlert()).toBeNull();
  });

  it('should dismiss manually when dismiss() is called', () => {
    service.showAlert('Test alert');
    expect(service.currentAlert()).not.toBeNull();

    service.dismiss();
    expect(service.currentAlert()).toBeNull();
  });
});
