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
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzMessageService } from 'ng-zorro-antd/message';
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
    NzSwitchModule,
    ReactiveFormsModule,
    NzSpinModule,
    NzPaginationModule,
    NzEmptyModule,
  ],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css', '/src/animations/styles.css'],
})
export class UserManagementComponent implements OnInit {
  isDataLoading = false;
  dataToDisplay: any[] = [];
  userTypes: any[] = [];
  form: UntypedFormGroup;
  visible = false;
  extraForm: any = null;
  userTypeOptions: { id: number; label: string; value: string }[] = [];
  localities: any[] = [];
  suppliers: any[] = [];
  insurers: any[] = [];
  drawerLoader = false;
  firstSearch: any = null;
  lastSearch: any = null;
  usernameSearch: any = null;
  num_pages = 1;
  count_records = 0;
  page_size = 10;
  page = 1;
  [key: string]: any;
  user_attr: any = null;
  searchFields = [
    { placeholder: 'Username...', model: 'usernameSearch', key: 'username' },
    { placeholder: 'First Name...', model: 'firstSearch', key: 'first_name' },
    { placeholder: 'Last Name...', model: 'lastSearch', key: 'last_name' },
  ];
  isVisible = false;
  tempUser: any = null;
  user_type: any = '';
  private searchNameSubject = new Subject<{ type: string; value: string }>();

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
      first_name: ['', [Validators.required, Validators.pattern(/^(?!\s*$).+/)]],
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
    this.user_attr = JSON.parse(localStorage.getItem('user_attr')!);
  }

  getSuppliers(): void {
    this.supplierService.getSuppliers({ status: 1 }, 1, 10, true).subscribe({
      next: (res: any) => {
        this.suppliers = res;
        if (this.user_attr.rol == 'SUPPLIER') {
          const supplier = this.suppliers.find(
            (s) => s.user.id == this.user_attr.id
          );
          this.form.patchValue({ supplier: supplier.id });
        }
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

  closeDrawerEdit(): void {
    this.isVisible = false;
  }

  submit(): void {
    if (this.form.valid) {
      const userData = this.form.value;

      this.drawerLoader = true;

      this.userService.createUser(userData).subscribe({
        next: () => {
          this.msgService.success('User created successfully');
          this.getInitData();
          this.getSuppliers();
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

  submit2(): void {
    this.drawerLoader = true;
    this.userService.updateAttributes(this.tempUser).subscribe(
      () => {
        if (this.tempUser.extra_data) {
          this.userService
            .updateDataByType(
              this.userTypeOptions.find((e) => e.id === this.user_type.id)!,
              this.tempUser.id,
              this.tempUser
            )
            .subscribe({
              next: () => {
                this.msgService.success('User updated successfully');
                this.isVisible = false;
                this.getInitData();

              },
              error: (err) => {
                this.msgService.error(JSON.stringify(err?.error));
              },
            });
          this.drawerLoader = false;
        } else {
          this.msgService.success('User updated successfully');
          this.isVisible = false;
          this.drawerLoader = false;
          this.getInitData();

        }
        this.drawerLoader = false;
      },
      (error) => {
        this.msgService.error(JSON.stringify(error?.error));
        this.isDataLoading = false;
      }
    );
  }

  userTypeChange(event: any): void {
    const userType = typeof event === 'string' ? event : event?.target?.value;
    const selectedType = this.userTypeOptions.find((e) => e.value === userType);

    const controls = {
      SUPPLIER: ['number_license', 'localities', 'insurers'],
      PARTNER: ['supplier'],
    };

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
          this.form
            .get(control)
            ?.setValidators(isActive ? [Validators.required] : null);
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
      next: (res: any[]) => {
        this.userTypeOptions = res.map((type) => ({
          label: type.name,
          value: type.name,
          type: type.type,
          id: type.id,
        }));
        this.userTypes = res || [];
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
          this.isDataLoading = false;

          const isSearching =
            this.usernameSearch || this.firstSearch || this.lastSearch;

          if (isSearching && (!res.results || res.results.length === 0)) {
            this.msgService.warning(
              'No results found matching your search criteria');
          }

          this.setPagination(res.total);
        },
        error: (error) => {
          this.msgService.error(JSON.stringify(error));
          this.isDataLoading = false;
        },
      });
  }

  showDrawer(user: any): void {
    this.isVisible = true;
    this.tempUser = { ...user };

    if (this.tempUser.extra_data?.length > 0 && this.tempUser.user_type) {
      this.user_type =
        this.userTypeOptions.find((e) => e.id == this.tempUser.user_type) || '';
    } else {
      this.user_type = { id: 1, type: 'MASTER' };
    }
  }


  // private saveOrUpdate(formData: any): void {
  //   if (this.isUpdating) {
  //     this.update(this.tempUser.id, formData);
  //   } else {
  //     this.insurerService.createInsurer(formData).subscribe({
  //       next: () => {
  //         this.msgService.success('Insurer created successfully');
  //         this.isDataLoading = false;
  //         this.getInitData();
  //         this.closeDrawer();
  //       },
  //       error: (error) => {
  //         this.drawerLoader = false;
  //         this.isDataLoading = false;
  //         this.msgService.error(JSON.stringify(error.error));
  //       },
  //     });
  //   }
  // }

  mapUserRole(user_type_id: number): string {
    return this.userTypes.find((t) => t.id === user_type_id)?.name;
  }

  update(id: number, data: any) {
    this.isDataLoading = true;
    this.userService.update(id, data).subscribe({
      next: () => {
        this.msgService.success('User updated successfully');
        this.isDataLoading = false;
        this.closeDrawer();
      },
      error: (err) => {
        this.drawerLoader = false;
        this.isDataLoading = false;
        this.msgService.error(JSON.stringify(err.error));
      },
    });
  }

  changeStatus(user: any) {
    const data = { is_active: user.is_active, username: user.username };
    this.update(user.id, data);
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
        this.userService.delete(username, id).subscribe({
          next: () => {
            this.msgService.success('User deleted successfully');
            this.isDataLoading = false;

            if (this.dataToDisplay.length === 1 && this.page > 1) {
              this.page--;
            }

            this.checkAndLogout(username);

            this.getInitData();
          },
          error: (err) => {
            this.msgService.error(JSON.stringify(err.error));
            this.isDataLoading = false;
          },
        });
      }
    });
  }

  checkAndLogout(username: string): void {
    const storedUser = localStorage.getItem('user_attributes');

    if (storedUser && JSON.parse(storedUser).username === username) {
      this.authService.doLogout();
    }
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

  exportUsers(): void {
    this.userService.getUsers({}, null, null, true).subscribe({
      next: (res: any) => {
        if (res.length === 0) {
          this.msgService.warning('No data available to export');
          this.isDataLoading = false;
          return;
        }

        this.isDataLoading = true;

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
              obj[headers[key]] = this.mapUserRole(user.user_type);
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

        this.isDataLoading = false;
        this.msgService.success('Export completed successfully');
      },
      error: (err) => {
        this.isDataLoading = false;
        this.msgService.error(JSON.stringify(err.error));
      },
    });
  }
}
