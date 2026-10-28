import { Routes } from '@angular/router';
import { Home } from './home/home.component';
import { GridComponent } from './grid/grid.component';
import { LogInUser } from './user/log-in-user/log-in-user.component';
import { RegisterUser } from './user/register-user/register-user.component';
import { authGuard } from './guards/auth.guard';

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
    }
];
