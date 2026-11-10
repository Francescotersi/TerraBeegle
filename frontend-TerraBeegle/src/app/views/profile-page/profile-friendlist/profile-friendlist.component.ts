import { Component, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { timer } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FriendsService } from '../../../services/friends.service';
import { FriendshipResponseDTO } from '../../../models/friendship.model';
import { AlertService } from '../../../services/alert.service';
import { ProfileFriendSearchComponent } from './profile-friend-search.component';
import { ProfileFriendCardComponent } from './profile-friend-card.component';

type SubTab = 'friends' | 'received' | 'sent';

@Component({
  selector: 'app-profile-friendlist',
  standalone: true,
  imports: [CommonModule, ProfileFriendSearchComponent, ProfileFriendCardComponent],
  template: `
    <div class="friends-container d-flex flex-column gap-3">

      <!-- Add Friend Box con Search Bar a sinistra e Testo a destra -->
      <app-profile-friend-search (requestSent)="onRequestSent($event)" />

      <!-- Navigation Tabs -->
      <div class="tabs-nav-container d-flex gap-2 border-bottom border-secondary border-opacity-25 pb-2">
        <button
          type="button"
          class="sub-tab-btn"
          [class.active]="activeTab() === 'friends'"
          (click)="switchTab('friends')"
        >
          Friends
          <span class="tab-count-badge ms-1">{{ friends().length }}</span>
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
          } @else {
            <span class="tab-count-badge ms-1">0</span>
          }
        </button>

        <button
          type="button"
          class="sub-tab-btn"
          [class.active]="activeTab() === 'sent'"
          (click)="switchTab('sent')"
        >
          Sent
          <span class="tab-count-badge ms-1">{{ sent().length }}</span>
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
              You haven't added any friends yet. Search above to add your first friend!
            </div>
          } @else {
            <div class="d-flex flex-column gap-2">
              @for (f of friends(); track f.id) {
                <app-profile-friend-card
                  [friend]="f"
                  type="friend"
                  (remove)="onDelete($event.id, $event.message)"
                />
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
                <app-profile-friend-card
                  [friend]="f"
                  type="received"
                  (accept)="onAccept($event)"
                  (reject)="onReject($event)"
                />
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
                <app-profile-friend-card
                  [friend]="f"
                  type="sent"
                  (remove)="onDelete($event.id, $event.message)"
                />
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

    app-profile-friend-search {
      position: relative;
      z-index: 25;
    }

    .tabs-nav-container {
      position: relative;
      z-index: 1;
    }

    .empty-state {
      background: var(--tb-glass-inner-bg, var(--tb-glass-bg));
      border: 1px solid var(--tb-glass-border);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
    }

    :host-context([data-bs-theme="light"]) .empty-state {
      background: rgba(255, 255, 255, 0.90);
      border: 1px solid rgba(51, 65, 85, 0.30);
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
    }

    :host-context([data-bs-theme="light"]) .tabs-nav-container {
      border-color: rgba(51, 65, 85, 0.35) !important;
    }

    .sub-tab-btn {
      background: none;
      border: none;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--bs-secondary-color);
      padding: 0.4rem 0.85rem;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
    }

    .sub-tab-btn.active {
      color: var(--tb-accent);
      background: var(--tb-accent-subtle);
    }

    .tab-count-badge {
      font-size: 0.72rem;
      opacity: 0.8;
      background: rgba(125, 125, 125, 0.15);
      padding: 0.1rem 0.45rem;
      border-radius: 999px;
    }

    .sub-tab-btn.active .tab-count-badge {
      background: var(--tb-accent);
      color: #fff;
    }

    @media (max-width: 575.98px) {
      .tabs-nav-container {
        display: grid !important;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        justify-items: stretch;
        gap: 0.5rem !important;
      }

      .sub-tab-btn {
        justify-content: center;
        width: 100%;
      }

      .sub-tab-btn:last-child {
        grid-column: 1 / -1;
        justify-self: center;
        width: calc(50% - 0.25rem);
      }
    }
  `,
})
export class ProfileFriendlistComponent implements OnInit {
  private readonly friendsService = inject(FriendsService);
  private readonly alertService = inject(AlertService);
  private readonly destroyRef = inject(DestroyRef);

  readonly activeTab = signal<SubTab>('friends');
  readonly friends = signal<FriendshipResponseDTO[]>([]);
  readonly received = signal<FriendshipResponseDTO[]>([]);
  readonly sent = signal<FriendshipResponseDTO[]>([]);
  readonly isLoading = signal(false);

  private previousReceivedCount = -1;

  ngOnInit(): void {
    this.loadAll(true);

    timer(4000, 4000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.refreshQuietly();
      });
  }

  loadAll(showLoading = false): void {
    if (showLoading) {
      this.isLoading.set(true);
    }
    let loadedCount = 0;
    const checkDone = () => {
      loadedCount++;
      if (loadedCount >= 3) {
        this.isLoading.set(false);
      }
    };

    this.friendsService.getFriends().subscribe({
      next: (res) => {
        this.friends.set(res.items || []);
        if (showLoading) checkDone();
      },
      error: () => {
        if (showLoading) checkDone();
      },
    });

    this.friendsService.getReceivedRequests().subscribe({
      next: (res) => {
        const items = res.items || [];
        this.previousReceivedCount = items.length;
        this.received.set(items);
        if (showLoading) checkDone();
      },
      error: () => {
        if (showLoading) checkDone();
      },
    });

    this.friendsService.getSentRequests().subscribe({
      next: (res) => {
        this.sent.set(res.items || []);
        if (showLoading) checkDone();
      },
      error: () => {
        if (showLoading) checkDone();
      },
    });
  }

  refreshQuietly(): void {
    this.friendsService.getFriends().subscribe({
      next: (res) => this.friends.set(res.items || []),
    });

    this.friendsService.getReceivedRequests().subscribe({
      next: (res) => {
        const items = res.items || [];
        if (this.previousReceivedCount !== -1 && items.length > this.previousReceivedCount) {
          const diff = items.length - this.previousReceivedCount;
          this.alertService.showAlert(
            diff === 1
              ? 'New friend request received!'
              : `${diff} new friend requests received!`
          );
        }
        this.previousReceivedCount = items.length;
        this.received.set(items);
      },
    });

    this.friendsService.getSentRequests().subscribe({
      next: (res) => this.sent.set(res.items || []),
    });
  }

  onRequestSent(newRequest?: FriendshipResponseDTO | void): void {
    if (newRequest) {
      this.sent.update((list) => [newRequest, ...list.filter((f) => f.id !== newRequest.id)]);
    }
    this.activeTab.set('sent');
    this.refreshQuietly();
  }

  switchTab(tab: SubTab): void {
    this.activeTab.set(tab);
  }

  onAccept(f: FriendshipResponseDTO): void {
    this.friendsService.acceptRequest(f).subscribe({
      next: () => {
        this.alertService.showAlert(`Friend request from @${f.user.username} accepted!`);
        this.received.update((items) => items.filter((item) => item.id !== f.id));
        this.previousReceivedCount = this.received().length;
        this.refreshQuietly();
      },
      error: () => this.alertService.showAlert('Error accepting friend request'),
    });
  }

  onReject(f: FriendshipResponseDTO): void {
    this.friendsService.rejectRequest(f).subscribe({
      next: () => {
        this.alertService.showAlert('Friend request declined.');
        this.received.update((items) => items.filter((item) => item.id !== f.id));
        this.previousReceivedCount = this.received().length;
        this.refreshQuietly();
      },
      error: () => this.alertService.showAlert('Error declining friend request'),
    });
  }

  onDelete(id: number, successMessage: string): void {
    this.friendsService.deleteFriendship(id).subscribe({
      next: () => {
        this.alertService.showAlert(successMessage);
        this.friends.update((items) => items.filter((item) => item.id !== id));
        this.sent.update((items) => items.filter((item) => item.id !== id));
        this.refreshQuietly();
      },
      error: () => this.alertService.showAlert('Error removing friendship'),
    });
  }
}
