import { Component, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ResetPasswordService } from '../../services/reset-password/reset-password.service';
import { 
  PasswordToggleComponent, 
  PasswordResetButtonComponent, 
  NotificationComponent 
} from '../../reusable-components';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule, CommonModule, NotificationComponent, PasswordToggleComponent, PasswordResetButtonComponent],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})

export class ResetPasswordComponent {
  email = '';
  verificationCode = '';
  showVerificationCode = false;
  showResendLink = false;
  showPasswordInput = false;
  message: string | null = null;
  messageType: 'error' | 'success' | null = null;
  emailReadOnly = false;
  isLoading = false;
  newPassword = '';

  constructor(
    private resetPasswordService: ResetPasswordService, 
    private router: Router) 
    { }

  closeMessage(): void {
    this.message = null;
    this.messageType = null;
  }

  showMessage(message: string, type: 'error' | 'success'): void {
    this.message = message;
    this.messageType = type;
  }

  onRequestReset(): void {
    if (!this.isValidEmail(this.email)) {
      this.showMessage('Please enter a valid email address', 'error');
      return;
    }

    this.resetPasswordService.handleRequest(
      this.resetPasswordService.requestReset(this.email),
      this,
      () => {
        this.showVerificationCode = this.showResendLink = this.showPasswordInput = this.emailReadOnly = true;
      }
    );
  }

  onResendCode(): void {
    this.resetPasswordService.handleRequest(
      this.resetPasswordService.resendConfirmationCode(this.email),
      this,
      () => {
        this.showVerificationCode = this.showResendLink = this.showPasswordInput = this.emailReadOnly = true;
      }
    );
  }

  onConfirmResetPassword(): void {
    if (!this.verificationCode.trim()) {
      this.showMessage('Please enter verification code', 'error');
      return;
    }

    if (!this.newPassword.trim()) {
      this.showMessage('Please enter new password', 'error');
      return;
    }

    this.resetPasswordService.handleRequest(
      this.resetPasswordService.confirmResetPassword(this.email, this.verificationCode, this.newPassword),
      this,
      () => setTimeout(() => this.router.navigate(['./login']), 900)
    );
  }

  private isValidEmail(email: string): boolean {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
  }
}
