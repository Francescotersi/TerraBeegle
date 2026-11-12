export type AlertType = 'danger' | 'warning' | 'info' | 'success';

export interface AlertNotification {
  id: number;
  message: string;
  type?: AlertType;
  durationMs?: number;
}
