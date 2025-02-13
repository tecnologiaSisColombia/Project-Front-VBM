import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
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
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTableModule } from 'ng-zorro-antd/table';
import { PlanService } from 'app/services/insurers/plan.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { debounceTime, Subject } from 'rxjs';
import Swal from 'sweetalert2';
import { SubplanService } from 'app/services/insurers/subplan.service';
import * as XLSX from 'xlsx';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-subplans',
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
    NzEmptyModule,
  ],
  templateUrl: './subplans.component.html',
  styleUrl: './subplans.component.css',
})
export class SubplansComponent implements OnInit {
  form: UntypedFormGroup;
  plans: any[] = [];
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
  nameSearch: any = null;
  planSearch: any = null;
  groupSearch: any = null;
  planContractSearch: any = null;
  [key: string]: any;
  searchFields = [
    { placeholder: 'Name...', model: 'nameSearch', key: 'name' },
    { placeholder: 'Plan...', model: 'planSearch', key: 'plan' },
    { placeholder: 'Group...', model: 'groupSearch', key: 'group' },
    { placeholder: 'Plan Contract...', model: 'planContractSearch', key: 'plan_contract' }

  ];
  private searchNameSubject = new Subject<{ type: string; value: string }>();
  @Input() planData: any;

  constructor(
    private fb: UntypedFormBuilder,
    private planService: PlanService,
    private subplanService: SubplanService,
    private msgService: NzMessageService
  ) {
    this.form = this.fb.group({
      plan: [null, [Validators.required]],
      pds: [null, [Validators.required]],
      name: [null, [Validators.required, Validators.pattern(/^(?!\s*$).+/)]],
      group: [null, [Validators.required, Validators.pattern(/^(?!\s*$).+/)]],
      plan_contract: [null, [Validators.required, Validators.pattern(/^(?!\s*$).+/)]],
      visual_test_medicare: [null, [Validators.required]],
      visual_surgery_medicare: [null, [Validators.required]],
      routine_visual_test: [null, [Validators.required]],
      routine_visual_test_benefit: [null],
      vision_elements: [null, [Validators.required]],
      vision_elements_benefit: [null],
    });

    this.searchNameSubject.pipe(debounceTime(1000)).subscribe((data) => {
      if (data.type === 'name') this.nameSearch = data.value;
      if (data.type === 'plan') this.planSearch = data.value;
      if (data.type === 'group') this.groupSearch = data.value;
      if (data.type === 'planContract') this.planContractSearch = data.value;
      this.page = 1;
      this.getInitData();
      this.isDataLoading = false;
    });
  }

  ngOnInit(): void {
    this.getInitData();
    this.getPlans();
  }

  getInitData(): void {
    this.isDataLoading = true;
    this.subplanService
      .getSubPlans(
        this.planData.id,
        {
          name: this.nameSearch,
          plan: this.planSearch,
          group: this.groupSearch,
          plan_contract: this.planContractSearch,
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

  getPlans(): void {
    this.planService.getPlans({ status: 1 }, null, null, true).subscribe({
      next: (res: any) => {
        this.plans = res;
      },
      error: (err) => {
        this.msgService.error(JSON.stringify(err.error));
      },
    });
  }

  openDrawer(): void {
    this.form.patchValue({ plan: this.planData.id });
    this.visible = true;
    this.drawerTitle = 'New Subplan';
  }

  openEditDrawer(data: any): void {
    this.visible = true;
    this.isUpdating = true;
    this.drawerTitle = 'Edit Subplan';
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
      text: 'Are you sure you want to delete this subplan?',
      icon: 'warning',
      showDenyButton: true,
      confirmButtonText: 'Yes',
      denyButtonText: 'No',
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        this.isDataLoading = true;
        this.subplanService.deleteSubPlan(id)
          .pipe(finalize(() => {
            this.isDataLoading = false;
          }))
          .subscribe({
            next: () => {
              this.msgService.success('Subplan deleted successfully');

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
    this.isDataLoading = true;
    this.subplanService.updateSubPlan(id, data)
      .pipe(finalize(() => {
        this.isDataLoading = false;
      }))
      .subscribe({
        next: () => {
          this.msgService.success('Subplan updated successfully');
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

    if (this.isUpdating) {
      return this.update(this.dataDrawerCahe.group, this.form.value);
    }

    this.drawerLoader = true;

    this.subplanService.createSubPlan(this.form.value)
      .pipe(finalize(() => {
        this.drawerLoader = false;
      }))
      .subscribe({
        next: () => {
          this.msgService.success('Subplan created successfully');
          this.getInitData();
          this.closeDrawer();
        },
        error: (err) => {
          this.msgService.error(JSON.stringify(err.error));
        },
      });
  }

  changeStatus(id: number, data: any): void {
    delete data.plan_data;
    this.update(id, data);
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

  exportSubplans(): void {
    this.subplanService
      .getSubPlans(this.planData.id, {}, null, null, true)
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
            plan_data: 'Plan',
            name: 'Subplan',
            group: 'Group',
            plan_contract: 'Plan Contract',
            visual_test_medicare: 'Visual Test Medicare',
            visual_surgery_medicare: 'Visual Surgery Medicare',
            routine_visual_test: 'Routine Visual Test',
            vision_elements: 'Vision Elements',
            created: 'Created',
            active: 'Status',
          };

          const formatData = (data: any[], headers: Record<string, string>) =>
            data.map((subplan) =>
              Object.keys(headers).reduce((obj: Record<string, any>, key) => {
                if (key === 'active') {
                  obj[headers[key]] = subplan[key] ? 'Active' : 'Inactive';
                } else if (key === 'created') {
                  const date = new Date(subplan[key]);
                  obj[headers[key]] = date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });
                } else if (key === 'plan_data') {
                  obj[headers[key]] = subplan.plan_data?.name || 'Unknown';
                } else {
                  obj[headers[key]] = subplan[key];
                }
                return obj;
              }, {})
            );

          const subplansData = formatData(res, headers);

          const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(subplansData);
          const workbook: XLSX.WorkBook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(workbook, worksheet, 'Subplans');

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
          link.setAttribute('download', 'Subplans.xlsx');
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
