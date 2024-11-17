import { Injectable } from '@angular/core'
import { environment } from '../../../environments/environment'
import { HttpClient } from '@angular/common/http'

@Injectable({
  providedIn: 'root',
})
export class PlanService {
  hostname = environment.apiUrl

  constructor(private http: HttpClient) {}

  getPlans() {
    return this.http.get(`${this.hostname}insurers/plan`)
  }
  getPlan(id: number) {
    return this.http.get(`${this.hostname}insurers/plan/${id}`)
  }
  createPlan(data: any) {
    return this.http.post(`${this.hostname}insurers/plan`, data)
  }
  updatePlan(id: number, data: any) {
    return this.http.put(`${this.hostname}insurers/plan/${id}`, data)
  }
  deletePlan(id: number) {
    return this.http.delete(`${this.hostname}insurers/plan/${id}`)
  }
}
