import { Component } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { FormsModule } from '@angular/forms';
import { NzIconModule } from 'ng-zorro-antd/icon';

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
    <button nz-button nzType="primary" (click)="open()"><i nz-icon nzType="user"></i>Create User</button>
    <nz-drawer
      [nzBodyStyle]="{ overflow: 'auto', padding: '24px' }"
      [nzMaskClosable]="false"
      [nzWidth]="500"
      [nzVisible]="visible"
      nzTitle="Create User"
      [nzFooter]="footerTpl"
      (nzOnClose)="close()"
    >
    <form nz-form nzLayout="vertical" *nzDrawerContent>
  <div nz-row [nzGutter]="16" style="margin-bottom: 16px;">
    <div nz-col nzSpan="12">
      <nz-form-item>
        <nz-form-label [nzRequired]="true">Full Name</nz-form-label>
        <nz-form-control>
          <input
            nz-input
            placeholder="e.g. John Doe"
            required
            style="border-radius: 6px; font-size: 14px; padding: 8px;"
          />
        </nz-form-control>
      </nz-form-item>
    </div>
    <div nz-col nzSpan="12">
      <nz-form-item>
        <nz-form-label [nzRequired]="true">Email</nz-form-label>
        <nz-form-control>
          <input
            nz-input
            type="email"
            placeholder="e.g. john.doe@example.com"
            required
            style="border-radius: 6px; font-size: 14px; padding: 8px;"
          />
        </nz-form-control>
      </nz-form-item>
    </div>
  </div>

  <div nz-row [nzGutter]="16" style="margin-bottom: 16px;">
    <div nz-col nzSpan="12">
      <nz-form-item>
        <nz-form-label>Phone</nz-form-label>
        <nz-form-control>
          <input
            nz-input
            type="tel"
            placeholder="e.g. +1 123 456 7890"
            required
            style="border-radius: 6px; font-size: 14px; padding: 8px;"
          />
        </nz-form-control>
      </nz-form-item>
    </div>
    <div nz-col nzSpan="12">
      <nz-form-item>
        <nz-form-label [nzRequired]="true">Username</nz-form-label>
        <nz-form-control>
          <input
            nz-input
            placeholder="Choose a username"
            style="border-radius: 6px; font-size: 14px; padding: 8px;"
          />
        </nz-form-control>
      </nz-form-item>
    </div>
  </div>

  <div nz-row [nzGutter]="16" style="margin-bottom: 16px;">
    <div nz-col nzSpan="24">
      <nz-form-item>
        <nz-form-label [nzRequired]="true">Role</nz-form-label>
        <nz-form-control>
          <nz-select
            [(ngModel)]="selectedRole"
            [nzPlaceHolder]="'Select a role'"
            name="role"
            required
            style="width: 100%; border-radius: 6px; font-size: 14px; padding: 8px;"
          >
            <nz-option nzValue="admin" nzLabel="Admin"></nz-option>
            <nz-option nzValue="doctor" nzLabel="Doctor"></nz-option>
            <nz-option nzValue="seller" nzLabel="Seller"></nz-option>
          </nz-select>
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
  visible = false;
  selectedRole: string | null = null;

  open(): void {
    this.visible = true;
  }

  close(): void {
    this.visible = false;
  }

  submit(): void {
    console.log('Selected Role:', this.selectedRole);
    // this.close();
  }
}
