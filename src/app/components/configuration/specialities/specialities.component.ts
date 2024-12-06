import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
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
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { EspecialitiesService } from 'app/services/config/especialities.service';
import { debounceTime, Subject } from 'rxjs';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-specialities',
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
  templateUrl: './specialities.component.html',
  styleUrls: ['./specialities.component.css', '../../../../animations/styles.css'],
})
export class SpecialitiesComponent {
  descriptionSearch: any = null;
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
  form: UntypedFormGroup;
  private searchNameSubject: Subject<{ type: string; value: string }> =
    new Subject();

  constructor(
    private fb: UntypedFormBuilder,
    private specialitiesService: EspecialitiesService,
    private msgService: NzMessageService
  ) {
    this.form = this.fb.group({
      description: [
        null,
        [
          Validators.required,
          Validators.pattern(/^(?!\s*$).+/)
        ]
      ],
    });

    this.searchNameSubject.pipe(debounceTime(2000)).subscribe((data) => {
      if (data.type === 'description') {
        this.descriptionSearch = data.value;
      }
      this.page = 1;
      this.getInitData();
    });
  }

  ngOnInit(): void {
    this.getInitData();
  }

  getInitData() {
    this.isDataLoading = true;
    this.specialitiesService
      .get(
        {
          name: this.descriptionSearch,
          description: this.descriptionSearch
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
    this.drawerTitle = 'New Speciality';
  }

  openEditDrawer(data: any): void {
    this.visible = true;
    this.isUpdating = true;
    this.drawerTitle = 'Edit Speciality';
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
      confirmButtonText: 'Yes',
      denyButtonText: `No`,
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        this.isDataLoading = true;
        this.specialitiesService.delete(id).subscribe({
          next: (res: any) => {
            this.msgService.success('Speciality deleted successfully');
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
    this.specialitiesService.update(id, data).subscribe({
      next: () => {
        this.msgService.success('Specialty updated successfully');
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
      this.specialitiesService.create(this.form.value).subscribe({
        next: () => {
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
        this.msgService.error(JSON.stringify(err.error));
      },
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

  exportSpecialities(): void {
    if (this.dataToDisplay.length === 0) {
      this.msgService.warning('No data available to export');
      return;
    }

    this.isDataLoading = true;

    const headers: Record<
      'description' |
      'created' |
      'active',
      string> = {
      description: 'Specialty',
      created: 'Created',
      active: 'Status',
    };

    const selectedColumns = Object.keys(headers) as (keyof typeof headers)[];

    const filteredData = this.dataToDisplay.map(speciality =>
      selectedColumns.reduce((obj: Record<string, any>, key) => {
        if (key === 'active') {
          obj[headers[key]] = speciality[key] ? 'Active' : 'Inactive';
        } else if (key === 'created') {
          const date = new Date(speciality[key]);
          obj[headers[key]] = date.toISOString().split('T')[0];
        } else {
          obj[headers[key]] = speciality[key];
        }
        return obj;
      }, {})
    );

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(filteredData);

    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Specialities');

    const excelBuffer: ArrayBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', 'Specialities.xlsx');
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.isDataLoading = false;
  }

}
