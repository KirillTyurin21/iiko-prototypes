import { Routes } from '@angular/router';

/**
 * Главные маршруты приложения.
 *
 * Для добавления нового прототипа:
 * 1. Создай папку в src/app/prototypes/<имя>/
 * 2. Создай файл маршрутов (demo.routes.ts)
 * 3. Добавь loadChildren ниже
 * 4. Добавь запись в prototypes.registry.ts
 */
export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/home.component').then(m => m.HomeComponent),
      },
      // === ПРОТОТИПЫ ===
      {
        path: 'prototype/demo',
        loadChildren: () =>
          import('./prototypes/demo/demo.routes').then(m => m.DEMO_ROUTES),
      },
      {
        path: 'prototype/web-screens',
        loadChildren: () =>
          import('./prototypes/web-screens/web-screens.routes').then(
            m => m.WEB_SCREENS_ROUTES
          ),
      },
      {
        path: 'prototype/front-plugins',
        loadChildren: () =>
          import('./prototypes/front-plugins/front-plugins.routes').then(
            m => m.FRONT_PLUGINS_ROUTES
          ),
      },
      {
        path: 'prototype/eagle',
        loadChildren: () =>
          import('./prototypes/eagle/eagle.routes').then(
            m => m.EAGLE_ROUTES
          ),
      },
      {
        path: 'prototype/falcon',
        loadChildren: () =>
          import('./prototypes/falcon/falcon.routes').then(
            m => m.FALCON_ROUTES
          ),
      },
      {
        path: 'prototype/neptune',
        loadChildren: () =>
          import('./prototypes/neptune/neptune.routes').then(
            m => m.NEPTUNE_ROUTES
          ),
      },
      {
        path: 'prototype/demo-wizard',
        loadChildren: () =>
          import('./prototypes/demo-wizard/demo-wizard.routes').then(
            m => m.DEMO_WIZARD_ROUTES
          ),
      },
      {
        path: 'prototype/comet',
        loadChildren: () =>
          import('./prototypes/comet/comet.routes').then(
            m => m.COMET_ROUTES
          ),
      },
      {
        path: 'prototype/wb-pay',
        loadChildren: () =>
          import('./prototypes/wb-pay/wb-pay.routes').then(
            m => m.WB_PAY_ROUTES
          ),
      },
      // Добавляй новые прототипы здесь

      // Wildcard — перенаправление на главную для несуществующих URL
      { path: '**', redirectTo: '', pathMatch: 'full' },
    ],
  },
];
