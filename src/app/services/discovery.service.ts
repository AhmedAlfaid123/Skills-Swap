import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../models/user';

export interface UsersResponse {
  success: boolean;
  data: {
    users: User[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface EnrichedSkillRef {
  trackId: string;
  trackName: string;
  skillId: string;
  skillName: string;
}

export interface UserProfile {
  id: string;
  name: string;
  bio: string;
  avatarUrl: string;
  skillsToTeach: EnrichedSkillRef[];
  skillsToLearn: EnrichedSkillRef[];
}

export interface UserProfileResponse {
  success: boolean;
  data: UserProfile;
}

const API_ROOT = 'http://localhost:5000/api';

@Injectable({ providedIn: 'root' })
export class DiscoveryService {
  constructor(private readonly httpClient: HttpClient) {}

  getAllUsers(page = 1, limit = 20): Observable<UsersResponse> {
    const params = new HttpParams().set('page', page).set('limit', limit);
    return this.httpClient.get<UsersResponse>(`${API_ROOT}/users`, { params });
  }

  searchBySkill(skill: string, page = 1, limit = 20): Observable<UsersResponse> {
    const params = new HttpParams().set('skill', skill).set('page', page).set('limit', limit);
    return this.httpClient.get<UsersResponse>(`${API_ROOT}/users/search`, { params });
  }

  filterByTrack(trackId: string, page = 1, limit = 20): Observable<UsersResponse> {
    const params = new HttpParams().set('trackId', trackId).set('page', page).set('limit', limit);
    return this.httpClient.get<UsersResponse>(`${API_ROOT}/users/filter`, { params });
  }

  getUserById(userId: string): Observable<UserProfileResponse> {
    return this.httpClient.get<UserProfileResponse>(`${API_ROOT}/users/${userId}`);
  }

  getTracks(): Observable<{ success: boolean; data: { id: string; name: string }[] }> {
    return this.httpClient.get<{ success: boolean; data: { id: string; name: string }[] }>(`${API_ROOT}/tracks`);
  }
}




