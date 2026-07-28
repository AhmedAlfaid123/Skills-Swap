import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class Auth {
  private api = "http://localhost:5000/api/auth";
  constructor(private http: HttpClient) {}
  register(data: any) {
    return this.http.post(`${this.api}/register`, data);
  }
  login(data: any) {
    return this.http.post(`${this.api}/login`, data);
  }
}