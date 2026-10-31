import { inject } from '@angular/core';
import { ResolveFn, Routes } from '@angular/router';
import { Locale } from './core/portfolio.models';
import { Page, PortfolioService } from './core/portfolio.service';

const useLocale =
  (locale: Locale, page: Page): ResolveFn<Locale> =>
  () => {
    inject(PortfolioService).applyRouteLocale(locale, page);
    return locale;
  };

const home = () => import('./pages/home/home.component').then((m) => m.HomeComponent);
const services = () =>
  import('./pages/services/services-page.component').then((m) => m.ServicesPageComponent);

export const routes: Routes = [
  { path: '', pathMatch: 'full', loadComponent: home, resolve: { locale: useLocale('en-US', 'home') } },
  { path: 'services', loadComponent: services, resolve: { locale: useLocale('en-US', 'services') } },
  { path: 'pt', pathMatch: 'full', loadComponent: home, resolve: { locale: useLocale('pt-BR', 'home') } },
  { path: 'pt/services', loadComponent: services, resolve: { locale: useLocale('pt-BR', 'services') } },
  { path: 'es', pathMatch: 'full', loadComponent: home, resolve: { locale: useLocale('es-ES', 'home') } },
  { path: 'es/services', loadComponent: services, resolve: { locale: useLocale('es-ES', 'services') } },
  { path: 'en', redirectTo: '' },
  { path: 'en/services', redirectTo: 'services' },
  { path: '**', redirectTo: '' },
];
