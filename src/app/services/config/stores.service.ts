import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root',
})
export class StoresService {
  hostname = environment.apiUrl;

  constructor(private http: HttpClient) {}

  get(
    { name, status }: any,
    page: number | null = 1,
    pageSize: number | null = 10,
    init = false
  ) {
    let params = new HttpParams()
      .set('page', page!.toString())
      .set('page_size', pageSize!.toString())
      .set('init', init);

    if (name != null) {
      params = params.set('name', name);
    }

    if (status != null) {
      params = params.set('status', status);
    }

    return this.http.get(`${this.hostname}core/localities`, { params });
  }

  create(data: any) {
    return this.http.post(`${this.hostname}core/localities`, data);
  }

  delete(id: number) {
    return this.http.delete(`${this.hostname}core/localities/${id}`);
  }

  update(id: number, data: any) {
    return this.http.put(`${this.hostname}core/localities/${id}`, data);
  }
}
