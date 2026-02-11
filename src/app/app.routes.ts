import { Routes } from '@angular/router';
import { accessGuard } from './shared/access.guard';

/**
 * Главные маршруты приложения.
 *
 * Для добавления нового прототипа:
 * 1. Создай папку в src/app/prototypes/<имя>/
 * 2. Создай файл маршрутов (demo.routes.ts)
 * 3. Добавь loadChildren ниже (обёрнутый в protected-prototype)
 * 4. Добавь запись в prototypes.registry.ts
 * 5. Добавь код в access-codes.ts
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
      // === ПРОТОТИПЫ (защищены кодом доступа) ===
      {
        path: 'prototype/demo',
        canActivate: [accessGuard],
        loadComponent: () =>
          import('./components/layout/protected-prototype.component').then(
            m => m.ProtectedPrototypeComponent
          ),
        children: [
          {
            path: '',
            loadChildren: () =>
              import('./prototypes/demo/demo.routes').then(m => m.DEMO_ROUTES),
          },
        ],
      },
      {
        path: 'prototype/web-screens',
        canActivate: [accessGuard],
        loadComponent: () =>
          import('./components/layout/protected-prototype.component').then(
            m => m.ProtectedPrototypeComponent
          ),
        children: [
          {
            path: '',
            loadChildren: () =>
              import('./prototypes/web-screens/web-screens.routes').then(
                m => m.WEB_SCREENS_ROUTES
              ),
          },
        ],
      },
      {
        path: 'prototype/front-plugins',
        canActivate: [accessGuard],
        loadComponent: () =>
          import('./components/layout/protected-prototype.component').then(
            m => m.ProtectedPrototypeComponent
          ),
        children: [
          {
            path: '',
            loadChildren: () =>
              import('./prototypes/front-plugins/front-plugins.routes').then(
                m => m.FRONT_PLUGINS_ROUTES
              ),
          },
        ],
      },
      {
        path: 'prototype/pudu-admin',
        canActivate: [accessGuard],
        loadComponent: () =>
          import('./components/layout/protected-prototype.component').then(
            m => m.ProtectedPrototypeComponent
          ),
        children: [
          {
            path: '',
            loadChildren: () =>
              import('./prototypes/pudu-admin/pudu-admin.routes').then(
                m => m.PUDU_ADMIN_ROUTES
              ),
          },
        ],
      },
      {
        path: 'prototype/front-pudu-plugin',
        canActivate: [accessGuard],
        loadComponent: () =>
          import('./components/layout/protected-prototype.component').then(
            m => m.ProtectedPrototypeComponent
          ),
        children: [
          {
            path: '',
            loadChildren: () =>
              import('./prototypes/front-pudu-plugin/pudu-plugin.routes').then(
                m => m.PUDU_PLUGIN_ROUTES
              ),
          },
        ],
      },
      // Добавляй новые прототипы здесь
    ],
  },
];
