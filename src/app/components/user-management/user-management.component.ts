import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzDemoDrawerFromDrawerComponent } from '../drawers-modals/drawers/drawer-create-users.component';
import { NzDemoModalLocaleComponent } from '../drawers-modals/modals/modal-edit-user.component';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { UserService } from '../../services/user-management/user-management.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import Swal from 'sweetalert2';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { AuthService } from '../../services/auth/auth.service';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

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
    NzSwitchModule,
  ],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css', '../../../animations/styles.css'],
})
export class UserManagementComponent implements OnInit {
  loading = false;
  data: any[] = [];
  originalData: any[] = [];
  user_types: any[] = [];
  searchQuery: { username: string; fullName: string } = {
    username: '', fullName: ''
  };
  searchQuerySubject: Subject<{
    field: 'username' | 'fullName'; query: string
  }> = new Subject();

  num_pages = 1;
  count_records = 0;
  page_size = 10;
  page = 1;

  private searchNameSubject = new Subject<{ type: string; value: string }>();
  nameSearch: any = null;
  usernameSearch: any = null;
  lastnameSearch: any = null;

  constructor(
    private userService: UserService,
    private msgService: NzMessageService,
    private authService: AuthService
  ) {
    this.searchNameSubject.pipe(debounceTime(2000)).subscribe((data) => {
      if (data.type === 'name') this.nameSearch = data.value;
      if (data.type === 'username') this.usernameSearch = data.value;
      if (data.type === 'lastname') this.lastnameSearch = data.value;
      console.log('pasó');

      this.page = 1;
      this.fetchUsers();
    });
  }

  ngOnInit(): void {
    this.fetchUsers();
    this.getUserTypes();

    this.searchQuerySubject
      .pipe(debounceTime(300))
      .subscribe(({ field, query }) => this.filterData(field, query));
  }

  getUserTypes(): void {
    this.userService.getUserTypes().subscribe({
      next: (response: any) => {
        this.user_types = response;
      },
      error: (error) => {
        this.msgService.error(`Error fetching users`);
      },
    });
  }

  fetchUsers(): void {
    this.loading = true;
    this.userService
      .getUsers({
        name: this.nameSearch,
        lastname: this.lastnameSearch,
        username: this.usernameSearch,
      })
      .subscribe({
        next: (data: any) => {
          this.data = data.results;
          this.originalData = [...data.results];
          this.loading = false;
        },
        error: (error) => {
          this.msgService.error(`Error fetching users`);
          this.loading = false;
        },
      });
  }

  addUserToList(newUser: any): void {
    this.data = [newUser, ...this.data];
  }

  updateUser(updatedUser: any): void {
    this.fetchUsers();
  }

  toggleUserStatus(user: any): void {
    if (user.is_active) {
      Swal.fire({
        text: `Activate ${user.username}? Confirm?`,
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
            text: 'Please wait while the user is being activated',
            allowOutsideClick: false,
            showConfirmButton: false,
            didOpen: () => {
              Swal.showLoading();
            },
          });

          this.userService.enableUser(user.username).subscribe(
            () => {
              Swal.fire(
                '',
                'The user has been activated',
                'success'
              );
              user.is_active = true;
            },
            (error) => {
              Swal.fire(
                '',
                `There was an issue activating the user ${error}`,
                'error'
              );
              user.is_active = false;
            }
          );
        } else {
          user.is_active = false;
        }
      });
    } else {
      Swal.fire({
        text: `Inactivate ${user.username}? Confirm?`,
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
            text: 'Please wait while the user is being inactivated',
            allowOutsideClick: false,
            showConfirmButton: false,
            didOpen: () => {
              Swal.showLoading();
            },
          });

          this.userService.disableUser(user.username).subscribe(
            () => {
              Swal.fire(
                '',
                'The user has been inactivated',
                'success'
              );

              const userAttributes = localStorage.getItem('user_attributes');
              const currentUser = userAttributes ? JSON.parse(userAttributes) : null;

              if (currentUser && currentUser.username === user.username) {
                this.authService.doLogout();
              }

              user.is_active = false;
            },
            (error) => {
              Swal.fire(
                '',
                `There was an issue inactivating the user ${error}`,
                'error'
              );
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
        text: `User ${user.username} is active. Deactivate and delete?`,
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
            text: 'Deactivating the user. Please wait...',
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            },
          });
          this.userService.disableUser(user.username).subscribe(
            () => {
              user.is_active = false;
              Swal.fire({
                text: 'The user has been deactivated successfully. Proceeding with deletion...',
                icon: 'success',
                showConfirmButton: false,
                allowOutsideClick: false,
                timer: 2000,
              });

              this.confirmDeleteUser(user);
            },
            (error) => {
              Swal.fire(
                '',
                `There was an issue deactivating the user: ${error}`,
                'error'
              );
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
      text: `You are about to delete ${user.username}. Do you want to continue?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete',
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          text: 'Please wait while the user is being deleted',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });
        this.userService.deleteUser(user.username).subscribe(
          () => {
            Swal.fire(
              '',
              'The user has been deleted successfully',
              'success'
            );

            this.data = this.data.filter((u) => u.username !== user.username);

            const userAttributes = localStorage.getItem('user_attributes');
            const currentUser = userAttributes ? JSON.parse(userAttributes) : null;

            if (currentUser && currentUser.username === user.username) {
              this.authService.doLogout();
            }
          },
          (error) => {
            Swal.fire('', `There was an issue deleting the user ${error}`, 'error');
          }
        );
      }
    });
  }

  mapUserRole(user_type_id: number): string {
    const type = this.user_types.find((t) => t.id == user_type_id);
    return type.name;
  }

  onSearch(field: 'username' | 'fullName'): void {
    this.loading = true;
    const query = this.searchQuery[field].trim();
    this.searchQuerySubject.next({ field, query });
  }

  filterData(field: string, query: string): void {
    if (query) {
      this.data = this.originalData.filter((user) => {
        if (field === 'username') {
          const username = `${user.username}`;
          return username.includes(query);
        } else if (field === 'fullName') {
          const fullName = `${user.first_name} ${user.last_name}`;
          return fullName.includes(query);
        }
        return true;
      });
    } else {
      this.data = [...this.originalData];
    }
    this.loading = false;
  }
}
