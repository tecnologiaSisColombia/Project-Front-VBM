import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginService } from '../../services/login/login.service';
import { PasswordResetButtonComponent } from '../../reusable-components';
import { CommonModule } from '@angular/common';
import { passwordRegex } from '../../utils/password_regex';
import { AuthService } from '../../services/auth/auth.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [
    PasswordResetButtonComponent,
    ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css'],
})
export class ChangePasswordComponent implements OnInit {
  changePasswordForm: FormGroup;
  session: string | null = null;
  username: string | null = null;
  isLoading: boolean = false;
  btnActive: boolean = false;
  passwordRight: boolean = false;
  passwordConfirm: boolean = false;
  regex = passwordRegex;

  constructor(
    private fb: FormBuilder,
    private loginService: LoginService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private msg: NzMessageService
  ) {
    this.changePasswordForm = this.fb.group({
      new_password: [
        '', 
        [
          Validators.required, 
          Validators.minLength(8)
        ]
      ],
      confirmPassword: [
        '', 
        [
          Validators.required, 
          Validators.minLength(8)
        ]
      ],
    });
  }

  ngOnInit(): void {
    this.session = this.route.snapshot.queryParamMap.get('session');
    this.username = this.route.snapshot.queryParamMap.get('username');
  }

  passwordChange(value: string): void {
    this.passwordRight = this.regex.test(value);
    this.btnActive =
    this.passwordRight &&
    this.passwordConfirm &&
    !!this.session &&
    !!this.username;
  }

  confirmPasswordChange(value: string): void {
    const newPassword = this.changePasswordForm.value.new_password;
    this.passwordConfirm = value === newPassword;
    this.btnActive =
    this.passwordRight &&
    this.passwordConfirm &&
    !!this.session &&
    !!this.username;
  }

  changePassword(): void {
    const { new_password, confirmPassword } = this.changePasswordForm.value;
    if (!this.regex.test(new_password) || new_password !== confirmPassword) {
      return;
    }
    if (this.username && this.session) {
      this.isLoading = true;
      this.loginService.changeTemporaryPassword(this.username, new_password, this.session).subscribe({
        next: (res: any) => {
          res.properties.user = {
            id: res.attributes.find((e: any) => e.Name === 'sub')?.Value,
            email: res.attributes.find((e: any) => e.Name === 'email')?.Value,
            username: res.attributes.find((e: any) => e.Name === 'username')?.Value,
          };
          this.authService.doLogin(res.properties);
          this.router.navigate(['/home']).then(() => {
            this.isLoading = false;
          });
        },
        error: (error) => {
          this.isLoading = false;
          const errorMessage = error.error?.error?.message || 'Change Password failed';
          this.msg.error(errorMessage);
        },
      });
    }
  }
}
