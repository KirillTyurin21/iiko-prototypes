import { Routes } from '@angular/router';

export const PUDU_PLUGIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pudu-plugin-prototype.component').then(
        m => m.PuduPluginPrototypeComponent
      ),
  },
];
