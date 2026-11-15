import { Component, input, output, inject } from '@angular/core';
import { LiquidGlassComponent } from '../../ui/liquid-glass/liquid-glass.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-logout-popup',
  standalone: true,
  imports: [LiquidGlassComponent],
  template: `
    @if (isOpen()) {
      <div class="modal-backdrop-custom" (click)="onClose()">
        <div class="modal-dialog-custom" (click)="$event.stopPropagation()">
          <app-liquid-glass
            borderRadius="24px"
            background="var(--tb-glass-bg)"
            [scale]="95"
          >
            <div class="p-4 text-center">
              <div class="modal-icon mb-3">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" x2="9" y1="12" y2="12"/>
                </svg>
              </div>

              <h3 class="h5 fw-bold text-body mb-2">Log Out</h3>
              <p class="text-body-secondary small mb-4">Are you sure you want to log out?</p>

              <div class="d-flex justify-content-center gap-3">
                <button
                  type="button"
                  class="btn btn-cancel-custom"
                  (click)="onClose()"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  class="btn btn-confirm-custom"
                  (click)="onConfirm()"
                >
                  Yes, Log Out
                </button>
              </div>
            </div>
          </app-liquid-glass>
        </div>
      </div>
    }
  `,
  styles: `
    .modal-backdrop-custom {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.45);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 99999;
      padding: 1rem;
      animation: modalFadeIn 0.25s ease-out;
    }

    .modal-dialog-custom {
      width: 100%;
      max-width: 380px;
      animation: modalScaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .modal-icon {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: rgba(220, 38, 38, 0.12);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(220, 38, 38, 0.15);
    }

    .btn-cancel-custom {
      background: var(--tb-glass-bg);
      border: 1px solid var(--tb-glass-border);
      color: var(--tb-text);
      font-weight: 600;
      padding: 0.5rem 1.25rem;
      border-radius: 12px;
      transition: all 0.2s ease;
    }

    .btn-cancel-custom:hover {
      background: var(--tb-input-bg-focus);
      color: var(--tb-text);
    }

    .btn-confirm-custom {
      background: #dc2626;
      border: none;
      color: #ffffff;
      font-weight: 600;
      padding: 0.5rem 1.25rem;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
      transition: all 0.2s ease;
    }

    .btn-confirm-custom:hover {
      background: #b91c1c;
      box-shadow: 0 6px 16px rgba(220, 38, 38, 0.4);
      transform: translateY(-1px);
    }

    @keyframes modalFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes modalScaleUp {
      from {
        opacity: 0;
        transform: scale(0.92);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
  `,
})
export class logoutPopupComponent {
  private readonly authService = inject(AuthService);

  readonly isOpen = input<boolean>(false);
  readonly close = output<void>();

  protected onClose(): void {
    this.close.emit();
  }

  protected onConfirm(): void {
    this.close.emit();
    this.authService.logout();
  }
}
