import { ApplicationConfig, importProvidersFrom } from '@angular/core'
import { provideRouter } from '@angular/router'
import { routes } from './app.routes'
import { provideClientHydration } from '@angular/platform-browser'
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withFetch,
  withInterceptorsFromDi,
} from '@angular/common/http'
import { icons } from './icons-provider'
import { provideNzIcons } from 'ng-zorro-antd/icon'
import { en_US, provideNzI18n } from 'ng-zorro-antd/i18n'
import { registerLocaleData } from '@angular/common'
import en from '@angular/common/locales/en'
import { FormsModule } from '@angular/forms'
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async'
import { AuthInterceptor } from './interceptors/auth.interceptors'
import { AuthGuardService } from './services/guards/auth-guard.service'
import { LoginGuardService } from './services/guards/login.guard'

registerLocaleData(en)

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    AuthGuardService,
    LoginGuardService,
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(withFetch()),
    provideNzIcons(icons),
    provideNzI18n(en_US),
    importProvidersFrom(FormsModule),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptorsFromDi()),
  ],
}
