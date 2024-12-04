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
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTableModule } from 'ng-zorro-antd/table';
import { debounceTime, Subject } from 'rxjs';
import { PlanService } from '../../services/insurers/plan.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import Swal from 'sweetalert2';
import { InsurersService } from '../../services/insurers/insurers.service';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { SubplansComponent } from '../subplans/subplans.component';

@Component({
  selector: 'app-plans',
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
    NzModalModule,
    SubplansComponent,
  ],
  templateUrl: './plans.component.html',
  styleUrls: ['./plans.component.css', '../../../animations/styles.css'],
})
export class PlansComponent implements OnInit {
  form: UntypedFormGroup;
  nameSearch: any = null;
  insurerSearch: any = null;
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
  isVisibleModal = false;
  dataCacheModal: any;
  insurers: any[] = [];
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
    this.searchNameSubject.pipe(debounceTime(2000)).subscribe((data) => {
      if (data.type === 'name') this.nameSearch = data.value;
      if (data.type === 'insurer') this.insurerSearch = data.value;
      this.page = 1;
      this.getInitData();
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
        { name: this.nameSearch, insurer: this.insurerSearch },
        this.page,
        this.page_size
      )
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
        this.planService.deletePlan(id).subscribe({
          next: () => {
            this.msgService.success('Coverage deleted successfully');
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
    this.planService.updatePlan(id, data).subscribe({
      next: () => {
        this.msgService.success('Coverage updated successfully');
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
      this.planService.createPlan(this.form.value).subscribe({
        next: () => {
          this.msgService.success('New Coverage created');
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
    delete data.insurer_data;
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
}
