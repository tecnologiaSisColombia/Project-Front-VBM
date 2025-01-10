import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';

@Injectable({
    providedIn: 'root',
})
export class DiagnosisService {
    hostname = environment.apiUrl;

    constructor(private http: HttpClient) { }

    get(
        { description, code }: any,
        page: number | null = 1,
        pageSize: number | null = 10,
        init = false
    ) {
        let params = new HttpParams()
            .set('page', (page ?? 1).toString())
            .set('page_size', (pageSize ?? 10).toString())
            .set('init', init);

        if (description != null) {
            params = params.set('description', description);
        }

        if (code != null) {
            params = params.set('code', code);
        }

        return this.http.get(`${this.hostname}core/diagnosis`, { params });
    }

    create(data: any) {
        return this.http.post(`${this.hostname}core/diagnosis`, data);
    }

    delete(id: number) {
        return this.http.delete(`${this.hostname}core/diagnosis/${id}`);
    }

    update(id: number, data: any) {
        return this.http.put(`${this.hostname}core/diagnosis/${id}`, data);
    }
}
