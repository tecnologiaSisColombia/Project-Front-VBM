import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { PasswordToggleComponent, PasswordResetButtonComponent } from '../../reusable-components';
import { LoginService } from '../../services/login/login.service';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PasswordToggleComponent,
    PasswordResetButtonComponent,
    RouterLink,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private loginService: LoginService,
    private authService: AuthService,
    private router: Router,
    private msg: NzMessageService
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  ngOnInit(): void { }

  signIn(): void {
    if (this.isLoading) return;

    const { username, password } = this.loginForm.value;

    if (!username.trim() || !password.trim()) {
      this.msg.error(`${!username.trim() ? 'Username' : 'Password'} is required`);
      return;
    }

    this.isLoading = true;

    this.loginService.signIn(username, password).subscribe({
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

        if (error.error?.error?.code === 'NewPasswordRequired') {
          localStorage.setItem('auth_challenge', 'NewPasswordRequired');
          this.router
            .navigate(['/change_password'], {
              queryParams: {
                session: error.error.error.session,
                username,
              },
            })
            .then(() => {
              this.isLoading = false;
            });
        } else {
          const errorMessage = error.error?.error?.message || 'Login failed';
          this.msg.error(errorMessage);
        }
      },
    });
  }
}
