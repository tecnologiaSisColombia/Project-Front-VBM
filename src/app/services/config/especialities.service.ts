import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EspecialitiesService {
  hostname = environment.apiUrl;

  constructor(private http: HttpClient) {}

  get(
    { description, status }: any,
    page: number | null = 1,
    pageSize: number | null = 10,
    init = false
  ) {
    let params = new HttpParams()
      .set('page', page!.toString())
      .set('page_size', pageSize!.toString())
      .set('init', init);
    if (description != null) {
      params = params.set('description', description);
    }
    if (status != null) {
      params = params.set('status', status);
    }
    return this.http.get(`${this.hostname}core/specialities`, { params });
  }
  create(data: any) {
    return this.http.post(`${this.hostname}core/specialities`, data);
  }
  delete(id: number) {
    return this.http.delete(`${this.hostname}core/specialities/${id}`);
  }
  update(id: number, data: any) {
    return this.http.put(`${this.hostname}core/specialities/${id}`, data);
  }
}
