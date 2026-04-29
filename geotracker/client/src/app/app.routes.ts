import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home.page').then((module) => module.HomePage),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
