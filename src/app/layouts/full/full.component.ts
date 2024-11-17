import { Component, OnInit } from '@angular/core'
import { Router, RouterLink, RouterOutlet } from '@angular/router'
// import { AuthService } from 'app/services/auth/auth.service'
// import { InicioService } from 'app/services/inicio/inicio.service'
// import Swal from 'sweetalert2'

import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzLayoutModule } from 'ng-zorro-antd/layout'
import { NzMenuModule } from 'ng-zorro-antd/menu'
import { AuthService } from '../../services/auth/auth.service'
import { NzButtonModule } from 'ng-zorro-antd/button'

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
  ],
})
export class FullComponent implements OnInit {
  isCollapsed = false
  constructor(private authService: AuthService, private router: Router) {}

  // clienteDatos: any = {}
  // MENU_ITEMS: any[] = []

  // rol: string = ''

  ngOnInit(): void {
    // this.getInicio()
    // this.rol = this.authService.getRolName()!
  }
  logout() {
    this.authService.doLogout()
  }

  // getInicio() {
  //   this.inicioService.getInicio().subscribe({
  //     next: (res: any) => {
  //       //console.log(res)
  //       localStorage.setItem('sara_inicio', JSON.stringify(res))
  //       this.clienteDatos = res.datos
  //       this.MENU_ITEMS = res.cargaMenu.menuPorRol
  //       localStorage.setItem('cargaMenu', btoa(JSON.stringify(this.MENU_ITEMS)))
  //       //console.log(this.MENU_ITEMS)
  //     },
  //     error: (error) => {
  //       //console.error(error)
  //       Swal.fire({
  //         icon: 'error',
  //         text: error.error.title,
  //       })
  //     },
  //   })
  // }

  // logout() {
  //   this.authService.doLogoutUser()
  //   this.router.navigate(['/login'])
  // }
}
