import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  Validators,
  UntypedFormGroup,
  UntypedFormBuilder,
  ReactiveFormsModule,
  AbstractControl,
} from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import Swal from 'sweetalert2';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { AuthService } from 'app/services/auth/auth.service';
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
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { finalize } from 'rxjs/operators';

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
    NzDrawerModule,
    NzBreadCrumbModule,
    NzSwitchModule,
    ReactiveFormsModule,
    NzSpinModule,
    NzPaginationModule,
    NzEmptyModule,
    NzDividerModule,
  ],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css', '/src/animations/styles.css'],
})
export class UserManagementComponent implements OnInit {
  form: UntypedFormGroup;
  isDataLoading = false;
  exportLoader = false;
  drawerLoader = false;
  dataToDisplay: any[] = [];
  visible = false;
  drawerTitle = '';
  extraForm: any = null;
  userTypeOptions: {
    id: number;
    label: string;
    value: string;
    type: string;
    code_type: number;
  }[] = [];
  localities: any[] = [];
  suppliers: any[] = [];
  insurers: any[] = [];
  firstSearch: any = null;
  lastSearch: any = null;
  usernameSearch: any = null;
  isUpdating = false;
  dataDrawerCahe: any = null;
  num_pages = 1;
  count_records = 0;
  page_size = 10;
  page = 1;
  userAttr: any = null;
  [key: string]: any;
  searchFields = [
    { placeholder: 'Username...', model: 'usernameSearch', key: 'username' },
    { placeholder: 'First Name...', model: 'firstSearch', key: 'first_name' },
    { placeholder: 'Last Name...', model: 'lastSearch', key: 'last_name' },
  ];
  fieldsToClearMap: { [key: string]: string[] } = {
    '2': ['type_user'],
    '3': ['type_user', 'number_license', 'localities'],
    '1': ['type_user', 'number_license', 'supplier', 'localities'],
  };
  private searchNameSubject = new Subject<{ type: string; value: string }>();
  user_type: any = '';

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
      address: [null],
      city: [null],
      state: [null],
      postal_code: [null],
      number_license: [''],
      npi: [''],
      federal_tax_id: [''],
    });
    this.searchNameSubject
      .pipe(debounceTime(1000))
      .subscribe(({ type, value }) => {
        const fields = {
          first_name: () => (this.firstSearch = value),
          last_name: () => (this.lastSearch = value),
          username: () => (this.usernameSearch = value),
        };

        (fields as Record<string, () => void>)[type]?.();
        this.page = 1;
        this.getInitData();
        this.isDataLoading = false;
      });
  }

  ngOnInit(): void {
    this.getInitData();
    this.getUserTypes();
    this.getLocalities();
    this.getSuppliers();
    this.getInsurers();
    this.userAttr = JSON.parse(localStorage.getItem('user_attr')!);
  }

  openEditDrawer(data: any): void {
    this.visible = true;
    this.isUpdating = true;
    this.drawerTitle = 'Edit User';
    this.dataDrawerCahe = data;

    this.form.patchValue({ ...data });

    if (data.extra_data && data.extra_data.length > 0) {
      this.form.patchValue({
        number_license: data.extra_data[0].license_number,
        npi: data.extra_data[0].npi,
        federal_tax_id: data.extra_data[0].federal_tax_id,
        supplier: data.extra_data[0].supplier_id,
        address: data.extra_data[0].address,
        city: data.extra_data[0].city,
        state: data.extra_data[0].state,
        postal_code: data.extra_data[0].postal_code,
      });
    }

    const selectedUserType = this.userTypeOptions.find(
      (e) => e.id === this.dataDrawerCahe.user_type
    );

    
    if (selectedUserType) {
      const userType = selectedUserType.code_type;
      const fieldsToClear = this.fieldsToClearMap[userType] || this.fieldsToClearMap['1'];

      fieldsToClear.forEach((field) => {
        const control = this.form.get(field);
        if (control) {
          control.clearValidators();
          control.updateValueAndValidity();
        }
      });

      const controls = {
        2: [
          'number_license',
          'localities',
          'insurers',
          'address',
          'city',
          'state',
          'npi',
          'federal_tax_id'
        ],
        3: ['supplier'],
      };

      const requiredWithPattern = [
        'address',
        'city',
        'state',
        'number_license',
        'npi',
        'federal_tax_id'
      ];

      Object.entries(controls).forEach(([key, controlNames]) => {
        const isActive = userType.toString() === key.toString();
        controlNames.forEach((control) => {
          if (isActive) {
            const validators = requiredWithPattern.includes(control)
              ? [Validators.required, Validators.pattern(/^(?!\s*$).+/)]
              : [Validators.required];
            this.form.get(control)?.setValidators(validators);
          } else {
            this.form.get(control)?.clearValidators();
          }
          this.form.get(control)?.updateValueAndValidity();
        });
      });
    }

    this.user_type = this.userTypeOptions.find(
      (e) => e.id == this.dataDrawerCahe.user_type
    ) || { id: 1, type: 'MASTER', code_type: 2 };
  }

  submit(): void {
    if (!this.form.valid) {
      Object.values(this.form.controls).forEach((control) => {
        control.markAsDirty();
        control.updateValueAndValidity({ onlySelf: true });
      });
      return;
    }

    this.drawerLoader = true;

    const request = this.isUpdating
      ? this.userService.updateAttributes(this.form.value)
      : this.userService.createUser(this.form.value);

    request
      .pipe(
        finalize(() => {
          this.drawerLoader = false;
        })
      )
      .subscribe({
        next: () => {
          if (this.isUpdating && this.form.value) {
            this.userService
              .updateDataByType(
                this.userTypeOptions.find((e) => e.id === this.user_type.id)!,
                this.dataDrawerCahe.id,
                this.form.value
              )
              .subscribe({
                error: (err) =>
                  this.msgService.error(JSON.stringify(err?.error)),
              });
          }

          this.msgService.success(
            `User ${this.isUpdating ? 'updated' : 'created'} successfully`
          );

          this.getInitData();
          this.getSuppliers();
          this.closeDrawer();
        },
        error: (err) =>
          this.msgService.error(
            JSON.stringify(err?.error?.message || err?.error)
          ),
      });
  }

  userTypeChange(event: any): void {
    const userType = typeof event === 'string' ? event : event?.target?.value;
    const selectedType = this.userTypeOptions.find((e) => e.value === userType);

    const controls = {
      2: [
        'number_license',
        'localities',
        'insurers',
        'address',
        'city',
        'state',
        'npi',
        'federal_tax_id'
      ],
      3: ['supplier'],
    };

    const requiredWithPattern = [
      'address',
      'city',
      'state',
      'number_license',
      'npi',
      'federal_tax_id'
    ];

    const resetControls = () => {
      Object.values(controls)
        .flat()
        .forEach((control) => {
          this.form.get(control)?.clearValidators();
          this.form.get(control)?.updateValueAndValidity();
        });
    };

    const applyValidation = (type: string | null) => {
      Object.entries(controls).forEach(([key, controlNames]) => {
        const isActive = type === key;
        controlNames.forEach((control) => {
          if (isActive) {
            const validators = requiredWithPattern.includes(control)
              ? [Validators.required, Validators.pattern(/^(?!\s*$).+/)]
              : [Validators.required];
            this.form.get(control)?.setValidators(validators);
          } else {
            this.form.get(control)?.clearValidators();
          }
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
    applyValidation(this.extraForm.code_type.toString());
  }

  getSuppliers(): void {
    this.supplierService
      .getSuppliers({ status: 1 }, null, null, true)
      .subscribe({
        next: (res: any) => {
          this.suppliers = res;
          if (this.userAttr.rol == 2) {
            const supplier = this.suppliers.find(
              (s) => s.user.id == this.userAttr.id
            );
            this.form.patchValue({ supplier: supplier.id });
          }
        },
        error: (err) => {
          this.msgService.error(JSON.stringify(err.error));
        },
      });
  }

  closeDrawer(): void {
    this.visible = false;
    this.form.reset();
    this.extraForm = null;
    this.drawerLoader = false;
    this.dataDrawerCahe = null;
  }

  openDrawer(): void {
    this.visible = true;
    this.drawerTitle = 'New User';
    this.isUpdating = false;
  }

  getInsurers(): void {
    this.insurerService.getInsurers({ status: 1 }, null, null, true).subscribe({
      next: (res: any) => {
        this.insurers = res;
      },
      error: (err) => {
        this.msgService.error(JSON.stringify(err.error));
      },
    });
  }

  getLocalities(): void {
    this.localitiesService.get({ status: 1 }, null, null, true).subscribe({
      next: (res: any) => {
        this.localities = res;
      },
      error: (err) => {
        this.msgService.error(JSON.stringify(err.error));
      },
    });
  }

  getUserTypes(): void {
    this.userService.getUserTypes().subscribe({
      next: (res: any[]) => {
        this.userTypeOptions = res.map((type) => ({
          label: type.name,
          value: type.name,
          type: type.type,
          id: type.id,
          code_type: type.code_type,
        }));
      },
      error: (error) => {
        this.msgService.error(JSON.stringify(error));
      },
    });
  }

  getInitData(): void {
    this.isDataLoading = true;
    this.userService
      .getUsers(
        {
          username: this.usernameSearch,
          first_name: this.firstSearch,
          last_name: this.lastSearch,
        },
        this.page,
        this.page_size
      )
      .subscribe({
        next: (res: any) => {
          this.dataToDisplay = res.results;
          this.setPagination(res.total);
        },
        error: (error) => {
          this.msgService.error(JSON.stringify(error));
        },
        complete: () => {
          this.isDataLoading = false;
        },
      });
  }

  update(id: number, data: any) {
    this.isDataLoading = true;
    this.userService.update(id, data).subscribe({
      next: () => {
        this.msgService.success('User updated successfully');
        this.closeDrawer();
      },
      error: (err) => {
        this.msgService.error(JSON.stringify(err.error));
      },
      complete: () => {
        this.isDataLoading = false;
      },
    });
  }

  delete(username: string, id: number): void {
    Swal.fire({
      text: 'Are you sure you want to delete this user?',
      icon: 'warning',
      showDenyButton: true,
      confirmButtonText: 'Yes',
      denyButtonText: `No`,
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        this.isDataLoading = true;
        this.userService
          .delete(username, id)
          .pipe(
            finalize(() => {
              this.isDataLoading = false;
            })
          )
          .subscribe({
            next: () => {
              this.msgService.success('User deleted successfully');

              if (this.dataToDisplay.length === 1 && this.page > 1) {
                this.page--;
              }

              const storedUser = localStorage.getItem('user_attributes');

              if (storedUser && JSON.parse(storedUser).username === username) {
                this.authService.doLogout();
              }

              this.getInitData();
            },
            error: (err) => {
              this.msgService.error(JSON.stringify(err.error));
            },
          });
      }
    });
  }

  changeStatus(username: string, id: number, is_active: boolean): void {
    this.update(id, { is_active: is_active, username: username });
  }

  mapRole(userType: number): string | undefined {
    return this.userTypeOptions.find((t) => t.id === userType)?.label;
  }

  search(value: string, type: string) {
    this.isDataLoading = true;
    this.searchNameSubject.next({ type, value });
  }

  pageChange(event: number) {
    this.page = event;
    this.getInitData();
  }

  pageSizeChange(pageSize: number): void {
    this.page_size = pageSize;
    this.page = 1;
    this.getInitData();
  }

  setPagination(count: number) {
    this.count_records = count;
    this.num_pages = Math.ceil(count / this.page_size);
  }

  getErrorMessage(control: AbstractControl | null): string | null {
    if (!control || !control.errors) return null;

    if (control.hasError('required')) return 'This field is required';

    if (control.hasError('pattern')) return 'This field cannot be empty';

    if (control.hasError('email')) return 'Please enter a valid email address';

    return null;
  }

  exportUsers(): void {
    this.userService
      .getUsers({}, null, null, true)
      .pipe(
        finalize(() => {
          this.exportLoader = false;
        })
      )
      .subscribe({
        next: (res: any) => {
          if (res.length === 0) {
            this.msgService.warning('No data available to export');
            return;
          }

          this.exportLoader = true;

          const headers = {
            role: 'Role',
            first_name: 'First Name',
            last_name: 'Last Name',
            email: 'Email',
            username: 'Username',
            phone: 'Phone',
            is_active: 'Status',
            created: 'Created',
          };

          const selectedColumns = Object.keys(
            headers
          ) as (keyof typeof headers)[];

          const filteredData = res.map((user: any) =>
            selectedColumns.reduce((obj: Record<string, any>, key) => {
              if (key === 'is_active') {
                obj[headers[key]] = user[key] ? 'Active' : 'Inactive';
              } else if (key === 'created') {
                const date = new Date(user[key]);
                obj[headers[key]] = date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });
              } else if (key === 'role') {
                obj[headers[key]] = this.mapRole(user.user_type);
              } else {
                obj[headers[key]] = user[key];
              }
              return obj;
            }, {})
          );

          const worksheet: XLSX.WorkSheet =
            XLSX.utils.json_to_sheet(filteredData);
          const workbook: XLSX.WorkBook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');

          const excelBuffer: ArrayBuffer = XLSX.write(workbook, {
            bookType: 'xlsx',
            type: 'array',
          });

          const blob = new Blob([excelBuffer], {
            type: 'application/octet-stream',
          });
          const link = document.createElement('a');
          const url = URL.createObjectURL(blob);

          link.setAttribute('href', url);
          link.setAttribute('download', 'Users.xlsx');
          link.style.visibility = 'hidden';

          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          this.msgService.success('Export completed successfully');
        },
        error: (err) => {
          this.msgService.error(JSON.stringify(err.error));
        },
      });
  }
}
