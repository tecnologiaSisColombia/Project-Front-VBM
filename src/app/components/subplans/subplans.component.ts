import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
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
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTableModule } from 'ng-zorro-antd/table';
import { PlanService } from '../../services/insurers/plan.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { debounceTime, Subject } from 'rxjs';
import Swal from 'sweetalert2';
import { SubplanService } from '../../services/insurers/subplan.service';

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
  ],
  templateUrl: './subplans.component.html',
  styleUrl: './subplans.component.css',
})
export class SubplansComponent implements OnInit {
  form: UntypedFormGroup;
  plans: any[] = [];
  isDataLoading = false;
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
      name: [null, [Validators.required, Validators.pattern(/^(?!\s*$).+/)]],
      group: [null, [Validators.required, Validators.pattern(/^(?!\s*$).+/)]],
      plan_contract: [null, [Validators.required, Validators.pattern(/^(?!\s*$).+/)]],
      visual_test_medicare: [null, [Validators.required]],
      visual_surgery_medicare: [null, [Validators.required]],
      routine_visual_test: [null, [Validators.required]],
      vision_elements: [null, [Validators.required]],
    });

    this.searchNameSubject.pipe(debounceTime(2000)).subscribe((data) => {
      if (data.type === 'name') this.nameSearch = data.value;
      if (data.type === 'plan') this.planSearch = data.value;
      if (data.type === 'group') this.groupSearch = data.value;
      if (data.type === 'planContract') this.planContractSearch = data.value;

      this.page = 1;
      this.getInitData();
    });
  }

  ngOnInit(): void {
    this.getInitData();
    this.getPlans();
  }

  getInitData(): void {
    this.isDataLoading = true;
    this.subplanService
      .getSubPlans(this.planData.id, {
        name: this.nameSearch,
        plan: this.planSearch,
        group: this.groupSearch,
        plan_contract: this.planContractSearch,
      })
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

  getPlans(): void {
    this.planService.getPlans({ status: 1 }, 1, 1, true).subscribe({
      next: (res: any) => {
        this.plans = res;
      },
      error: (err) => {
        this.msgService.error(JSON.stringify(err.error));
      },
    });
  }

  openDrawer(): void {
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
    this.drawerLoader = false;
    this.isUpdating = false;
    this.visible = false;
    this.dataDrawerCahe = null;
    this.drawerTitle = '';
    this.form.reset();
  }

  delete(id: number): void {
    Swal.fire({
      title: 'Are you sure to delete?',
      showDenyButton: true,
      confirmButtonText: 'Yes',
      denyButtonText: 'No',
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        this.isDataLoading = true;
        this.subplanService.deleteSubPlan(id).subscribe({
          next: (res: any) => {
            this.msgService.success(res);
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

  update(id: number, data: any): void {
    this.isDataLoading = true;
    this.subplanService.updateSubPlan(id, data).subscribe({
      next: (res: any) => {
        this.msgService.success(res);
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

  submit(): void {
    if (this.form.valid) {
      this.drawerLoader = true;
      if (this.isUpdating) {
        return this.update(this.dataDrawerCahe.id, this.form.value);
      }
      this.subplanService.createSubPlan(this.form.value).subscribe({
        next: () => {
          this.msgService.success('New Subplan created');
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

  changeStatus(id: number, data: any): void {
    delete data.plan_data;
    this.update(id, data);
  }

  search(value: string, type: string) {
    this.isDataLoading = true;
    this.searchNameSubject.next({ type, value });
    this.searchNameSubject.pipe(debounceTime(2000)).subscribe({
      next: () => {
        this.isDataLoading = false;
      },
      error: () => {
        this.isDataLoading = false;
        this.msgService.error('Error during search');
      },
    });
  }

  pageChange(event: number): void {
    this.page = event;
    this.getInitData();
  }

  setPagination(count: number): void {
    this.count_records = count;
    this.num_pages = Math.ceil(this.count_records / this.page_size);
  }
}
