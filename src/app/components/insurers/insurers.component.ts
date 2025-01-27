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
import { InsurersService } from 'app/services/insurers/insurers.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { debounceTime, Subject } from 'rxjs';
import Swal from 'sweetalert2';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { S3Service } from 'app/services/upload-s3/upload-s3.service';
import * as XLSX from 'xlsx';
import { ProductsService } from 'app/services/config/products.service';
import { ServicesService } from 'app/services/config/services.service';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzEmptyModule } from 'ng-zorro-antd/empty';

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
    NzEmptyModule
  ],
  templateUrl: './insurers.component.html',
  styleUrls: ['./insurers.component.css', '../../../animations/styles.css'],
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
  private searchNameSubject: Subject<{ type: string; value: string }> = new Subject();

  constructor(
    private fb: UntypedFormBuilder,
    private insurerService: InsurersService,
    private msgService: NzMessageService,
    private s3Service: S3Service,
    private productService: ProductsService,
    private serviceService: ServicesService
  ) {
    this.form = this.fb.group({
      services: [null, [Validators.required]],
      products: [null, [Validators.required]],
      logo: [null],
      logo_description: [null, [Validators.required, Validators.pattern(/^(?!\s*$).+/)]],
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
    this.serviceService.get({}, 1, 1, true).subscribe({
      next: (res: any) => {
        this.services = res;
        this.isDataLoading = false;
      },
      error: (err) => {
        this.msgService.error(JSON.stringify(err.error));
        this.isDataLoading = false;
      },
    });
  }

  getProducts() {
    this.isDataLoading = true;
    this.productService.get({}, 1, 1, true).subscribe({
      next: (res: any) => {
        this.products = res;
        this.isDataLoading = false;
      },
      error: (err) => {
        this.msgService.error(JSON.stringify(err.error));
        this.isDataLoading = false;
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
      .subscribe({
        next: (res: any) => {
          this.isDataLoading = false;
          this.dataToDisplay = res.results;

          const isSearching = this.nameSearch || this.payerIdSearch || this.addresSearch || this.phoneSearch;

          if (isSearching && (!res.results || res.results.length === 0)) {
            this.msgService.warning('No results found matching your search criteria');
          }

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
    this.form.reset({
      logo: null,
      logo_description: null,
      payer_id: null,
      phone: null,
      address: null,
      name: null,
    });
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
        this.insurerService.deleteInsurer(id).subscribe({
          next: () => {
            this.msgService.success('Insurer deleted successfully');
            this.isDataLoading = false;

            if (this.dataToDisplay.length === 1 && this.page > 1) {
              this.page--;
            }

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
    this.insurerService.updateInsurer(id, data).subscribe({
      next: () => {
        this.msgService.success('Insurer updated successfully');
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

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const validFileTypes = ['image/jpeg', 'image/png'];

      if (!validFileTypes.includes(file.type)) {
        this.msgService.warning('Only JPG and PNG files');
        this.form.patchValue({ logo: null });
        return;
      }

      this.form.patchValue({ logo: file });
      this.form.get('logo')?.updateValueAndValidity();
    }
  }

  submit(): void {
    if (this.form.valid) {
      this.drawerLoader = true;
      const formData = this.form.value;

      if (!formData.logo) {
        formData.logo = this.isUpdating ? this.dataDrawerCahe.logo : 'None';
      }

      const logoFile = this.form.get('logo')?.value;

      if (logoFile instanceof File) {
        const uploadData = new FormData();
        uploadData.append('name', formData.name);
        uploadData.append('logo', logoFile);

        this.s3Service.uploadLogo(uploadData).subscribe({
          next: (response: any) => {
            formData.logo = response.url;
            this.saveOrUpdate(formData);
          },
          error: (error: any) => {
            this.drawerLoader = false;
            this.msgService.error(JSON.stringify(error.error));
          },
        });
      } else {
        this.saveOrUpdate(formData);
      }
    } else {
      Object.values(this.form.controls).forEach((control) => {
        control.markAsDirty();
        control.updateValueAndValidity({ onlySelf: true });
      });
    }
  }

  private saveOrUpdate(formData: any): void {
    if (this.isUpdating) {
      this.update(this.dataDrawerCahe.id, formData);
    } else {
      this.insurerService.createInsurer(formData).subscribe({
        next: () => {
          this.msgService.success('Insurer created successfully');
          this.isDataLoading = false;
          this.getInitData();
          this.closeDrawer();
        },
        error: (error) => {
          this.drawerLoader = false;
          this.isDataLoading = false;
          this.msgService.error(JSON.stringify(error.error));
        },
      });
    }
  }

  changeStatus(id: number, data: any): void {
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

  exporInsurers(): void {
    this.insurerService.getInsurers({}, null, null, true).subscribe({
      next: (res: any) => {
        if (res.length === 0) {
          this.msgService.warning('No data available to export');
          this.isDataLoading = false;
          return;
        }

        this.isDataLoading = true;

        const headers = {
          name: 'Insurer Name',
          payer_id: 'Payer ID',
          phone: 'Phone',
          address: 'Address',
          created: 'Created',
          active: 'Status',
        };

        const selectedColumns = Object.keys(headers) as (keyof typeof headers)[];

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

        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(filteredData);
        const workbook: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Insurers');

        const excelBuffer: ArrayBuffer = XLSX.write(workbook, {
          bookType: 'xlsx',
          type: 'array',
        });

        const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'Insurers.xlsx');
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        this.isDataLoading = false;
        this.msgService.success('Export completed successfully');
      },
      error: (err: any) => {
        this.isDataLoading = false;
        this.msgService.error(JSON.stringify(err.error));
      },
    });
  }
}
