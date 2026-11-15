import { Component, DestroyRef, inject, input, model, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

/** Centered UI search bar for filtering user game collections. */
@Component({
  selector: 'app-collection-search-bar',
  standalone: true,
  template: `
    <div class="collection-search-wrapper d-flex justify-content-center w-100 px-2 pt-2 pb-3">
      <form
        class="collection-search-form d-flex align-items-center gap-2 w-100"
        role="search"
        (submit)="$event.preventDefault(); submitNow()"
      >
        <div class="collection-search-field position-relative flex-grow-1">
          <svg
            class="collection-search-icon"
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>

          <input
            #searchInput
            class="form-control collection-search-input"
            type="search"
            [placeholder]="placeholder()"
            [attr.aria-label]="ariaLabel()"
            autocomplete="off"
            [value]="query()"
            (input)="onInput(searchInput.value)"
          />

          @if (query()) {
            <button
              type="button"
              class="collection-clear-btn"
              aria-label="Clear search"
              (click)="clear(searchInput)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          }
        </div>

        <button class="btn collection-search-btn" type="submit">Search</button>
      </form>
    </div>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
    }

    .collection-search-form {
      max-width: 520px;
    }

    .collection-search-icon {
      position: absolute;
      left: 0.9rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--tb-text-muted);
      pointer-events: none;
    }

    .collection-search-input {
      background: var(--tb-input-bg);
      border: 1px solid var(--tb-input-border);
      border-radius: 22px;
      padding: 0.45rem 2.2rem 0.45rem 2.4rem;
      color: var(--tb-text);
      transition: background 0.2s ease, border-color 0.2s ease;
    }
    .collection-search-input::placeholder {
      color: var(--tb-text-muted);
      opacity: 0.8;
    }
    .collection-search-input:focus {
      background: var(--tb-input-bg-focus);
      border-color: var(--tb-accent);
      box-shadow: none;
      outline: none;
      color: var(--tb-text);
    }
    .collection-search-input::-webkit-search-cancel-button {
      -webkit-appearance: none;
      appearance: none;
    }

    .collection-clear-btn {
      position: absolute;
      right: 0.6rem;
      top: 50%;
      transform: translateY(-50%);
      border: none;
      background: transparent;
      color: var(--tb-text-muted);
      padding: 0.2rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
    .collection-clear-btn:hover {
      color: var(--tb-text);
    }

    .collection-search-btn {
      border-radius: 22px;
      white-space: nowrap;
      font-size: 0.9rem;
      font-weight: 600;
      padding: 0.45rem 1rem;
      color: var(--tb-accent);
      background: var(--tb-glass-bg);
      border: 1px solid var(--tb-accent);
      transition: all 0.2s ease;
    }
    .collection-search-btn:hover {
      background: var(--tb-btn-gradient);
      color: #ffffff;
      border-color: transparent;
      transform: translateY(-1px);
    }
  `,
})
export class CollectionSearchBarComponent {
  readonly placeholder = input<string>('Search games...');
  readonly ariaLabel = input<string>('Search games');
  readonly query = model<string>('');
  readonly searchSubmit = output<string>();

  private readonly input$ = new Subject<string>();

  constructor() {
    this.input$
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(inject(DestroyRef)))
      .subscribe((value) => this.searchSubmit.emit(value));
  }

  onInput(value: string): void {
    this.query.set(value);
    this.input$.next(value);
  }

  submitNow(): void {
    this.searchSubmit.emit(this.query());
  }

  clear(inputEl: HTMLInputElement): void {
    this.query.set('');
    this.searchSubmit.emit('');
    inputEl.focus();
  }
}
