import { Routes } from '@angular/router'
import { LoginComponent } from './components/login/login.component'
import { ResetPasswordComponent } from './components/reset-password/reset-password.component'
import { MainMenuComponent } from './components/main-menu/main-menu.component'
import { AuthGuardService } from './services/guards/auth-guard.service'
import { ChangePasswordComponent } from './components/change-password/change-password.component'
import { LoginGuardService } from './services/guards/login.guard'
import { NewPasswordRequiredGuard } from './services/guards/new-password-required.guard'
import { PlansComponent } from './components/plans/plans.component'
import { InsurersComponent } from './components/insurers/insurers.component'
import { BlankComponent } from './layouts/blank/blank.component'
import { FullComponent } from './layouts/full/full.component'
import { SubplansComponent } from './components/subplans/subplans.component'
import { UserManagementComponent } from './components/user-management/user-management.component'
import { SpecialitiesComponent } from './components/configuration/specialities/specialities.component'
import { StoresComponent } from './components/configuration/stores/stores.component'
import { OfficesComponent } from './components/configuration/offices/offices.component'

export const routes: Routes = [
  {
    path: 'login',
    component: BlankComponent,
    canActivate: [LoginGuardService],
    children: [
      {
        path: '',
        component: LoginComponent,
      },
    ],
  },
  {
    path: 'reset_password',
    component: ResetPasswordComponent,
  },
  {
    path: 'change_password',
    component: ChangePasswordComponent,
    canActivate: [NewPasswordRequiredGuard],
  },
  {
    path: '',
    component: FullComponent,
    canActivate: [AuthGuardService],
    children: [
      {
        path: 'home',
        component: MainMenuComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'config',
        canActivate: [AuthGuardService],
        children: [
          {
            path: 'specialities',
            component: SpecialitiesComponent,
          },
          {
            path: 'stores',
            component: StoresComponent,
          },
          {
            path: 'offices',
            component: OfficesComponent,
          },
        ]
      },
      {
        path: 'insurers',
        children: [
          {
            path: '',
            component: InsurersComponent,
            canActivate: [AuthGuardService],
          },
          {
            path: 'coverages',
            component: PlansComponent,
            canActivate: [AuthGuardService],
          },
          {
            path: 'subplans',
            component: SubplansComponent,
            canActivate: [AuthGuardService],
          },
        ],
      },
      {
        path: 'users',
        children: [
          {
            path: 'user_management',
            component: UserManagementComponent,
            canActivate: [AuthGuardService],
          },
        ],
      },
    ],
  },
  {
    path: '**',
    redirectTo: '/login',
  },
]
