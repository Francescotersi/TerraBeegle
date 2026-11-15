import { Routes } from '@angular/router';
import { Home } from './views/home/home.component';
import { authGuard } from './guards/auth.guard';
import { CatalogPage } from './views/catalog-page/catalog-page.component';

// Home + CatalogPage (the grid) are loaded right away.
// Every other page is lazy-loaded: its code is downloaded only when you navigate to it.
export const routes: Routes = [
    {
        path:'',
        component: Home,
        children: [
            {
                path: '',
                component: CatalogPage,
            },
            {
                path: 'game/:slug',
                loadComponent: () => import('./views/game-details-page/game-details-page.component').then(m => m.GameDetailsPage),
            },
        ]
    },
    {
        path:'login',
        loadComponent: () => import('./views/user/log-in-user/log-in-user.component').then(m => m.LogInUser),
    },
    {
        path:'register',
        loadComponent: () => import('./views/user/register-user/register-user.component').then(m => m.RegisterUser),
    },
    {
        path: 'otp',
        loadComponent: () => import('./views/user/otp/otp.component').then(m => m.OtpComponent),
    },
    {
        path: 'forgot-password',
        loadComponent: () => import('./views/user/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
    },
    {
        path: 'profile',
        loadComponent: () => import('./views/profile-page/profile-page.component').then(m => m.ProfilePageComponent),
        canActivate: [authGuard],
    },
    {
        path: 'favorites',
        loadComponent: () => import('./views/favorite-page/favorite-page.component').then(m => m.FavoritePageComponent),
        canActivate: [authGuard],
    },
    {
        path: 'wishlist',
        loadComponent: () => import('./views/wishlist-page/wishlist-page.component').then(m => m.WishlistPageComponent),
        canActivate: [authGuard],
    },
    {
        path: 'friends/:id',
        loadComponent: () => import('./views/friend-lists-page/friend-lists-page.component').then(m => m.FriendListsPage),
        canActivate: [authGuard],
    }
];
