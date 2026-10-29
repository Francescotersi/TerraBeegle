import { Routes } from '@angular/router';
import { Home } from './views/home/home.component';
import { GridComponent } from './views/grid/grid.component';
import { LogInUser } from './views/user/log-in-user/log-in-user.component';
import { RegisterUser } from './views/user/register-user/register-user.component';
import { authGuard } from './guards/auth.guard';
import { ProfilePageComponent } from './views/profile-page/profile-page.component';

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
                canActivate: [authGuard],
            },
            {
                path: 'wishlist',
                component: GridComponent,
                canActivate: [authGuard],
            },
        ]
    },
    {
        path:'login',
        component: LogInUser,
    },
    {
        path:'register',
        component: RegisterUser
    },
    {
        path: 'profile',
        component: ProfilePageComponent,
        canActivate: [authGuard],
    }
];
