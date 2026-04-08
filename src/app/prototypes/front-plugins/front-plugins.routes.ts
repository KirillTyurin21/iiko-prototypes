import { Routes } from '@angular/router';

export const FRONT_PLUGINS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./front-plugins-prototype.component').then(
        m => m.FrontPluginsPrototypeComponent
      ),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./screens/plugins-main-screen.component').then(
            m => m.PluginsMainScreenComponent
          ),
      },
      {
        path: 'hints',
        loadComponent: () =>
          import('./screens/hint-hub-screen.component').then(
            m => m.HintHubScreenComponent
          ),
      },
      {
        path: 'hints/demo',
        loadComponent: () =>
          import('./screens/hint-demo-screen.component').then(
            m => m.HintDemoScreenComponent
          ),
      },
      {
        path: 'hints/variants',
        loadComponent: () =>
          import('./screens/hint-variants-screen.component').then(
            m => m.HintVariantsScreenComponent
          ),
      },
      {
        path: ':pluginId',
        loadComponent: () =>
          import('./screens/plugin-dialogs-screen.component').then(
            m => m.PluginDialogsScreenComponent
          ),
      },
    ],
  },
];
