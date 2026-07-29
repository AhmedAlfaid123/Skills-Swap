import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { DashboardData, ApiResponse } from '../models/dashboard';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = '/api/dashboard'; // As per Member 5 contract

  constructor(private http: HttpClient) {}

  getDashboardData(): Observable<ApiResponse<DashboardData>> {
    // For day 1, we can return mock data or make the actual HTTP call.
    // If you want to use mock data, you can return `of({ success: true, data: { ... } })`
    // Returning actual HTTP call. Ensure interceptor adds auth token.
    return this.http.get<ApiResponse<DashboardData>>(this.apiUrl);
  }
}
