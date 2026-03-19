import { Routes } from '@angular/router';

export const COMET_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./comet-prototype.component').then(m => m.CometPrototypeComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./screens/comet-main-screen.component').then(m => m.CometMainScreenComponent),
      },
    ],
  },
];
