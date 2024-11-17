import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from '../base/base.service';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root',
})

export class ResetPasswordService extends BaseService {
    private baseUrl = environment.apiUrl

    constructor(protected override http: HttpClient) {
        super(http);
    }

    requestReset(email: string): Observable<any> {
        return this.http.post(`${this.baseUrl}UserAccessControl/ResetPassword`, { 
            email 
        });
    }

    resendConfirmationCode(email: string): Observable<any> {
        return this.http.post(`${this.baseUrl}UserAccessControl/ResendConfirmationCode`, { 
            email 
        });
    }

    confirmResetPassword(email: string, confirmationCode: string, newPassword: string): Observable<any> {
        return this.http.post(`${this.baseUrl}UserAccessControl/ConfirmResetPassword`, {
            email,
            confirmation_code: confirmationCode,
            new_password: newPassword,
        });
    }
}
