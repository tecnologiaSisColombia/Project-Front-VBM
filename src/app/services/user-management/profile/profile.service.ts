import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class ProfileService {
    private baseUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    getGroups(
        { name }: { name?: string },
        page: number | null = 1,
        pageSize: number | null = 10,
        init: boolean = false
    ) {
        let params = new HttpParams()
            .set('page', (page ?? 1).toString())
            .set('page_size', (pageSize ?? 10).toString())
            .set('init', init.toString());

        if (name) {
            params = params.set('name', name);
        }

        return this.http.get(`${this.baseUrl}core/groups`, { params });
    }

    getGroupPerfil(
        grupo_id: any,
        page: number | null = 1,
        pageSize: number | null = 10,
        init: boolean = false,
        modulo: string | boolean | null = null
    ) {
        let params = new HttpParams()
            .set('page', (page ?? 1).toString())
            .set('page_size', (pageSize ?? 10).toString())
            .set('init', init.toString());

        if (modulo) {
            params = params.set('modulo', modulo);
        }

        return this.http.get(`${this.baseUrl}core/profile-group/${grupo_id}`, { params });
    }

    addGroup(data: any) {
        return this.http.post(`${this.baseUrl}core/groups`, data);
    }

    addPerfilModule(data: any) {
        return this.http.post(`${this.baseUrl}core/profiles`, data);
    }

    updateGroup(id: number, data: any) {
        return this.http.put(`${this.baseUrl}core/groups/${id}`, data);
    }

    updatePerfil(id: number, data: any) {
        return this.http.put(`${this.baseUrl}core/profile-group/` + id, data);
    }

    deleteGroup(id: any) {
        return this.http.delete(`${this.baseUrl}core/groups/${id}`);
    }

    getModules() {
        return this.http.get(`${this.baseUrl}core/modules`);
    }
}
