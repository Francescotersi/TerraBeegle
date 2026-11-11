import { Component, input } from '@angular/core';
import { User } from '../../models/user.model';
import { DogComponent } from '../../ui/dog/dog.component';

@Component({
  selector: 'app-profile-details',
  standalone: true,
  imports: [DogComponent],
  template: `
    <div class="row g-3">
      <div class="col-12 col-sm-6">
        <div class="info-card p-3 rounded-3">
          <span class="info-label text-body-secondary small text-uppercase fw-semibold d-block mb-1">Username</span>
          <span class="info-value fw-bold text-body">&#64;{{ user()?.username || '—' }}</span>
        </div>
      </div>
      <div class="col-12 col-sm-6">
        <div class="info-card p-3 rounded-3">
          <span class="info-label text-body-secondary small text-uppercase fw-semibold d-block mb-1">Email</span>
          <span class="info-value fw-bold text-body">{{ user()?.email || '—' }}</span>
        </div>
      </div>
      <div class="col-12 col-sm-6">
        <div class="info-card p-3 rounded-3">
          <span class="info-label text-body-secondary small text-uppercase fw-semibold d-block mb-1">First Name</span>
          <span class="info-value fw-bold text-body">{{ user()?.name || '—' }}</span>
        </div>
      </div>
      <div class="col-12 col-sm-6">
        <div class="info-card p-3 rounded-3">
          <span class="info-label text-body-secondary small text-uppercase fw-semibold d-block mb-1">Last Name</span>
          <span class="info-value fw-bold text-body">{{ user()?.familyName || '—' }}</span>
        </div>
      </div>
      <div class="col-12 col-sm-6">
        <div class="info-card p-3 rounded-3 d-flex align-items-center gap-3">
          <app-dog [dog]="user()?.dogCompanion ?? 'Beagle'" animation="sit" [size]="64" />
          <div>
            <span class="info-label text-body-secondary small text-uppercase fw-semibold d-block mb-1">Dog companion</span>
            <span class="info-value fw-bold text-body">{{ companionLabel() }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
    }

    .info-card {
      background: var(--tb-glass-inner-bg, var(--tb-glass-bg));
      border: 1px solid var(--tb-glass-border);
      box-shadow: 0 4px 14px var(--tb-glass-shadow);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    :host-context([data-bs-theme="light"]) .info-card {
      background: rgba(255, 255, 255, 0.90);
      border: 1px solid rgba(51, 65, 85, 0.30);
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
    }

    .info-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 18px var(--tb-accent-glow);
    }

  `,
})
export class ProfileDetailsComponent {
  readonly user = input<User | null>(null);

  companionLabel(): string {
    return this.user()?.dogCompanion === 'GoldenRetriever'
      ? 'Golden Retriever'
      : this.user()?.dogCompanion ?? 'Beagle';
  }

}
