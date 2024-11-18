import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzInputModule } from 'ng-zorro-antd/input'
import { NzTableModule } from 'ng-zorro-antd/table'
import { NzTagModule } from 'ng-zorro-antd/tag'
import { NzDrawerModule } from 'ng-zorro-antd/drawer'
import { NzDemoDrawerFromDrawerComponent } from '../drawers-modals/drawer-create-users/drawer-create-users.component'
import { NzDemoModalBasicComponent } from '../drawers-modals/modal-create-user-bulk/modal-create-user-bulk.component'
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb'
import { UserService } from '../../services/user-management/user-management.service';
import { NzMessageService } from 'ng-zorro-antd/message'
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzTableModule,
    NzTagModule,
    NzDrawerModule,
    NzDemoDrawerFromDrawerComponent,
    NzDemoModalBasicComponent,
    NzBreadCrumbModule,
  ],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css'],
})

export class UserManagementComponent implements OnInit {
  data: any[] = [];
  searchQuery = '';
  loading = false;

  constructor(
    private userService: UserService,
    private msgService: NzMessageService,
  ) { }

  ngOnInit(): void {
    this.fetchUsers();
  }

  fetchUsers(): void {
    this.loading = true;
    this.userService.getUsers().subscribe(
      (data) => {
        this.data = data;
        console.log('Data fetched:', this.data);
        this.loading = false;
      },
      (error) => {
        console.error('Error fetching users:', error);
        this.loading = false;
      }
    );
  }

  addUserToList(newUser: any): void {
    this.data = [newUser, ...this.data];
  }

  modifyUser(user: any): void {
    console.log('Modify User:', user);
  }

  inactivateUser(user: any): void {
    if (!user.is_active) {
      this.msgService.warning(`The user ${user.username} is already inactive.`);
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to inactivate ${user.username}. Do you want to continue?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, inactivate',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.disableUser(user.username).subscribe(
          (response) => {
            Swal.fire('Inactivated!', 'The user has been inactivated.', 'success');
            user.is_active = false;
          },
          (error) => {
            Swal.fire('Error', 'There was an issue inactivating the user.', 'error');
          }
        );
      }
    });
  }

  enableUser(user: any): void {
    if (user.is_active) {
      this.msgService.warning(`The user ${user.username} is already active.`);
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to activate ${user.username}. Do you want to continue?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, activate',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.enableUser(user.username).subscribe(
          (response) => {
            Swal.fire('Activated!', 'The user has been activated.', 'success');
            user.is_active = true;
          },
          (error) => {
            Swal.fire('Error', 'There was an issue activating the user.', 'error');
          }
        );
      }
    });
  }

  onSearch(): void {
    console.log('Search:', this.searchQuery);
  }
}
