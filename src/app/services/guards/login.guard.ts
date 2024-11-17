import { Injectable } from '@angular/core'
import { Router, CanActivate, ActivatedRouteSnapshot } from '@angular/router'
import { AuthService } from '../auth/auth.service'

@Injectable()
export class LoginGuardService implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): any {
    if (this.authService.getJwtToken()) {
      this.router.navigate(['/home'])
      // return false
    }
    return true
  }
}
