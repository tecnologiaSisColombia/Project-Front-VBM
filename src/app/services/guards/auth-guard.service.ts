import { Injectable } from '@angular/core'
import { Router, CanActivate, ActivatedRouteSnapshot } from '@angular/router'
import { AuthService } from '../auth/auth.service'

@Injectable()
export class AuthGuardService implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): Promise<any> {
    return this.authService
      .viewToken()
      .toPromise()
      .then((resp: any) => {
        if (!resp || !resp.status) {
          this.router.navigate(['/login'])
          return false
        } else {
          return resp.status
        }
      })
  }
}
