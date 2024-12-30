import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class LoginService {
    private baseUrl = environment.apiUrl

    constructor(private http: HttpClient) { }

    signIn(data: any): Observable<any> {
        return this.http.post(`${this.baseUrl}access-control/AuthUsers`, data);
    }

    changeTemporaryPassword(data: any): Observable<any> {
        return this.http.post(`${this.baseUrl}access-control/ChangeTemporaryPassword`, data);
    }

    ChangePasswordDays(data: any): Observable<any> {
        return this.http.post(`${this.baseUrl}access-control/ChangePasswordDays`, data);
    }
}
