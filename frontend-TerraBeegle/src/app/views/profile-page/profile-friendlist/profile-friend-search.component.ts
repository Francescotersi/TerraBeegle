import { Component, inject, signal, OnInit, HostListener, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { FriendsService } from '../../../services/friends.service';
import { AuthService } from '../../../services/auth.service';
import { AlertService } from '../../../services/alert.service';
import { UserPublicResponseDTO } from '../../../models-services/user.model';
import { PagedResponse, FriendshipResponseDTO } from '../../../models-services/friendship.model';

@Component({
  selector: 'app-profile-friend-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="add-friend-box p-3 p-md-4 rounded-4 position-relative">
      <div class="d-flex flex-column flex-md-row align-items-stretch align-items-md-center justify-content-between gap-3">
        
        <!-- LEFT: search bar with autocomplete dropdown -->
        <div class="search-bar-wrapper position-relative flex-grow-1">
          <div class="search-input-group d-flex align-items-center">
            <span class="search-icon-box text-body-secondary ps-3 pe-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" viewBox="0 0 16 16">
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
              </svg>
            </span>
            <input
              type="text"
              class="form-control friend-search-input"
              placeholder="Search users..."
              [(ngModel)]="searchUsername"
              (input)="onSearchInput()"
              (focus)="onInputFocus()"
              (keydown.enter)="onSendByInput()"
              autocomplete="off"
            />
            @if (searchUsername) {
              <button type="button" class="btn-clear-input pe-3" (click)="clearSearch()" title="Clear">
                ✕
              </button>
            }
          </div>

          <!-- Autocomplete dropdown with the results -->
          @if (isDropdownOpen() && searchResults().length > 0) {
            <div class="autocomplete-dropdown rounded-3 shadow-sm p-1">
              @for (u of searchResults(); track u.id) {
                <div
                  class="autocomplete-item p-2 rounded-2 d-flex align-items-center justify-content-between"
                  (click)="selectUser(u)"
                >
                  <div class="d-flex align-items-center gap-2">
                    <div class="avatar-mini-xs">
                      @if (u.imageProfile) {
                        <img [src]="u.imageProfile" [alt]="u.username" class="avatar-img" />
                      } @else {
                        <span>{{ u.username.charAt(0).toUpperCase() }}</span>
                      }
                    </div>
                    <div class="d-flex flex-column">
                      <span class="fw-semibold text-body small">&#64;{{ u.username }}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    class="btn btn-xs btn-tb-accent text-nowrap"
                    [disabled]="isSending() || isSelf(u.id)"
                    (click)="$event.stopPropagation(); sendRequestTo(u)"
                  >
                    {{ isSelf(u.id) ? 'You' : '+ Add' }}
                  </button>
                </div>
              }
            </div>
          } @else if (isDropdownOpen() && isSearching()) {
            <div class="autocomplete-dropdown rounded-3 p-3 text-center small text-body-secondary">
              Searching users...
            </div>
          }
        </div>

        <!-- RIGHT OF THE SEARCH BAR: "Enter Your Friend Username:" + Send Request button -->
        <div class="d-flex align-items-center justify-content-between justify-content-md-end gap-2 flex-wrap flex-shrink-0">
          <button
            class="btn btn-sm btn-tb-accent text-nowrap px-3"
            [disabled]="!searchUsername.trim() || isSending()"
            (click)="onSendByInput()"
          >
            {{ isSending() ? 'Sending...' : 'Send Request' }}
          </button>
        </div>

      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
      position: relative;
      z-index: 25;
    }

    .add-friend-box {
      background: var(--tb-glass-inner-bg, var(--tb-glass-bg));
      border: 1px solid var(--tb-glass-border);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      transition: border-color 0.2s ease;
      position: relative;
      z-index: 25;
    }

    :host-context([data-bs-theme="light"]) .add-friend-box {
      background: rgba(255, 255, 255, 0.90);
      border: 1px solid rgba(51, 65, 85, 0.30);
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
    }

    .search-input-group {
      background: var(--tb-input-bg);
      border: 1px solid var(--tb-input-border);
      border-radius: 12px;
      transition: border-color 0.2s ease, background 0.2s ease;
    }

    .search-input-group:focus-within {
      background: var(--tb-input-bg-focus);
      border-color: var(--tb-accent);
    }

    .friend-search-input {
      background: transparent !important;
      border: none !important;
      color: var(--bs-body-color);
      box-shadow: none !important;
      padding: 0.45rem 0.5rem;
      font-size: 0.9rem;
    }

    .friend-search-input:focus {
      outline: none;
    }

    .btn-clear-input {
      background: none;
      border: none;
      color: var(--tb-text-muted);
      cursor: pointer;
      font-size: 0.85rem;
      display: flex;
      align-items: center;
    }

    .btn-clear-input:hover {
      color: var(--bs-body-color);
    }

    .autocomplete-dropdown {
      position: absolute;
      top: calc(100% + 6px);
      left: 0;
      right: 0;
      z-index: 1050;
      background: var(--bs-body-bg);
      border: 1px solid var(--tb-glass-border);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      max-height: 220px;
      overflow-y: auto;
      box-shadow: 0 12px 28px rgba(0, 0, 0, 0.25);
    }

    :host-context([data-bs-theme="dark"]) .autocomplete-dropdown {
      background: #0d1e3d;
      border-color: rgba(46, 217, 231, 0.35);
    }

    .autocomplete-item {
      cursor: pointer;
      transition: background 0.15s ease;
    }

    .autocomplete-item:hover {
      background: var(--tb-accent-subtle);
    }

    .btn-xs {
      padding: 0.2rem 0.6rem;
      font-size: 0.75rem;
      border-radius: 6px;
    }

    .avatar-mini-xs {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: var(--tb-accent-subtle);
      color: var(--tb-accent);
      font-weight: bold;
      font-size: 0.75rem;
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
      border-radius: 10px;
      font-weight: 600;
      transition: transform 0.15s ease, background 0.2s ease;
    }

    .btn-tb-accent:hover:not(:disabled) {
      background: var(--tb-btn-gradient-hover);
      color: #fff;
      transform: translateY(-1px);
    }
  `,
})
export class ProfileFriendSearchComponent implements OnInit {
  private readonly friendsService = inject(FriendsService);
  private readonly authService = inject(AuthService);
  private readonly alertService = inject(AlertService);

  readonly requestSent = output<FriendshipResponseDTO | void>();

  searchUsername = '';
  readonly searchResults = signal<UserPublicResponseDTO[]>([]);
  readonly isSearching = signal(false);
  readonly isDropdownOpen = signal(false);
  readonly isSending = signal(false);
  private readonly searchSubject = new Subject<string>();

  ngOnInit(): void {
    this.searchSubject
      .pipe(
        debounceTime(250),
        distinctUntilChanged(),
        switchMap((term) => {
          const clean = term.trim().replace(/^@/, '');
          if (!clean || clean.length < 1) {
            this.isSearching.set(false);
            return of({ items: [], page: 1, pageSize: 5, totalCount: 0, totalPages: 0 } as PagedResponse<UserPublicResponseDTO>);
          }
          this.isSearching.set(true);
          return this.friendsService.searchUsers(clean, 5).pipe(
            catchError(() => of({ items: [], page: 1, pageSize: 5, totalCount: 0, totalPages: 0 } as PagedResponse<UserPublicResponseDTO>))
          );
        })
      )
      .subscribe({
        next: (res) => {
          this.isSearching.set(false);
          const items = res?.items || [];
          this.searchResults.set(items);
          this.isDropdownOpen.set(items.length > 0 && this.searchUsername.trim().length > 0);
        },
        error: () => {
          this.isSearching.set(false);
          this.searchResults.set([]);
        },
      });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.search-bar-wrapper')) {
      this.isDropdownOpen.set(false);
    }
  }

  onSearchInput(): void {
    this.searchSubject.next(this.searchUsername);
  }

  onInputFocus(): void {
    if (this.searchResults().length > 0 && this.searchUsername.trim().length > 0) {
      this.isDropdownOpen.set(true);
    }
  }

  clearSearch(): void {
    this.searchUsername = '';
    this.searchResults.set([]);
    this.isDropdownOpen.set(false);
  }

  selectUser(u: UserPublicResponseDTO): void {
    this.searchUsername = u.username;
    this.isDropdownOpen.set(false);
  }

  isSelf(userId: number): boolean {
    return this.authService.currentUser()?.id === userId;
  }

  sendRequestTo(u: UserPublicResponseDTO): void {
    if (this.isSelf(u.id)) {
      this.alertService.showAlert('You cannot add yourself as a friend.');
      return;
    }

    this.isSending.set(true);
    this.friendsService.sendRequest(u.id).subscribe({
      next: (created) => {
        this.alertService.showSuccess(`Friend request sent to @${u.username}!`);
        this.isSending.set(false);
        this.clearSearch();
        const enriched = created ? { ...created, user: created.user || u } : undefined;
        this.requestSent.emit(enriched);
      },
      error: (err) => {
        this.isSending.set(false);
        const msg = err.error || 'Failed to send friend request.';
        this.alertService.showAlert(typeof msg === 'string' ? msg : 'Error sending friend request');
      },
    });
  }

  onSendByInput(): void {
    const clean = this.searchUsername.trim().replace(/^@/, '');
    if (!clean || this.isSending()) return;

    this.isSending.set(true);
    this.friendsService.sendRequestByUsername(clean).subscribe({
      next: (created) => {
        this.alertService.showSuccess(`Friend request sent to @${clean}!`);
        this.isSending.set(false);
        this.clearSearch();
        this.requestSent.emit(created);
      },
      error: (err) => {
        this.isSending.set(false);
        const msg = err.status === 404
          ? `User @${clean} not found.`
          : (err.error || 'Failed to send friend request.');
        this.alertService.showAlert(typeof msg === 'string' ? msg : 'Error sending friend request');
      },
    });
  }
}
