import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private readonly apiUrl = 'http://localhost:5000/api/profile';

  constructor(private http: HttpClient) {}

  getProfileData() {
    return this.http.get(`${this.apiUrl}/show`);
  }

  updateProfile(profileData: { name: string; bio: string; avatarUrl: string }) {
    return this.http.put(`${this.apiUrl}/update`, profileData);
  }

  updateSkills(skillsData: { skillsToTeach: any[]; skillsToLearn: any[] }) {
    return this.http.put(`${this.apiUrl}/updateSkills`, skillsData);
  }
}
