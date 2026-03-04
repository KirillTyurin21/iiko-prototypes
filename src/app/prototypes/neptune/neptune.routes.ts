import { Routes } from '@angular/router';

export const NEPTUNE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./neptune-prototype.component').then(
        m => m.NeptunePrototypeComponent
      ),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./screens/neptune-overview-screen.component').then(
            m => m.NeptuneOverviewScreenComponent
          ),
      },
    ],
  },
];
