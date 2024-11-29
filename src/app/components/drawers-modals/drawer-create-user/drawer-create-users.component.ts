import { Component, EventEmitter, Output } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import {
  FormsModule,
  Validators,
  UntypedFormGroup,
  UntypedFormBuilder,
  ReactiveFormsModule
} from '@angular/forms';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { UserService } from '../../../services/user-management/user-management.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CommonModule } from '@angular/common';
import { EspecialitiesService } from 'app/services/config/especialities.service';
import { StoresService } from 'app/services/config/stores.service';
import { OfficesService } from 'app/services/config/offices.service';
import { NzSpinModule } from 'ng-zorro-antd/spin';

@Component({
  selector: 'nz-demo-drawer-from-drawer',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NzButtonModule,
    NzDrawerModule,
    NzDatePickerModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    FormsModule,
    CommonModule,
    NzIconModule,
    NzSpinModule
  ],
  templateUrl: './drawer-create-users.component.html',
})
export class NzDemoDrawerFromDrawerComponent {
  formm: UntypedFormGroup;
  visible = false;
  extraForm: string | null = null;
  userTypeOptions: { id: number; label: string; value: string }[] = [];
  specialities: any[] = [];
  stores: any[] = [];
  offices: any[] = [];
  officesToDisplay: any[] = [];
  drawerLoader = false;
  @Output() userCreated = new EventEmitter<any>();

  constructor(
    private fb: UntypedFormBuilder,
    private createUserService: UserService,
    private msgService: NzMessageService,
    private specialityService: EspecialitiesService,
    private storeService: StoresService,
    private officeService: OfficesService
  ) {
    this.formm = this.fb.group({
      first_name: ['', [Validators.required, Validators.pattern(/^(?!\s*$).+/)]],
      last_name: ['', [Validators.required, Validators.pattern(/^(?!\s*$).+/)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^(?!\s*$).+/)]],
      username: ['', [Validators.required, Validators.pattern(/^(?!\s*$).+/)]],
      password: ['', [Validators.required, Validators.pattern(/^(?!\s*$).+/)]],
      type_user: ['', [Validators.required]],
      speciality_id: [null],
      store_id: [null],
      office_id: [null],
      number_license: [''],
    });
    this.loadUserTypes();
    this.getSpecialities();
    this.getStores();
    this.getOffices();
  }

  getSpecialities(): void {
    this.specialityService.get({ status: 1 }, 1, 1, true).subscribe({
      next: (res: any) => (this.specialities = res),
      error: (err) => this.msgService.error(JSON.stringify(err.error)),
    });
  }

  getStores(): void {
    this.storeService.get({ status: 1 }, 1, 1, true).subscribe({
      next: (res: any) => (this.stores = res),
      error: (err) => this.msgService.error(JSON.stringify(err.error)),
    });
  }

  getOffices(): void {
    this.officeService.get({ status: 1 }, 1, 1, true).subscribe({
      next: (res: any) => {
        this.offices = res;
        this.officesToDisplay = res;
      },
      error: (err) => this.msgService.error(JSON.stringify(err.error)),
    });
  }

  loadUserTypes(): void {
    this.createUserService.getUserTypes().subscribe({
      next: (response: any[]) => {
        this.userTypeOptions = response.map((type) => ({
          label: type.name,
          value: type.name,
          id: type.id,
        }));
      },
      error: (err) => this.msgService.error(JSON.stringify(err.error)),
    });
  }

  open(): void {
    this.visible = true;
  }

  close(): void {
    this.visible = false;
    this.formm.reset();
    this.extraForm = null;
    this.drawerLoader = false;
  }

  submit(): void {
    if (this.formm.valid) {
      const userData = this.formm.value;

      if (
        this.extraForm === 'Doctor' &&
        (
          !userData.speciality_id ||
          !userData.store_id ||
          !userData.office_id ||
          !userData.number_license
        )
      ) {
        this.msgService.error('Please fill all the required fields for a Doctor');
        return;
      }

      if (this.extraForm === 'Seller' && !userData.store_id) {
        this.msgService.error('Store is required for a Seller.');
        return;
      }

      this.drawerLoader = true;

      this.createUserService.createUser(userData).subscribe({
        next: (response) => {
          this.msgService.success('New user created');
          this.userCreated.emit(response);
          this.close();
          this.drawerLoader = false;
        },
        error: (error) => {
          this.msgService.error(JSON.stringify(error.error.error.message));
          this.drawerLoader = false;
        },
      });
    } else {
      this.markFormGroupTouched(this.formm);
    }
  }

  markFormGroupTouched(formGroup: UntypedFormGroup): void {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsDirty();
      control.updateValueAndValidity({ onlySelf: true });
    });
  }

  userTypeChange(event: any): void {
    const userType = typeof event === 'string' ? event : event?.target?.value;
    const type = this.userTypeOptions.find((e) => e.value === userType);
    this.extraForm = type?.value === 'Doctor' ? 'Doctor' : type?.value === 'Seller' ? 'Seller' : null;
  }

  storeChange(event: any): void {
    const storeId = typeof event === 'number' ? event : parseInt(event, 10);
    this.officesToDisplay = storeId
      ? this.offices.filter((e) => e.store === storeId)
      : this.offices;
  }
}
