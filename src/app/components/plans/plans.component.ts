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
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTableModule } from 'ng-zorro-antd/table';
import { debounceTime, Subject } from 'rxjs';
import { PlanService } from 'app/services/insurers/plan.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { InsurersService } from 'app/services/insurers/insurers.service';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { SubplansComponent } from 'app/components/subplans/subplans.component';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { finalize } from 'rxjs/operators';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-plans',
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
    NzModalModule,
    SubplansComponent,
    NzEmptyModule
  ],
  templateUrl: './plans.component.html',
  styleUrls: ['./plans.component.css', '/src/animations/styles.css']
})
export class PlansComponent implements OnInit {
  form: UntypedFormGroup;
  nameSearch: any = null;
  insurerSearch: any = null;
  isDataLoading = false;
  exportLoader = false;
  dataToDisplay: any[] = [];
  num_pages = 1;
  count_records = 0;
  page_size = 10;
  page = 1;
  visible = false;
  drawerLoader = false;
  drawerTitle = '';
  dataDrawerCahe: any;
  isUpdating = false;
  isVisibleModal = false;
  dataCacheModal: any;
  insurers: any[] = [];
  [key: string]: any;
  searchFields = [
    { placeholder: 'Name...', model: 'nameSearch', key: 'name' },
    { placeholder: 'Insurer...', model: 'insurerSearch', key: 'insurer' }
  ];
  private searchNameSubject = new Subject<{ type: string; value: string }>();

  constructor(
    private fb: UntypedFormBuilder,
    private planService: PlanService,
    private msgService: NzMessageService,
    private insurerService: InsurersService
  ) {
    this.form = this.fb.group({
      insurer: [null, [Validators.required]],
      name: [null, [Validators.required, Validators.pattern(/^(?!\s*$).+/)]],
    });

    this.searchNameSubject.pipe(debounceTime(1000)).subscribe((data) => {
      if (data.type === 'name') this.nameSearch = data.value;
      if (data.type === 'insurer') this.insurerSearch = data.value;
      this.page = 1;
      this.getInitData();
      this.isDataLoading = false;
    });
  }

  ngOnInit(): void {
    this.getInitData();
    this.getInsurers();
  }

  getInitData(): void {
    this.isDataLoading = true;
    this.planService
      .getPlans(
        {
          name: this.nameSearch,
          insurer: this.insurerSearch
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

  getInsurers(): void {
    this.insurerService.getInsurers({ active: 1 }, null, null, true)
      .subscribe({
        next: (res: any) => {
          this.insurers = res;
        },
        error: (err) => {
          this.msgService.error(JSON.stringify(err.error));
        },
      });
  }

  openDrawer(): void {
    this.visible = true;
    this.drawerTitle = 'New Coverage';
  }

  openEditDrawer(data: any): void {
    this.visible = true;
    this.isUpdating = true;
    this.drawerTitle = 'Edit Coverage';
    this.dataDrawerCahe = data;
    this.form.patchValue({ ...data });
  }

  closeDrawer(): void {
    this.isUpdating = false;
    this.visible = false;
    this.dataDrawerCahe = null;
    this.drawerTitle = '';
    this.form.reset();
  }

  delete(id: number): void {
    Swal.fire({
      text: 'Are you sure you want to delete this coverage?',
      icon: 'warning',
      showDenyButton: true,
      confirmButtonText: 'Yes',
      denyButtonText: 'No',
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        this.isDataLoading = true;
        this.planService.deletePlan(id)
          .pipe(finalize(() => {
            this.isDataLoading = false;
          }))
          .subscribe({
            next: () => {
              this.msgService.success('Coverage deleted successfully');

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

  update(id: number, data: any): void {
    this.planService.updatePlan(id, data)
      .pipe(finalize(() => {
        this.drawerLoader = false;
      }))
      .subscribe({
        next: () => {
          this.msgService.success('Coverage updated successfully');
          this.closeDrawer();
          this.getInitData();
        },
        error: (err) => {
          this.msgService.error(JSON.stringify(err.error));
        },
      });
  }

  submit(): void {
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
      return this.update(this.dataDrawerCahe.id, this.form.value);
    }

    this.planService.createPlan(this.form.value)
      .pipe(finalize(() => {
        this.drawerLoader = false;
      }))
      .subscribe({
        next: () => {
          this.msgService.success('Coverage created successfully');
          this.getInitData();
          this.closeDrawer();
        },
        error: (err) => {
          this.msgService.error(JSON.stringify(err.error));
        },
      });
  }

  changeStatus(id: number, data: any): void {
    const { insurer_data, ...filteredData } = data;
    this.update(id, filteredData);
  }

  search(value: string, type: string) {
    this.isDataLoading = true;
    this.searchNameSubject.next({ type, value });
  }

  pageChange(event: number): void {
    this.page = event;
    this.getInitData();
  }

  setPagination(count: number): void {
    this.count_records = count;
    this.num_pages = Math.ceil(this.count_records / this.page_size);
  }

  openModal(data: any): void {
    this.isVisibleModal = true;
    this.dataCacheModal = data;
  }

  handleCancelModal(): void {
    this.isVisibleModal = false;
    this.dataCacheModal = null;
  }

  handleOkModal(): void {
    this.handleCancelModal();
  }

  pageSizeChange(pageSize: number): void {
    this.page_size = pageSize;
    this.page = 1;
    this.getInitData();
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

  exportCoverages(): void {
    this.planService
      .getPlans({}, null, null, true)
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
            insurer_name: 'Insurer',
            name: 'Coverage',
            created: 'Created',
            active: 'Status',
          };

          const selectedColumns = Object.keys(headers) as (keyof typeof headers)[];

          const filteredData = res.map((coverage: any) =>
            selectedColumns.reduce((obj: Record<string, any>, key) => {
              if (key === 'active') {
                obj[headers[key]] = coverage[key] ? 'Active' : 'Inactive';
              } else if (key === 'created') {
                const date = new Date(coverage[key]);
                obj[headers[key]] = date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });
              } else if (key === 'insurer_name') {
                obj[headers[key]] = coverage.insurer_data?.name;
              } else {
                obj[headers[key]] = coverage[key];
              }
              return obj;
            }, {})
          );

          const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(filteredData);
          const workbook: XLSX.WorkBook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(workbook, worksheet, 'Coverages');

          const excelBuffer: ArrayBuffer = XLSX.write(workbook, {
            bookType: 'xlsx',
            type: 'array',
          });

          const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
          const link = document.createElement('a');
          const url = URL.createObjectURL(blob);

          link.setAttribute('href', url);
          link.setAttribute('download', 'Coverages.xlsx');
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