import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createUser(userData: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}UserAccessControl/CreateUser`,
      userData
    );
  }

  getUsers(
    { name, lastname, username }: any,
    page: number = 1,
    pageSize: number = 10,
    init = false
  ): Observable<any[]> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('page_size', pageSize.toString())
      .set('init', init);

    if (name != null) {
      params = params.set('name', name);
    }

    if (lastname != null) {
      params = params.set('lastname', lastname);
    }

    if (username != null) {
      params = params.set('username', username);
    }

    return this.http.get<any[]>(`${this.baseUrl}core/users`, { params });
  }

  disableUser(username: string): Observable<any> {
    return this.http.post(`${this.baseUrl}UserAccessControl/DisableUser`, {
      username,
    });
  }

  enableUser(username: string): Observable<any> {
    return this.http.post(`${this.baseUrl}UserAccessControl/EnableUser`, {
      username,
    });
  }

  deleteUser(username: string): Observable<any> {
    return this.http.post(`${this.baseUrl}UserAccessControl/DeleteUser`, {
      username,
    });
  }

  updateAttributes(userData: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}UserAccessControl/UpdateAttributes`,
      userData
    );
  }

  getUserTypes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}core/user-types`);
  }

  createUserType(userTypeData: { name: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}core/user-types`, userTypeData);
  }

  updateDataByType(
    type_user: any,
    user_id: number,
    user: any
  ): Observable<any> {
    let data = {};

    if (user.extra_data && type_user.value === 'Doctor') {
      data = {
        ...user.extra_data[0],
      };
    } else if (user.extra_data && type_user.value === 'Seller') {
      data = {
        store_id: user.extra_data[0].store_id,
      };
    }

    return this.http.put(
      `${this.baseUrl}UserAccessControl/update-type-user/${user_id}?type_user=${type_user.id}`,
      user
    );
  }

  createWorkingHour(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}core/user-working-hours`, data);
  }

  updateWorkingHour(id: any, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}core/user-working-hours/${id}`, data);
  }

  deleteWorkingHour(id: any): Observable<any> {
    return this.http.delete(`${this.baseUrl}core/user-working-hours/${id}`);
  }

  getWorkingHour(user_id: any): Observable<any> {
    return this.http.get(`${this.baseUrl}core/user-working-hours/${user_id}`);
  }

  assignGroups(id: number, groups: any) {
    return this.http.put(`${this.baseUrl}core/users-groups/${id}`, groups);
  }

  getGroups({}, page = 1, page_size = 10, init = false) {
    let params = new HttpParams()
      .append('page', page.toLocaleString())
      .append('page_size', page_size.toLocaleString())
      .append('init', init);
    return this.http.get(`${this.baseUrl}core/groups`, { params });
  }

  addGroup(data: any) {
    return this.http.post(`${this.baseUrl}core/groups`, data);
  }

  updateGroup(id: number, data: any) {
    return this.http.put(`${this.baseUrl}core/groups/${id}`, data);
  }

  getGroupPerfil(grupo_id: any) {
    return this.http.get(`${this.baseUrl}core/profile-group/` + grupo_id);
  }

  updatePerfil(id: number, data: any) {
    return this.http.put(`${this.baseUrl}core/profile-group/` + id, data);
  }

  deleteGroup(id: any) {
    return this.http.delete(`${this.baseUrl}core/groups/${id}`);
  }
  
}
