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
import { StoresService } from 'app/services/config/stores.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-stores',
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
  ],
  templateUrl: './stores.component.html',
  styleUrls: ['./stores.component.css', '../../../../animations/styles.css'],
})
export class StoresComponent implements OnInit {
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
  nameSearch: any = null;
  private searchNameSubject = new Subject<{ type: string; value: string }>();

  constructor(
    private fb: UntypedFormBuilder,
    private storesService: StoresService,
    private msgService: NzMessageService
  ) {
    this.form = this.fb.group({
      name: [
        null,
        [
          Validators.required,
          Validators.pattern(/^(?!\s*$).+/)
        ]
      ],
    });

    this.searchNameSubject.pipe(debounceTime(2000)).subscribe((data) => {
      if (data.type === 'description') {
        this.nameSearch = data.value;
      }
      this.page = 1;
      this.getInitData();
    });
  }

  ngOnInit(): void {
    this.getInitData();
  }

  getInitData() {
    this.isDataLoading = true;
    this.storesService
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

  openDrawer(): void {
    this.visible = true;
    this.drawerTitle = 'New Store';
  }

  openEditDrawer(data: any): void {
    this.visible = true;
    this.isUpdating = true;
    this.drawerTitle = 'Edit Store';
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
        this.storesService.delete(id).subscribe({
          next: () => {
            this.msgService.success('Store deleted successfully');
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
    this.storesService.update(id, data).subscribe({
      next: () => {
        this.msgService.success('Store updated successfully');
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
      this.storesService.create(this.form.value).subscribe({
        next: () => {
          this.msgService.success('New Store created');
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
    this.update(id, data);
  }

  search(value: string, type: string) {
    this.isDataLoading = true;
    this.searchNameSubject.next({ type, value });
    this.searchNameSubject.pipe(debounceTime(2000)).subscribe({
      next: () => {
        this.isDataLoading = false;
      },
      error: (err) => {
        this.isDataLoading = false;
        this.msgService.error(JSON.stringify(err.error));
      },
    });
  }

  pageChange(event: number) {
    this.page = event;
    this.getInitData();
  }

  setPagination(count: number) {
    this.count_records = count;
    this.num_pages = Math.ceil(count / this.page_size);
  }

  exportStores(): void {
    if (this.dataToDisplay.length === 0) {
      this.msgService.warning('No data available to export');
      return;
    }

    this.isDataLoading = true;

    const headers = {
      name: 'Store',
      created: 'Created',
      active: 'Status',
    } as const;

    const selectedColumns = Object.keys(headers) as (keyof typeof headers)[];

    const filteredData = this.dataToDisplay.map(store =>
      selectedColumns.reduce((obj: Record<string, any>, key) => {
        if (key === 'active') {
          obj[headers[key]] = store[key] ? 'Active' : 'Inactive';
        } else if (key === 'created') {
          const date = new Date(store[key]);
          obj[headers[key]] = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });
        } else {
          obj[headers[key]] = store[key];
        }
        return obj;
      }, {})
    );

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(filteredData);

    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Stores');

    const excelBuffer: ArrayBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', 'Stores.xlsx');
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.isDataLoading = false;
  }
}
