import { Injectable } from '@angular/core';
import { environment } from 'environments/environment'
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class SubplanService {
  hostname = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getSubPlans(
    plan_id: number | null = null,
    { name, plan, group, plan_contract, active }: any,
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

    if (plan != null) {
      params = params.set('plan', plan);
    }

    if (group != null) {
      params = params.set('group', group);
    }

    if (plan_contract != null) {
      params = params.set('plan_contract', plan_contract);
    }

    if (plan_id != null) {
      params = params.set('plan_id', plan_id);
    }

    if (active != null) {
      params = params.set('active', active);
    }

    return this.http.get(`${this.hostname}insurers/subplan/`, { params });
  }

  getSubPlan(id: number) {
    return this.http.get(`${this.hostname}insurers/subplan/${id}`);
  }

  createSubPlan(data: any) {
    return this.http.post(`${this.hostname}insurers/subplan/`, data);
  }

  updateSubPlan(id: number, data: any) {
    return this.http.put(`${this.hostname}insurers/subplan/${id}`, data);
  }

  deleteSubPlan(id: number) {
    return this.http.delete(`${this.hostname}insurers/subplan/${id}`);
  }
}
