import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class NewPasswordRequiredGuard implements CanActivate {
  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  canActivate(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      const challenge = localStorage.getItem('auth_challenge');
      if (challenge === 'NewPasswordRequired') {
        return true;
      }
    }
    this.router.navigate(['/login']);
    return false;
  }
}
