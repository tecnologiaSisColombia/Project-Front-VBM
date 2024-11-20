import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzInputModule } from 'ng-zorro-antd/input'
import { NzTableModule } from 'ng-zorro-antd/table'
import { NzTagModule } from 'ng-zorro-antd/tag'
import { NzDrawerModule } from 'ng-zorro-antd/drawer'
import { 
  NzDemoDrawerFromDrawerComponent 
} from '../drawers-modals/drawers/drawer-create-users.component'
import { 
  NzDemoModalLocaleComponent 
} from '../drawers-modals/modals/modal-edit-user.component'
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb'
import { UserService } from '../../services/user-management/user-management.service';
import { NzMessageService } from 'ng-zorro-antd/message'
import Swal from 'sweetalert2';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { AuthService } from '../../services/auth/auth.service';

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
    NzBreadCrumbModule,
    NzDemoModalLocaleComponent,
    NzSwitchModule
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
    private authService: AuthService,
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
        this.msgService.error(`Error fetching users`);
        this.loading = false;
      }
    );
  }

  addUserToList(newUser: any): void {
    this.data = [newUser, ...this.data];
  }

  updateUser(updatedUser: any): void {
    const index = this.data.findIndex((u) => u.username === updatedUser.username);
    if (index !== -1) {
      this.data[index] = { ...updatedUser };
      console.log('User updated:', updatedUser);
    }
  }
  
  toggleUserStatus(user: any): void {
    if (user.is_active) {
      Swal.fire({
        title: 'Are you sure?',
        text: `You are about to activate ${user.username}. Do you want to continue?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, activate',
        cancelButtonText: 'Cancel',
        allowOutsideClick: false,
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire({
            title: 'Processing...',
            text: 'Please wait while the user is being activated.',
            allowOutsideClick: false,
            showConfirmButton: false,
            didOpen: () => {
              Swal.showLoading();
            },
          });
  
          this.userService.enableUser(user.username).subscribe(
            (response) => {
              Swal.fire('Activated!', 'The user has been activated.', 'success');
              user.is_active = true;
            },
            (error) => {
              Swal.fire('Error', 'There was an issue activating the user.', 'error');
              user.is_active = false;
            }
          );
        } else {
          user.is_active = false;
        }
      });
    } else {
      Swal.fire({
        title: 'Are you sure?',
        text: `You are about to inactivate ${user.username}. Do you want to continue?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, inactivate',
        cancelButtonText: 'Cancel',
        allowOutsideClick: false,
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire({
            title: 'Processing...',
            text: 'Please wait while the user is being inactivated.',
            allowOutsideClick: false,
            showConfirmButton: false,
            didOpen: () => {
              Swal.showLoading();
            },
          });
  
          this.userService.disableUser(user.username).subscribe(
            (response) => {
              Swal.fire('Inactivated!', 'The user has been inactivated.', 'success');

              const userAttributes = localStorage.getItem('user_attributes');
              const currentUser = userAttributes ? JSON.parse(userAttributes) : null;

              if (currentUser && currentUser.username === user.username) {
                this.authService.doLogout();
              }

              user.is_active = false;
            },
            (error) => {
              Swal.fire('Error', 'There was an issue inactivating the user.', 'error');
              user.is_active = true;
            }
          );
        } else {
          user.is_active = true;
        }
      });
    }
  }
  
  deleteUser(user: any): void {
    if (user.is_active) {
      Swal.fire({
        title: 'The user is active',
        text: `The user ${user.username} is currently active. Do you want to deactivate and then delete the user?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, deactivate and delete',
        cancelButtonText: 'Cancel',
        allowOutsideClick: false,
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire({
            title: 'Processing...',
            text: 'Deactivating the user. Please wait...',
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            },
          });
          this.userService.disableUser(user.username).subscribe(
            (response) => {
              user.is_active = false;
              Swal.fire({
                title: 'User Deactivated',
                text: 'The user has been deactivated successfully. Proceeding with deletion...',
                icon: 'success',
                showConfirmButton: false,
                allowOutsideClick: false,
                timer: 2000,
              });

              this.confirmDeleteUser(user);
            },
            (error) => {
              Swal.fire('Error', 'There was an issue deactivating the user', 'error');
            }
          );
        }
      });
    } else {
      this.confirmDeleteUser(user);
    }
  }

  confirmDeleteUser(user: any): void {
    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete ${user.username}. Do you want to continue?`,
      icon: 'warning',
      showCancelButton: false,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete',
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Processing...',
          text: 'Please wait while the user is being deleted',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });
        this.userService.deleteUser(user.username).subscribe(
          (response) => {
            Swal.fire('Deleted!', 'The user has been deleted successfully', 'success');
            this.data = this.data.filter((u) => u.username !== user.username);

            const userAttributes = localStorage.getItem('user_attributes');
            const currentUser = userAttributes ? JSON.parse(userAttributes) : null;

            if (currentUser && currentUser.username === user.username) {
              this.authService.doLogout();
            }
          },
          (error) => {
            Swal.fire('Error', 'There was an issue deleting the user', 'error');
          }
        );
      }
    });
  }

  onSearch(): void {
    console.log('Search:', this.searchQuery);
  }
}
