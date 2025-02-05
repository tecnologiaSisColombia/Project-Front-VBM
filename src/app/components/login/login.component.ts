import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { LoginService } from '../../services/login/login.service';
import { AuthService } from '../../services/auth/auth.service';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzCardModule } from 'ng-zorro-antd/card';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    NzButtonModule,
    NzInputModule,
    NzFormModule,
    NzIconModule,
    NzCardModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css', '/src/animations/styles.css'],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isDataLoading: boolean = false;
  showPassword: boolean = false;

  constructor(
    private fb: FormBuilder,
    private loginService: LoginService,
    private authService: AuthService,
    private router: Router,
    private msg: NzMessageService
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.pattern(/^(?!\s*$).+/)]],
      password: ['', [Validators.required, Validators.pattern(/^(?!\s*$).+/)]],
    });
  }

  ngOnInit(): void { }

  signIn(): void {
    if (!this.loginForm.valid) {
      Object.values(this.loginForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }

    this.isDataLoading = true;

    this.loginService.signIn(this.loginForm.value)
      .subscribe({
        next: (res: any) => {
          const getAttr = (name: string) => {
            const attribute = res.attributes.find((attr: any) => attr.Name === name);
            return attribute?.Value;
          };

          res.properties.user = {
            id: getAttr('sub'),
            email: getAttr('email'),
            username: getAttr('username'),
          };

          localStorage.removeItem('auth_challenge');

          this.authService.doLogin(res.properties);

          this.router.navigate(['/home']).then(() => {
            this.isDataLoading = false;
          });
        },
        error: (err) => {
          const errorMapping: Record<string, { route: string; queryParams: Record<string, any> }> = {
            NewPasswordRequired: {
              route: '/change_password',
              queryParams: {
                session: err.error.error.session,
                username: this.loginForm.get('username')?.value,
              },
            },
            NewPasswordDays: {
              route: '/change_password',
              queryParams: {
                username: this.loginForm.get('username')?.value,
              },
            },
          };

          const errorCode = err?.error?.error?.code;

          if (errorMapping[errorCode]) {
            this.isDataLoading = false;

            localStorage.setItem('auth_challenge', errorCode);

            this.router.navigate([errorMapping[errorCode].route], {
              queryParams: errorMapping[errorCode].queryParams,
            });
          } else {
            this.isDataLoading = false;

            this.msg.error(JSON.stringify(err?.error?.error?.message));
          }
        },
      });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
