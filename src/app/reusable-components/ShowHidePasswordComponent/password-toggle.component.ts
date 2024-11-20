import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-password-toggle',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <i
      class="fas fa-eye typcn"
      [ngClass]="passwordFieldType === 'password' ? 'fa-eye' : 'fa-eye-slash'"
      (click)="togglePasswordVisibility()"
      *ngIf="showEyeIcon"
    ></i>
  `,
  styles: [
    `
      .typcn {
        position: absolute;
        left: 310px;
        top: 15px;
        color: #aaa;
        font-size: 22px;
        cursor: pointer;
      }
    `,
  ],
})

export class PasswordToggleComponent {
  @Input() showEyeIcon: boolean = false;
  
  passwordFieldType: string = 'password';

  togglePasswordVisibility() {
    this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
  }
}