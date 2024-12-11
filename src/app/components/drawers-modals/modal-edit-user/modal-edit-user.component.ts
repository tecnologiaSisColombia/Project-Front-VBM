import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { FormsModule } from '@angular/forms';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { UserService } from '../../../services/user-management/user-management.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { EspecialitiesService } from 'app/services/config/especialities.service';
import { StoresService } from 'app/services/config/stores.service';
import { OfficesService } from 'app/services/config/offices.service';
import { CommonModule } from '@angular/common';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { InsurersService } from 'app/services/insurers/insurers.service';

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
    NzIconModule,
    CommonModule,
    NzSelectModule,
    NzTableModule,
    NzDividerModule,
    NzDrawerModule,
    NzButtonModule,
    NzSpinModule,
  ],
  templateUrl: `./modal-edit-user.component.html`,
  styles: [
    `
      .form-container {
        max-width: 600px;
        margin: 0 auto;
      }
      nz-form-item {
        margin-bottom: 16px;
      }
      .custom-pagination ::ng-deep .ant-pagination {
        justify-content: flex-start !important;
      }
    `,
  ],
})
export class NzDemoModalLocaleComponent implements OnInit {
  @Input() user: any = null;
  @Output() userUpdated = new EventEmitter<any>();
  isVisible = false;
  specialities: any[] = [];
  stores: any[] = [];
  userTypeOptions: { id: number; label: string; value: string }[] = [];
  offices: any[] = [];
  loading = false;
  tempUser: any = null;
  user_type: string = '';
  officesToDisplay: any[] = [];
  working_hours: any[] = [];
  insurers: any[] = [];
  titleDrawer = '';
  visibleDrawer = false;
  isUpdatingDrawer: boolean = false;
  dataCacheDrawer: any = null;
  workingHourForm = {
    id: 0,
    day: '',
    hour_start: 0,
    hour_end: 0,
    user: 0,
    store: 0,
  };
  days = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];
  workingHours: any;

  constructor(
    private userService: UserService,
    private msgService: NzMessageService,
    private specialityService: EspecialitiesService,
    private createUserService: UserService,
    private storeService: StoresService,
    private officeService: OfficesService,
    private insurerService: InsurersService
  ) { }

  ngOnInit(): void {
    this.loadUserTypes();
    this.getOffices();
    this.getSpecialities();
    this.getStores();
    this.getInsurers();
  }

  getInsurers(): void {
    this.insurerService.getInsurers({ status: 1 }, 1, 10, true).subscribe({
      next: (res: any) => {
        this.insurers = res;
      },
      error: (err) => {
        this.msgService.error(JSON.stringify(err.error));
      },
    });
  }

  showModal(): void {
    this.getWorkingHours();
    this.isVisible = true;

    this.tempUser = {
      ...this.user,
      extra_data: this.user?.extra_data || [{}],
    };

    if (
      this.tempUser.extra_data?.length > 0 &&
      this.tempUser.extra_data[0].user_type_id
    ) {
      this.user_type =
        this.userTypeOptions.find(
          (e) => e.id == this.tempUser.extra_data[0].user_type_id
        )?.value || '';
    } else {
      this.user_type = 'Admin';
    }
  }

  handleOk(): void {
    this.loading = true;
    this.userService.updateAttributes(this.tempUser).subscribe(
      (response) => {
        if (this.tempUser.extra_data) {
          this.userService
            .updateDataByType(
              this.userTypeOptions.find((e) => e.value == this.user_type)!,
              this.tempUser.id,
              this.tempUser
            )
            .subscribe({
              next: (res) => {
                this.msgService.success(
                  'The user has been updated successfully'
                );
                this.user = { ...this.tempUser };
                this.isVisible = false;
                this.userUpdated.emit(res);
              },
              error: (err) => {
                this.msgService.error(JSON.stringify(err?.error));
              },
            });
          this.loading = false;
        } else {
          this.msgService.success('The user has been updated successfully!');
          this.user = { ...this.tempUser };
          this.isVisible = false;
          this.userUpdated.emit(response);
          this.loading = false;
        }
        this.loading = false;
      },
      (error) => {
        this.msgService.error(JSON.stringify(error?.error));
        this.loading = false;
      }
    );
  }

  getSpecialities() {
    this.specialityService.get({ status: 1 }, 1, 1, true).subscribe({
      next: (res: any) => (this.specialities = res),
      error: (err) => {
        this.msgService.error(JSON.stringify(err.error));
      },
    });
  }

  getStores() {
    this.storeService.get({ status: 1 }, 1, 1, true).subscribe({
      next: (res: any) => (this.stores = res),
      error: (err) => {
        this.msgService.error(JSON.stringify(err.error));
      },
    });
  }

  getOffices() {
    this.officeService.get({ status: 1 }, 1, 1, true).subscribe({
      next: (res: any) => {
        this.offices = res;
        this.officesToDisplay = res;
      },
      error: (err) => {
        this.msgService.error(JSON.stringify(err.error));
      },
    });
  }

  loadUserTypes(): void {
    this.createUserService.getUserTypes().subscribe(
      (response: any[]) => {
        this.userTypeOptions = response.map((type) => ({
          label: type.name,
          value: type.name,
          id: type.id,
        }));
      },
      (error) => {
        this.msgService.error(JSON.stringify(error.error));
      }
    );
  }

  handleCancel(): void {
    this.isVisible = false;
  }

  storeChange(event: number) {
    if (event) {
      this.officesToDisplay = this.offices.filter((e) => e.store == event);
    } else {
      this.officesToDisplay = this.offices;
    }
  }

  getWorkingHours() {
    this.userService.getWorkingHour(this.user.id).subscribe({
      next: (res: any) => {
        this.workingHours = res;
      },
      error: (err) => {
        this.msgService.error(JSON.stringify(err.error));
      },
    });
  }

  open() {
    this.titleDrawer = 'Add working hour';
    this.visibleDrawer = true;
    this.workingHourForm.user = this.user.id;
    console.log(this.user);
    this.stores = this.stores.filter(
      (s: any) => this.user.stores && this.user.stores.includes(s.id)
    );
  }

  openEdit(data: any) {
    this.titleDrawer = 'Update working hour';
    this.visibleDrawer = true;
    this.isUpdatingDrawer = true;
    this.dataCacheDrawer = data;
    this.workingHourForm = { ...data };
  }

  closeDrawer() {
    this.visibleDrawer = false;
    this.isUpdatingDrawer = false;
    this.dataCacheDrawer = null;
    this.workingHourForm = {
      id: 0,
      day: '',
      hour_start: 0,
      hour_end: 0,
      user: 0,
      store: 0,
    };
  }

  deleteHour(id: number) {
    this.userService.deleteWorkingHour(id).subscribe({
      next: () => {
        this.msgService.success('Work time deleted successfully');
        this.getWorkingHours();
      },
      error: (err) => {
        this.msgService.error(
          `Failed to delete user working hours: ${JSON.stringify(err.error)}`
        );
      },
    });
  }

  updateHour(id: number, data: any) {
    delete data.store_data;
    this.userService.updateWorkingHour(id, data).subscribe({
      next: () => {
        this.msgService.success('Work time update successfully');
        this.closeDrawer();
        this.getWorkingHours();
      },
      error: (err) => {
        this.msgService.error(
          `Failed to update user working hours: ${JSON.stringify(err.error)}`
        );
      },
    });
  }

  submitDrawer() {
    if (this.isUpdatingDrawer) {
      this.updateHour(this.dataCacheDrawer.id, this.workingHourForm);
      return;
    }
    if (!this.workingHourForm.day) {
      this.msgService.error('The "Day" field is required');
      return;
    }
    this.userService.createWorkingHour(this.workingHourForm).subscribe({
      next: () => {
        this.msgService.success('Work time created successfully');
        this.closeDrawer();
        this.getWorkingHours();
      },
      error: (err) => {
        this.msgService.error(
          `Failed to save user working hour: ${JSON.stringify(err.error)}`
        );
      },
    });
  }
}
