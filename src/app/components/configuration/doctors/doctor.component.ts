import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
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
import { debounceTime, Subject } from 'rxjs';
import Swal from 'sweetalert2';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzSelectModule } from 'ng-zorro-antd/select';
import * as XLSX from 'xlsx';
import { DoctorService } from 'app/services/config/doctors.service';

@Component({
  selector: 'app-products',
  standalone: true,
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
  ],
  templateUrl: './doctor.component.html',
  styleUrls: ['./doctor.component.css', '../../../../animations/styles.css'],
})
export class DoctorComponent {
  form: UntypedFormGroup;
  isDataLoading = false;
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
      email: [null, [Validators.required, Validators.email]],
      phone: [null, [Validators.required, Validators.pattern(/^(?!\s*$).+/)]],
      last_name: [null, [Validators.required, Validators.pattern(/^(?!\s*$).+/)]],
      first_name: [null, [Validators.required, Validators.pattern(/^(?!\s*$).+/)]],
      supplier: [null, [Validators.required]],
    });

    this.searchNameSubject.pipe(debounceTime(1000)).subscribe(({ type, value }) => {
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
  }

  getSuppliers() {
    this.doctorService.getSuppliers({}, 1, 1, true).subscribe({
      next: (res: any) => {
        this.suppliers = res;
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
          last_name: this.lastSearch
        },
        this.page,
        this.page_size
      )
      .subscribe({
        next: (res: any) => {
          this.isDataLoading = false;
          this.dataToDisplay = res.results;

          const isSearching = this.licenseSearch || this.firstSearch || this.lastSearch;

          if (isSearching && (!res.results || res.results.length === 0)) {
            this.msgService.warning(JSON.stringify('No results found matching your search criteria'));
          }

          this.setPagination(res.total);
        },
        error: (err) => {
          this.isDataLoading = false;
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
    this.drawerLoader = false;
    this.isUpdating = false;
    this.visible = false;
    this.dataDrawerCache = null;
    this.drawerTitle = '';
    this.form.reset();
  }

  delete(id: number) {
    Swal.fire({
      title: 'Are you sure to delete?',
      showDenyButton: true,
      confirmButtonText: 'Yes',
      denyButtonText: `No`,
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        this.isDataLoading = true;
        this.doctorService.delete(id).subscribe({
          next: () => {
            this.msgService.success(JSON.stringify('Doctor deleted successfully'));
            this.isDataLoading = false;

            if (this.dataToDisplay.length === 1 && this.page > 1) {
              this.page--;
            }

            this.getInitData();
          },
          error: (err) => {
            this.isDataLoading = false;
            this.msgService.error(JSON.stringify(err.error));
          },
        });
      }
    });
  }

  update(id: number, data: any) {
    this.isDataLoading = true;
    this.doctorService.update(id, data).subscribe({
      next: () => {
        this.msgService.success(JSON.stringify('Doctor updated successfully'));
        this.isDataLoading = false;
        this.closeDrawer();
        this.getInitData();
      },
      error: (err) => {
        this.drawerLoader = false;
        this.isDataLoading = false;
        this.msgService.error(JSON.stringify(err.error));
      },
    });
  }

  submit() {
    if (this.form.valid) {
      this.drawerLoader = true;
      if (this.isUpdating) {
        return this.update(this.dataDrawerCache.id, this.form.value);
      }
      this.doctorService.create(this.form.value).subscribe({
        next: () => {
          this.msgService.success(JSON.stringify('New Doctor created'));
          this.isDataLoading = false;
          this.getInitData();
          this.closeDrawer();
        },
        error: (err) => {
          this.drawerLoader = false;
          this.isDataLoading = false;
          this.msgService.error(JSON.stringify(err.error));
        },
      });
    } else {
      Object.values(this.form.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  changeStatus(id: number, data: any) {
    delete data.store_data;
    this.update(id, data);
  }

  search(value: string, type: string) {
    this.isDataLoading = true;
    this.searchNameSubject.next({ type, value });
  }

  pageChange(event: number) {
    this.page = event;
    this.getInitData();
  }

  setPagination(count: number) {
    this.count_records = count;
    this.num_pages = Math.ceil(count / this.page_size);
  }

  exportDoctors(): void {
    if (this.dataToDisplay.length === 0) {
      this.msgService.warning(JSON.stringify('No data available to export'));
      return;
    }

    this.isDataLoading = true;

    const headers = {
      name: 'Doctor',
      created: 'Created',
      active: 'Status',
    } as const;

    const selectedColumns = Object.keys(headers) as (keyof typeof headers)[];

    const filteredData = this.dataToDisplay.map((product) =>
      selectedColumns.reduce((obj: Record<string, any>, key) => {
        if (key === 'active') {
          obj[headers[key]] = product[key] ? 'Active' : 'Inactive';
        } else if (key === 'created') {
          const date = new Date(product[key]);
          obj[headers[key]] = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });
        } else {
          obj[headers[key]] = product[key];
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

    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', 'Doctors.xlsx');
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.isDataLoading = false;

    this.msgService.success(JSON.stringify('Export completed successfully'));
  }
}
