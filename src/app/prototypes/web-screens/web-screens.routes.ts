import { Routes } from '@angular/router';

export const WEB_SCREENS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./web-screens-prototype.component').then(
        m => m.WebScreensPrototypeComponent
      ),
    children: [
      {
        path: '',
        redirectTo: 'displays',
        pathMatch: 'full',
      },
      {
        path: 'displays',
        loadComponent: () =>
          import('./screens/displays-screen.component').then(
            m => m.DisplaysScreenComponent
          ),
      },
      {
        path: 'themes-cs',
        loadComponent: () =>
          import('./screens/themes-cs-screen.component').then(
            m => m.ThemesCsScreenComponent
          ),
      },
      {
        path: 'controls',
        loadComponent: () =>
          import('./screens/controls-screen.component').then(
            m => m.ControlsScreenComponent
          ),
      },
      {
        path: 'hints',
        loadComponent: () =>
          import('./screens/hints-screen.component').then(
            m => m.HintsScreenComponent
          ),
      },
      {
        path: 'cs-terminals',
        loadComponent: () =>
          import('./screens/cs-terminals-screen.component').then(
            m => m.CsTerminalsScreenComponent
          ),
      },
      {
        path: 'terminals',
        loadComponent: () =>
          import('./screens/terminals-screen.component').then(
            m => m.TerminalsScreenComponent
          ),
      },
      {
        path: 'themes-arrivals',
        loadComponent: () =>
          import('./screens/themes-arrivals-screen.component').then(
            m => m.ThemesArrivalsScreenComponent
          ),
      },
      {
        path: 'arrivals-theme-editor/:id',
        loadComponent: () =>
          import('./screens/arrivals-theme-editor-screen.component').then(
            m => m.ArrivalsThemeEditorScreenComponent
          ),
      },
      {
        path: 'theme-editor/:id',
        loadComponent: () =>
          import('./screens/theme-editor-screen.component').then(
            m => m.ThemeEditorScreenComponent
          ),
      },
      {
        path: 'arrivals-controls',
        loadComponent: () =>
          import('./screens/arrivals-controls-screen.component').then(
            m => m.ArrivalsControlsScreenComponent
          ),
      },
      {
        path: 'arrivals-control-editor/:id',
        loadComponent: () =>
          import('./screens/arrivals-control-editor-screen.component').then(
            m => m.ArrivalsControlEditorScreenComponent
          ),
      },
      {
        path: 'sounds-event-handlers',
        loadComponent: () =>
          import('./screens/sounds-event-handlers-screen.component').then(
            m => m.SoundsEventHandlersScreenComponent
          ),
      },
      {
        path: 'sounds-event-handlers-v2',
        loadComponent: () =>
          import('./screens/sounds-event-handlers-v2-screen.component').then(
            m => m.SoundsEventHandlersV2ScreenComponent
          ),
      },

      {
        path: 'sounds-terminals',
        loadComponent: () =>
          import('./screens/sounds-terminals-screen.component').then(
            m => m.SoundsTerminalsScreenComponent
          ),
      },
      {
        path: 'sounds-terminals-v2',
        loadComponent: () =>
          import('./screens/sounds-terminals-v2-screen.component').then(
            m => m.SoundsTerminalsV2ScreenComponent
          ),
      },
      {
        path: 'arrivals-multiscreen',
        loadComponent: () =>
          import('./screens/arrivals-multiscreen-screen.component').then(
            m => m.ArrivalsMultiscreenScreenComponent
          ),
      },
      {
        path: 'menuboard-themes',
        loadComponent: () =>
          import('./screens/menuboard-themes-screen.component').then(
            m => m.MenuboardThemesScreenComponent
          ),
      },
      {
        path: 'menuboard-theme-editor/:id',
        loadComponent: () =>
          import('./screens/menuboard-theme-editor-screen.component').then(
            m => m.MenuboardThemeEditorScreenComponent
          ),
      },
      {
        path: 'menuboard-controls',
        loadComponent: () =>
          import('./screens/menuboard-controls-screen.component').then(
            m => m.MenuboardControlsScreenComponent
          ),
      },
      {
        path: 'menuboard-control-editor/:id',
        loadComponent: () =>
          import('./screens/arrivals-control-editor-screen.component').then(
            m => m.ArrivalsControlEditorScreenComponent
          ),
      },
      {
        path: 'menuboard-terminals',
        loadComponent: () =>
          import('./screens/menuboard-terminals-screen.component').then(
            m => m.MenuboardTerminalsScreenComponent
          ),
      },
      {
        path: 'menuboard-multiscreen',
        loadComponent: () =>
          import('./screens/menuboard-multiscreen-screen.component').then(
            m => m.MenuboardMultiscreenScreenComponent
          ),
      },
      {
        path: 'global-hints',
        loadComponent: () =>
          import('./screens/stub-screen.component').then(
            m => m.StubScreenComponent
          ),
      },
      {
        path: 'gallery',
        loadComponent: () =>
          import('./screens/stub-screen.component').then(
            m => m.StubScreenComponent
          ),
      },
      {
        path: 'campaigns',
        loadComponent: () =>
          import('./screens/campaigns-screen.component').then(
            m => m.CampaignsScreenComponent
          ),
      },
      {
        path: 'campaign-editor/:id',
        loadComponent: () =>
          import('./screens/campaign-editor-screen.component').then(
            m => m.CampaignEditorScreenComponent
          ),
      },
      {
        path: 'kiosk-themes',
        loadComponent: () =>
          import('./screens/kiosk-themes-screen.component').then(
            m => m.KioskThemesScreenComponent
          ),
      },
      {
        path: 'kiosk-theme-editor/:id',
        loadComponent: () =>
          import('./screens/kiosk-theme-editor-screen.component').then(
            m => m.KioskThemeEditorScreenComponent
          ),
      },
      {
        path: 'cs-control-editor/:id',
        loadComponent: () =>
          import('./screens/cs-control-editor-screen.component').then(
            m => m.CsControlEditorScreenComponent
          ),
      },
    ],
  },
];
