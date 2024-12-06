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
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { UserService } from 'app/services/user-management/user-management.service';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzLayoutModule } from 'ng-zorro-antd/layout';

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
    NzSelectModule,
    NzIconModule,
    NzDrawerModule,
    NzSpinModule,
    CommonModule,
    NzSwitchModule,
    NzModalModule,
    NzDropDownModule,
    NzPopconfirmModule,
    NzCardModule,
    NzLayoutModule
  ],
  templateUrl: './profiles.component.html',
  styleUrl: './profiles.component.css',
})
export class ProfilesComponent implements OnInit {
  searchValue = '';
  visible = false;
  groupsList: any[] = [];
  listOfDisplayData: any[] = [];
  loadingSwAdmin = false;
  spinning: boolean = false;
  permisosList: any[] = [];
  listOfDisplayPermisos: any[] = [];
  showPermisos: boolean = false;
  isVisibleModalProfile: boolean = false;
  new_group_name: string = '';
  spinningNuevoPerfil: boolean = false;
  editCache: { [key: number]: { edit: boolean; data: any } } = {};

  constructor(
    private profileService: UserService,
    private message: NzMessageService
  ) { }

  ngOnInit(): void {
    this.getGroups();
  }

  reset(): void {
    this.searchValue = '';
    this.search();
  }

  search(): void {
    this.visible = false;
    this.listOfDisplayPermisos = this.permisosList.filter(
      (item: any) => item.modulo_data.modulo.indexOf(this.searchValue) !== -1
    );
  }

  getGroups(): void {
    this.spinning = true;
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
        this.spinning = false;
      },
      error: (err: any) => {
        this.message.error(JSON.stringify(err.error));
        this.spinning = false;
      },
    });
  }

  updateEditCache(): void {
    this.listOfDisplayData.forEach((item) => {
      this.editCache[item.id] = {
        edit: false,
        data: { ...item },
      };
    });
  }

  startEdit(id: number): void {
    this.editCache[id].edit = true;
  }

  cancelEdit(id: number): void {
    const index = this.listOfDisplayData.findIndex((item) => item.id === id);
    this.editCache[id] = {
      data: { ...this.listOfDisplayData[index] },
      edit: false,
    };
  }

  saveEdit(id: number, paramToChange?: string) {
    const index = this.listOfDisplayData.findIndex((item) => item.id === id);

    const dataToEdit = this.editCache[id].data;

    if (!dataToEdit.name || dataToEdit.name.trim().length === 0) {
      this.message.error('Group name cannot be empty.');
      return;
    }

    if (dataToEdit.name.trim().length < 5) {
      this.message.error('Invalid profile name. Must be at least 5 characters long');
      return;
    }

    this.spinning = true;

    if (paramToChange === 'active') {
      this.editCache[id].data.active = !this.editCache[id].data.active;
    }

    delete this.editCache[id].data.is_edit;

    this.profileService
      .updateGroup(this.editCache[id].data.id, this.editCache[id].data)
      .subscribe({
        next: (res: any) => {
          this.message.success(`Group successfully updated`, {
            nzDuration: 5000,
          });

          this.spinning = false;

          Object.assign(this.listOfDisplayData[index], this.editCache[id].data);
          this.editCache[id].edit = false;
        },
        error: (err: any) => {
          this.message.error(JSON.stringify(err.error));
          this.spinning = false;
        },
      });
  }

  verPermisos(id_grupo: number) {
    this.spinning = true;
    this.profileService.getGroupPerfil(id_grupo).subscribe({
      next: (res: any) => {
        this.permisosList = res;
        this.listOfDisplayPermisos = this.permisosList;
        this.spinning = false;
        this.showPermisos = true;
      },
      error: (err) => {
        this.message.error(JSON.stringify(err.error));
        this.spinning = false;
        this.showPermisos = true;
      },
    });
  }

  editPermisos(data: any, paramToChange: string) {
    this.spinning = true;

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
      next: (res: any) => {
        this.message.success(`Permissions updated successfully`, {
          nzDuration: 5000,
        });
        this.verPermisos(group);
      },
      error: (err) => {
        this.spinning = false;
        this.message.error(JSON.stringify(err.error));
      },
    });
  }

  openProfileModal() {
    this.isVisibleModalProfile = true;
    this.new_group_name = '';
  }

  handleCancelProfileModal() {
    this.isVisibleModalProfile = false;
    this.spinningNuevoPerfil = false;
  }

  handleSaveProfileModal() {
    if (!this.new_group_name || this.new_group_name.trim().length === 0) {
      this.message.error('Profile name cannot be empty');
      return;
    }

    if (this.new_group_name.trim().length < 5) {
      this.message.error('Invalid profile name. Must be at least 5 characters long');
      return;
    }

    this.spinningNuevoPerfil = true;

    const data = {
      name: this.new_group_name,
    };

    this.profileService.addGroup(data).subscribe({
      next: (res: any) => {
        this.getGroups();
        this.handleCancelProfileModal();
      },
      error: (err) => {
        this.spinningNuevoPerfil = false;
        this.message.error(JSON.stringify(err.error));
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
        this.spinning = true;
        this.profileService.deleteGroup(id_group).subscribe({
          next: (res: any) => {
            this.message.success(`Group deleted`, {
              nzDuration: 5000,
            });
            this.spinning = false;
            this.getGroups();
          },
          error: (err) => {
            this.message.error(JSON.stringify(err.error));
            this.spinning = false;
          },
        });
      }
    });
  }
}
