import { Injectable, signal } from '@angular/core';

export interface AlertNotification {
  id: number;
  message: string;
  type?: 'danger' | 'warning' | 'info' | 'success';
  durationMs?: number;
}

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  private nextId = 0;
  private timer: ReturnType<typeof setTimeout> | null = null;

  readonly currentAlert = signal<AlertNotification | null>(null);

  /**
   * Displays a compact Bootstrap danger alert in the top-right corner.
   * Auto-dismisses after durationMs (default: 3000ms = 3 seconds).
   */
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
