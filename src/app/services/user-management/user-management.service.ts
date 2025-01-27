import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, forkJoin, switchMap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createUser(userData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}access-control/CreateUser`, userData);
  }

  getUsers(
    { username, first_name, last_name }: any,
    page: number | null = 1,
    pageSize: number | null = 10,
    init = false
  ): Observable<any[]> {
    let params = new HttpParams()
      .set('page', (page ?? 1).toString())
      .set('page_size', (pageSize ?? 10).toString())
      .set('init', init);

    if (username != null) {
      params = params.set('username', username);
    }

    if (first_name != null) {
      params = params.set('first_name', first_name);
    }

    if (last_name != null) {
      params = params.set('last_name', last_name);
    }

    return this.http.get<any[]>(`${this.baseUrl}core/users`, { params });
  }

  update(
    id: number,
    data: { username: string; is_active: boolean }
  ): Observable<any> {
    const params = new HttpParams()
      .set('username', data.username)
      .set('is_active', String(data.is_active));

    const cognito = this.http.put(
      `${this.baseUrl}access-control/ChangeStatus`,
      {},
      { params }
    );
    const db = this.http.put(`${this.baseUrl}core/users/${id}`, data);

    return forkJoin([cognito, db]);
  }

  delete(username: string, id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}core/users/${id}`).pipe(
      switchMap((response: any) => {
        return this.http.delete(
          `${this.baseUrl}access-control/DeleteUser/${username}`
        );
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  updateAttributes(userData: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}access-control/UpdateAttributes`,
      userData
    );
  }

  getUserTypes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}core/user-types`);
  }

  getPartnerTypes() {
    return this.http.get<any[]>(`${this.baseUrl}core/partner-types`);
  }

  createUserType(userTypeData: { name: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}core/user-types`, userTypeData);
  }

  updateDataByType(
    type_user: any,
    user_id: number,
    user: any
  ): Observable<any> {
    return this.http.put(
      `${this.baseUrl}access-control/update-type-user/${user_id}?type_user=${type_user.id}`,
      user
    );
  }

  // createWorkingHour(data: any): Observable<any> {
  //   return this.http.post(`${this.baseUrl}core/user-working-hours`, data);
  // }

  // updateWorkingHour(id: any, data: any): Observable<any> {
  //   return this.http.put(`${this.baseUrl}core/user-working-hours/${id}`, data);
  // }

  // deleteWorkingHour(id: any): Observable<any> {
  //   return this.http.delete(`${this.baseUrl}core/user-working-hours/${id}`);
  // }

  // getWorkingHour(user_id: any): Observable<any> {
  //   return this.http.get(`${this.baseUrl}core/user-working-hours/${user_id}`);
  // }
}
