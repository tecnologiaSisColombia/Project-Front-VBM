import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class ResetPasswordService {
    private baseUrl = environment.apiUrl

    constructor(private http: HttpClient) { }

    requestReset(email: string): Observable<any> {
        return this.http.post(`${this.baseUrl}access-control/ResetPassword`, { email });
    }

    resendConfirmationCode(email: string): Observable<any> {
        return this.http.post(`${this.baseUrl}access-control/ResendConfirmationCode`, { email });
    }

    confirmResetPassword(data: any): Observable<any> {
        return this.http.post(`${this.baseUrl}access-control/ConfirmResetPassword`, data);
    }
}
