import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  resetForm: FormGroup;
  isDataLoading = false;
  resetStep: 'request' | 'confirm' = 'request';
  passwordVisible = false;

  constructor(
    private fb: FormBuilder,
    private resetPasswordService: ResetPasswordService,
    private router: Router,
    private msg: NzMessageService
  ) {
    this.resetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      confirmation_code: [''],
      new_password: ['']
    });
  }

  requestReset(): void {
    if (this.resetForm.invalid) {
      Object.values(this.resetForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }

    this.isDataLoading = true;

    const email = this.resetForm.get('email')?.value;

    this.resetPasswordService.requestReset(email)
      .pipe(finalize(() => {
        this.isDataLoading = false;
      }))
      .subscribe({
        next: () => {
          this.resetStep = 'confirm';

          this.resetForm.get('confirmation_code')?.setValidators([Validators.required]);

          this.resetForm.get('confirmation_code')?.updateValueAndValidity();

          this.resetForm.get('new_password')?.setValidators([
            Validators.required,
            Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\W)[a-zA-Z\d\W]{8,}$/)
          ]);
          
          this.resetForm.get('new_password')?.updateValueAndValidity();

          this.msg.success('Reset request sent successfully');
        },
        error: (error) => {
          this.msg.error(JSON.stringify(error?.error?.error?.message));
        },
      });
  }

  resendCode(): void {
    this.isDataLoading = true;

    const email = this.resetForm.get('email')?.value;

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

    this.resetPasswordService.confirmResetPassword(this.resetForm.value)
      .pipe(finalize(() => {
        this.isDataLoading = false;
      }))
      .subscribe({
        next: () => {
          this.resetForm.reset();

          this.resetForm.get('confirmation_code')?.clearValidators();
          
          this.resetForm.get('new_password')?.clearValidators();

          this.resetForm.updateValueAndValidity();

          this.msg.success('Password reset successfully');

          setTimeout(() => this.router.navigate(['./login']), 900);
        },
        error: (error) => {
          this.msg.error(JSON.stringify(error?.error?.error?.message));
        },
      });
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }
}