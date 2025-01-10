import { Routes } from '@angular/router';
import { BlankComponent, FullComponent } from './layouts';
import { AuthGuardService, LoginGuardService, NewPasswordRequiredGuard } from './services'
import {
  ServicesComponent,
  ProductsComponent,
  DoctorComponent,
  LocalitiesComponent,
  LoginComponent,
  ResetPasswordComponent,
  PlansComponent,
  InsurersComponent,
  UserManagementComponent,
  SubplansComponent,
  ProfilesComponent,
  EligibilityComponent,
  MainMenuComponent,
  ChangePasswordComponent,
  DiagnosisComponent
} from './components';

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
            path: 'localities',
            component: LocalitiesComponent,
          },
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
          {
            path: 'diagnosis',
            component: DiagnosisComponent,
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
