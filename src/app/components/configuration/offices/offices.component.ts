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

  private searchNameSubject = new Subject<{ type: string; value: string }>();
  nameSearch: any = null;

  constructor(
    private fb: UntypedFormBuilder,
    private officeService: OfficesService,
    private storeService: StoresService,
    private msgService: NzMessageService
  ) {
    this.form = this.fb.group({
      store: [null, [Validators.required]],
      name: [null, [Validators.required]],
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
        this.officeService.delete(id).subscribe({
          next: () => {
            this.msgService.success('Office deleted successfully');
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
        this.msgService.success('Office updated successfully');
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
      this.form.markAllAsTouched();
    }
  }

  changeStatus(id: number, data: any) {
    delete data.store_data;
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
        this.msgService.error('Error during search');
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
}
