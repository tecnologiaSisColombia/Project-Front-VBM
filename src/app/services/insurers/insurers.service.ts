import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root',
})
export class InsurersService {
  hostname = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getInsurers(
    { name, address, phone, active, payer_id }: any,
    page: number | null = 1,
    pageSize: number | null = 10,
    init = false
  ) {
    let params = new HttpParams()
      .set('page', (page ?? 1).toString())
      .set('page_size', (pageSize ?? 10).toString())
      .set('init', init);

    if (name != null) {
      params = params.set('name', name);
    }

    if (address != null) {
      params = params.set('address', address);
    }

    if (phone != null) {
      params = params.set('phone', phone);
    }

    if (payer_id != null) {
      params = params.set('payer_id', payer_id);
    }

    if (active != null) {
      params = params.set('active', active);
    }

    return this.http.get(`${this.hostname}insurers/`, { params });
  }

  getInsurer(id: number) {
    return this.http.get(`${this.hostname}insurers/${id}`);
  }

  createInsurer(data: any) {
    return this.http.post(`${this.hostname}insurers/`, data);
  }

  updateInsurer(id: number, data: any) {
    return this.http.put(`${this.hostname}insurers/${id}`, data);
  }

  deleteInsurer(id: number) {
    return this.http.delete(`${this.hostname}insurers/${id}`);
  }
}