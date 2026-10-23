import { Component } from '@angular/core';
import { GridComponent } from '../grid/grid.component';

@Component({
  imports: [GridComponent],  
  selector: 'app-home',
  template: `
    <app-grid-component class="grid"/>
  `,
  styles: `
    .home{color: red;}
    
    .grid{z-index: 1;}
  `,
})
export class Home {}
