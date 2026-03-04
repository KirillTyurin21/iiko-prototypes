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
        path: 'prototype/pudu-admin',
        loadChildren: () =>
          import('./prototypes/pudu-admin/pudu-admin.routes').then(
            m => m.PUDU_ADMIN_ROUTES
          ),
      },
      {
        path: 'prototype/front-pudu-plugin',
        loadChildren: () =>
          import('./prototypes/front-pudu-plugin/pudu-plugin.routes').then(
            m => m.PUDU_PLUGIN_ROUTES
          ),
      },
      {
        path: 'prototype/mgs-casino',
        loadChildren: () =>
          import('./prototypes/mgs-casino/mgs-casino.routes').then(
            m => m.MGS_CASINO_ROUTES
          ),
      },
      // Добавляй новые прототипы здесь

      // Wildcard — перенаправление на главную для несуществующих URL
      { path: '**', redirectTo: '', pathMatch: 'full' },
    ],
  },
];
