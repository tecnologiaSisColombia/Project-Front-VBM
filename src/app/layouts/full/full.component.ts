import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { AuthService } from '../../services/auth/auth.service';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-full',
  templateUrl: './full.component.html',
  styleUrls: ['./full.component.css'],
  standalone: true,
  imports: [
    NzBreadCrumbModule,
    NzIconModule,
    NzMenuModule,
    NzLayoutModule,
    RouterOutlet,
    RouterLink,
    NzButtonModule,
    NzDropDownModule,
    NzAvatarModule,
    CommonModule,
  ],
})
export class FullComponent implements OnInit {
  isCollapsed = false;
  permisos = [];
  adminRead = false;
  currentDate: Date = new Date();
  access = {
    admin: false,
    insurers: false,
    users: false,
    plans: false,
    subplans: false,
  };
  role: string = '';

  constructor(
    private authService: AuthService,
    private message: NzMessageService
  ) { }

  ngOnInit(): void {
    this.authService.getProfile().subscribe({
      next: (res: any) => {
        console.log(res);
        this.role = res.groups[0];
        
        res.group_profile.forEach((e: any) => {
          if (e.modulo__modulo == 'users') {
            this.access.users = e.write;
          }

          if (e.modulo__modulo == 'core') {
            this.access.admin = e.write;
          }
          if (e.modulo__modulo == 'plans') {
            this.access.plans = e.write;
          }
          if (e.modulo__modulo == 'subplans') {
            this.access.subplans = e.write;
          }
          if (e.modulo__modulo == 'insurers') {
            this.access.insurers = e.write;
          }
        });
      },
      error: (err) => {
        this.message.error(JSON.stringify(err.error));
      },
    });

    setInterval(() => {
      this.currentDate = new Date();
    }, 1000);
  }

  logout() {
    this.authService.doLogout();
  }
}
