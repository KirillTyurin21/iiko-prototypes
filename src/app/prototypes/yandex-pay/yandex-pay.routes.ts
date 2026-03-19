import { Routes } from '@angular/router';

export const YANDEX_PAY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./yandex-pay-prototype.component').then(m => m.YandexPayPrototypeComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./screens/yandex-pay-main-screen.component').then(m => m.YandexPayMainScreenComponent),
      },
    ],
  },
];
