// import { HttpClient, HttpParams } from '@angular/common/http';
// import { Injectable } from '@angular/core';
// import { environment } from 'environments/environment';

// @Injectable({
//   providedIn: 'root',
// })
// export class OfficesService {
//   hostname = environment.apiUrl;

//   constructor(private http: HttpClient) { }

//   get(
//     { name, status }: any,
//     page: number | null = 1,
//     pageSize: number | null = 10,
//     init = false
//   ) {
//     let params = new HttpParams()
//       .set('page', page!.toString())
//       .set('page_size', pageSize!.toString())
//       .set('init', init);

//     if (name != null) {
//       params = params.set('name', name);
//     }

//     if (status != null) {
//       params = params.set('status', status);
//     }

//     return this.http.get(`${this.hostname}core/offices`, { params });
//   }

//   create(data: any) {
//     return this.http.post(`${this.hostname}core/offices`, data);
//   }

//   delete(id: number) {
//     return this.http.delete(`${this.hostname}core/offices/${id}`);
//   }

//   update(id: number, data: any) {
//     return this.http.put(`${this.hostname}core/offices/${id}`, data);
//   }
// }
