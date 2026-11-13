import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: 'game/:id', renderMode: RenderMode.Client },
  {
    path: 'profile',
    renderMode: RenderMode.Client
  },
  {
    path: 'favorites',
    renderMode: RenderMode.Client
  },
  {
    path: 'wishlist',
    renderMode: RenderMode.Client
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
