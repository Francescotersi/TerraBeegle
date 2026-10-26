import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  imports: [RouterOutlet, SidebarComponent],  
  selector: 'app-home',
  template: `
    <div class="container">
      <div class="row g-4">
        
        <aside class="col-12 col-lg-2">
          <div class="sidebar-sticky">
            <app-sidebar />
          </div>
        </aside>
        <main class="col-12 col-lg-8">
          <router-outlet />
        </main>
        <!-- aggiungere recenzioni o altro in questa colonna -->
        <div class="d-none d-lg-block col-lg-2"></div>
      </div>
    </div>
  `,
  styles: `
    .sidebar-sticky {
      position: sticky;
      top: 80px;
      padding-right: 15px;
      max-height: calc(100vh - 100px);
      overflow-y: auto;
    }
  `,
})
export class Home {}
