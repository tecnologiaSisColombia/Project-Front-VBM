import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from '../base/base.service';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root',
})

export class UserService extends BaseService {
    private baseUrl = environment.apiUrl

    constructor(protected override http: HttpClient) {
        super(http);
    }

    requestCreateUser(userData: {
        email: string,
        password: string,
        username: string,
        first_name: string,
        last_name: string,
        phone: string
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
            username
        }
        );
    }

    enableUser(username: string): Observable<any> {
        return this.http.post(`${this.baseUrl}UserAccessControl/EnableUser`, {
            username
        }
        );
    }

}
