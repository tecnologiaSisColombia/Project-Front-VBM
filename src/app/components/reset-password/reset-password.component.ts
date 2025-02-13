import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ResetPasswordService } from 'app/services/reset-password/reset-password.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzCardModule } from 'ng-zorro-antd/card';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    NzButtonModule,
    NzInputModule,
    NzFormModule,
    NzIconModule,
    NzCardModule,
    RouterLink
  ],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css', '/src/animations/styles.css']
})
export class ResetPasswordComponent {
  form: FormGroup;
  isDataLoading = false;
  resetStep: 'request' | 'confirm' = 'request';
  passwordVisible = false;

  constructor(
    private fb: FormBuilder,
    private resetPasswordService: ResetPasswordService,
    private router: Router,
    private msg: NzMessageService
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      confirmation_code: [''],
      new_password: ['']
    });
  }

  requestReset(): void {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }

    this.isDataLoading = true;

    const email = this.form.get('email')?.value;

    this.resetPasswordService.requestReset(email)
      .pipe(finalize(() => {
        this.isDataLoading = false;
      }))
      .subscribe({
        next: () => {
          this.resetStep = 'confirm';

          this.form.get('confirmation_code')?.setValidators([Validators.required]);

          this.form.get('confirmation_code')?.updateValueAndValidity();

          this.form.get('new_password')?.setValidators([
            Validators.required,
            Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\W)[a-zA-Z\d\W]{8,}$/)
          ]);

          this.form.get('new_password')?.updateValueAndValidity();

          this.msg.success('Reset request sent successfully');
        },
        error: (error) => {
          this.msg.error(JSON.stringify(error?.error?.error?.message));
        },
      });
  }

  resendCode(): void {
    this.isDataLoading = true;

    const email = this.form.get('email')?.value;

    this.resetPasswordService.resendConfirmationCode(email)
      .pipe(finalize(() => {
        this.isDataLoading = false;
      }))
      .subscribe({
        next: () => {
          this.resetStep = 'confirm';
          this.msg.success('Verification code resent successfully');
        },
        error: (error) => {
          this.msg.error(JSON.stringify(error?.error?.error?.message));
        },
      });
  }

  confirmResetPassword(): void {
    this.isDataLoading = true;

    this.resetPasswordService.confirmResetPassword(this.form.value)
      .pipe(finalize(() => {
        this.isDataLoading = false;
      }))
      .subscribe({
        next: () => {
          this.form.reset();

          this.form.get('confirmation_code')?.clearValidators();

          this.form.get('new_password')?.clearValidators();

          this.form.updateValueAndValidity();

          this.msg.success('Password reset successfully');

          setTimeout(() => this.router.navigate(['./login']), 900);
        },
        error: (error) => {
          this.msg.error(JSON.stringify(error?.error?.error?.message));
        },
      });
  }

  getErrorMessage(control: AbstractControl | null): string | null {
    if (!control || !control.errors) return null;

    if (control.hasError('required')) return 'This field is required';

    if (control.hasError('pattern')) return 'Must be at least 8 chars, include uppercase, lowercase, and a symbol';

    if (control.hasError('email')) return 'Please enter a valid email address';

    return null;
  }

  hasFeedback(controlName: string): boolean {
    const control = this.form.get(controlName);
    return control?.invalid && (control.dirty || control.touched) ? true : false;
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }
}