import { Component, OnInit } from '@angular/core'
import { RouterLink, RouterOutlet } from '@angular/router'
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzLayoutModule } from 'ng-zorro-antd/layout'
import { NzMenuModule } from 'ng-zorro-antd/menu'
import { AuthService } from '../../services/auth/auth.service'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzDropDownModule } from 'ng-zorro-antd/dropdown'
import { NzAvatarModule } from 'ng-zorro-antd/avatar'

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
  ],
})

export class FullComponent implements OnInit {
  isCollapsed = false

  constructor(private authService: AuthService) { }


  ngOnInit(): void { }

  logout() {
    this.authService.doLogout()
  }
}
