import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ResetPasswordService } from '../../services/reset-password/reset-password.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzCardModule } from 'ng-zorro-antd/card';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

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
  styleUrls: ['./reset-password.component.css', '../../../animations/styles.css']
})
export class ResetPasswordComponent {
  resetForm: FormGroup;
  isLoading = false;
  showVerificationCode = false;
  showPassword = false;
  passwordVisible: boolean = false;

  constructor(
    private fb: FormBuilder,
    private resetPasswordService: ResetPasswordService,
    private router: Router,
    private msg: NzMessageService
  ) {
    this.resetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      verificationCode: [''],
      newPassword: ['']
    });
  }

  onRequestReset(): void {
    if (this.resetForm.valid) {
      this.isLoading = true;

      const email = this.resetForm.get('email')?.value;

      this.resetPasswordService.requestReset(email).subscribe({
        next: () => {
          this.showVerificationCode = true;
          this.showPassword = true;

          this.resetForm.get('verificationCode')?.setValidators([
            Validators.required,
            Validators.pattern(/^\d+$/)
          ]);

          this.resetForm.get('verificationCode')?.updateValueAndValidity();

          this.resetForm.get('newPassword')?.setValidators([
            Validators.required, Validators.minLength(8)
          ]);

          this.resetForm.get('newPassword')?.updateValueAndValidity();

          this.isLoading = false;

          this.msg.success(JSON.stringify('Reset request sent successfully'));
        },
        error: (error) => {
          this.msg.error(JSON.stringify(error?.error?.error?.message || 'Reset failed'));
          this.isLoading = false;
        }
      });
    } else {
      Object.values(this.resetForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  onResendCode(): void {
    this.isLoading = true;

    const email = this.resetForm.get('email')?.value;

    this.resetPasswordService.resendConfirmationCode(email).subscribe({
      next: () => {
        this.showVerificationCode = true;
        this.showPassword = true;
        this.isLoading = false;
        this.msg.success(JSON.stringify('Verification code resent successfully'));
      },
      error: (error) => {
        this.msg.error(JSON.stringify(error?.error?.error?.message || 'Resend failed'));
        this.isLoading = false;
      }
    });
  }

  onConfirmResetPassword(): void {
    const data = {
      email: this.resetForm.get('email')?.value,
      confirmation_code: this.resetForm.get('verificationCode')?.value,
      new_password: this.resetForm.get('newPassword')?.value,
    };

    this.isLoading = true;

    this.resetPasswordService.confirmResetPassword(data).subscribe({
      next: () => {
        this.resetForm.reset();
        this.resetForm.get('verificationCode')?.clearValidators();
        this.resetForm.get('newPassword')?.clearValidators();
        this.resetForm.updateValueAndValidity();
        
        this.msg.success('Password reset successfully');

        setTimeout(() => {
          this.router.navigate(['./login']);
        }, 900);

        this.isLoading = false;
      },
      error: (error) => {
        this.msg.error(JSON.stringify(error?.error?.error?.message || 'Reset confirm failed'));
        this.isLoading = false;
      }
    });
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }
}
