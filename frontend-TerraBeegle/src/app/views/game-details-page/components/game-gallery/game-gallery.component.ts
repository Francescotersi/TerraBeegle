import { Component, HostListener, computed, input, signal } from '@angular/core';
import { LiquidGlassComponent } from '../../../../ui/liquid-glass/liquid-glass.component';
import { GAME_DETAILS_STYLES } from '../../styles/game-details.styles';

// Screenshot grid; a click opens the image full size, a click or Escape closes it
@Component({
  selector: 'app-game-gallery',
  standalone: true,
  imports: [LiquidGlassComponent],
  template: `
    @if (images().length > 0) {
      <app-liquid-glass borderRadius="20px" blur="3px" [scale]="85" background="var(--tb-glass-bg)">
        <section class="p-3 p-md-4">
          <h2 class="section-title">Screenshots</h2>
          <div class="gallery">
            @for (image of images(); track image; let i = $index) {
              <button type="button" class="gallery-item" (click)="open(i)" [attr.aria-label]="'Open image ' + (i + 1)">
                <img [src]="image" [alt]="gameName() + ' screenshot ' + (i + 1)" loading="lazy" width="320" height="180" />
              </button>
            }
          </div>
        </section>
      </app-liquid-glass>
    }

    @if (selectedImage(); as image) {
      <div class="lightbox" role="dialog" aria-modal="true" aria-label="Screenshot" (click)="close()">
        <img [src]="image" [alt]="gameName() + ' screenshot'" />
        <button type="button" class="lightbox-close" aria-label="Close image" (click)="close()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    }
  `,
  styles: [
    GAME_DETAILS_STYLES,
    `
    .gallery {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 10px;
    }
    .gallery-item {
      padding: 0;
      border: 1px solid var(--tb-glass-border);
      border-radius: 12px;
      overflow: hidden;
      background: none;
      aspect-ratio: 16 / 9;
      cursor: zoom-in;
    }
    .gallery-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }
    .gallery-item:hover img {
      transform: scale(1.06);
    }

    .lightbox {
      position: fixed;
      inset: 0;
      z-index: 100000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      background: rgba(2, 6, 23, 0.85);
      backdrop-filter: blur(6px);
      cursor: zoom-out;
      animation: fadeIn 0.2s ease;
    }
    .lightbox img {
      max-width: 100%;
      max-height: 100%;
      border-radius: 14px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    }
    .lightbox-close {
      position: absolute;
      top: 1rem;
      right: 1rem;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 1px solid rgba(255, 255, 255, 0.3);
      background: rgba(255, 255, 255, 0.12);
      color: #fff;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `,
  ],
})
export class GameGalleryComponent {
  // Screenshots first, then artworks (720p URLs from IGDB)
  readonly images = input<string[]>([]);
  readonly gameName = input<string>('');

  private readonly selectedIndex = signal<number | null>(null);

  protected readonly selectedImage = computed(() => {
    const index = this.selectedIndex();
    return index === null ? null : (this.images()[index] ?? null);
  });

  protected open(index: number): void {
    this.selectedIndex.set(index);
  }

  protected close(): void {
    this.selectedIndex.set(null);
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.close();
  }
}
