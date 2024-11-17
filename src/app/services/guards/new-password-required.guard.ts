import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})

export class NewPasswordRequiredGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
<<<<<<< HEAD
  ) { }
=======
  ) {}
>>>>>>> f832f1df51e03a14c7129a12a7a4805dc022ab32

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    if (isPlatformBrowser(this.platformId)) {
      const challenge = localStorage.getItem('auth_challenge');
<<<<<<< HEAD
      
=======
>>>>>>> f832f1df51e03a14c7129a12a7a4805dc022ab32
      if (challenge === 'NewPasswordRequired') {
        return true;
      }
    }
    this.router.navigate(['/login']);
    return false;
  }
}
