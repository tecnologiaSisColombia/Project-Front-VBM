import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { environment } from '../../../environments/environment'

@Injectable({
  providedIn: 'root',
})
export class InsurersService {
  hostname = environment.apiUrl

  constructor(private http: HttpClient) {}

  getInsurers() {
    return this.http.get(`${this.hostname}insurers`)
  }
  getInsurer(id: number) {
    return this.http.get(`${this.hostname}insurers/${id}`)
  }
  createInsurer(data: any) {
    return this.http.post(`${this.hostname}insurers`, data)
  }
  updateInsurer(id: number, data: any) {
    return this.http.put(`${this.hostname}insurers/${id}`, data)
  }
  deleteInsurer(id: number) {
    return this.http.delete(`${this.hostname}insurers/${id}`)
  }
}
