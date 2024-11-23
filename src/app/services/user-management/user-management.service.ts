import { Host, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  requestCreateUser(userData: {
    email: string;
    password: string;
    username: string;
    first_name: string;
    last_name: string;
    phone: string;
    type_user: string;
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}UserAccessControl/CreateUser`,
      userData
    );
  }

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}core/users`);
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

  updateAttributes(userData: {
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    phone: string;
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}UserAccessControl/UpdateAttributes`,
      userData
    );
  }

  getUserTypes(): Observable<any> {
    return this.http.get<any[]>(`${this.baseUrl}core/user-types`);
  }

  createUserType(userTypeData: { name: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}core/user-types`, userTypeData);
  }

  updateDataByType(type_user: any, user_id: number, user: any) {
    let data = {};
    if (user.extra_data && type_user.value == 'Doctor') {
      data = {
        ...user.extra_data[0],
      };
    } else if (user.extra_data && type_user.value == 'Seller') {
      data = {
        store_id: user.extra_data[0].store_id,
      };
    }
    return this.http.put(
      `${this.baseUrl}UserAccessControl/update-type-user/${user_id}?type_user=${type_user.id}`,
      data
    );
  }

  createWorkingHour(data: any) {
    return this.http.post(`${this.baseUrl}core/user-working-hours`, data);
  }

  updateWorkingHour(id: any, data: any) {
    return this.http.put(`${this.baseUrl}core/user-working-hours/${id}`, data);
  }

  deleteWorkingHour(id: any) {
    return this.http.delete(`${this.baseUrl}core/user-working-hours/${id}`);
  }

  getWorkingHour(user_id: any) {
    return this.http.get(`${this.baseUrl}core/user-working-hours/${user_id}`);
  }
}
