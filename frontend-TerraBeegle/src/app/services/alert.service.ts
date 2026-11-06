import { Injectable, signal } from '@angular/core';
import { AlertNotification, AlertType } from '../models/alert.model';

export type { AlertNotification, AlertType };

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  private nextId = 0;
  private timer: ReturnType<typeof setTimeout> | null = null;

  readonly currentAlert = signal<AlertNotification | null>(null);

  showAlert(message: string, durationMs: number = 3000): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    const alertId = ++this.nextId;
    this.currentAlert.set({
      id: alertId,
      message,
      type: 'danger',
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
