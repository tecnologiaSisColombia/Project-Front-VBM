import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  Validators,
  UntypedFormGroup,
  UntypedFormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzDemoModalLocaleComponent } from '../drawers-modals/edit-user/edit-user.component';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzMessageService } from 'ng-zorro-antd/message';
import Swal from 'sweetalert2';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { AuthService } from '../../services/auth/auth.service';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import * as XLSX from 'xlsx';
import { InsurersService } from 'app/services/insurers/insurers.service';
import { DoctorService } from 'app/services/config/doctors.service';
import { LocalityService } from 'app/services/config/localities.service';
import { UserService } from 'app/services/user-management/user-management.service';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzFormModule,
    NzIconModule,
    NzInputModule,
    NzTableModule,
    NzSelectModule,
    NzTagModule,
    NzDrawerModule,
    NzBreadCrumbModule,
    NzDemoModalLocaleComponent,
    NzSwitchModule,
    ReactiveFormsModule,
    NzSpinModule
  ],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css', '../../../animations/styles.css'],
})
export class UserManagementComponent implements OnInit {
  loading = false;
  data: any[] = [];
  originalData: any[] = [];
  user_types: any[] = [];
  searchQuery: { username: string; fullName: string } = { username: '', fullName: '', };
  searchQuerySubject: Subject<{
    field: 'username' | 'fullName';
    query: string;
  }> = new Subject();
  num_pages = 1;
  count_records = 0;
  page_size = 10;
  page = 1;
  nameSearch: any = null;
  usernameSearch: any = null;
  lastnameSearch: any = null;

  form: UntypedFormGroup;
  visible = false;
  extraForm: any = null;
  userTypeOptions: { id: number; label: string; value: string }[] = [];
  localities: any[] = [];
  suppliers: any[] = [];
  insurers: any[] = [];
  drawerLoader = false;

  // private searchNameSubject = new Subject<{ type: string; value: string }>();

  constructor(
    private userService: UserService,
    private msgService: NzMessageService,
    private authService: AuthService,
    private fb: UntypedFormBuilder,
    private localitiesService: LocalityService,
    private insurerService: InsurersService,
    private supplierService: DoctorService
  ) {
    this.form = this.fb.group({
      first_name: ['', [Validators.required, Validators.pattern(/^(?!\s*$).+/)],],
      last_name: ['', [Validators.required, Validators.pattern(/^(?!\s*$).+/)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^(?!\s*$).+/)]],
      username: ['', [Validators.required, Validators.pattern(/^(?!\s*$).+/)]],
      type_user: ['', [Validators.required]],
      localities: [null],
      supplier: [null],
      insurers: [null],
      number_license: [''],
    });

    // this.searchNameSubject.pipe(debounceTime(2000)).subscribe((data) => {
    //   if (data.type === 'name') this.nameSearch = data.value;
    //   if (data.type === 'username') this.usernameSearch = data.value;
    //   if (data.type === 'lastname') this.lastnameSearch = data.value;
    //   this.page = 1;
    //   this.fetchUsers();
    // });

    this.getUserTypes();
    this.getLocalities();
    this.getSuppliers();
    this.getInsurers();
  }

  ngOnInit(): void {
    this.fetchUsers();
    this.getUserTypes();

    this.searchQuerySubject
      .pipe(debounceTime(300))
      .subscribe(({ field, query }) => this.filterData(field, query));
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

  getLocalities(): void {
    this.localitiesService.get({ status: 1 }, 1, 1, true).subscribe({
      next: (res: any) => (this.localities = res),
      error: (err) => this.msgService.error(JSON.stringify(err.error)),
    });
  }

  openDrawer(): void {
    this.visible = true;
  }

  closeDrawer(): void {
    this.visible = false;
    this.form.reset();
    this.extraForm = null;
    this.drawerLoader = false;
  }

  submit(): void {
    if (this.form.valid) {
      const userData = this.form.value;

      this.drawerLoader = true;

      this.userService.createUser(userData).subscribe({
        next: () => {
          this.msgService.success(JSON.stringify('User created successfully'));
          this.fetchUsers();
          this.closeDrawer();
          this.drawerLoader = false;
        },
        error: (error) => {
          this.msgService.error(JSON.stringify(error.error.error.message));
          this.drawerLoader = false;
        },
      });
    } else {
      Object.values(this.form.controls).forEach((control) => {
        control.markAsDirty();
        control.updateValueAndValidity({ onlySelf: true });
      });
    }
  }

  userTypeChange(event: any): void {
    const userType = typeof event === 'string' ? event : event?.target?.value;
    const selectedType = this.userTypeOptions.find((e) => e.value === userType);

    const controls = {
      SUPPLIER: ['number_license', 'localities', 'insurers'],
      PARTNER: ['supplier'],
    };

    const resetControls = () => {
      Object.values(controls).flat().forEach((control) => {
        this.form.get(control)?.clearValidators();
        this.form.get(control)?.updateValueAndValidity();
      });
    };

    const applyValidation = (type: string | null) => {
      Object.entries(controls).forEach(([key, controlNames]) => {
        const isActive = type === key;
        controlNames.forEach((control) => {
          this.form.get(control)?.setValidators(isActive ? [Validators.required] : null);
          this.form.get(control)?.updateValueAndValidity();
        });
      });
    };

    if (!selectedType) {
      this.extraForm = null;
      resetControls();
      return;
    }

    this.extraForm = selectedType;

    resetControls();
    applyValidation(this.extraForm.type);
  }

  getUserTypes(): void {
    this.userService.getUserTypes().subscribe({
      next: (response: any[]) => {
        this.userTypeOptions = response.map((type) => ({
          label: type.name,
          value: type.name,
          type: type.type,
          id: type.id,
        }));
        this.user_types = response || [];
      },
      error: (error) => {
        this.msgService.error(JSON.stringify(error));
      },
    });
  }

  fetchUsers(): void {
    this.loading = true;
    this.userService
      .getUsers({
        name: this.nameSearch,
        lastname: this.lastnameSearch,
        username: this.usernameSearch,
      })
      .subscribe({
        next: (data: any) => {
          this.data = data.results;
          this.originalData = [...data.results];
          this.loading = false;
        },
        error: (error) => {
          this.msgService.error(JSON.stringify(error));
          this.loading = false;
        },
      });
  }

  addUserToList(newUser: any): void {
    this.data = [newUser, ...this.data];
    this.fetchUsers();
  }

  updateUser(updatedUser: any): void {
    this.fetchUsers();
  }

  toggleUserStatus(user: any): void {
    const toggleAction = user.is_active
      ? this.userService.enableUser(user.username)
      : this.userService.disableUser(user.username);

    toggleAction.subscribe(
      () => {
        this.msgService.success('User updated successfully');

        user.is_active = user.is_active;

        if (!user.is_active) {
          const userAttributes = localStorage.getItem('user_attributes');
          const currentUser = userAttributes
            ? JSON.parse(userAttributes)
            : null;

          if (currentUser?.username === user.username) {
            this.authService.doLogout();
          }
        }
      },
      (error) => {
        this.msgService.error(JSON.stringify(error.error));
        user.is_active = !user.is_active;
      }
    );
  }

  deleteUser(user: any): void {
    Swal.fire({
      title: 'Are you sure to delete?',
      showDenyButton: true,
      confirmButtonText: 'Yes',
      denyButtonText: `No`,
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading = true;
        this.userService.deleteUser(user.username).subscribe({
          next: () => {
            this.msgService.success('User deleted successfully');
            this.loading = false;

            this.data = this.data.filter((u) => u.username !== user.username);

            const userAttributes = localStorage.getItem('user_attributes');
            const currentUser = userAttributes
              ? JSON.parse(userAttributes)
              : null;

            if (currentUser && currentUser.username === user.username) {
              this.authService.doLogout();
            }
          },
          error: (err) => {
            this.loading = false;
            this.msgService.error(JSON.stringify(err.error));
          },
        });
      }
    });
  }

  mapUserRole(user_type_id: number): string {
    const type = this.user_types.find((t) => t.id == user_type_id);
    return type ? type.name : 'Unknown Role';
  }

  onSearch(field: 'username' | 'fullName'): void {
    this.loading = true;
    const query = this.searchQuery[field].trim();
    this.searchQuerySubject.next({ field, query });
  }

  filterData(field: string, query: string): void {
    if (query) {
      this.data = this.originalData.filter((user) => {
        if (field === 'username') {
          const username = `${user.username}`;
          return username.includes(query);
        } else if (field === 'fullName') {
          const fullName = `${user.first_name} ${user.last_name}`;
          return fullName.includes(query);
        }
        return true;
      });
    } else {
      this.data = [...this.originalData];
    }
    this.loading = false;
  }

  exportUsersToXLS(): void {
    if (this.data.length === 0) {
      this.msgService.warning('No data available to export');
      return;
    }

    this.loading = true;

    const headers: Record<
      | 'first_name'
      | 'last_name'
      | 'email'
      | 'username'
      | 'phone'
      | 'is_active'
      | 'role',
      string
    > = {
      role: 'Role',
      first_name: 'First Name',
      last_name: 'Last Name',
      email: 'Email',
      username: 'Username',
      phone: 'Phone',
      is_active: 'Status',
    };

    const selectedColumns = Object.keys(headers) as (keyof typeof headers)[];

    const filteredData = this.data.map((user) =>
      selectedColumns.reduce((obj: Record<string, any>, key) => {
        if (key === 'is_active') {
          obj[headers[key]] = user[key] == 1 ? 'Active' : 'Inactive';
        } else if (key === 'role') {
          obj[headers[key]] = user.extra_data
            ? this.mapUserRole(user.extra_data[0].user_type_id)
            : 'Master';
        } else {
          obj[headers[key]] = user[key];
        }
        return obj;
      }, {})
    );

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(filteredData);

    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');

    const excelBuffer: ArrayBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', 'users.xlsx');
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.loading = false;
  }
}
