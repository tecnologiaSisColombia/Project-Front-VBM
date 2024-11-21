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

            <div
              nz-col
              [nzSpan]="12"
              *ngIf="user.extra_data && user_type == 'Doctor'"
            >
              <nz-form-item>
                <nz-form-label [nzSpan]="24">Speciality</nz-form-label>
                <nz-form-control [nzSpan]="24">
                  <nz-select
                    name="speciality_id"
                    [(ngModel)]="user.extra_data[0].speciality_id"
                    nzPlaceHolder="Select speciality"
                    style="width: 100%; border-radius: 6px"
                  >
                    <nz-option
                      *ngFor="let o of specialities"
                      [nzLabel]="o.description"
                      [nzValue]="o.id"
                    ></nz-option>
                  </nz-select>
                </nz-form-control>
              </nz-form-item>
            </div>

            <div
              nz-col
              [nzSpan]="12"
              *ngIf="user.extra_data && user_type == 'Doctor'"
            >
              <nz-form-item>
                <nz-form-label [nzSpan]="24">License number</nz-form-label>
                <nz-form-control [nzSpan]="24">
                  <input
                    name="license_number"
                    nz-input
                    [(ngModel)]="user.extra_data[0].license_number"
                    type="tel"
                    placeholder="Enter license number"
                  />
                </nz-form-control>
              </nz-form-item>
            </div>

            <div
              nz-col
              [nzSpan]="12"
              *ngIf="
                user.extra_data &&
                (user_type == 'Doctor' || user_type == 'Seller')
              "
            >
              <nz-form-item>
                <nz-form-label [nzSpan]="24">Store</nz-form-label>
                <nz-form-control [nzSpan]="24">
                  <nz-select
                    (ngModelChange)="storeChange($event)"
                    [(ngModel)]="user.extra_data[0].store_id"
                    nzPlaceHolder="Select store"
                    style="width: 100%; border-radius: 6px"
                    name="store_id"
                  >
                    <nz-option
                      *ngFor="let o of stores"
                      [nzLabel]="o.name"
                      [nzValue]="o.id"
                    ></nz-option>
                  </nz-select>
                </nz-form-control>
              </nz-form-item>
            </div>

            <div
              nz-col
              [nzSpan]="12"
              *ngIf="user.extra_data && user_type == 'Doctor'"
            >
              <nz-form-item>
                <nz-form-label [nzSpan]="24">Office</nz-form-label>
                <nz-form-control [nzSpan]="24">
                  <nz-select
                    name="office_id"
                    [(ngModel)]="user.extra_data[0].office_id"
                    nzPlaceHolder="Select office"
                    style="width: 100%; border-radius: 6px"
                  >
                    <nz-option
                      *ngFor="let o of officesToDisplay"
                      [nzLabel]="o.name"
                      [nzValue]="o.id"
                    ></nz-option>
                  </nz-select>
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

  constructor(
    private userService: UserService,
    private msgService: NzMessageService,
    private specialityService: EspecialitiesService,
    private createUserService: UserService,
    private storeService: StoresService,
    private officeService: OfficesService
  ) {}
  ngOnInit(): void {
    this.loadUserTypes();
    this.getOffices();
    this.getSpecialities();
    this.getStores();
  }

  showModal(): void {
    this.isVisible = true;
    if (!this.user.extra_data) return;
    this.user_type = this.userTypeOptions.find(
      (e) => e.id == this.user.extra_data[0].user_type_id
    )?.value!;
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
                Swal.fire({
                  icon: 'success',
                  title: 'User Updated',
                  text: 'The user has been updated successfully!',
                });
              },
              error: (err) => {
                Swal.fire({
                  icon: 'error',
                  title: 'Update Failed',
                  text: JSON.stringify(err.error),
                });
              },
            });
        }
        Swal.fire({
          icon: 'success',
          title: 'User Updated',
          text: 'The user has been updated successfully!',
        }).then(() => {
          this.isVisible = false;
          this.userUpdated.emit(response);
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
}
