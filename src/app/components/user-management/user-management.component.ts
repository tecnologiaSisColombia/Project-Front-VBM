import { Component } from '@angular/core'
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
export class UserManagementComponent {
  userData = [
    {
      name: 'Juan Pérez',
      email: 'juan@example.com',
      role: 'Administrador',
      status: 'Active',
    },
    {
      name: 'Maria López',
      email: 'maria@example.com',
      role: 'Médico',
      status: 'Active',
    },
    {
      name: 'Maria López',
      email: 'maria@example.com',
      role: 'Médico',
      status: 'Active',
    },
    {
      name: 'Maria López',
      email: 'maria@example.com',
      role: 'Médico',
      status: 'Active',
    },
    {
      name: 'Maria López',
      email: 'maria@example.com',
      role: 'Médico',
      status: 'Inactive',
    },
    {
      name: 'Maria López',
      email: 'maria@example.com',
      role: 'Médico',
      status: 'Inactive',
    },
  ]
  searchQuery = ''
  loading = false

  openCreateUserModal(): void {
    console.log('Open Create User Modal')
  }

  openCreateUserModalBulk(): void {
    console.log('Open Create User Modal')
  }

  modifyUser(user: any): void {
    console.log('Modify User:', user)
  }

  inactivateUser(user: any): void {
    console.log('Inactivate User:', user)
  }

  onSearch(): void {
    console.log('Search:', this.searchQuery)
    // Implement search logic here
  }
}
