import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      [ngClass]="{
        'error_container': type === 'error',
        'success_container': type === 'success',
        'fade-out': fadingOut
      }"
      class="message_container">
      
      <span class="message_icon">
        <i
          class="fa"
          [ngClass]="{
            'fa-exclamation-circle': type === 'error',
            'fa-check-circle': type === 'success'
          }"
        ></i>
      </span>

      <span class="message_content">{{ message }}</span>

      <button class="message_close" (click)="closeNotification()">&times;</button>
    </div>
  `,
  styleUrls: ['./notification.component.css'],
})

export class NotificationComponent implements OnInit {
  @Input() type: 'error' | 'success' | null = null;
  @Input() message: string | null = null;
  @Output() close = new EventEmitter<void>();
  
  fadingOut = false;

  ngOnInit(): void {
    setTimeout(() => this.closeNotification(), 1600);
  }

  closeNotification(): void {
    this.fadingOut = true;
    setTimeout(() => this.close.emit(), 300);
  }
}
