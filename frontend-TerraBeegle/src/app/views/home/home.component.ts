import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  imports: [RouterOutlet, SidebarComponent],  
  selector: 'app-home',
  template: `
    <div class="container-fluid px-3 px-md-4 px-xl-5">
      <div class="row g-4 align-items-start justify-content-center">

        <aside class="col-12 col-lg-4 col-xl-3 col-xxl-2">
          <div class="sidebar-sticky">
            <app-sidebar />
          </div>
        </aside>

        <main class="col-12 col-lg-8 col-xl-6 col-xxl-8">
          <router-outlet />
        </main>

        <!-- recensioni etc... -->
        <div class="d-none d-xl-block col-xl-3 col-xxl-2" aria-hidden="true"></div>
      </div>
    </div>
  `,
  styles: `
    .sidebar-sticky {
      position: sticky;
      top: 90px;
    }
  `,
})
export class Home {}
