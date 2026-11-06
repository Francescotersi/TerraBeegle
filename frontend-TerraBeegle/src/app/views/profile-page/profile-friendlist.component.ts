import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FriendsService } from '../../services/friends.service';
import { FriendshipResponseDTO } from '../../models/friendship.model';
import { AlertService } from '../../services/alert.service';

type SubTab = 'friends' | 'received' | 'sent';

@Component({
  selector: 'app-profile-friendlist',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="friends-container d-flex flex-column gap-3">

      <!-- Add Friend Box -->
      <div class="add-friend-box p-3 rounded-3 d-flex flex-column flex-sm-row gap-2 align-items-sm-center justify-content-between">
        <div class="d-flex align-items-center gap-2">
          <span class="small fw-semibold text-body">Add a friend:</span>
          <span class="text-body-secondary small">(enter User ID)</span>
        </div>
        <div class="d-flex gap-2">
          <input
            type="number"
            class="form-control form-control-sm friend-input"
            placeholder="User ID..."
            [(ngModel)]="targetUserId"
            (keydown.enter)="onSendRequest()"
          />
          <button
            class="btn btn-sm btn-tb-accent text-nowrap"
            [disabled]="!targetUserId || isSending()"
            (click)="onSendRequest()"
          >
            {{ isSending() ? 'Sending...' : 'Send Request' }}
          </button>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="d-flex gap-2 border-bottom border-secondary border-opacity-25 pb-2">
        <button
          type="button"
          class="sub-tab-btn"
          [class.active]="activeTab() === 'friends'"
          (click)="switchTab('friends')"
        >
          Friends ({{ friends().length }})
        </button>
        <button
          type="button"
          class="sub-tab-btn"
          [class.active]="activeTab() === 'received'"
          (click)="switchTab('received')"
        >
          Received
          @if (received().length > 0) {
            <span class="badge bg-danger ms-1">{{ received().length }}</span>
          }
        </button>
        <button
          type="button"
          class="sub-tab-btn"
          [class.active]="activeTab() === 'sent'"
          (click)="switchTab('sent')"
        >
          Sent ({{ sent().length }})
        </button>
      </div>

      <!-- Tab Contents -->
      @if (isLoading()) {
        <div class="text-center py-4 text-body-secondary small">
          Loading friends...
        </div>
      } @else {

        <!-- 1. FRIENDS LIST -->
        @if (activeTab() === 'friends') {
          @if (friends().length === 0) {
            <div class="empty-state p-4 text-center rounded-3 text-body-secondary small">
              You haven't added any friends yet.
            </div>
          } @else {
            <div class="d-flex flex-column gap-2">
              @for (f of friends(); track f.id) {
                <div class="friend-card p-3 rounded-3 d-flex align-items-center justify-content-between">
                  <div class="d-flex align-items-center gap-3">
                    <div class="avatar-mini">
                      @if (f.user.imageProfile) {
                        <img [src]="f.user.imageProfile" [alt]="f.user.username" class="avatar-img" />
                      } @else {
                        <span>{{ f.user.username.charAt(0).toUpperCase() }}</span>
                      }
                    </div>
                    <div>
                      <span class="fw-bold d-block text-body">&#64;{{ f.user.username }}</span>
                      <span class="text-body-secondary small">User #{{ f.user.id }}</span>
                    </div>
                  </div>
                  <button
                    class="btn btn-sm btn-outline-danger"
                    (click)="onDelete(f.id, 'Friend removed')"
                  >
                    Remove
                  </button>
                </div>
              }
            </div>
          }
        }

        <!-- 2. RECEIVED REQUESTS -->
        @if (activeTab() === 'received') {
          @if (received().length === 0) {
            <div class="empty-state p-4 text-center rounded-3 text-body-secondary small">
              No pending friend requests received.
            </div>
          } @else {
            <div class="d-flex flex-column gap-2">
              @for (f of received(); track f.id) {
                <div class="friend-card p-3 rounded-3 d-flex align-items-center justify-content-between">
                  <div class="d-flex align-items-center gap-3">
                    <div class="avatar-mini">
                      @if (f.user.imageProfile) {
                        <img [src]="f.user.imageProfile" [alt]="f.user.username" class="avatar-img" />
                      } @else {
                        <span>{{ f.user.username.charAt(0).toUpperCase() }}</span>
                      }
                    </div>
                    <div>
                      <span class="fw-bold d-block text-body">&#64;{{ f.user.username }}</span>
                      <span class="text-body-secondary small">Wants to be your friend</span>
                    </div>
                  </div>
                  <div class="d-flex gap-2">
                    <button class="btn btn-sm btn-success" (click)="onAccept(f)">Accept</button>
                    <button class="btn btn-sm btn-outline-danger" (click)="onReject(f)">Decline</button>
                  </div>
                </div>
              }
            </div>
          }
        }

        <!-- 3. SENT REQUESTS -->
        @if (activeTab() === 'sent') {
          @if (sent().length === 0) {
            <div class="empty-state p-4 text-center rounded-3 text-body-secondary small">
              No pending requests sent.
            </div>
          } @else {
            <div class="d-flex flex-column gap-2">
              @for (f of sent(); track f.id) {
                <div class="friend-card p-3 rounded-3 d-flex align-items-center justify-content-between">
                  <div class="d-flex align-items-center gap-3">
                    <div class="avatar-mini">
                      @if (f.user.imageProfile) {
                        <img [src]="f.user.imageProfile" [alt]="f.user.username" class="avatar-img" />
                      } @else {
                        <span>{{ f.user.username.charAt(0).toUpperCase() }}</span>
                      }
                    </div>
                    <div>
                      <span class="fw-bold d-block text-body">&#64;{{ f.user.username }}</span>
                      <span class="text-body-secondary small">Pending approval</span>
                    </div>
                  </div>
                  <button
                    class="btn btn-sm btn-outline-secondary"
                    (click)="onDelete(f.id, 'Request cancelled')"
                  >
                    Cancel
                  </button>
                </div>
              }
            </div>
          }
        }
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
    }

    .add-friend-box,
    .friend-card,
    .empty-state {
      background: var(--tb-glass-bg);
      border: 1px solid var(--tb-glass-border);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .friend-card:hover {
      transform: translateY(-2px);
    }

    .friend-input {
      background: var(--tb-input-bg);
      border: 1px solid var(--tb-input-border);
      color: var(--bs-body-color);
      max-width: 140px;
    }

    .sub-tab-btn {
      background: none;
      border: none;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--bs-secondary-color);
      padding: 0.35rem 0.75rem;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .sub-tab-btn.active {
      color: var(--tb-accent);
      background: var(--tb-accent-subtle);
    }

    .btn-tb-accent {
      background: var(--tb-btn-gradient);
      color: #fff;
      border: none;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .btn-tb-accent:hover:not(:disabled) {
      background: var(--tb-btn-gradient-hover);
      color: #fff;
      transform: translateY(-1px);
    }

    .avatar-mini {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background: var(--tb-accent-subtle);
      color: var(--tb-accent);
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      border: 1px solid var(--tb-glass-border);
    }

    .avatar-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  `,
})
export class ProfileFriendlistComponent implements OnInit {
  private readonly friendsService = inject(FriendsService);
  private readonly alertService = inject(AlertService);

  readonly activeTab = signal<SubTab>('friends');
  readonly friends = signal<FriendshipResponseDTO[]>([]);
  readonly received = signal<FriendshipResponseDTO[]>([]);
  readonly sent = signal<FriendshipResponseDTO[]>([]);
  readonly isLoading = signal(false);
  readonly isSending = signal(false);

  targetUserId: number | null = null;

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.isLoading.set(true);
    let loadedCount = 0;
    const checkDone = () => {
      loadedCount++;
      if (loadedCount >= 3) {
        this.isLoading.set(false);
      }
    };

    this.friendsService.getFriends().subscribe({
      next: (res) => {
        this.friends.set(res.items);
        checkDone();
      },
      error: () => checkDone(),
    });

    this.friendsService.getReceivedRequests().subscribe({
      next: (res) => {
        this.received.set(res.items);
        checkDone();
      },
      error: () => checkDone(),
    });

    this.friendsService.getSentRequests().subscribe({
      next: (res) => {
        this.sent.set(res.items);
        checkDone();
      },
      error: () => checkDone(),
    });
  }

  switchTab(tab: SubTab): void {
    this.activeTab.set(tab);
  }

  onSendRequest(): void {
    if (!this.targetUserId) return;
    this.isSending.set(true);

    this.friendsService.sendRequest(this.targetUserId).subscribe({
      next: () => {
        this.alertService.showAlert('Friend request sent successfully!');
        this.targetUserId = null;
        this.isSending.set(false);
        this.loadAll();
      },
      error: (err) => {
        const msg = err.error || 'Failed to send friend request.';
        this.alertService.showAlert(typeof msg === 'string' ? msg : 'Error sending friend request');
        this.isSending.set(false);
      },
    });
  }

  onAccept(f: FriendshipResponseDTO): void {
    this.friendsService.acceptRequest(f).subscribe({
      next: () => {
        this.loadAll();
      },
      error: () => this.alertService.showAlert('Error accepting friend request'),
    });
  }

  onReject(f: FriendshipResponseDTO): void {
    this.friendsService.rejectRequest(f).subscribe({
      next: () => {
        this.loadAll();
      },
      error: () => this.alertService.showAlert('Error declining friend request'),
    });
  }

  onDelete(id: number, successMessage: string): void {
    this.friendsService.deleteFriendship(id).subscribe({
      next: () => {
        this.loadAll();
      },
      error: () => this.alertService.showAlert('Error removing friendship'),
    });
  }
}
