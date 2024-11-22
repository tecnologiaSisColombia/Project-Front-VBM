import { Component } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFormModule } from 'ng-zorro-antd/form';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../services/user-management/user-management.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'nz-demo-modal-basic',
  standalone: true,
  imports: [
    NzButtonModule,
    NzModalModule,
    NzInputModule,
    NzFormModule,
    FormsModule
  ],
  template: `
    <button nz-button nzType="primary" (click)="showModal()">Create Type User</button>
    <nz-modal
      [(nzVisible)]="isVisible"
      nzTitle="Create User Type"
      (nzOnCancel)="handleCancel()"
      (nzOnOk)="handleOk()"
      nzOkText="Create"
      nzCancelText="Cancel"
    >
      <ng-container *nzModalContent>
        <form nz-form>
          <nz-form-item>
            <nz-form-label [nzFor]="'userTypeName'" [nzRequired]="true">User Type Name</nz-form-label>
            <nz-form-control>
              <nz-input-group [nzPrefix]="prefixTemplate">
                <input
                  nz-input
                  id="userTypeName"
                  [(ngModel)]="newUserType.name"
                  name="userTypeName"
                  placeholder="Enter type name"
                  required
                />
              </nz-input-group>
              <ng-template #prefixTemplate>
                <i nz-icon nzType="user" nzTheme="outline"></i>
              </ng-template>
            </nz-form-control>
          </nz-form-item>
        </form>
      </ng-container>
    </nz-modal>
  `
})
export class NzDemoModalBasicComponent {
  isVisible = false;
  newUserType = { name: '' };

  constructor(
    private userService: UserService,
    private msgService: NzMessageService
  ) {}

  showModal(): void {
    this.isVisible = true;
  }

  handleOk(): void {
    const name = this.newUserType.name;

    if (!name) {
      this.msgService.error('User type name is required!');
      return;
    }

    if (/\d/.test(name)) {
      this.msgService.error('User type name cannot contain numbers!');
      return;
    }

    this.userService.createUserType(this.newUserType).subscribe(
      () => {
        this.msgService.success('User type created successfully');
        this.isVisible = false;
        this.newUserType.name = '';
      },
      (error) => {
        console.error('Error creating user type', error);
        this.msgService.error('Failed to create user type. Please try again.');
      }
    );
  }

  handleCancel(): void {
    this.isVisible = false;
    this.newUserType.name = '';
  }
}
