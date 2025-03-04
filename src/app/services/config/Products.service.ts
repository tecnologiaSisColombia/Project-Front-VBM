import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  hostname = environment.apiUrl;

  constructor(private http: HttpClient) { }

  get(
    { description, code, payer_id, active }: any,
    page: number | null = 1,
    pageSize: number | null = 10,
    init = false
  ) {
    let params = new HttpParams()
      .set('page', (page ?? 1).toString())
      .set('page_size', (pageSize ?? 10).toString())
      .set('init', init);

    if (payer_id != null) {
      params = params.set('payer_id', payer_id);
    }

    if (description != null) {
      params = params.set('description', description);
    }

    if (code != null) {
      params = params.set('code', code);
    }

    if (active != null) {
      params = params.set('active', active);
    }

    return this.http.get(`${this.hostname}core/products`, { params });
  }

  create(data: any) {
    return this.http.post(`${this.hostname}core/products`, data);
  }

  delete(id: number) {
    return this.http.delete(`${this.hostname}core/products/${id}`);
  }

  update(id: number, data: any) {
    return this.http.put(`${this.hostname}core/products/${id}`, data);
  }
}
