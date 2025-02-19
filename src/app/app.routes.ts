import { Routes } from '@angular/router';
import { BlankComponent } from 'app/layouts/blank/blank.component';
import { FullComponent } from 'app/layouts/full/full.component';
import { AuthGuardService } from 'app/services/guards/auth-guard.service'
import { LoginGuardService } from 'app/services/guards/login.guard'
import { NewPasswordRequiredGuard } from 'app/services/guards/new-password-required.guard'
import { ServicesComponent } from 'app/components/configuration/services/services.component'
import { ProductsComponent } from 'app/components/configuration/products/products.component'
import { DoctorComponent } from 'app/components/configuration/doctors/doctor.component'
import { LocalitiesComponent } from 'app/components/configuration/localities/localities.component'
import { DiagnosisComponent } from 'app/components/configuration/diagnosis/diagnosis.component'
import { LocationComponent } from 'app/components/configuration/place_of_service/place_of_service.component'
import { LoginComponent } from 'app/components/login/login.component'
import { ResetPasswordComponent } from 'app/components/reset-password/reset-password.component'
import { ChangePasswordComponent } from 'app/components/change-password/change-password.component'
import { InsurersComponent } from 'app/components/insurers/insurers.component'
import { PlansComponent } from 'app/components/plans/plans.component'
import { SubplansComponent } from 'app/components/subplans/subplans.component'
import { UserManagementComponent } from 'app/components/user-management/user-management.component'
import { ProfilesComponent } from 'app/components/user-management/profiles/profiles.component'
import { EligibilityComponent } from 'app/components/eligibility/eligibility.component'
import { MainMenuComponent } from 'app/components/main-menu/main-menu.component'

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
    canActivate: [LoginGuardService]
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
          {
            path: 'place_of_service',
            component: LocationComponent,
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
        path: 'patients',
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
