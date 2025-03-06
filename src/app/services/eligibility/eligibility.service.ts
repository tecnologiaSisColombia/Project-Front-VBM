import { HttpClient, HttpParams } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { environment } from 'environments/environment'

@Injectable({
    providedIn: 'root',
})
export class EligibilityService {
    hostname = environment.apiUrl

    constructor(private http: HttpClient) { }

    getPatients(
        { first_name, last_name, subscriber_id, active, patient_id }: any,
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

        if (active != null) {
            params = params.set('active', active)
        }

        if (patient_id != null) {
            params = params.set('patient_id', patient_id)
        }

        return this.http.get(`${this.hostname}eligibility/patients/`, { params })
    }

    getClaim(
        { patient, id_claim, active, origin, status, suscriber_id }: any,
        page: number | null = 1,
        pageSize: number | null = 10,
        init = false
    ) {
        let params = new HttpParams()
            .set('page', (page ?? 1).toString())
            .set('page_size', (pageSize ?? 10).toString())
            .set('init', init)

        if (patient != null) {
            params = params.set('patient', patient)
        }

        if (id_claim != null) {
            params = params.set('id_claim', id_claim)
        }

        if (origin != null) {
            params = params.set('origin', origin)
        }

        if (status != null) {
            params = params.set('status', status)
        }

        if (active != null) {
            params = params.set('active', active);
        }

        if (suscriber_id != null) {
            params = params.set('suscriber_id', suscriber_id);
        }
        
        return this.http.get(`${this.hostname}eligibility/claim`, { params })
    }

    getClaimCpt(
        { id_claim, active }: any,
        page: number | null = 1,
        pageSize: number | null = 10,
        init = false
    ) {
        let params = new HttpParams()
            .set('page', (page ?? 1).toString())
            .set('page_size', (pageSize ?? 10).toString())
            .set('init', init)

        if (id_claim != null) {
            params = params.set('claim', id_claim)
        }

        if (active != null) {
            params = params.set('active', active);
        }

        return this.http.get(`${this.hostname}eligibility/claim-cpt`, { params })
    }

    getClaimDx(
        { id_claim, active }: any,
        page: number | null = 1,
        pageSize: number | null = 10,
        init = false
    ) {
        let params = new HttpParams()
            .set('page', (page ?? 1).toString())
            .set('page_size', (pageSize ?? 10).toString())
            .set('init', init)

        if (id_claim != null) {
            params = params.set('claim', id_claim)
        }

        if (active != null) {
            params = params.set('active', active);
        }

        return this.http.get(`${this.hostname}eligibility/claim-dx`, { params })
    }

    createClaim(data: any) {
        return this.http.post(`${this.hostname}eligibility/claim`, data)
    }
}
