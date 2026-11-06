import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FriendshipResponseDTO } from '../../../models/friendship.model';

@Component({
  selector: 'app-profile-friend-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="friend-card p-3 rounded-3 d-flex align-items-center justify-content-between">
      <div class="d-flex align-items-center gap-3">
        <div class="avatar-mini">
          @if (friend().user.imageProfile) {
            <img [src]="friend().user.imageProfile" [alt]="friend().user.username" class="avatar-img" />
          } @else {
            <span>{{ friend().user.username.charAt(0).toUpperCase() }}</span>
          }
        </div>
        <div>
          <span class="fw-bold d-block text-body">&#64;{{ friend().user.username }}</span>
          <span class="text-body-secondary small">
            @switch (type()) {
              @case ('friend') { Friend }
              @case ('received') { Wants to be your friend }
              @case ('sent') { Pending approval }
            }
          </span>
        </div>
      </div>

      <!-- Azioni contestuali -->
      <div class="d-flex align-items-center gap-2">
        @switch (type()) {
          @case ('friend') {
            <button
              class="btn btn-sm btn-outline-danger"
              (click)="remove.emit({ id: friend().id, message: 'Friend removed' })"
            >
              Remove
            </button>
          }
          @case ('received') {
            <button class="btn btn-sm btn-tb-accent" (click)="accept.emit(friend())">
              Accept
            </button>
            <button class="btn btn-sm btn-outline-danger" (click)="reject.emit(friend())">
              Decline
            </button>
          }
          @case ('sent') {
            <button
              class="btn btn-sm btn-outline-secondary"
              (click)="remove.emit({ id: friend().id, message: 'Request cancelled' })"
            >
              Cancel
            </button>
          }
        }
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
    }

    .friend-card {
      background: var(--tb-glass-bg);
      border: 1px solid var(--tb-glass-border);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      transition: transform 0.2s ease, border-color 0.2s ease;
    }

    .friend-card:hover {
      transform: translateY(-1px);
    }

    .avatar-mini {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: var(--tb-accent-subtle);
      color: var(--tb-accent);
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      border: 1px solid var(--tb-glass-border);
      flex-shrink: 0;
    }

    .avatar-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .btn-tb-accent {
      background: var(--tb-btn-gradient);
      color: #fff;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      transition: transform 0.15s ease, background 0.2s ease;
    }

    .btn-tb-accent:hover {
      background: var(--tb-btn-gradient-hover);
      color: #fff;
      transform: translateY(-1px);
    }
  `,
})
export class ProfileFriendCardComponent {
  readonly friend = input.required<FriendshipResponseDTO>();
  readonly type = input.required<'friend' | 'received' | 'sent'>();

  readonly accept = output<FriendshipResponseDTO>();
  readonly reject = output<FriendshipResponseDTO>();
  readonly remove = output<{ id: number; message: string }>();
}
