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
  styleUrl: './offices.component.css',
})
export class OfficesComponent {
  constructor(
    private fb: UntypedFormBuilder,
    private officeService: OfficesService,
    private storeServices: StoresService,
    private msgService: NzMessageService
  ) {
    this.form = this.fb.group({
      store: [null, [Validators.required]],
      name: [null, [Validators.required]],
    });
    this.searchNameSubject
      .pipe(debounceTime(2000))
      .subscribe((data: { type: string; value: string }) => {
        // Aquí puedes realizar una acción después de que ha pasado el tiempo de debounce
        if (data.type == 'description') {
          this.nameSearch = data.value;
        }

        this.getInitData();
      });
  }

  ngOnInit(): void {
    this.getInitData();
    this.getStores();
  }
  // searches
  private searchNameSubject: Subject<{
    type: string;
    value: string;
  }> = new Subject<{ type: string; value: string }>();
  nameSearch: any = null;

  // Table
  isDataLoading = false;
  dataToDisplay: any[] = [];

  // Form
  form: UntypedFormGroup;

  // Drawer
  visible = false;
  drawerLoader = false;
  drawerTitle = '';
  dataDrawerCahe: any;
  isUpdating = false;

  // Paginator search vars
  num_pages: number = 1;
  count_records: number = 0;
  page_size: number = 10;
  page: number = 1;

  stores: any[] = [];

  getInitData() {
    this.isDataLoading = true;
    this.officeService
      .get(
        {
          name: this.nameSearch,
        },
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
          console.log(err);

          this.msgService.error(JSON.stringify(err.error));
        },
      });
  }

  getStores() {
    this.storeServices.get({ status: 1 }, 1, 1, true).subscribe({
      next: (res: any) => {
        this.stores = res;
      },
      error: (err) => {
        console.log(err);

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

  delete(id: number) {
    Swal.fire({
      title: 'Are you sure to delete?',
      showDenyButton: true,
      // showCancelButton: true,
      confirmButtonText: 'Yes',
      denyButtonText: `No`,
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        this.isDataLoading = true;
        this.officeService.delete(id).subscribe({
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

  update(id: number, data: any) {
    this.isDataLoading = true;
    this.officeService.update(id, data).subscribe({
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

  submit() {
    if (this.form.valid) {
      this.drawerLoader = true;
      if (this.isUpdating) {
        return this.update(this.dataDrawerCahe.id, this.form.value);
      }

      this.officeService.create(this.form.value).subscribe({
        next: (res: any) => {
          this.msgService.success('New Speciality created');
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
  // searches
  search(value: string, type: string) {
    this.searchNameSubject.next({
      type,
      value,
    });
  }
  pageChange(event: number) {
    this.page = event;
    this.getInitData();
  }
  setPagination(count: number) {
    this.count_records = count;
    this.num_pages = Math.ceil(this.count_records / this.page_size);
  }
}
