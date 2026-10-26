import { Routes } from '@angular/router';
import { Home } from './home/home.component';
import { GridComponent } from './grid/grid.component';

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
];
