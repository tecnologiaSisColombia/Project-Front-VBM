import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { NzIconModule, NzIconService } from 'ng-zorro-antd/icon'
import { NzLayoutModule } from 'ng-zorro-antd/layout'
import { NzMenuModule } from 'ng-zorro-antd/menu'
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb'
import {
  PieChartOutline,
  DesktopOutline,
  UserOutline,
  TeamOutline,
  LockOutline,
  ProfileOutline,
  ShoppingOutline,
  DownloadOutline,
  FileTextOutline,
  ControlOutline,
  FileSearchOutline,
} from '@ant-design/icons-angular/icons'

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [],
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.css'],
})

export class MainMenuComponent {
  constructor(private iconService: NzIconService) {
    this.iconService.addIcon(
      PieChartOutline,
      DesktopOutline,
      UserOutline,
      TeamOutline,
      LockOutline,
      ProfileOutline,
      ShoppingOutline,
      DownloadOutline,
      FileTextOutline,
      ControlOutline,
      FileSearchOutline,
    )
  }
  isCollapsed = false
}
