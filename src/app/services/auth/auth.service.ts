import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Injectable, Inject, PLATFORM_ID } from '@angular/core'
import { catchError, of, tap } from 'rxjs'
import { Router } from '@angular/router'
import { environment } from '../../../environments/environment'
<<<<<<< HEAD
=======
import { isPlatformBrowser } from '@angular/common'
>>>>>>> f832f1df51e03a14c7129a12a7a4805dc022ab32

@Injectable({
  providedIn: 'root',
})
<<<<<<< HEAD

=======
>>>>>>> f832f1df51e03a14c7129a12a7a4805dc022ab32
export class AuthService {
  private hostname = environment.apiUrl
  private ACCESS_TOKEN = 'access_token'
  private REFRESH_TOKEN = 'refresh_token'
  private USER_ATTRIBUTES = 'user_attributes'

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
<<<<<<< HEAD
  ) { }
=======
  ) {}
>>>>>>> f832f1df51e03a14c7129a12a7a4805dc022ab32

  doLogin(data: any) {
    localStorage.setItem(this.ACCESS_TOKEN, data.AccessToken)
    localStorage.setItem(this.REFRESH_TOKEN, data.RefreshToken)
    localStorage.setItem(this.USER_ATTRIBUTES, JSON.stringify(data.user))
  }

<<<<<<< HEAD
  getUserInfo() { }
=======
  getUserInfo() {}
>>>>>>> f832f1df51e03a14c7129a12a7a4805dc022ab32

  viewToken() {
    const jwtToken = this.getJwtToken()
    const refreshToken = this.getRefreshToken()

<<<<<<< HEAD
    if (!jwtToken) {
      return of({ status: false });
    }

=======
>>>>>>> f832f1df51e03a14c7129a12a7a4805dc022ab32
    const headers = new HttpHeaders().set('Authorization', `Bearer ${jwtToken}`)

    return this.http.post(
      this.hostname + 'UserAccessControl/ValidateTokenCognito',
      { refresh_token: refreshToken },
      { headers },
    )
  }

  getJwtToken() {
    return localStorage.getItem(this.ACCESS_TOKEN)
  }

  getRefreshToken() {
    return localStorage.getItem(this.REFRESH_TOKEN)
  }

  refreshToken() {
    return this.http
      .post<any>(this.hostname + 'UserAccessControl/RefreshTokenCognito', {
        refresh_token: this.getRefreshToken(),
      })
      .pipe(
        tap((tokens: any) => {
          localStorage.setItem(this.ACCESS_TOKEN, tokens.access_token)
        }),
        catchError(() => {
          this.router.navigate(['/'])
          return of(null)
        }),
      )
  }

  doLogout() {
    localStorage.removeItem(this.ACCESS_TOKEN)
    localStorage.removeItem(this.REFRESH_TOKEN)
    localStorage.removeItem(this.USER_ATTRIBUTES)
    this.router.navigate(['/login'])
  }
}
