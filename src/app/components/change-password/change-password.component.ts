import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ValidationErrors,
  ReactiveFormsModule,
  AbstractControl
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginService } from 'app/services/login/login.service';
import { CommonModule } from '@angular/common';
import { AuthService } from 'app/services/auth/auth.service';
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
  form: FormGroup;
  session: string | null = null;
  username: string | null = null;
  isDataLoading = false;
  passwordVisible = false;

  constructor(
    private fb: FormBuilder,
    private loginService: LoginService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private msg: NzMessageService
  ) {
    this.form = this.fb.group(
      {
        new_password: ['',
          [
            Validators.required,
            Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\W)[a-zA-Z\d\W]{8,}$/)
          ]
        ],
        confirm_password: [''],
      },
      { validators: this.passwordsMatchValidator }
    );
  }

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;
    this.session = params.get('session');
    this.username = params.get('username');
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  private passwordsMatchValidator(group: FormGroup): ValidationErrors | null {
    const newPass = group.get('new_password')?.value;
    const confirmCtrl = group.get('confirm_password');
    const isValid = newPass === confirmCtrl?.value;
    confirmCtrl?.setErrors(isValid ? null : { mismatch: true });
    return isValid ? null : { mismatch: true };
  }

  submit(): void {
    const challenge = localStorage.getItem('auth_challenge');

    this.isDataLoading = true;

    const { new_password } = this.form.value;

    const data = {
      username: this.username,
      new_password,
      ...(challenge === 'NewPasswordRequired' && { session: this.session }),
    };

    const serviceCall = challenge === 'NewPasswordRequired'
      ? this.loginService.changeTemporaryPassword(data)
      : this.loginService.ChangePasswordDays(data);

    serviceCall.subscribe({
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

        this.authService.doLogin(res.properties);

        localStorage.removeItem('auth_challenge');

        this.router.navigate(['/home']).then(() => {
          this.isDataLoading = false;
        });
      },
      error: (error) => {
        this.isDataLoading = false;
        this.msg.error(JSON.stringify(error?.error?.error?.message));
      },
    });
  }

  getErrorMessage(control: AbstractControl | null): string | null {
    if (!control || !control.errors) return null;

    if (control.hasError('required')) return 'This field is required';

    if (control.hasError('pattern')) return 'Must be at least 8 chars, include uppercase, lowercase, and a symbol';

    if (control.hasError('mismatch')) return 'Passwords do not match';

    return null;
  }

  hasFeedback(controlName: string): boolean {
    const control = this.form.get(controlName);
    return control?.invalid && (control.dirty || control.touched) ? true : false;
  }
}