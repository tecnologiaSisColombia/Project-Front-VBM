import { Component } from '@angular/core'
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [],
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.css'],
})
export class MainMenuComponent {
  constructor() {
  }
  isCollapsed = false
}
