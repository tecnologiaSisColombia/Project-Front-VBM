import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { FormsModule } from '@angular/forms';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { UserService } from 'app/services/user-management/user-management.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { LocalityService } from 'app/services/config/localities.service';
import { CommonModule } from '@angular/common';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { InsurersService } from 'app/services/insurers/insurers.service';
import { DoctorService } from 'app/services/config/doctors.service';

@Component({
  selector: 'app-edit-user',
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
  templateUrl: `./edit-user.component.html`,
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
  localities: any[] = [];
  isDataLoading = false;
  tempUser: any = null;
  user_type: any = '';
  insurers: any[] = [];
  suppliers: any[] = [];
  userTypeOptions: {
    id: number;
    label: string;
    value: string;
    type: string;
  }[] = [];

  constructor(
    private userService: UserService,
    private msgService: NzMessageService,
    private localitiesService: LocalityService,
    private insurerService: InsurersService,
    private supplierService: DoctorService
  ) { }

  ngOnInit(): void {
    this.getUserTypes();
    this.getLocalities();
    this.getInsurers();
    this.getSuppliers();
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

  getSuppliers(): void {
    this.supplierService.getSuppliers({ status: 1 }, 1, 10, true).subscribe({
      next: (res: any) => {
        this.suppliers = res;
      },
      error: (err) => {
        this.msgService.error(JSON.stringify(err.error));
      },
    });
  }

  showDrawer(): void {
    this.isVisible = true;

    this.tempUser = {
      ...this.user,
      extra_data: this.user?.extra_data || [{}],
    };

    if (this.tempUser.extra_data?.length > 0 && this.tempUser.user_type) {
      this.user_type =
        this.userTypeOptions.find((e) => e.id == this.tempUser.user_type) || '';
    } else {
      this.user_type = { id: 1, type: 'MASTER' };
    }
  }

  submit(): void {
    this.isDataLoading = true;
    this.userService.updateAttributes(this.tempUser).subscribe(
      (response) => {
        if (this.tempUser.extra_data) {
          this.userService
            .updateDataByType(
              this.userTypeOptions.find((e) => e.id === this.user_type.id)!,
              this.tempUser.id,
              this.tempUser
            )
            .subscribe({
              next: (res) => {
                this.msgService.success(JSON.stringify('User updated successfully'));
                this.user = { ...this.tempUser };
                this.isVisible = false;
                this.userUpdated.emit(res);
              },
              error: (err) => {
                this.msgService.error(JSON.stringify(err?.error));
              },
            });
          this.isDataLoading = false;
        } else {
          this.msgService.success(JSON.stringify('User updated successfully'));
          this.user = { ...this.tempUser };
          this.isVisible = false;
          this.userUpdated.emit(response);
          this.isDataLoading = false;
        }
        this.isDataLoading = false;
      },
      (error) => {
        this.msgService.error(JSON.stringify(error?.error));
        this.isDataLoading = false;
      }
    );
  }

  getLocalities() {
    this.localitiesService.get({ status: 1 }, 1, 1, true).subscribe({
      next: (res: any) => (this.localities = res),
      error: (err) => {
        this.msgService.error(JSON.stringify(err.error));
      },
    });
  }

  getUserTypes(): void {
    this.userService.getUserTypes().subscribe(
      (response: any[]) => {
        this.userTypeOptions = response.map((type) => ({
          label: type.name,
          value: type.name,
          type: type.type,
          id: type.id,
        }));
      },
      (error) => {
        this.msgService.error(JSON.stringify(error.error));
      }
    );
  }

  closeDrawer(): void {
    this.isVisible = false;
  }

}
