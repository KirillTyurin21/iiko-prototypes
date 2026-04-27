import { Routes } from '@angular/router';

export const WB_PAY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./wb-pay-prototype.component').then(
        m => m.WbPayPrototypeComponent
      ),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./screens/wb-pay-main-screen.component').then(
            m => m.WbPayMainScreenComponent
          ),
      },
      {
        path: 'plugin/payment',
        loadComponent: () =>
          import('./screens/plugin-payment-screen.component').then(
            m => m.PluginPaymentScreenComponent
          ),
      },
      {
        path: 'plugin/refund',
        loadComponent: () =>
          import('./screens/plugin-refund-screen.component').then(
            m => m.PluginRefundScreenComponent
          ),
      },
      {
        path: 'plugin/fiscal-error',
        loadComponent: () =>
          import('./screens/plugin-fiscal-error-screen.component').then(
            m => m.PluginFiscalErrorScreenComponent
          ),
      },
      {
        path: 'plugin/setup',
        loadComponent: () =>
          import('./screens/plugin-setup-screen.component').then(
            m => m.PluginSetupScreenComponent
          ),
      },
      {
        path: 'admin',
        loadComponent: () =>
          import('./screens/admin-credentials-screen.component').then(
            m => m.AdminCredentialsScreenComponent
          ),
      },
    ],
  },
];
