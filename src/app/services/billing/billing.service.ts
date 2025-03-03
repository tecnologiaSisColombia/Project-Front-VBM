import { HttpClient, HttpParams } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { environment } from 'environments/environment'

@Injectable({
    providedIn: 'root',
})
export class BillingService {
    hostname = environment.apiUrl

    constructor(private http: HttpClient) { }

    getClaim(
        { id_claim, origin }: any,
        page: number | null = 1,
        pageSize: number | null = 10,
        init = false
    ) {
        let params = new HttpParams()
            .set('page', (page ?? 1).toString())
            .set('page_size', (pageSize ?? 10).toString())
            .set('init', init)

        if (id_claim != null) {
            params = params.set('id_claim', id_claim)
        }

        if (origin != null) {
            params = params.set('origin', origin)
        }

        return this.http.get(`${this.hostname}eligibility/claim`, { params })
    }

    createClaim(data: any) {
        return this.http.post(`${this.hostname}eligibility/claim`, data)
    }

    getClaimCpt(
        { id_claim }: any,
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

        return this.http.get(`${this.hostname}eligibility/claim-cpt`, { params })
    }

    getClaimDx(
        { id_claim }: any,
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

        return this.http.get(`${this.hostname}eligibility/claim-dx`, { params })
    }
}
