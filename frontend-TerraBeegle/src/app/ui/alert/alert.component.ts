import { Component, inject } from '@angular/core';
import { AlertService, AlertNotification } from '../../services/alert.service';
import { LiquidGlassComponent } from '../liquid-glass/liquid-glass.component';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [LiquidGlassComponent],
  template: `
    @if (alert(); as current) {
      <div
        class="toast-container position-fixed top-0 end-0 p-3"
        style="z-index: 100000; pointer-events: none;"
        aria-live="polite"
        aria-atomic="true"
      >
        <div class="alert-toast-wrapper">
          <app-liquid-glass
            borderRadius="18px"
            blur="3px"
            [scale]="85"
            background="var(--tb-glass-bg)"
            [customStyle]="isSuccess(current) ? successStyle : errorStyle"
          >
            <div
              class="alert alert-liquid-inner d-flex align-items-center gap-2 py-2 px-3 mb-0 border-0"
              [class.alert-danger]="!isSuccess(current)"
              [class.alert-success]="isSuccess(current)"
              [attr.role]="isSuccess(current) ? 'status' : 'alert'"
            >
              <!-- Icon badge styled consistently with site modals and buttons -->
              <div class="alert-icon-circle flex-shrink-0" [class.success]="isSuccess(current)">
                @if (isSuccess(current)) {
                  <!-- Green check mark -->
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#22c55e"
                    stroke-width="3"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                } @else {
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#ef4444"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                }
              </div>

              <!-- Message -->
              <div class="alert-content flex-grow-1">
                <span class="d-block alert-message fw-medium text-break">
                  {{ current.message }}
                </span>
              </div>

              <!-- Close button -->
              <button
                type="button"
                class="btn-close ms-2 flex-shrink-0"
                aria-label="Close"
                (click)="alertService.dismiss()"
              ></button>
            </div>
          </app-liquid-glass>
        </div>
      </div>
    }
  `,
  styles: `
    .toast-container {
      pointer-events: none;
    }

    .alert-toast-wrapper {
      pointer-events: auto;
      max-width: 360px;
      animation: alertSlideIn 0.28s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .alert-liquid-inner {
      background: transparent !important;
      color: var(--tb-text) !important;
    }

    .alert-icon-circle {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.35);
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .alert-icon-circle.success {
      background: rgba(34, 197, 94, 0.15);
      border-color: rgba(34, 197, 94, 0.35);
    }

    .alert-title {
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      line-height: 1.2;
      margin-bottom: 2px;
    }

    .alert-message {
      font-size: 0.84rem;
      line-height: 1.35;
      color: var(--tb-text);
      letter-spacing: 0.01em;
    }

    .btn-close {
      font-size: 0.65rem;
      padding: 0.25rem;
      opacity: 0.75;
      transition: opacity 0.2s ease, transform 0.2s ease;
    }

    .btn-close:hover {
      opacity: 1;
      transform: scale(1.1);
    }

    @keyframes alertSlideIn {
      from {
        opacity: 0;
        transform: translateY(-14px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
  `,
})
export class AlertComponent {
  protected readonly alertService = inject(AlertService);
  protected readonly alert = this.alertService.currentAlert;

  // Same glass look for both, only the color changes: red for errors, green for success
  protected readonly errorStyle = {
    border: '1px solid rgba(239, 68, 68, 0.42)',
    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(220, 38, 38, 0.04) 100%), var(--tb-glass-bg)',
  };

  protected readonly successStyle = {
    border: '1px solid rgba(34, 197, 94, 0.42)',
    background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.12) 0%, rgba(22, 163, 74, 0.04) 100%), var(--tb-glass-bg)',
  };

  protected isSuccess(alert: AlertNotification): boolean {
    return alert.type === 'success';
  }
}
