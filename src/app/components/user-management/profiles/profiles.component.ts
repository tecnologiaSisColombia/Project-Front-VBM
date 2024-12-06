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
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { UserService } from 'app/services/user-management/user-management.service';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';

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
  ],
  templateUrl: './profiles.component.html',
  styleUrl: './profiles.component.css',
})
export class ProfilesComponent implements OnInit {
  // TABLE VARS **********************************************************************************************************
  searchValue = '';
  visible = false;
  groupsList: any[] = [];
  listOfDisplayData: any[] = [];
  loadingSwAdmin = false;
  spinning: boolean = false; // Spinning control

  permisosList: any[] = [];
  listOfDisplayPermisos: any[] = [];
  showPermisos: boolean = false;

  //Perfil modal
  isVisibleModalProfile: boolean = false;
  new_group_name: string = '';
  spinningNuevoPerfil: boolean = false;

  editCache: { [key: number]: { edit: boolean; data: any } } = {};
  constructor(
    private profileService: UserService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.getGroups();
  }

  // Table methods *************************************************************

  reset(): void {
    // @desc: Method for reset datatable search
    this.searchValue = '';
    this.search();
  }

  search(): void {
    // @desc: Method for datatable search
    this.visible = false;
    this.listOfDisplayPermisos = this.permisosList.filter(
      (item: any) => item.modulo_data.modulo.indexOf(this.searchValue) !== -1
    );
    console.log(this.listOfDisplayPermisos);
  }

  getGroups(): void {
    /**
     * @desc Call service to collect groups info and prepare array
     */
    this.spinning = true;
    this.profileService.getGroups({}, 1, 1, true).subscribe({
      next: (groups: any) => {
        this.listOfDisplayData = groups;
        this.listOfDisplayData.forEach((group: any) => {
          group.is_edit = false;
        });
        // This array must dont be related to the listOfDisplayData, because this array is used for recovery
        // the data when the group cancel the edit or any error occurs
        groups.forEach((group: any) => {
          this.groupsList.push(Object.assign({}, group));
        });
        this.updateEditCache();
        this.spinning = false;
        console.log(this.listOfDisplayData);
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
    console.log(this.editCache);
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
    /** 
    @desc: Method for change super user state
    @param: id: number, user id
    @param: paramToChange: string, Opcional, used only for set super admin or activate and deactivate
            user directly from data table, whe using edit form, is not necessary
    @return: void, use API for update user state, and update datatable    
    **/

    const index = this.listOfDisplayData.findIndex((item) => item.id === id);

    // Spining activated
    this.spinning = true;

    // Set new value
    // if (paramToChange === 'is_superuser') {
    //   userUpdate.is_superuser = !userUpdate.is_superuser ;
    // }
    if (paramToChange === 'active') {
      this.editCache[id].data.active = !this.editCache[id].data.active;
    }

    // Sen data to API
    delete this.editCache[id].data.is_edit;
    console.log(this.editCache[id]);
    this.profileService
      .updateGroup(this.editCache[id].data.id, this.editCache[id].data)
      .subscribe({
        next: (res: any) => {
          console.log(res);

          // Show success message
          this.message.success(`Grupo actualizado con exito!!!`, {
            nzDuration: 5000,
          });
          // Spining deactivated
          this.spinning = false;
          // Replace original data for new data
          Object.assign(this.listOfDisplayData[index], this.editCache[id].data);
          // Finis edit mode
          this.editCache[id].edit = false;
        },
        error: (err: any) => {
          // Show error message
          this.message.error(JSON.stringify(err.error));

          // Spining deactivated
          this.spinning = false;
        },
      });
  }
  verPermisos(id_grupo: number) {
    this.spinning = true;
    this.profileService.getGroupPerfil(id_grupo).subscribe({
      next: (res: any) => {
        console.log(res);
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

    // Set new value
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
        // Show success message
        this.message.success(`Permisos actualizados con exito!!!`, {
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
    if (this.new_group_name.length < 5) {
      Swal.fire({
        icon: 'warning',
        text: 'El nombre del perfíl es invalido, Este debe contener como minímo 5 caracteres.',
      });
      return;
    }
    this.spinningNuevoPerfil = true;
    const data = {
      name: this.new_group_name,
    };
    this.profileService.addGroup(data).subscribe({
      next: (res: any) => {
        console.log(res);
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
      title: '¿Está seguro de borrar este grupo?',
      text: 'No será posible revertir esta acción',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, borrar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.spinning = true;
        this.profileService.deleteGroup(id_group).subscribe({
          next: (res: any) => {
            console.log(res);
            // Show success message
            this.message.success(`Grupo eliminado!!!`, {
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
