import { Routes } from '@angular/router'
import { LoginComponent } from './components/login/login.component'
import { ResetPasswordComponent } from './components/reset-password/reset-password.component'
import { MainMenuComponent } from './components/main-menu/main-menu.component'
import { InsurersCoversComponent } from './components/insurers-covers/insurers-covers.component'
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
        path: 'insurers',
        component: InsurersComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'plans',
        component: PlansComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'subplans',
        component: SubplansComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'tabla',
        component: InsurersCoversComponent,
        canActivate: [AuthGuardService],
      },
    ],
  },
  {
    path: 'user_management',
    component: UserManagementComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: '**',
    redirectTo: '/login',
  },
]
