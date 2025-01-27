import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { catchError, of, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private hostname = environment.apiUrl;
  private ACCESS_TOKEN = 'access_token';
  private REFRESH_TOKEN = 'refresh_token';
  private USER_ATTRIBUTES = 'user_attributes';

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  doLogin(data: any) {
    localStorage.setItem(this.ACCESS_TOKEN, data.AccessToken);
    localStorage.setItem(this.REFRESH_TOKEN, data.RefreshToken);
    localStorage.setItem(this.USER_ATTRIBUTES, JSON.stringify(data.user));
  }

  getProfile() {
    return this.http.get(`${this.hostname}core/user`);
  }

  viewToken() {
    const jwtToken = this.getJwtToken();
    const refreshToken = this.getRefreshToken();

    if (!jwtToken) {
      return of({ status: false });
    }

    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${jwtToken}`
    );

    return this.http
      .post(
        this.hostname + 'access-control/ValidateTokenCognito',
        { refresh_token: refreshToken },
        { headers }
      )
      .pipe(
        tap((tokens: any) => { }),
        catchError(() => {
          localStorage.removeItem(this.ACCESS_TOKEN);
          this.router.navigate(['/login']);
          return of(null);
        })
      );
  }

  getJwtToken() {
    return localStorage.getItem(this.ACCESS_TOKEN);
  }

  getRefreshToken() {
    return localStorage.getItem(this.REFRESH_TOKEN);
  }

  refreshToken() {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      return of({ token: null });
    }

    return this.http
      .post<any>(`${this.hostname}access-control/RefreshTokenCognito`, {
        refresh_token: this.getRefreshToken(),
      })
      .pipe(
        tap((tokens: any) => {
          localStorage.setItem(this.ACCESS_TOKEN, tokens.access_token);
        }),
        catchError(() => {
          localStorage.removeItem(this.REFRESH_TOKEN);
          this.router.navigate(['/']);
          return of(null);
        })
      );
  }

  doLogout() {
    localStorage.removeItem(this.ACCESS_TOKEN);
    localStorage.removeItem(this.REFRESH_TOKEN);
    localStorage.removeItem(this.USER_ATTRIBUTES);
    localStorage.removeItem('user_attr');
    this.router.navigate(['/login']);
  }
}
