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
import Swal from 'sweetalert2';
import { EspecialitiesService } from 'app/services/config/especialities.service';
import { StoresService } from 'app/services/config/stores.service';
import { OfficesService } from 'app/services/config/offices.service';
import { CommonModule } from '@angular/common';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';

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

  user_type: string = '';
  officesToDisplay: any[] = [];
  working_hours: any[] = [];

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
    private officeService: OfficesService
  ) { }

  ngOnInit(): void {
    this.loadUserTypes();
    this.getOffices();
    this.getSpecialities();
    this.getStores();
  }

  showModal(): void {
    this.getWorkingHours();
    this.isVisible = true;
    if (!this.user.extra_data) return;
    this.user_type = this.userTypeOptions.find(
      (e) => e.id == this.user.extra_data[0].user_type_id
    )?.value!;
  }

  handleOk(): void {
    this.userService.updateAttributes(this.user).subscribe(
      (response) => {
        if (this.user.extra_data) {
          this.userService
            .updateDataByType(
              this.userTypeOptions.find((e) => e.value == this.user_type)!,
              this.user.id,
              this.user
            )
            .subscribe({
              next: (res) => {
                this.isVisible = false;
                this.userUpdated.emit(res);
                this.msgService.success('The user has been updated successfully');
              },
              error: (err) => {
                const errorMessage = err?.error;
                this.msgService.error(errorMessage);
              },
            });
        } else {
          this.msgService.success('The user has been updated successfully!');
          this.isVisible = false;
          this.userUpdated.emit(response);
        }
      },
      (error) => {
        const errorMessage = error?.error?.error?.message;
        this.msgService.error(errorMessage);
        console.error('Error updating user:', errorMessage);
      }
    );
    
  }

  getSpecialities() {
    this.specialityService.get({ status: 1 }, 1, 1, true).subscribe({
      next: (res: any) => (this.specialities = res),
      error: (err) => {
        console.error(err);

        this.msgService.error(JSON.stringify(err.error));
      },
    });
  }

  getStores() {
    this.storeService.get({ status: 1 }, 1, 1, true).subscribe({
      next: (res: any) => (this.stores = res),
      error: (err) => {
        console.error(err);

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
        console.error(err);

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
        this.msgService.error('Failed to load user types');
      }
    );
  }

  handleCancel(): void {
    this.isVisible = false;
  }

  storeChange(event: number) {
    console.log(this.offices, event);

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
        this.msgService.error('Failed to load user working hours');
      },
    });
  }

  open() {
    this.titleDrawer = 'Add working hour';
    this.visibleDrawer = true;
    this.workingHourForm.user = this.user.id;
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
    };
  }

  deleteHour(id: number) {
    this.userService.deleteWorkingHour(id).subscribe({
      next: (res: any) => {
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
    this.userService.updateWorkingHour(id, data).subscribe({
      next: (res: any) => {
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
    this.userService.createWorkingHour(this.workingHourForm).subscribe({
      next: (res: any) => {
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
