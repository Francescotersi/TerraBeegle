import { Component, DestroyRef, OnInit, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subscription } from 'rxjs';
import { WishlistFavoritesService } from '../../services/wishlist-favorites.service';
import { FriendsService } from '../../services/friends.service';
import { GameCollectionType } from '../../models-services/game.model';
import { GridComponent, GridComponentProps } from '../grid/grid.component';
import { SpinnerComponent } from '../../ui/spinner/spinner.component';

// /friends/:id?username=... — the favorites and the wishlist of a friend (the backend allows only accepted friends)
@Component({
  selector: 'app-friend-lists-page',
  standalone: true,
  imports: [RouterLink, GridComponent, SpinnerComponent],
  template: `
    <div class="friend-lists-page container-fluid px-3 px-md-4 px-xl-5">
      <a routerLink="/profile" class="back-link d-inline-flex align-items-center gap-1 mb-3">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
        Back to profile
      </a>

      <div class="page-header d-flex flex-wrap align-items-center justify-content-between gap-3 mb-2">
        <div class="d-flex align-items-center gap-3 min-w-0">
          <div class="avatar" aria-hidden="true">
            @if (imageProfile(); as image) {
              <img class="avatar-img" [src]="image" alt="" width="48" height="48" (error)="imageProfile.set(null)" />
            } @else {
              {{ initial() }}
            }
          </div>
          <div class="min-w-0">
            <h1 class="page-title text-truncate">{{ displayName() }}</h1>
            <p class="page-subtitle">Games your friend loves and wants to play.</p>
          </div>
        </div>

        <div class="tab-switch" role="tablist" aria-label="Friend's lists">
          @for (tab of tabs; track tab.key) {
            <button
              type="button"
              role="tab"
              class="tab-btn"
              [class.active]="selected() === tab.key"
              [attr.aria-selected]="selected() === tab.key"
              (click)="select(tab.key)"
            >
              {{ tab.label }}
            </button>
          }
        </div>
      </div>

      @if (isLoading()) {
        <div class="d-flex justify-content-center py-5 my-4">
          <app-spinner size="lg" />
        </div>
      } @else if (errorMessage()) {
        <div class="state-box text-center p-4 my-4">
          <p class="mb-3 text-body-secondary">{{ errorMessage() }}</p>
          <button type="button" class="btn btn-gradient px-4" (click)="load()">Try again</button>
        </div>
      } @else {
        <app-grid-component
          [title]="''"
          [games]="games()"
          [emptyMessage]="emptyMessage()"
        />
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
      color: var(--tb-text);
    }

    .back-link {
      color: var(--tb-text-muted);
      font-weight: 600;
      font-size: 0.9rem;
      text-decoration: none;
      transition: color 0.2s ease, transform 0.2s ease;
    }
    .back-link:hover {
      color: var(--tb-accent);
      transform: translateX(-2px);
    }

    .avatar {
      width: 48px;
      height: 48px;
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      border: 1px solid var(--tb-glass-border);
      background: var(--tb-accent-subtle);
      color: var(--tb-accent);
      font-size: 1.2rem;
      font-weight: 800;
      overflow: hidden;
    }

    .avatar-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .page-title {
      margin: 0;
      font-size: clamp(1.3rem, 1rem + 1vw, 1.8rem);
      font-weight: 800;
    }
    .page-subtitle {
      margin: 0.15rem 0 0;
      color: var(--tb-text-muted);
      font-size: 0.85rem;
    }

    /* Same segmented switch as the statistics */
    .tab-switch {
      display: inline-flex;
      padding: 3px;
      border: 1px solid var(--tb-glass-border);
      border-radius: 10px;
      background: var(--tb-input-bg);
    }
    .tab-btn {
      padding: 0.4rem 1rem;
      border: none;
      border-radius: 7px;
      background: transparent;
      color: var(--tb-text-muted);
      font-size: 0.88rem;
      font-weight: 600;
      transition: background 0.2s ease, color 0.2s ease;
    }
    .tab-btn:hover {
      color: var(--tb-text);
    }
    .tab-btn.active {
      background: var(--tb-btn-gradient);
      color: #fff;
      box-shadow: 0 2px 8px var(--tb-btn-gradient-shadow);
    }

    .state-box {
      border: 1px solid var(--tb-glass-border);
      border-radius: 16px;
      background: var(--tb-glass-inner-bg, var(--tb-glass-bg));
    }
    .btn-gradient {
      border-radius: 20px;
      background: var(--tb-btn-gradient);
      border: 1px solid var(--tb-glass-border);
      color: #fff;
      font-weight: 600;
    }
    .btn-gradient:hover {
      background: var(--tb-btn-gradient-hover);
      color: #fff;
    }

    @media (max-width: 575.98px) {
      .tab-switch {
        width: 100%;
      }
      .tab-btn {
        flex: 1;
      }
    }
  `,
})
export class FriendListsPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly listsService = inject(WishlistFavoritesService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);

  protected readonly tabs: { key: GameCollectionType; label: string }[] = [
    { key: 'favorites', label: 'Favorites' },
    { key: 'wishlist', label: 'Wishlist' },
  ];

  protected readonly selected = signal<GameCollectionType>('favorites');
  protected readonly games = signal<GridComponentProps[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  private readonly friendId = signal(0);
  private readonly username = signal('');
  // Profile image of the friend (the link only has the id and the username), null = the initial is shown
  protected readonly imageProfile = signal<string | null>(null);
  private readonly friendsService = inject(FriendsService);
  private profileRequest: Subscription | null = null;
  private request: Subscription | null = null;

  protected readonly displayName = computed(() => (this.username() ? `@${this.username()}` : 'Your friend'));
  protected readonly initial = computed(() => (this.username().charAt(0) || '?').toUpperCase());
  protected readonly emptyMessage = computed(() =>
    `${this.username() ? '@' + this.username() : 'Your friend'} has no games in the ${this.selected()} yet.`
  );

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.friendId.set(Number(params.get('id')));
      this.username.set(this.route.snapshot.queryParamMap.get('username') ?? '');
      this.loadProfileImage();
      this.load();
    });
  }

  // GET /api/users/{username}: the public profile, only for its image
  private loadProfileImage(): void {
    this.profileRequest?.unsubscribe();
    this.imageProfile.set(null);
    if (!isPlatformBrowser(this.platformId) || !this.username()) return;

    const friendId = this.friendId();
    this.profileRequest = this.friendsService.getUserByUsername(this.username()).subscribe({
      // The id check: the username in the URL must belong to the friend of this page
      next: (user) => this.imageProfile.set(user.id === friendId ? user.imageProfile || null : null),
      error: () => this.imageProfile.set(null), // no image: the initial stays
    });
  }

  protected select(tab: GameCollectionType): void {
    if (tab === this.selected()) return;
    this.selected.set(tab);
    this.load();
  }

  // Downloads every page of the selected list of the friend
  protected load(): void {
    // During SSR the relative /api URL cannot be called; the browser loads the list after hydration
    if (!isPlatformBrowser(this.platformId)) return;

    const id = this.friendId();
    if (!Number.isInteger(id) || id <= 0) {
      this.isLoading.set(false);
      this.errorMessage.set('This user does not exist.');
      return;
    }

    // Switching tabs quickly: the older request must not overwrite the newer list
    this.request?.unsubscribe();
    this.isLoading.set(true);
    this.errorMessage.set(null);
    const type = this.selected();

    this.request = this.listsService.getAllGames(type, id).subscribe({
      next: (games) => {
        this.games.set(games.map((game) => this.listsService.toGridProps(game)));
        this.isLoading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.games.set([]);
        this.isLoading.set(false);
        this.errorMessage.set(
          error.status === 403
            ? `Only friends can see this ${type}. You may no longer be friends.`
            : error.status === 404
              ? 'This user does not exist.'
              : `Could not load the ${type} right now. Please try again.`
        );
      },
    });
  }
}
