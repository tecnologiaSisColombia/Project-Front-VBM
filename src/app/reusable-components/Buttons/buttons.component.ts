import { Component, Input, Output, EventEmitter } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { CommonModule } from '@angular/common'

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <button
      type="button"
      class="btn"
      (click)="onClick()"
      [disabled]="!btnActive || isLoading"
      [class.btnDeactive]="!btnActive"
    >
      <span *ngIf="!isLoading">{{ label }}</span>
      <span *ngIf="isLoading">
        <i class="fa fa-spinner fa-spin"></i>
      </span>
    </button>
  `,
  styles: [
    `
      .btnDeactive {
        background: var(--color-btn-hover) !important;
      }
      .btn {
        border: 0;
        background: var(--color-btn);
        color: var(--color-text-primary);
        border-radius: 100px;
        width: 340px;
        height: 49px;
        font-size: 16px;
        position: absolute;
        top: 79%;
        left: 8%;
        transition: background 0.3s;
        cursor: pointer;
      }

      .btn:hover {
        background: var(--color-btn-hover);
      }
    `,
  ],
})

export class PasswordResetButtonComponent {
  @Input() label!: string
  @Input() isLoading: boolean = false
  @Input() btnActive: boolean = false
  @Input() disabled: boolean = false;

  @Output() buttonClick = new EventEmitter<void>()

  onClick(): void {
    this.buttonClick.emit()
  }
}
