import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  template: ``,
  styles: ``,
})
export class App {
  protected readonly title = signal('frontend-TerraBeegle');
}
