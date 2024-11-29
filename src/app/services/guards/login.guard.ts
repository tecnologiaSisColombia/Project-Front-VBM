import { Injectable } from '@angular/core'
import { Router, CanActivate } from '@angular/router';
import { AuthService } from '../auth/auth.service'

@Injectable()
export class LoginGuardService implements CanActivate {
  constructor(private authService: AuthService, private router: Router) { }

  canActivate(): boolean {
    if (this.authService.getJwtToken()) {
      this.router.navigate(['/home'])
      return false;
    }
    return true
  }
}
