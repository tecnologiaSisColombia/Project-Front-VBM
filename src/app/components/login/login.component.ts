import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import {
  PasswordToggleComponent,
  PasswordResetButtonComponent,
  NotificationComponent,
} from '../../reusable-components';
import { LoginService } from '../../services/login/login.service';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NotificationComponent,
    PasswordToggleComponent,
    PasswordResetButtonComponent,
    RouterLink
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  message: string | null = null;
  messageType: 'error' | 'success' | null = null;
  isLoading: boolean = false;

  ngOnInit(): void { }

  constructor(
    private fb: FormBuilder,
    private loginService: LoginService,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', Validators.required],
    });
  }

  closeMessage(): void {
    this.message = null;
    this.messageType = null;
  }
  
  showMessage(message: string, type: 'error' | 'success'): void {
    this.message = message;
    this.messageType = type;
  }

  signIn(): void {
    if (this.isLoading) return;

    const username = this.loginForm.value.username;
    const password = this.loginForm.value.password;

    if (!username.trim()) {
      this.showMessage('Please enter username', 'error');
      return;
    }

    if (/\s/.test(username)) {
      this.showMessage('Username cannot contain spaces', 'error');
      return;
    }

    if (!password.trim()) {
      this.showMessage('Please enter password', 'error');
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
        if (error.error.error.code === 'NewPasswordRequired') {
          localStorage.setItem('auth_challenge', 'NewPasswordRequired');
          this.router
            .navigate(['/change_password'], {
              queryParams: {
                session: error.error.error.session,
                username,
              },
            }).then(() => {
              this.isLoading = false;
            });
        } else {
          const errorMessage =
            error.error?.error?.message || 'Login failed. Please try again.';
          this.showMessage(errorMessage, 'error');
        }
      },
    });
  }

}
