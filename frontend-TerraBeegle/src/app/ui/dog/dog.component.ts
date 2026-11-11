import { Component, computed, input } from '@angular/core';
import type { DogCompanion } from '../../models/user.model';

export type DogAnimation = 'idle' | 'sit' | 'wag' | 'walk';

@Component({
  selector: 'app-dog',
  standalone: true,
  template: `
    <img
      class="dog-sprite"
      [src]="source()"
      [alt]="dogLabel()"
      [attr.width]="size()"
      [attr.height]="size()"
    />
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .dog-sprite {
      display: block;
      width: var(--dog-size, 96px);
      height: var(--dog-size, 96px);
      object-fit: contain;
      image-rendering: pixelated;
    }
  `,
})
export class DogComponent {
  readonly dog = input.required<DogCompanion>();
  readonly animation = input<DogAnimation>('idle');
  readonly size = input(96);

  protected readonly source = computed(() => {
    const dogNumber = this.dogNumbers[this.dog()];
    const animation = this.animation();
    const extension = animation === 'wag' || animation === 'walk' ? 'gif' : 'png';

    return `/dogs/dogs/${this.dogFolders[this.dog()]}/${this.animationFolders[animation]}/` +
      `dog_${dogNumber}_${animation}.${extension}`;
  });

  protected readonly dogLabel = computed(() => {
    const labels: Record<DogCompanion, string> = {
      Beagle: 'Beagle',
      Elkhound: 'Black Norwegian Elkhound',
      GoldenRetriever: 'Golden Retriever',
      Husky: 'Husky',
    };

    return `${labels[this.dog()]} ${this.animation()} animation`;
  });

  private readonly dogNumbers: Record<DogCompanion, number> = {
    Beagle: 1,
    Elkhound: 2,
    GoldenRetriever: 3,
    Husky: 4,
  };

  private readonly dogFolders: Record<DogCompanion, string> = {
    Beagle: 'Beagle',
    Elkhound: 'BlackNorwegianElkhound',
    GoldenRetriever: 'GoldenRetriever',
    Husky: 'Husky',
  };

  private readonly animationFolders: Record<DogAnimation, string> = {
    idle: 'Idle',
    sit: 'Sit',
    wag: 'Wag',
    walk: 'Walk',
  };
}
