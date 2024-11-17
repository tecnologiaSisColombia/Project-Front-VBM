import { Injectable } from '@angular/core'
import { environment } from '../../../environments/environment'
import { HttpClient } from '@angular/common/http'

@Injectable({
  providedIn: 'root',
})
export class SubplanService {
  hostname = environment.apiUrl

  constructor(private http: HttpClient) {}

  getSubPlans() {
    return this.http.get(`${this.hostname}insurers/subplan`)
  }
  getSubPlan(id: number) {
    return this.http.get(`${this.hostname}insurers/subplan/${id}`)
  }
  createSubPlan(data: any) {
    return this.http.post(`${this.hostname}insurers/subplan`, data)
  }
  updateSubPlan(id: number, data: any) {
    return this.http.put(`${this.hostname}insurers/subplan/${id}`, data)
  }
  deleteSubPlan(id: number) {
    return this.http.delete(`${this.hostname}insurers/subplan/${id}`)
  }
}
