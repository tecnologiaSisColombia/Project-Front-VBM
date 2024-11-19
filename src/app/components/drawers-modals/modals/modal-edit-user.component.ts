import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { FormsModule } from '@angular/forms';
import { NzIconModule } from 'ng-zorro-antd/icon'
import { UserService } from '../../../services/user-management/user-management.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import Swal from 'sweetalert2';

@Component({
  selector: 'nz-demo-modal-locale',
  standalone: true,
  imports: [
    NzButtonModule,
    NzModalModule,
    NzFormModule,
    NzInputModule,
    NzGridModule,
    FormsModule,
    NzIconModule
  ],
  template: `
    <button nz-button nzType="link" (click)="showModal()">
      <i nz-icon nzType="edit" nzTheme="outline"></i>
    </button>
    <nz-modal
      [(nzVisible)]="isVisible"
      nzTitle="Edit User Attributes"
      nzOkText="Update Attributes"
      nzCancelText="Cancel"
      (nzOnOk)="handleOk()"
      (nzOnCancel)="handleCancel()"
    >
      <ng-container *nzModalContent>
        <form nz-form [nzLayout]="'vertical'" class="form-container">
          <div nz-row [nzGutter]="16">
            <div nz-col [nzSpan]="12">
              <nz-form-item>
                <nz-form-label [nzSpan]="24">First Name</nz-form-label>
                <nz-form-control [nzSpan]="24">
                  <input
                    nz-input
                    [(ngModel)]="user.first_name"
                    name="firstName"
                    placeholder="Enter first name"
                  />
                </nz-form-control>
              </nz-form-item>
            </div>
            <div nz-col [nzSpan]="12">
              <nz-form-item>
                <nz-form-label [nzSpan]="24">Last Name</nz-form-label>
                <nz-form-control [nzSpan]="24">
                  <input
                    nz-input
                    [(ngModel)]="user.last_name"
                    name="lastName"
                    placeholder="Enter last name"
                  />
                </nz-form-control>
              </nz-form-item>
            </div>
          </div>
          <div nz-row [nzGutter]="16">
            <div nz-col [nzSpan]="12">
              <nz-form-item>
                <nz-form-label [nzSpan]="24">Email</nz-form-label>
                <nz-form-control [nzSpan]="24">
                  <input
                    nz-input
                    [(ngModel)]="user.email"
                    name="email"
                    type="email"
                    placeholder="Enter email"
                  />
                </nz-form-control>
              </nz-form-item>
            </div>
            <div nz-col [nzSpan]="12">
              <nz-form-item>
                <nz-form-label [nzSpan]="24">Phone</nz-form-label>
                <nz-form-control [nzSpan]="24">
                  <input
                    nz-input
                    [(ngModel)]="user.phone"
                    name="phone"
                    type="tel"
                    placeholder="Enter phone"
                  />
                </nz-form-control>
              </nz-form-item>
            </div>
          </div>
        </form>
      </ng-container>
    </nz-modal>
  `,
  styles: [
    `
      .form-container {
        max-width: 600px;
        margin: 0 auto;
      }
      nz-form-item {
        margin-bottom: 16px;
      }
    `,
  ],
})
export class NzDemoModalLocaleComponent {
  @Input() user: any = null;
  @Output() userUpdated = new EventEmitter<any>();
  isVisible = false;

  constructor(
    private userService: UserService,
    private msgService: NzMessageService
  ) {}

  showModal(): void {
    this.isVisible = true;
  }

  handleOk(): void {
    Swal.fire({
      title: 'Updating User',
      text: 'Please wait while the user is being updated...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
  
    this.userService.updateAttributes(this.user).subscribe(
      (response) => {
        Swal.fire({
          icon: 'success',
          title: 'User Updated',
          text: 'The user has been updated successfully!',
        }).then(() => {
          this.isVisible = false;
          this.userUpdated.emit(this.user);
        });
      },
      (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Update Failed',
          text: 'There was an error updating the user. Please try again.',
        });
        console.error('Error updating user:', error);
      }
    );
  }
  
  handleCancel(): void {
    this.isVisible = false;
  }
}