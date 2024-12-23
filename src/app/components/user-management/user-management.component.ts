import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzDemoDrawerFromDrawerComponent } from '../drawers-modals/drawer-create-user/drawer-create-users.component';
import { NzDemoModalLocaleComponent } from '../drawers-modals/modal-edit-user/modal-edit-user.component';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { UserService } from '../../services/user-management/user-management.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import Swal from 'sweetalert2';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { AuthService } from '../../services/auth/auth.service';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import * as XLSX from 'xlsx';

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
  styleUrls: [
    './user-management.component.css',
    '../../../animations/styles.css',
  ],
})
export class UserManagementComponent implements OnInit {
  loading = false;
  data: any[] = [];
  originalData: any[] = [];
  user_types: any[] = [];
  searchQuery: { username: string; fullName: string } = {
    username: '',
    fullName: '',
  };
  searchQuerySubject: Subject<{
    field: 'username' | 'fullName';
    query: string;
  }> = new Subject();
  num_pages = 1;
  count_records = 0;
  page_size = 10;
  page = 1;
  nameSearch: any = null;
  usernameSearch: any = null;
  lastnameSearch: any = null;
  private searchNameSubject = new Subject<{ type: string; value: string }>();

  constructor(
    private userService: UserService,
    private msgService: NzMessageService,
    private authService: AuthService
  ) {
    this.searchNameSubject.pipe(debounceTime(2000)).subscribe((data) => {
      if (data.type === 'name') this.nameSearch = data.value;
      if (data.type === 'username') this.usernameSearch = data.value;
      if (data.type === 'lastname') this.lastnameSearch = data.value;
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
        this.user_types = response || [];
      },
      error: (error) => {
        this.msgService.error(JSON.stringify(error || 'Error getUserTypes'));
        this.user_types = [];
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
          this.msgService.error(JSON.stringify(error || 'Error fetchUsers'));
          this.loading = false;
        },
      });
  }

  addUserToList(newUser: any): void {
    this.data = [newUser, ...this.data];
    this.fetchUsers();
  }

  updateUser(updatedUser: any): void {
    this.fetchUsers();
  }

  toggleUserStatus(user: any): void {
    const toggleAction = user.is_active
      ? this.userService.enableUser(user.username)
      : this.userService.disableUser(user.username);

    toggleAction.subscribe(
      () => {
        this.msgService.success('User updated successfully');

        user.is_active = user.is_active;

        if (!user.is_active) {
          const userAttributes = localStorage.getItem('user_attributes');
          const currentUser = userAttributes
            ? JSON.parse(userAttributes)
            : null;

          if (currentUser?.username === user.username) {
            this.authService.doLogout();
          }
        }
      },
      (error) => {
        this.msgService.error(JSON.stringify(error.error));
        user.is_active = !user.is_active;
      }
    );
  }

  deleteUser(user: any): void {
    Swal.fire({
      title: 'Are you sure to delete?',
      showDenyButton: true,
      confirmButtonText: 'Yes',
      denyButtonText: `No`,
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading = true;
        this.userService.deleteUser(user.username).subscribe({
          next: () => {
            this.msgService.success('User deleted successfully');
            this.loading = false;

            this.data = this.data.filter((u) => u.username !== user.username);

            const userAttributes = localStorage.getItem('user_attributes');
            const currentUser = userAttributes
              ? JSON.parse(userAttributes)
              : null;

            if (currentUser && currentUser.username === user.username) {
              this.authService.doLogout();
            }
          },
          error: (err) => {
            this.loading = false;
            this.msgService.error(JSON.stringify(err.error));
          },
        });
      }
    });
  }

  mapUserRole(user_type_id: number): string {
    const type = this.user_types.find((t) => t.id == user_type_id);
    return type ? type.name : 'Unknown Role';
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

  exportUsersToXLS(): void {
    if (this.data.length === 0) {
      this.msgService.warning('No data available to export');
      return;
    }

    this.loading = true;

    const headers: Record<
      | 'first_name'
      | 'last_name'
      | 'email'
      | 'username'
      | 'phone'
      | 'is_active'
      | 'role',
      string
    > = {
      role: 'Role',
      first_name: 'First Name',
      last_name: 'Last Name',
      email: 'Email',
      username: 'Username',
      phone: 'Phone',
      is_active: 'Status',
    };

    const selectedColumns = Object.keys(headers) as (keyof typeof headers)[];

    const filteredData = this.data.map((user) =>
      selectedColumns.reduce((obj: Record<string, any>, key) => {
        if (key === 'is_active') {
          obj[headers[key]] = user[key] == 1 ? 'Active' : 'Inactive';
        } else if (key === 'role') {
          obj[headers[key]] = user.extra_data
            ? this.mapUserRole(user.extra_data[0].user_type_id)
            : 'Root';
        } else {
          obj[headers[key]] = user[key];
        }
        return obj;
      }, {})
    );

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(filteredData);

    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');

    const excelBuffer: ArrayBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', 'users.xlsx');
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.loading = false;
  }
}
