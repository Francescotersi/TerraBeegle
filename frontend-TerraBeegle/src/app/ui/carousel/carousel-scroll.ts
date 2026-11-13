import { DestroyRef, ElementRef, Signal, effect, inject, signal } from '@angular/core';

export interface CarouselScrollController {
  readonly canPrev: Signal<boolean>;
  readonly canNext: Signal<boolean>;
  onScroll(): void;
  scroll(direction: -1 | 1): void;
  refresh(): void;
}

// Tracks horizontal scroll bounds (with ResizeObserver) for fade-in/fade-out carousel arrows
export function createCarouselScroll(
  track: Signal<ElementRef<HTMLElement> | undefined>,
  minStep = 240,
  source?: Signal<unknown>
): CarouselScrollController {
  const destroyRef = inject(DestroyRef);
  const canPrev = signal(false);
  const canNext = signal(false);

  const refresh = () => {
    const el = track()?.nativeElement;
    if (!el) {
      canPrev.set(false);
      canNext.set(false);
      return;
    }
    const threshold = 2;
    canPrev.set(el.scrollLeft > threshold);
    canNext.set(el.scrollLeft + el.clientWidth < el.scrollWidth - threshold);
  };

  let observer: ResizeObserver | null = null;
  let rafId = 0;

  effect(() => {
    source?.();
    const el = track()?.nativeElement;

    observer?.disconnect();
    observer = null;
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }

    if (!el) {
      canPrev.set(false);
      canNext.set(false);
      return;
    }

    rafId = requestAnimationFrame(refresh);
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(refresh);
      observer.observe(el);
    }
  });

  destroyRef.onDestroy(() => {
    observer?.disconnect();
    if (rafId) {
      cancelAnimationFrame(rafId);
    }
  });

  return {
    canPrev: canPrev.asReadonly(),
    canNext: canNext.asReadonly(),
    onScroll: refresh,
    refresh,
    scroll(direction: -1 | 1): void {
      const el = track()?.nativeElement;
      if (!el) return;
      el.scrollBy({
        left: direction * Math.max(minStep, el.clientWidth * 0.75),
        behavior: 'smooth',
      });
    },
  };
}
