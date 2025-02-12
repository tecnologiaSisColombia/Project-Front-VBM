import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class S3Service {
    hostname = environment.apiUrl;
    
    constructor(private http: HttpClient) { }

    uploadEligibility(data: any): Observable<{ url: string }> {
        return this.http.post<{ url: string }>(`${this.hostname}s3/upload_eligibility`, data);
    }
}