import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginService } from '../../services/login/login.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth/auth.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzCardModule } from 'ng-zorro-antd/card';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    NzButtonModule,
    NzInputModule,
    NzFormModule,
    NzIconModule,
    NzCardModule,
  ],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css', '/src/animations/styles.css'],
})
export class ChangePasswordComponent implements OnInit {
  changePasswordForm: FormGroup;
  session: string | null = null;
  username: string | null = null;
  isLoading: boolean = false;
  passwordVisible: boolean = false;

  constructor(
    private fb: FormBuilder,
    private loginService: LoginService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private msg: NzMessageService
  ) {
    this.changePasswordForm = this.fb.group({
      new_password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: [''],
    },
      { validators: this.passwordsMatchValidator }
    );
  }

  ngOnInit(): void {
    this.session = this.route.snapshot.queryParamMap.get('session');
    this.username = this.route.snapshot.queryParamMap.get('username');
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  private passwordsMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const newPassword = group.get('new_password')?.value;
    const confirmPassword = group.get('confirmPassword');

    if (newPassword !== confirmPassword?.value) {
      confirmPassword?.setErrors({ mismatch: true });
      return { mismatch: true };
    } else {
      confirmPassword?.setErrors(null);
    }
    return null;
  }

  changePassword(): void {
    const challenge = localStorage.getItem('auth_challenge');
    this.isLoading = true;

    const baseData = {
      username: this.username,
      new_password: this.changePasswordForm.get('new_password')?.value,
    };

    const data = challenge === 'NewPasswordRequired'
      ? { ...baseData, session: this.session }
      : baseData;

    const serviceCall =
      challenge === 'NewPasswordRequired' ?
        this.loginService.changeTemporaryPassword(data) :
        this.loginService.ChangePasswordDays(data);

    serviceCall.subscribe({
      next: (res: any) => {
        res.properties.user = {
          id: res.attributes.find((e: any) => e.Name === 'sub')?.Value,
          email: res.attributes.find((e: any) => e.Name === 'email')?.Value,
          username: res.attributes.find((e: any) => e.Name === 'username')?.Value,
        };

        this.authService.doLogin(res.properties);

        localStorage.removeItem('auth_challenge');

        this.router.navigate(['/home']).then(() => {
          this.isLoading = false;
        });
      },
      error: (error) => {
        this.isLoading = false;
        this.msg.error(JSON.stringify(error?.error?.error?.message));
      },
    });
  }

}