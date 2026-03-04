import { Routes } from '@angular/router';

export const FALCON_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./falcon-prototype.component').then(
        m => m.FalconPrototypeComponent
      ),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./screens/falcon-catalog-screen.component').then(
            m => m.FalconCatalogScreenComponent
          ),
      },
      {
        path: 'pos',
        loadComponent: () =>
          import('./screens/falcon-pos-screen.component').then(
            m => m.FalconPosScreenComponent
          ),
      },
    ],
  },
];
