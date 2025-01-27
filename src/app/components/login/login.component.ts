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
  styleUrls: ['./login.component.css', '../../../animations/styles.css'],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading: boolean = false;
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
      password: ['', [Validators.required, Validators.pattern(/^(?!\s*$).+/), Validators.minLength(8),
      ]],
    });
  }

  ngOnInit(): void { }

  signIn(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;

      const data = {
        username: this.loginForm.get('username')?.value,
        password: this.loginForm.get('password')?.value,
      };

      this.loginService.signIn(data).subscribe({
        next: (res: any) => {
          res.properties.user = {
            id: res.attributes.find((e: any) => e.Name === 'sub').Value,
            email: res.attributes.find((e: any) => e.Name === 'email').Value,
            username: res.attributes.find((e: any) => e.Name === 'username').Value,
          };

          localStorage.removeItem('auth_challenge');

          this.authService.doLogin(res.properties);

          this.router.navigate(['/home']).then(() => {
            this.isLoading = false;
          });
        },
        error: (error) => {
          this.isLoading = false;

          const errorMapping: Record<string, { route: string; queryParams: Record<string, any> }> = {
            NewPasswordRequired: {
              route: '/change_password',
              queryParams: {
                session: error.error.error.session,
                username: data.username,
              },
            },
            NewPasswordDays: {
              route: '/change_password',
              queryParams: {
                username: data.username,
              },
            },
          };

          const errorCode = error?.error?.error?.code;

          if (errorMapping[errorCode]) {
            localStorage.setItem('auth_challenge', errorCode);
            this.router
              .navigate([errorMapping[errorCode].route], {
                queryParams: errorMapping[errorCode].queryParams,
              })
              .then(() => {
                this.isLoading = false;
              });
          } else {
            this.msg.error(JSON.stringify(error?.error?.error?.message));
          }
        },
      });
    } else {
      Object.values(this.loginForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
