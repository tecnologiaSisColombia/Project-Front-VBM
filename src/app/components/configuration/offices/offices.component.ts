import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
import { OfficesService } from 'app/services/config/offices.service';
import { StoresService } from 'app/services/config/stores.service';
import { NzSelectModule } from 'ng-zorro-antd/select';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-offices',
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
  templateUrl: './offices.component.html',
  styleUrls: ['./offices.component.css', '../../../../animations/styles.css'],
})
export class OfficesComponent implements OnInit {
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
  nameSearch: any = null;
  private searchNameSubject = new Subject<{ type: string; value: string }>();

  constructor(
    private fb: UntypedFormBuilder,
    private officeService: OfficesService,
    private storeService: StoresService,
    private msgService: NzMessageService
  ) {
    this.form = this.fb.group({
      store: [null, [Validators.required]],
      name: [null, [Validators.required, Validators.pattern(/^(?!\s*$).+/)],
      ],
    });

<<<<<<< HEAD
    this.searchNameSubject.pipe(debounceTime(1000)).subscribe((data) => {
=======
    this.searchNameSubject.pipe(debounceTime(2000)).subscribe((data) => {
>>>>>>> 1976f3141f4c055ce9e3693483ee1ae5a8ec0c91
      if (data.type === 'description') {
        this.nameSearch = data.value;
      }
      this.page = 1;
      this.getInitData();
<<<<<<< HEAD
      this.isDataLoading = false;
=======
>>>>>>> 1976f3141f4c055ce9e3693483ee1ae5a8ec0c91
    });
  }

  ngOnInit(): void {
    this.getInitData();
    this.getStores();
  }

  getInitData() {
    this.isDataLoading = true;
    this.officeService
      .get({ name: this.nameSearch }, this.page, this.page_size)
      .subscribe({
        next: (res: any) => {
          this.isDataLoading = false;
          this.dataToDisplay = res.results;
          this.setPagination(res.total);
        },
        error: (err) => {
          this.isDataLoading = false;
          this.msgService.error(JSON.stringify(err.error));
        },
      });
  }

  getStores() {
    this.storeService.get({ status: 1 }, 1, 1, true).subscribe({
      next: (res: any) => (this.stores = res),
      error: (err) => this.msgService.error(JSON.stringify(err.error)),
    });
  }

  openDrawer(): void {
    this.visible = true;
    this.drawerTitle = 'New Office';
  }

  openEditDrawer(data: any): void {
    this.visible = true;
    this.isUpdating = true;
    this.drawerTitle = 'Edit Office';
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
        this.officeService.delete(id).subscribe({
          next: () => {
            this.msgService.success(JSON.stringify('Office deleted successfully'));
            this.isDataLoading = false;
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
    this.officeService.update(id, data).subscribe({
      next: () => {
        this.msgService.success(JSON.stringify('Office updated successfully'));
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
      this.officeService.create(this.form.value).subscribe({
        next: () => {
          this.msgService.success(JSON.stringify('New office created'));
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
<<<<<<< HEAD
=======
    this.searchNameSubject.pipe(debounceTime(2000)).subscribe({
      next: () => {
        this.isDataLoading = false;
      },
      error: (err) => {
        this.isDataLoading = false;
        this.msgService.error(JSON.stringify(err.error));
      },
    });
>>>>>>> 1976f3141f4c055ce9e3693483ee1ae5a8ec0c91
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

  exportOffices(): void {
    if (this.dataToDisplay.length === 0) {
      this.msgService.warning(JSON.stringify('No data available to export'));
      return;
    }

    this.isDataLoading = true;

    const headers = {
      name: 'Office',
      created: 'Created',
      active: 'Status',
    } as const;

    const selectedColumns = Object.keys(headers) as (keyof typeof headers)[];

    const filteredData = this.dataToDisplay.map(office =>
      selectedColumns.reduce((obj: Record<string, any>, key) => {
        if (key === 'active') {
          obj[headers[key]] = office[key] ? 'Active' : 'Inactive';
        } else if (key === 'created') {
          const date = new Date(office[key]);
          obj[headers[key]] = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });
        } else {
          obj[headers[key]] = office[key];
        }
        return obj;
      }, {})
    );

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(filteredData);

    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Offices');

    const excelBuffer: ArrayBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', 'Offices.xlsx');
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.isDataLoading = false;

    this.msgService.success(JSON.stringify('Export completed successfully'));
  }
}
