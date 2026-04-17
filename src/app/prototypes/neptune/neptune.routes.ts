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
          import('./screens/neptune-catalog-screen.component').then(
            m => m.NeptuneCatalogScreenComponent
          ),
      },
      {
        path: 'pos',
        loadComponent: () =>
          import('./screens/neptune-pos-screen.component').then(
            m => m.NeptunePosScreenComponent
          ),
      },
      {
        path: 'config',
        loadComponent: () =>
          import('./screens/neptune-config-screen.component').then(
            m => m.NeptuneConfigScreenComponent
          ),
      },
    ],
  },
];
