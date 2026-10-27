import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import { Home } from './home/home.component';
import { GridComponent } from './grid/grid.component';

@Component({
  selector: 'app-login-user',
  template: `
    <div class="container py-5 text-center">
      <h2 class="fw-bold mb-3">Log In</h2>
      <p class="text-muted">Modulo di accesso in arrivo.</p>
    </div>
  `,
})
export class LoginUser {}

@Component({
  selector: 'app-register-user',
  template: `
    <div class="container py-5 text-center">
      <h2 class="fw-bold mb-3">Register</h2>
      <p class="text-muted">Modulo di registrazione in arrivo.</p>
    </div>
  `,
})
export class RegisterUser {}

export const routes: Routes = [
    {
        path:'',
        component: Home,
        children: [
            {
                path: '',
                component: GridComponent,
            },
            {
                path: 'favorites',
                component: GridComponent,
            },
            {
                path: 'wishlist',
                component: GridComponent,
            },
        ]
    },
    {
        path:'login',
        component: LoginUser,
    },
    {
        path:'register',
        component: RegisterUser
    }
];
