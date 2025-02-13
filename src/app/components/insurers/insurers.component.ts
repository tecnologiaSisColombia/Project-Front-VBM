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
import { InsurersService } from 'app/services/insurers/insurers.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { debounceTime, Subject } from 'rxjs';
import Swal from 'sweetalert2';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import * as XLSX from 'xlsx';
import { ProductsService } from 'app/services/config/products.service';
import { ServicesService } from 'app/services/config/services.service';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-insurers',
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
    NzEmptyModule,
  ],
  templateUrl: './insurers.component.html',
  styleUrls: ['./insurers.component.css', '/src/animations/styles.css'],
})
export class InsurersComponent implements OnInit {
  form: UntypedFormGroup;
  nameSearch: any = null;
  addresSearch: any = null;
  phoneSearch: any = null;
  payerIdSearch: any = null;
  isDataLoading = false;
  dataToDisplay: any[] = [];
  visible = false;
  drawerLoader = false;
  exportLoader = false;
  drawerTitle = '';
  dataDrawerCahe: any;
  isUpdating = false;
  num_pages = 1;
  count_records = 0;
  page_size = 10;
  page = 1;
  services: any[] = [];
  products: any[] = [];
  isVisibleCatalog: boolean = false;
  dataCatalog: any;
  [key: string]: any;
  searchFields = [
    { placeholder: 'Name...', model: 'nameSearch', key: 'name' },
    { placeholder: 'Address...', model: 'addresSearch', key: 'address' },
    { placeholder: 'Phone...', model: 'phoneSearch', key: 'phone' },
    { placeholder: 'Payer ID...', model: 'payerIdSearch', key: 'payer_id' },
  ];
  private searchNameSubject: Subject<{ type: string; value: string }> = new Subject();

  constructor(
    private fb: UntypedFormBuilder,
    private insurerService: InsurersService,
    private msgService: NzMessageService,
    private productService: ProductsService,
    private serviceService: ServicesService
  ) {
    this.form = this.fb.group({
      services: [null, [Validators.required]],
      products: [null, [Validators.required]],
      payer_id: [null, [Validators.required, Validators.pattern(/^(?!\s*$).+/)]],
      phone: [null, [Validators.required, Validators.pattern(/^(?!\s*$).+/)]],
      address: [null, [Validators.required, Validators.pattern(/^(?!\s*$).+/)]],
      name: [null, [Validators.required, Validators.pattern(/^(?!\s*$).+/)]],
      modifiers: [null, [Validators.required]],
      orderring_npi: [null, [Validators.required]],
      refering_npi: [null, [Validators.required]],
      auth: [null, [Validators.required]],
    });

    this.searchNameSubject
      .pipe(debounceTime(1000))
      .subscribe((data: { type: string; value: string }) => {
        if (data.type === 'name') this.nameSearch = data.value;
        if (data.type === 'address') this.addresSearch = data.value;
        if (data.type === 'phone') this.phoneSearch = data.value;
        if (data.type === 'payerId') this.payerIdSearch = data.value;
        this.page = 1;
        this.getInitData();
        this.isDataLoading = false;
      });
  }

  ngOnInit(): void {
    this.getInitData();
    this.getServices();
    this.getProducts();
  }

  getServices() {
    this.isDataLoading = true;
    this.serviceService.get({}, null, null, true)
      .pipe(finalize(() => {
        this.isDataLoading = false;
      }))
      .subscribe({
        next: (res: any) => {
          this.services = res;
        },
        error: (err) => {
          this.msgService.error(JSON.stringify(err.error));
        },
      });
  }

  getProducts() {
    this.isDataLoading = true;
    this.productService.get({}, null, null, true)
      .pipe(finalize(() => {
        this.isDataLoading = false;
      }))
      .subscribe({
        next: (res: any) => {
          this.products = res;
        },
        error: (err) => {
          this.msgService.error(JSON.stringify(err.error));
        },
      });
  }

  getInitData(): void {
    this.isDataLoading = true;
    this.insurerService
      .getInsurers(
        {
          name: this.nameSearch,
          payer_id: this.payerIdSearch,
          address: this.addresSearch,
          phone: this.phoneSearch,
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
    this.drawerTitle = 'New Insurer';
  }

  openEditDrawer(data: any): void {
    this.visible = true;
    this.isUpdating = true;
    this.drawerTitle = 'Edit Insurer';
    this.dataDrawerCahe = data;
    this.form.patchValue({ ...data });
    this.form.patchValue({
      services: data.services.map((e: any) => e.id),
      products: data.products.map((e: any) => e.id),
    });
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
      text: 'Are you sure you want to delete this insurer?',
      icon: 'warning',
      showDenyButton: true,
      confirmButtonText: 'Yes',
      denyButtonText: 'No',
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        this.isDataLoading = true;
        this.insurerService.deleteInsurer(id)
          .pipe(finalize(() => {
            this.isDataLoading = false;
          }))
          .subscribe({
            next: () => {
              this.msgService.success('Insurer deleted successfully');

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
    this.insurerService.updateInsurer(id, data)
      .pipe(finalize(() => {
        this.isDataLoading = false;
      }))
      .subscribe({
        next: () => {
          this.msgService.success('Insurer updated successfully');
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
      return this.update(this.dataDrawerCahe.id, this.form.value);
    }

    this.drawerLoader = true;

    this.insurerService.createInsurer(this.form.value)
      .pipe(finalize(() => {
        this.drawerLoader = false;
      }))
      .subscribe({
        next: () => {
          this.msgService.success('Insurer created successfully');
          this.getInitData();
          this.closeDrawer();
        },
        error: (err) => {
          this.msgService.error(JSON.stringify(err.error));
        },
      });
  }

  changeStatus(id: number, data: any): void {
    data.services = data.services.map((e: any) => e.id);
    data.products = data.products.map((e: any) => e.id);
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

  openCatalog(data: any) {
    this.isVisibleCatalog = true;
    this.dataCatalog = data;
  }

  handleCancelCatalog() {
    this.isVisibleCatalog = false;
    this.dataCatalog = null;
  }

  handleOkCatalog() {
    this.isVisibleCatalog = false;
    this.dataCatalog = null;
  }

  getErrorMessage(control: AbstractControl | null): string | null {
    if (!control || !control.errors) return null;

    if (control.hasError('required')) return 'This field is required';

    if (control.hasError('pattern')) return 'This field cannot be empty';

    return null;
  }

  selectChange(type: 'services' | 'products', selectedValues: any[]): void {
    if (selectedValues.includes('ALL')) {
      const allValues = this[type].map((o: any) => o.id);
      const isAllSelected = selectedValues.length === allValues.length + 1;
      this.form.controls[type].setValue(isAllSelected ? [] : allValues);
    }
  }

  hasFeedback(controlName: string): boolean {
    const control = this.form.get(controlName);
    return control?.invalid && (control.dirty || control.touched) ? true : false;
  }

  exporInsurers(): void {
    this.insurerService.getInsurers({}, null, null, true)
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
            name: 'Insurer Name',
            payer_id: 'Payer ID',
            phone: 'Phone',
            address: 'Address',
            created: 'Created',
            active: 'Status',
          };

          const selectedColumns = Object.keys(
            headers
          ) as (keyof typeof headers)[];

          const filteredData = res.map((insurer: any) =>
            selectedColumns.reduce((obj: Record<string, any>, key) => {
              if (key === 'active') {
                obj[headers[key]] = insurer[key] ? 'Active' : 'Inactive';
              } else if (key === 'created') {
                const date = new Date(insurer[key]);
                obj[headers[key]] = date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });
              } else {
                obj[headers[key]] = insurer[key];
              }
              return obj;
            }, {})
          );

          const worksheet: XLSX.WorkSheet =
            XLSX.utils.json_to_sheet(filteredData);
          const workbook: XLSX.WorkBook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(workbook, worksheet, 'Insurers');

          const excelBuffer: ArrayBuffer = XLSX.write(workbook, {
            bookType: 'xlsx',
            type: 'array',
          });

          const blob = new Blob([excelBuffer], {
            type: 'application/octet-stream',
          });
          const url = URL.createObjectURL(blob);

          const link = document.createElement('a');
          link.setAttribute('href', url);
          link.setAttribute('download', 'Insurers.xlsx');
          link.style.visibility = 'hidden';

          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          this.msgService.success('Export completed successfully');
        },
        error: (err: any) => {
          this.msgService.error(JSON.stringify(err.error));
        },
      });
  }
}
