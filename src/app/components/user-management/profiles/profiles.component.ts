import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, } from '@angular/forms';
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
import Swal from 'sweetalert2';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { UserService } from 'app/services/user-management/user-management.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-profiles',
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
    NzDropDownModule
  ],

  templateUrl: './profiles.component.html',
  styleUrls: ['./profiles.component.css', '../../../../animations/styles.css'],
})
export class ProfilesComponent implements OnInit {
  searchValue = '';
  visible = false;
  groupsList: any[] = [];
  listOfDisplayData: any[] = [];
  permisosList: any[] = [];
  listOfDisplayPermisos: any[] = [];
  showPermisos: boolean = false;
  isVisibleDrawerNewProfile: boolean = false;
  new_group_name: string = '';
  editCache: { [key: number]: { edit: boolean; data: any } } = {};
  isDataLoading = false;
  isVisibleEditDrawer = false;
  editForm!: FormGroup;
  selectedGroupId!: number;
  addForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private profileService: UserService,
    private message: NzMessageService
  ) { }

  ngOnInit(): void {
    this.getGroups();
    this.addForm = this.initializeForm('new_group_name');
    this.editForm = this.initializeForm('name');
  }

  initializeForm(fieldName: string): FormGroup {
    return this.fb.group({
      [fieldName]: ['', [Validators.required, Validators.pattern(/^(?!\s*$).+/)]],
    });
  }

  editPermisos(data: any, paramToChange: string) {
    this.isDataLoading = true;

    const id = data.id;
    const group = data.group;

    if (paramToChange === 'read') {
      data.read = !data.read;
    }
    if (paramToChange === 'write') {
      data.write = !data.write;
    }
    if (paramToChange === 'update') {
      data.update = !data.update;
    }
    if (paramToChange === 'delete') {
      data.delete = !data.delete;
    }

    data = {
      write: data.write,
      read: data.read,
      update: data.update,
      delete: data.delete,
    };

    this.profileService.updatePerfil(id, data).subscribe({
      next: () => {
        this.message.success(`Permissions updated successfully`)
        this.seePermissions(group);
      },
      error: (err) => {
        this.isDataLoading = false;
        this.message.error(JSON.stringify(err.error));
      },
    });
  }

  search(): void {
    this.visible = false;
    this.listOfDisplayPermisos = this.permisosList.filter(
      (item: any) => item.modulo_data.modulo.indexOf(this.searchValue) !== -1
    );
  }

  reset(): void {
    this.searchValue = '';
    this.search();
  }

  seePermissions(id_grupo: number) {
    this.isDataLoading = true;
    this.profileService.getGroupPerfil(id_grupo).subscribe({
      next: (res: any) => {
        this.message.success('Show permissions');
        this.permisosList = res;
        this.listOfDisplayPermisos = this.permisosList;
        this.isDataLoading = false;
        this.showPermisos = true;
      },
      error: (err) => {
        this.message.error(JSON.stringify(err.error));
        this.isDataLoading = false;
        this.showPermisos = true;
      },
    });
  }

  submitEdit(): void {
    if (this.editForm.valid) {
      const updatedData = { id: this.selectedGroupId, ...this.editForm.value };

      this.isDataLoading = true;

      this.profileService.updateGroup(updatedData.id, updatedData).subscribe({
        next: () => {
          this.message.success('Profile updated successfully');
          this.getGroups();
          this.closeEditDrawer();
          this.isDataLoading = false;

        },
        error: (err) => {
          this.message.error(JSON.stringify(err.error));
          this.isDataLoading = false;
        },
      });
    } else {
      Object.values(this.editForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  changeStatus(id: number, paramToChange?: string) {
    const index = this.listOfDisplayData.findIndex((item) => item.id === id);

    this.isDataLoading = true;

    if (paramToChange === 'active') {
      this.editCache[id].data.active = !this.editCache[id].data.active;
    }

    delete this.editCache[id].data.is_edit;

    this.profileService
      .updateGroup(this.editCache[id].data.id, this.editCache[id].data)
      .subscribe({
        next: () => {
          this.message.success(`Group successfully updated`)
          Object.assign(this.listOfDisplayData[index], this.editCache[id].data);
          this.editCache[id].edit = false;
          this.isDataLoading = false;
        },
        error: (err: any) => {
          this.message.error(JSON.stringify(err.error));
          this.isDataLoading = false;
        },
      });
  }

  openEditDrawer(group: any): void {
    this.selectedGroupId = group.id;
    this.editForm.patchValue({
      name: group.name,
    });
    this.isVisibleEditDrawer = true;
    this.isDataLoading = false;
  }

  closeEditDrawer(): void {
    this.isVisibleEditDrawer = false;
    this.editForm.reset();
  }

  openDrawerNewProfile() {
    this.isVisibleDrawerNewProfile = true;
    this.isDataLoading = false;
    this.new_group_name = '';
  }

  closeDrawerNewProfile() {
    this.isVisibleDrawerNewProfile = false;
    this.isDataLoading = false;
    this.addForm.reset();
  }

  SaveNewProfile() {
    if (this.addForm.valid) {
      this.isDataLoading = true;

      const data = {
        name: this.addForm.get('new_group_name')?.value
      };

      this.profileService.addGroup(data).subscribe({
        next: () => {
          this.message.success(`Group created`)
          this.getGroups();
          this.closeDrawerNewProfile();
        },
        error: (err) => {
          this.isDataLoading = false;
          this.message.error(JSON.stringify(err.error));
        },
      });
    } else {
      Object.values(this.addForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  updateEditCache(): void {
    this.listOfDisplayData.forEach((item) => {
      this.editCache[item.id] = {
        edit: false,
        data: { ...item },
      };
    });
  }

  getGroups(): void {
    this.isDataLoading = true;
    this.profileService.getGroups({}, 1, 1, true).subscribe({
      next: (groups: any) => {
        this.listOfDisplayData = groups;
        this.listOfDisplayData.forEach((group: any) => {
          group.is_edit = false;
        });
        groups.forEach((group: any) => {
          this.groupsList.push(Object.assign({}, group));
        });
        this.updateEditCache();
        this.isDataLoading = false;
      },
      error: (err: any) => {
        this.message.error(JSON.stringify(err.error));
        this.isDataLoading = false;
      },
    });
  }

  deleteGroup(id_group: number) {
    Swal.fire({
      text: 'Are you sure you want to delete this group?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete',
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        this.isDataLoading = true;
        this.profileService.deleteGroup(id_group).subscribe({
          next: () => {
            this.message.success(`Group deleted`)
            this.isDataLoading = false;
            this.getGroups();
          },
          error: (err) => {
            this.message.error(JSON.stringify(err.error));
            this.isDataLoading = false;
          },
        });
      }
    });
  }

  exportGroupName(): void {
    if (this.listOfDisplayData.length === 0) {
      this.message.warning('No data available to export');
      return;
    }

    this.isDataLoading = true;

    const headers = {
      name: 'Group Name',
      active: 'Status',
      created: 'Created',
    };

    const selectedColumns = Object.keys(headers) as (keyof typeof headers)[];

    const filteredData = this.listOfDisplayData.map((group) =>
      selectedColumns.reduce((obj: Record<string, any>, key) => {
        if (key === 'active') {
          obj[headers[key]] = group[key] ? 'Active' : 'Inactive';
        } else if (key === 'created') {
          const date = new Date(group[key]);
          obj[headers[key]] = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });
        } else {
          obj[headers[key]] = group[key];
        }
        return obj;
      }, {})
    );

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(filteredData);

    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Groups');

    const excelBuffer: ArrayBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', 'Groups.xlsx');
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.isDataLoading = false;
  }

}
