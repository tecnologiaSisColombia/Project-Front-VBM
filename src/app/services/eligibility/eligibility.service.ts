import { HttpClient, HttpParams } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { environment } from '../../../environments/environment'

@Injectable({
    providedIn: 'root',
})
export class EligibilityService {
    hostname = environment.apiUrl

    constructor(private http: HttpClient) { }

    getPatients(
        { first_name, last_name, subscriber_id, status }: any,
        page: number | null = 1,
        pageSize: number | null = 10,
        init = false,
    ) {
        let params = new HttpParams()
            .set('page', (page ?? 1).toString())
            .set('page_size', (pageSize ?? 10).toString())
            .set('init', init)

        if (first_name != null) {
            params = params.set('first_name', first_name)
        }

        if (last_name != null) {
            params = params.set('last_name', last_name)
        }

        if (subscriber_id != null) {
            params = params.set('subscriber_id', subscriber_id)
        }

        if (status != null) {
            params = params.set('status', status)
        }

        return this.http.get(`${this.hostname}eligibility/patients/`, { params })
    }
}
