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
<<<<<<< HEAD
import { Router, RouterLink } from '@angular/router';
=======
import { Router } from '@angular/router';
>>>>>>> f832f1df51e03a14c7129a12a7a4805dc022ab32
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
<<<<<<< HEAD
    RouterLink
=======
>>>>>>> f832f1df51e03a14c7129a12a7a4805dc022ab32
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
<<<<<<< HEAD
  
=======

>>>>>>> f832f1df51e03a14c7129a12a7a4805dc022ab32
  showMessage(message: string, type: 'error' | 'success'): void {
    this.message = message;
    this.messageType = type;
  }

  signIn(): void {
    if (this.isLoading) return;
<<<<<<< HEAD

=======
    
>>>>>>> f832f1df51e03a14c7129a12a7a4805dc022ab32
    const username = this.loginForm.value.username;
    const password = this.loginForm.value.password;

    if (!username.trim()) {
      this.showMessage('Please enter username', 'error');
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
          name: res.attributes.find((e: any) => e.Name === 'name').Value,
          email: res.attributes.find((e: any) => e.Name === 'email').Value,
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
