import { Injectable } from '@angular/core'
import { environment } from '../../../environments/environment'
import { HttpClient, HttpParams } from '@angular/common/http'

@Injectable({
  providedIn: 'root',
})
export class PlanService {
  hostname = environment.apiUrl

  constructor(private http: HttpClient) {}

  getPlans(
    { name, insurer }: any,
    page: number = 1,
    pageSize: number = 10,
    init = false,
  ) {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('page_size', pageSize.toString())
      .set('init', init)
    if (name != null) {
      params = params.set('name', name)
    }
    if (insurer != null) {
      params = params.set('insurer', insurer)
    }
    return this.http.get(`${this.hostname}insurers/plan/`, { params })
  }
  getPlan(id: number) {
    return this.http.get(`${this.hostname}insurers/plan/${id}`)
  }
  createPlan(data: any) {
    return this.http.post(`${this.hostname}insurers/plan/`, data)
  }
  updatePlan(id: number, data: any) {
    return this.http.put(`${this.hostname}insurers/plan/${id}`, data)
  }
  deletePlan(id: number) {
    return this.http.delete(`${this.hostname}insurers/plan/${id}`)
  }
}
