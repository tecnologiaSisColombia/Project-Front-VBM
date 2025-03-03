import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
  AbstractControl
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
import { LocalityService } from 'app/services/config/localities.service';
import * as XLSX from 'xlsx';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'app-localities',
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
        NzEmptyModule
    ],
    templateUrl: './localities.component.html',
    styleUrls: ['./localities.component.css', '/src/animations/styles.css']
})
export class LocalitiesComponent implements OnInit {
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
  nameSearch: any = null;
  private searchNameSubject = new Subject<{ type: string; value: string }>();

  constructor(
    private fb: UntypedFormBuilder,
    private localitiesService: LocalityService,
    private msgService: NzMessageService
  ) {
    this.form = this.fb.group({
      name: [null, [Validators.required, Validators.pattern(/^(?!\s*$).+/)]],
      address: [null, [Validators.required, Validators.pattern(/^(?!\s*$).+/)]],
      phone: [null, [Validators.required, Validators.pattern(/^(?!\s*$).+/)]],
      postal_code: [null, [Validators.required, Validators.pattern(/^(?!\s*$).+/)]],
      state: [null, [Validators.required, Validators.pattern(/^(?!\s*$).+/)]],
    });

    this.searchNameSubject.pipe(debounceTime(1000)).subscribe((data) => {
      if (data.type === 'description') {
        this.nameSearch = data.value;
      }
      this.page = 1;
      this.getInitData();
      this.isDataLoading = false;
    });
  }

  ngOnInit(): void {
    this.getInitData();
  }

  getInitData() {
    this.isDataLoading = true;
    this.localitiesService
      .get(
        {
          name: this.nameSearch
        },
        this.page,
        this.page_size
      )
      .pipe(finalize(() => {
        this.isDataLoading = false;
      }))
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
    this.drawerTitle = 'New Locality';
  }

  openEditDrawer(data: any): void {
    this.visible = true;
    this.isUpdating = true;
    this.drawerTitle = 'Edit Locality';
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
      text: 'Are you sure you want to delete this locality?',
      icon: 'warning',
      showDenyButton: true,
      confirmButtonText: 'Yes',
      denyButtonText: `No`,
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        this.isDataLoading = true;
        this.localitiesService.delete(id)
          .pipe(finalize(() => {
            this.isDataLoading = false;
          }))
          .subscribe({
            next: () => {
              this.msgService.success('Locality deleted successfully');

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

  update(id: number, data: any) {
    this.localitiesService.update(id, data)
      .pipe(finalize(() => {
        this.drawerLoader = false;
      }))
      .subscribe({
        next: () => {
          this.msgService.success('Locality updated successfully');
          this.closeDrawer();
          this.getInitData();
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
      return this.update(this.dataDrawerCache.id, this.form.value);
    }

    this.localitiesService.create(this.form.value)
      .pipe(finalize(() => {
        this.drawerLoader = false;
      }))
      .subscribe({
        next: () => {
          this.msgService.success('Locality created successfully');
          this.getInitData();
          this.closeDrawer();
        },
        error: (err) => {
          this.msgService.error(JSON.stringify(err.error));
        },
      });
  }

  changeStatus(id: number, data: any) {
    this.update(id, data);
  }

  search(value: string, type: string) {
    this.isDataLoading = true;
    this.searchNameSubject.next({ type, value });
  }

  pageSizeChange(pageSize: number): void {
    this.page_size = pageSize;
    this.page = 1;
    this.getInitData();
  }

  pageChange(event: number) {
    this.page = event;
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

    return null;
  }

  hasFeedback(controlName: string): boolean {
    const control = this.form.get(controlName);
    return control?.invalid && (control.dirty || control.touched) ? true : false;
  }

  exportLocalities(): void {
    this.localitiesService
      .get({}, null, null, true)
      .pipe(finalize(() => {
        this.exportLoader = false;
      }))
      .subscribe({
        next: (res: any) => {
          if (res.length === 0) {
            this.msgService.warning('No data available to export');
            return;
          }

          this.exportLoader = true;

          const headers = {
            name: 'Localities',
            created: 'Created',
            active: 'Status',
          };

          const selectedColumns = Object.keys(headers) as (keyof typeof headers)[];

          const filteredData = res.map((product: any) =>
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
          XLSX.utils.book_append_sheet(workbook, worksheet, 'Localities');

          const excelBuffer: ArrayBuffer = XLSX.write(workbook, {
            bookType: 'xlsx',
            type: 'array',
          });

          const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
          const link = document.createElement('a');
          const url = URL.createObjectURL(blob);

          link.setAttribute('href', url);
          link.setAttribute('download', 'Localities.xlsx');
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