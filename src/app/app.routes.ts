import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { MainMenuComponent } from './components/main-menu/main-menu.component';
import { ChangePasswordComponent } from './components/change-password/change-password.component';
import { PlansComponent } from './components/plans/plans.component';
import { InsurersComponent } from './components/insurers/insurers.component';
import { BlankComponent } from './layouts/blank/blank.component';
import { FullComponent } from './layouts/full/full.component';
import { SubplansComponent } from './components/subplans/subplans.component';
import { UserManagementComponent } from './components/user-management/user-management.component';
import { ProfilesComponent } from './components/user-management/profiles/profiles.component';
import { EligibilityComponent } from './components/eligibility/eligibility.component';
import { AuthGuardService, LoginGuardService, NewPasswordRequiredGuard } from './services'
import {
  ServicesComponent,
  ProductsComponent,
  DoctorComponent,
  LocalitiesComponent,
  // SpecialitiesComponent,
  // OfficesComponent
} from './components/configuration';

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
          // {
          //   path: 'specialities',
          //   component: SpecialitiesComponent,
          // },
          {
            path: 'localities',
            component: LocalitiesComponent,
          },
          // {
          //   path: 'offices',
          //   component: OfficesComponent,
          // },
          {
            path: 'services',
            component: ServicesComponent,
          },
          {
            path: 'doctors',
            component: DoctorComponent,
          },
          {
            path: 'products',
            component: ProductsComponent,
          },
        ],
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
          {
            path: 'profiles',
            component: ProfilesComponent,
            canActivate: [AuthGuardService],
          },
        ],
      },
      {
        path: 'eligibility',
        component: EligibilityComponent,
        canActivate: [AuthGuardService],
      },
    ],
  },
  {
    path: '**',
    redirectTo: '/login',
  },
];
