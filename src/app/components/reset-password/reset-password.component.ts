import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ResetPasswordService } from '../../services/reset-password/reset-password.service';
import {
  PasswordToggleComponent,
  PasswordResetButtonComponent
} from '../../reusable-components';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    PasswordToggleComponent,
    PasswordResetButtonComponent,
    RouterLink
  ],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})

export class ResetPasswordComponent {
  email = '';
  verificationCode = '';
  showVerificationCode = false;
  showResendLink = false;
  showPasswordInput = false;
  emailReadOnly = false;
  isLoading: boolean = false;
  newPassword = '';

  constructor(
    private resetPasswordService: ResetPasswordService,
    private router: Router,
    private msg: NzMessageService
  ) { }

  onRequestReset(): void {
    if (!this.isValidEmail(this.email)) {
      this.msg.error('Please enter a valid email address');
      return;
    }
    this.isLoading = true;
    this.resetPasswordService.requestReset(this.email).subscribe({
      next: () => {
        this.showVerificationCode =
          this.showResendLink =
          this.showPasswordInput =
          this.emailReadOnly = true;
        this.msg.success('Reset request sent successfully');
        this.isLoading = false;
      },
      error: (error) => {
        this.msg.error(error.error?.error?.message || 'Failed to send reset request');
        this.isLoading = false;
      }
    });
  }

  onResendCode(): void {
    this.isLoading = true;
    this.resetPasswordService.resendConfirmationCode(this.email).subscribe({
      next: () => {
        this.showVerificationCode =
          this.showResendLink =
          this.showPasswordInput =
          this.emailReadOnly = true;
        this.msg.success('Verification code resent successfully');
        this.isLoading = false;
      },
      error: (error) => {
        this.msg.error(error.error?.error?.message || 'Failed to resend verification code');
        this.isLoading = false;
      }
    });
  }


  onConfirmResetPassword(): void {
    if (!this.verificationCode.trim()) {
      this.msg.error('Please enter verification code');
      return;
    }
    if (!this.newPassword.trim()) {
      this.msg.error('New password is required');
      return;
    }
    this.isLoading = true;
    this.resetPasswordService.confirmResetPassword(
      this.email,
      this.verificationCode,
      this.newPassword
    ).subscribe({
      next: () => {
        this.msg.success('Password reset successfully');
        setTimeout(() => this.router.navigate(['./login']), 900);
        this.isLoading = false;
      },
      error: (error) => {
        this.msg.error(error.error?.error?.message || 'Failed to reset password');
        this.isLoading = false;
      }
    });
  }

  private isValidEmail(email: string): boolean {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
  }
}
