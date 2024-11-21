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
import { NzMessageService } from 'ng-zorro-antd/message';
import { nameRegex } from '../../../utils/name_regex';
import { usernameRegex } from '../../../utils/username_regex';
import { CommonModule } from '@angular/common';
import { EspecialitiesService } from 'app/services/config/especialities.service';
import { StoresService } from 'app/services/config/stores.service';
import { OfficesService } from 'app/services/config/offices.service';

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
    CommonModule,
    NzIconModule,
  ],
  templateUrl: './drawer-create-users.component.html',
})
export class NzDemoDrawerFromDrawerComponent {
  @Output() userCreated = new EventEmitter<any>();

  visible = false;
  extraForm: any = null;
  form = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    username: '',
    password: '',
    type_user: '',
    speciality_id: null,
    store_id: null,
    office_id: null,
    number_license: '',
  };

  userTypeOptions: { id: number; label: string; value: string }[] = [];

  specialities: any[] = [];
  stores: any[] = [];
  offices: any[] = [];
  officesToDisplay: any[] = [];

  constructor(
    private createUserService: UserService,
    private msgService: NzMessageService,
    private specialityService: EspecialitiesService,
    private storeService: StoresService,
    private officeService: OfficesService
  ) {
    this.loadUserTypes();
    this.getSpecialities();
    this.getStores();
    this.getOffices();
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

  open(): void {
    this.visible = true;
  }

  close(): void {
    this.visible = false;
  }

  submit(): void {
    for (const key of Object.keys(this.form)) {
      if (!this.form[key as keyof typeof this.form]) {
        if (
          !this.extraForm &&
          ['speciality_id', 'store_id', 'office_id', 'number_license'].includes(
            key
          )
        ) {
        } else if (
          this.extraForm == 'Seller' &&
          ['speciality_id', 'office_id', 'number_license'].includes(key)
        ) {
        } else {
          this.msgService.error(`Field ${key} is required.`);
          return;
        }
      }
    }

    if (
      !nameRegex.test(this.form.firstName) ||
      !nameRegex.test(this.form.lastName)
    ) {
      this.msgService.error(
        'Names cannot contain numbers or special characters.'
      );
      return;
    }

    if (!usernameRegex.test(this.form.username)) {
      this.msgService.error(
        'Username must be at least 5 characters long and can contain letters, numbers, dots, underscores, or hyphens.'
      );
      return;
    }

    if (!this.form.type_user) {
      this.msgService.error('User Type is required.');
      return;
    }

    let userData: any = {
      email: this.form.email,
      password: this.form.password,
      username: this.form.username,
      first_name: this.form.firstName,
      last_name: this.form.lastName,
      phone: this.form.phone,
      is_active: true,
      type_user: this.form.type_user,
    };

    if (this.form.type_user == 'Doctor') {
      if (
        !this.form.speciality_id ||
        !this.form.store_id ||
        !this.form.office_id ||
        !this.form.number_license
      ) {
        this.msgService.error('Please fill all the required fields.');
        return;
      }
      userData = {
        ...userData,
        speciality_id: this.form.speciality_id,
        store_id: this.form.store_id,
        office_id: this.form.office_id,
        number_license: this.form.number_license,
      };
    } else if (this.form.type_user == 'Seller') {
      if (!this.form.store_id) {
        this.msgService.error('Please fill all the required fields.');
        return;
      }
      userData = {
        ...userData,
        store_id: this.form.store_id,
      };
    }

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
      type_user: '',
      speciality_id: null,
      store_id: null,
      office_id: null,
      number_license: '',
    };
  }

  userTypeChange(event: string) {
    console.log(event, this.userTypeOptions);

    if (event) {
      const type = this.userTypeOptions.find((e) => e.value == event);
      if (type?.value == 'Doctor') {
        this.extraForm = 'Doctor';
      } else if (type?.value == 'Seller') {
        this.extraForm = 'Seller';
      } else {
        this.extraForm = null;
      }
      return;
    }
    this.extraForm = null;
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
