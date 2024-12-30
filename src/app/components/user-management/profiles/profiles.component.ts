import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { ProfileService } from 'app/services/user-management/profile/profile.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as XLSX from 'xlsx';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { debounceTime, Subject } from 'rxjs';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzEmptyModule } from 'ng-zorro-antd/empty';

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
    NzDropDownModule,
    NzModalModule,
    NzSelectModule,
    NzEmptyModule
  ],
  templateUrl: './profiles.component.html',
  styleUrls: ['./profiles.component.css', '../../../../animations/styles.css'],
})
export class ProfilesComponent implements OnInit {
  listOfDisplayData: any[] = [];
  permisosList: any[] = [];
  listOfDisplayPermisos: any[] = [];
  isVisibleDrawerNewProfile: boolean = false;
  new_group_name: string = '';
  editCache: { [key: number]: { edit: boolean; data: any } } = {};
  isDataLoading = false;
  isDataLoadingP = false;
  isVisibleEditDrawer = false;
  editForm!: FormGroup;
  selectedGroupId!: number;
  addForm!: FormGroup;
  isVisiblePermisosModal = false;
  page: number = 1;
  page_size: number = 10;
  count_records: number = 0;
  nameSearch: any = null;
  moduleSelected: any = null;
  idPermisions: any = null;
  p_page: number = 1;
  p_page_size: number = 10;
  p_count_records: number = 0;
  moduleSearch: any = null;
  types_users = [
    {
      id: 'MASTER',
      label: 'Master',
    },
    {
      id: 'SUPPLIER',
      label: 'Supplier',
    },
    {
      id: 'PARTNER',
      label: 'Partner',
    },
  ];
  private searchSubject: Subject<{ type: string; value: string }> = new Subject();

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private message: NzMessageService
  ) {
    this.searchSubject.pipe(debounceTime(1000)).subscribe((data) => {
      this.page = 1;
      this.p_page = 1

      switch (data.type) {
        case 'name':
          this.nameSearch = data.value;
          this.getGroups();
          this.isDataLoading = false;
          break;

        case 'modulo':
          this.moduleSearch = data.value;
          this.seePermissions(this.idPermisions);
          this.isDataLoadingP = false;
          break;
      }
    });
  }

  ngOnInit(): void {
    this.getGroups();

    this.addForm = this.fb.group({
      new_group_name: ['', [Validators.required, Validators.pattern(/^(?!\s*$).+/)]],
      type: [null, [Validators.required]],
    });

    this.editForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(/^(?!\s*$).+/)]],
      type: [null, [Validators.required]],
    });
  }

  OkPermissionsModal(): void {
    this.isVisiblePermisosModal = false;
  }

  editPermissions(data: any, paramToChange: string) {
    this.isDataLoading = true;
    const updatedData = { ...data };

    updatedData[paramToChange] = !data[paramToChange];

    const id = updatedData.id;
    const group = updatedData.group;

    const permissions = {
      write: updatedData.write,
      read: updatedData.read,
      update: updatedData.update,
      delete: updatedData.delete,
      admin: updatedData.admin,
    };

    this.profileService.updatePerfil(id, permissions).subscribe({
      next: () => {
        this.message.success(JSON.stringify('Permissions updated successfully'));
        this.seePermissions(group);
        this.isDataLoading = false;
      },
      error: (err) => {
        this.isDataLoading = false;
        this.message.error(JSON.stringify(err.error));
      },
    });
  }

  openPermissionsModal(id_grupo: number): void {
    this.seePermissions(id_grupo, true);
  }

  seePermissions(id_grupo: number, resetSearch: boolean = false): void {
    if (resetSearch) {
      this.moduleSearch = null;
      this.p_page = 1;
    }

    this.idPermisions = id_grupo;
    this.isDataLoadingP = true;
    this.profileService.getGroupPerfil(id_grupo, this.p_page, this.p_page_size, false, this.moduleSearch)
      .subscribe({
        next: (res: any) => {
          this.permisosList = res.results;
          this.listOfDisplayPermisos = this.permisosList;
          this.p_count_records = res.total;

          if ((!res.results || res.results.length === 0) && this.moduleSearch) {
            this.message.warning('No results found matching your search criteria');
          }

          this.isVisiblePermisosModal = true;
          this.isDataLoadingP = false;
        },
        error: (err) => {
          this.isDataLoadingP = false;
          this.message.error(JSON.stringify(err.error));
        },
      });
  }


  submitEdit(): void {
    if (this.editForm.valid) {
      const updatedData = { id: this.selectedGroupId, ...this.editForm.value };

      this.isDataLoading = true;

      this.profileService.updateGroup(updatedData.id, updatedData).subscribe({
        next: () => {
          this.message.success(JSON.stringify('Profile updated successfully'));
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
          this.message.success(JSON.stringify('Group updated successfully'));
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
      type: group.type,
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
        name: this.addForm.get('new_group_name')?.value,
        type: this.addForm.get('type')?.value,
      };

      this.profileService.addGroup(data).subscribe({
        next: () => {
          this.message.success(JSON.stringify('Group created successfully'));
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

  getGroups(init: boolean = false): void {
    this.isDataLoading = true;
    this.profileService
      .getGroups({ name: this.nameSearch }, this.page, this.page_size, init)
      .subscribe({
        next: (res: any) => {
          this.listOfDisplayData = res.results;
          this.count_records = res.total;
          this.updateEditCache();

          const isSearching = this.nameSearch;

          if (isSearching && (!res.results || res.results.length === 0)) {
            this.message.warning(JSON.stringify('No results found matching your search criteria'));
          }

          this.isDataLoading = false;
        },
        error: (err: any) => {
          this.message.error(JSON.stringify(err.error));
          this.isDataLoading = false;
        },
      });
  }

  handlePagination(page: number, pageSize: number, isPermissions: boolean = false): void {
    if (isPermissions) {
      this.p_page = page;
      this.p_page_size = pageSize;
      this.seePermissions(this.idPermisions);
    } else {
      this.page = page;
      this.page_size = pageSize;
      this.getGroups();
    }
  }

  search(value: string, type: string) {
    if (type === 'modulo') {
      this.isDataLoadingP = true;
    } else {
      this.isDataLoading = true;
    }
    this.searchSubject.next({ type, value });
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
            this.message.success(JSON.stringify('Group deleted successfully'));
            this.isDataLoading = false;

            if (this.listOfDisplayData.length === 1 && this.page > 1) {
              this.page--;
            }

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

  exportGroups(): void {
    this.profileService.getGroups({}, null, null, true).subscribe({
      next: (res: any) => {
        if (res.length === 0) {
          this.message.warning('No data available to export');
          this.isDataLoading = false;
          return;
        }

        this.isDataLoading = true;

        const headers = {
          name: 'Group Name',
          active: 'Status',
          created: 'Created',
        };

        const formatData = (data: any[], headers: Record<string, string>) =>
          data.map((group) =>
            Object.keys(headers).reduce((obj: Record<string, any>, key) => {
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

        const groupsData = formatData(res, headers);

        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(groupsData);
        const workbook: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Groups');

        const excelBuffer: ArrayBuffer = XLSX.write(workbook, {
          bookType: 'xlsx',
          type: 'array',
        });

        const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'Groups.xlsx');
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        this.isDataLoading = false;

        this.message.success('Export completed successfully');
      },
      error: (err) => {
        this.isDataLoading = false;
        this.message.error(JSON.stringify(err.error));
      },
    });
  }

}
