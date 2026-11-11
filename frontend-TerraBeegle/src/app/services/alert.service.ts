import { Injectable, signal } from '@angular/core';
import { AlertNotification, AlertType } from '../models-services/alert.model';

export type { AlertNotification, AlertType };

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  private nextId = 0;
  private timer: ReturnType<typeof setTimeout> | null = null;

  readonly currentAlert = signal<AlertNotification | null>(null);

  // Shows a red error toast
  showAlert(message: string, durationMs: number = 3000): void {
    this.show(message, 'danger', durationMs);
  }

  // Shows a green success toast with a check mark
  showSuccess(message: string, durationMs: number = 3000): void {
    this.show(message, 'success', durationMs);
  }

  private show(message: string, type: AlertType, durationMs: number): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    const alertId = ++this.nextId;
    this.currentAlert.set({
      id: alertId,
      message,
      type,
      durationMs,
    });

    if (durationMs > 0) {
      this.timer = setTimeout(() => {
        if (this.currentAlert()?.id === alertId) {
          this.dismiss();
        }
      }, durationMs);
    }
  }

  dismiss(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.currentAlert.set(null);
  }
}
