import { Routes } from '@angular/router';
import { Home } from './views/home/home.component';
import { LogInUser } from './views/user/log-in-user/log-in-user.component';
import { RegisterUser } from './views/user/register-user/register-user.component';
import { authGuard } from './guards/auth.guard';
import { ProfilePageComponent } from './views/profile-page/profile-page.component';
import { FavoritePageComponent } from './views/favorite-page/favorite-page.component';
import { CatalogPage } from './views/catalog-page/catalog-page.component';
import { WishlistPageComponent } from './views/wishlist-page/wishlist-page.component';

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
                path: 'favorites',
                component: FavoritePageComponent,
                canActivate: [authGuard],
            },
            {
                path: 'wishlist',
                component: WishlistPageComponent,
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
