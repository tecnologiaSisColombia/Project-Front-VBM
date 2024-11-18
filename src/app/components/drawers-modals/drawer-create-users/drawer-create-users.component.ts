import { Component, EventEmitter, Output } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { FormsModule } from '@angular/forms';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { UserService } from '../../../services/user-management/user-management.service';
import { NzMessageService } from 'ng-zorro-antd/message'
import { nameRegex } from '../../../utils/name_regex'
import { usernameRegex } from '../../../utils/username_regex'

@Component({
  selector: 'nz-demo-drawer-from-drawer',
  standalone: true,
  imports: [
    NzButtonModule,
    NzDrawerModule,
    NzDatePickerModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    FormsModule,
    NzIconModule
  ],
  template: `
    <button nz-button nzType="primary" (click)="open()">
      <i nz-icon nzType="user"></i> Create User
    </button>
    <nz-drawer
      [nzBodyStyle]="{ overflow: 'auto', padding: '24px' }"
      [nzMaskClosable]="false"
      [nzWidth]="450"
      [nzVisible]="visible"
      nzTitle="Create User"
      [nzFooter]="footerTpl"
      (nzOnClose)="close()"
    >
      <form nz-form nzLayout="vertical" *nzDrawerContent>
        <div nz-row style="margin-bottom: 16px;">
          <div nz-col nzSpan="24">
            <nz-form-item>
              <nz-form-label [nzRequired]="true" style="width: 100%;">First Name</nz-form-label>
              <nz-form-control>
                <input
                  nz-input
                  required
                  [(ngModel)]="form.firstName"
                  name="firstName"
                  style="width: 100%; border-radius: 6px; font-size: 14px; padding: 8px;"
                />
              </nz-form-control>
            </nz-form-item>
          </div>

          <div nz-col nzSpan="24">
            <nz-form-item>
              <nz-form-label [nzRequired]="true" style="width: 100%;">Last Name</nz-form-label>
              <nz-form-control>
                <input
                  nz-input
                  required
                  [(ngModel)]="form.lastName"
                  name="lastName"
                  style="width: 100%; border-radius: 6px; font-size: 14px; padding: 8px;"
                />
              </nz-form-control>
            </nz-form-item>
          </div>

          <div nz-col nzSpan="24">
            <nz-form-item>
              <nz-form-label [nzRequired]="true" style="width: 100%;">Email</nz-form-label>
              <nz-form-control>
                <input
                  nz-input
                  type="email"
                  required
                  [(ngModel)]="form.email"
                  name="email"
                  style="width: 100%; border-radius: 6px; font-size: 14px; padding: 8px;"
                />
              </nz-form-control>
            </nz-form-item>
          </div>

          <div nz-col nzSpan="24">
            <nz-form-item>
              <nz-form-label [nzRequired]="true" style="width: 100%;">Phone</nz-form-label>
              <nz-form-control>
                <input
                  nz-input
                  type="tel"
                  [(ngModel)]="form.phone"
                  name="phone"
                  style="width: 100%; border-radius: 6px; font-size: 14px; padding: 8px;"
                />
              </nz-form-control>
            </nz-form-item>
          </div>

          <div nz-col nzSpan="24">
            <nz-form-item>
              <nz-form-label [nzRequired]="true" style="width: 100%;">Username</nz-form-label>
              <nz-form-control>
                <input
                  nz-input
                  required
                  [(ngModel)]="form.username"
                  name="username"
                  style="width: 100%; border-radius: 6px; font-size: 14px; padding: 8px;"
                />
              </nz-form-control>
            </nz-form-item>
          </div>

          <div nz-col nzSpan="24">
            <nz-form-item>
              <nz-form-label [nzRequired]="true" style="width: 100%;">Password</nz-form-label>
              <nz-form-control>
                <input
                  nz-input
                  type="password"
                  required
                  [(ngModel)]="form.password"
                  name="password"
                  style="width: 100%; border-radius: 6px; font-size: 14px; padding: 8px;"
                />
              </nz-form-control>
            </nz-form-item>
          </div>
        </div>
      </form>

      <ng-template #footerTpl>
        <div style="text-align: right; padding-top: 16px; border-top: 1px solid #f0f0f0;">
          <button
            nz-button
            style="margin-right: 8px; border-radius: 4px;"
            (click)="close()"
          >
            Cancel
          </button>
          <button
            nz-button
            nzType="primary"
            style="border-radius: 4px;"
            (click)="submit()"
          >
            Create User
          </button>
        </div>
      </ng-template>
    </nz-drawer>
  `,
})

export class NzDemoDrawerFromDrawerComponent {
  @Output() userCreated = new EventEmitter<any>();

  visible = false;
  form = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    username: '',
    password: ''
  };

  constructor(
    private createUserService: UserService,
    private msgService: NzMessageService,
  ) { }

  open(): void {
    this.visible = true;
  }

  close(): void {
    this.visible = false;
  }

  submit(): void {
    for (const key of Object.keys(this.form)) {
      if (!this.form[key as keyof typeof this.form]) {
        this.msgService.error(`Field ${key} is required.`);
        return;
      }
    }

    if (!nameRegex.test(this.form.firstName) || !nameRegex.test(this.form.lastName)) {
      this.msgService.error('Names cannot contain numbers or special characters.');
      return;
    }

    if (!usernameRegex.test(this.form.username)) {
      this.msgService.error('Username must be at least 5 characters long and can contain letters, numbers, dots, underscores, or hyphens.');
      return;
    }

    const userData = {
      email: this.form.email,
      password: this.form.password,
      username: this.form.username,
      first_name: this.form.firstName,
      last_name: this.form.lastName,
      phone: this.form.phone,
    };

    this.createUserService.requestCreateUser(userData).subscribe(
      (response) => {
        this.msgService.success('New user created');
        this.userCreated.emit(userData);
        this.resetForm();
        this.close();
      },
      (error) => {
        this.msgService.error(JSON.stringify(error.error.error.message));
      }
    );
  }

  resetForm(): void {
    this.form = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      username: '',
      password: '',
    };
  }
}
