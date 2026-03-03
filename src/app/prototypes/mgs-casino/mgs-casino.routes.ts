import { Routes } from '@angular/router';

export const MGS_CASINO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./mgs-casino-prototype.component').then(
        m => m.MgsCasinoPrototypeComponent
      ),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./screens/mgs-overview-screen.component').then(
            m => m.MgsOverviewScreenComponent
          ),
      },
    ],
  },
];
