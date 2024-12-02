import { Injectable } from '@angular/core'
import { Router, CanActivate } from '@angular/router';
import { AuthService } from '../auth/auth.service'

@Injectable()
export class AuthGuardService implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Promise<boolean> {
    return this.authService
      .viewToken()
      .toPromise()
      .then((resp: any) => {
        if (!resp || !resp.status) {
          this.router.navigate(['/login'])
          return false
        } else {
          return true
        }
      })
  }
}
