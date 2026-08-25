import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'services',
    loadComponent: () =>
      import('./pages/services/services-page.component').then((m) => m.ServicesPageComponent),
  },
  { path: '**', redirectTo: '' },
];
