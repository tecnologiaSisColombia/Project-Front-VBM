import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from '../base/base.service';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root',
})

export class LoginService extends BaseService {
    private baseUrl = environment.apiUrl

    constructor(protected override http: HttpClient) {
        super(http);
    }

    signIn(username: string, password: string): Observable<any> {
        return this.http.post(`${this.baseUrl}UserAccessControl/AuthUsers`, {
            username,
            password
        });
    }

    changeTemporaryPassword(username: string, new_password: string, session: string): Observable<any> {
        return this.http.post(`${this.baseUrl}UserAccessControl/ChangeTemporaryPassword`, {
            username,
            new_password,
            session
        });
    }
}
