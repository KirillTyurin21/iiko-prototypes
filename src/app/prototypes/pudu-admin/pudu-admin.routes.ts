import { Routes } from '@angular/router';

export const PUDU_ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pudu-prototype.component').then(m => m.PuduPrototypeComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./screens/restaurants-screen.component').then(m => m.RestaurantsScreenComponent),
      },
      {
        path: 'robots',
        loadComponent: () =>
          import('./screens/robots-screen.component').then(m => m.RobotsScreenComponent),
      },
      {
        path: 'mapping',
        loadComponent: () =>
          import('./screens/mapping-screen.component').then(m => m.MappingScreenComponent),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./screens/settings-screen.component').then(m => m.SettingsScreenComponent),
      },
    ],
  },
];
