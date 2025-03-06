import { HttpClient, HttpParams } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { environment } from 'environments/environment'

@Injectable({
    providedIn: 'root',
})
export class BillingService {
    hostname = environment.apiUrl

    constructor(private http: HttpClient) { }

    convertX12(data: any) {
        return this.http.post(`${this.hostname}x12/convert-x12`, data)
    }
}
