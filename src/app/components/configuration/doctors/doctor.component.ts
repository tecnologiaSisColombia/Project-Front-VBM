import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { DoctorService } from 'app/services/config/doctors.service';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { debounceTime, Subject } from 'rxjs';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-doctors',
  imports: [
    NzBreadCrumbModule,
    NzFormModule,
    FormsModule,
    ReactiveFormsModule,
    NzButtonComponent,
    NzTableModule,
    NzPaginationModule,
    NzDividerModule,
    NzInputModule,
    NzIconModule,
    NzDrawerModule,
    NzSpinModule,
    CommonModule,
    NzSwitchModule,
    NzSelectModule,
    NzEmptyModule,
    NzPopoverModule
  ],
  templateUrl: './doctor.component.html',
  styleUrls: ['./doctor.component.css', '/src/animations/styles.css']
})
export class DoctorComponent {
  form: UntypedFormGroup;
  isDataLoading = false;
  exportLoader = false;
  dataToDisplay: any[] = [];
  visible = false;
  drawerLoader = false;
  drawerTitle = '';
  dataDrawerCache: any;
  isUpdating = false;
  num_pages = 1;
  count_records = 0;
  page_size = 10;
  page = 1;
  stores: any[] = [];
  suppliers: any[] = [];
  firstSearch: any = null;
  lastSearch: any = null;
  licenseSearch: any = null;
  userAttr: any = null;
  [key: string]: any;
  searchFields = [
    { placeholder: 'First Name...', model: 'firstSearch', key: 'first_name' },
    { placeholder: 'Last Name...', model: 'lastSearch', key: 'last_name' },
    { placeholder: 'License Number...', model: 'licenseSearch', key: 'license' },
  ];
  private searchNameSubject = new Subject<{ type: string; value: string }>();

  constructor(
    private fb: UntypedFormBuilder,
    private doctorService: DoctorService,
    private msgService: NzMessageService
  ) {
    this.form = this.fb.group({
      license_number: [null, [Validators.required, Validators.pattern(/^(?!\s*$).+/)]],
      npi: [null, [Validators.required, Validators.pattern(/^(?!\s*$).+/)]],
      email: [null, [Validators.required, Validators.email]],
      phone: [null, [Validators.required, Validators.pattern(/^(?!\s*$).+/)]],
      last_name: [null, [Validators.required, Validators.pattern(/^(?!\s*$).+/)]],
      first_name: [null, [Validators.required, Validators.pattern(/^(?!\s*$).+/)]],
      supplier: [null, [Validators.required]],
    });

    this.searchNameSubject
      .pipe(debounceTime(1000))
      .subscribe(({ type, value }) => {
        const fields = {
          first_name: () => (this.firstSearch = value),
          last_name: () => (this.lastSearch = value),
          license: () => (this.licenseSearch = value),
        };

        (fields as Record<string, () => void>)[type]?.();
        this.page = 1;
        this.getInitData();
        this.isDataLoading = false;
      });
  }

  ngOnInit(): void {
    this.getInitData();
    this.getSuppliers();
    this.userAttr = JSON.parse(localStorage.getItem('user_attr')!);
  }

  getSuppliers() {
    this.doctorService.getSuppliers({}, null, null, true).subscribe({
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

  getInitData() {
    this.isDataLoading = true;
    this.doctorService
      .get(
        {
          license: this.licenseSearch,
          first_name: this.firstSearch,
          last_name: this.lastSearch,
        },
        this.page,
        this.page_size
      )
      .pipe(
        finalize(() => {
          this.isDataLoading = false;
        })
      )
      .subscribe({
        next: (res: any) => {
          this.dataToDisplay = res.results;
          this.setPagination(res.total);
        },
        error: (err) => {
          this.msgService.error(JSON.stringify(err.error));
        },
      });
  }

  openDrawer(): void {
    this.visible = true;
    this.drawerTitle = 'New Doctor';
  }

  openEditDrawer(data: any): void {
    this.visible = true;
    this.isUpdating = true;
    this.drawerTitle = 'Edit Doctor';
    this.dataDrawerCache = data;
    this.form.patchValue({ ...data });
  }

  closeDrawer(): void {
    this.isUpdating = false;
    this.visible = false;
    this.dataDrawerCache = null;
    this.drawerTitle = '';
    this.form.reset();
  }

  delete(id: number) {
    Swal.fire({
      text: 'Are you sure you want to delete this doctor?',
      icon: 'warning',
      showDenyButton: true,
      confirmButtonText: 'Yes',
      denyButtonText: `No`,
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        this.isDataLoading = true;
        this.doctorService
          .delete(id)
          .pipe(
            finalize(() => {
              this.isDataLoading = false;
            })
          )
          .subscribe({
            next: () => {
              this.msgService.success('Doctor deleted successfully');

              if (this.dataToDisplay.length === 1 && this.page > 1) {
                this.page--;
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

  update(id: number, data: any, reloadData?: string) {
    this.doctorService.update(id, data)
      .pipe(
        finalize(() => {
          this.drawerLoader = false;
        })
      )
      .subscribe({
        next: () => {
          this.msgService.success('Doctor updated successfully');
          this.closeDrawer();

          if (reloadData === 'reload') {
            this.getInitData();
          }
        },
        error: (err) => {
          this.msgService.error(JSON.stringify(err.error));
        },
      });
  }

  submit() {
    if (!this.form.valid) {
      Object.values(this.form.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }

    this.drawerLoader = true;

    if (this.isUpdating) {
      return this.update(this.dataDrawerCache.id, this.form.value, 'reload');
    }

    this.doctorService.create(this.form.value)
      .pipe(
        finalize(() => {
          this.drawerLoader = false;
        })
      )
      .subscribe({
        next: () => {
          this.msgService.success('Doctor created successfully');
          this.getInitData();
          this.closeDrawer();
        },
        error: (err) => {
          this.msgService.error(JSON.stringify(err.error));
        },
      });
  }

  changeStatus(id: number, isActive: boolean): void {
    this.update(id, { active: isActive });
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

  hasFeedback(controlName: string): boolean {
    const control = this.form.get(controlName);
    return control?.invalid && (control.dirty || control.touched) ? true : false;
  }

  exportDoctors(): void {
    this.doctorService
      .get({}, null, null, true)
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
            first_name: 'First Name',
            last_name: 'Last Name',
            email: 'Email',
            phone: 'Phone',
            license_number: 'License Number',
            supplier: 'Supplier',
            created: 'Created',
            active: 'Status',
          };

          const selectedColumns = Object.keys(headers) as (keyof typeof headers)[];

          const filteredData = res.map((doctor: any) =>
            selectedColumns.reduce((obj: Record<string, any>, key) => {
              if (key === 'active') {
                obj[headers[key]] = doctor[key] ? 'Active' : 'Inactive';
              } else if (key === 'created') {
                const date = new Date(doctor[key]);
                obj[headers[key]] = date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });
              } else if (key === 'supplier') {
                const supplier = this.suppliers.find(s => s.id == doctor.supplier);
                if (supplier && supplier.user) {
                  const supUser = supplier.user;
                  obj[headers[key]] = `${supUser.first_name} ${supUser.last_name}`.trim();
                }
              } else {
                obj[headers[key]] = doctor[key];
              }
              return obj;
            }, {})
          );

          const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(filteredData);
          const workbook: XLSX.WorkBook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(workbook, worksheet, 'Doctors');

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
          link.setAttribute('download', 'Doctors.xlsx');
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