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
import { InsurersService } from '../../services/insurers/insurers.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { debounceTime, Subject } from 'rxjs';
import Swal from 'sweetalert2';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { S3Service } from '../../services/upload-s3/upload-s3.service';

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
  private searchNameSubject: Subject<{ type: string; value: string }> = new Subject();

  constructor(
    private fb: UntypedFormBuilder,
    private insurerService: InsurersService,
    private msgService: NzMessageService,
    private s3Service: S3Service
  ) {
    this.form = this.fb.group({
      logo: [null],
      logo_description: [null, [Validators.required, Validators.pattern(/^(?!\s*$).+/)]],
      payer_id: [null, [Validators.required, Validators.pattern(/^(?!\s*$).+/)]],
      phone: [null, [Validators.required, Validators.pattern(/^(?!\s*$).+/)]],
      address: [null, [Validators.required, Validators.pattern(/^(?!\s*$).+/)]],
      name: [null, [Validators.required, Validators.pattern(/^(?!\s*$).+/)]],
    });

    this.searchNameSubject
      .pipe(debounceTime(2000))
      .subscribe((data: { type: string; value: string }) => {
        if (data.type === 'name') this.nameSearch = data.value;
        if (data.type === 'address') this.addresSearch = data.value;
        if (data.type === 'phone') this.phoneSearch = data.value;
        if (data.type === 'payerId') this.payerIdSearch = data.value;
        this.page = 1;
        this.getInitData();
      });
  }

  ngOnInit(): void {
    this.getInitData();
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
      title: 'Are you sure to delete?',
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
        this.msgService.error('The image will not be uploaded because only JPG and PNG files are allowed');
        this.form.patchValue({ logo: null });
        return;
      }

      this.form.patchValue({
        logo: file,
      });
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
          error: (err: any) => {
            this.drawerLoader = false;
            this.msgService.error('Error uploading logo: ' + JSON.stringify(err.error));
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
          this.msgService.success('New Insurer created');
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
    }
  }

  changeStatus(id: number, data: any): void {
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
