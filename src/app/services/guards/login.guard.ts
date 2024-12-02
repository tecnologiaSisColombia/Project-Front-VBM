import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { catchError, of, switchMap, tap } from 'rxjs';

@Injectable()
export class LoginGuardService implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): any {
    return this.authService.viewToken().pipe(
      switchMap((t) => {
        if (t.status) {
          this.router.navigate(['/home']);
          return of(false);
        } else {
          return of(true);
        }
      }),
      catchError((er) => {
        localStorage.removeItem('access_token');
        return er;
      })
    );
  }
}
