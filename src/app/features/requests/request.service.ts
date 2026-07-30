import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_BASE_URL } from '../../app.config';
import { RequestPayload, SwapRequest, SwapRequestSummary } from '../../models/swap-request';

@Injectable({ providedIn: 'root' })
export class RequestService {
  constructor(private readonly httpClient: HttpClient, @Inject(API_BASE_URL) private readonly apiBaseUrl: string) {}

  getSentRequests(): Observable<SwapRequestSummary[]> {
    const params = new HttpParams().set('type', 'sent');

    return this.httpClient.get<SwapRequest[]>(`${this.apiBaseUrl}/requests`, { params }).pipe(
      map((requests) => requests.map((request) => this.toSummary(request, 'fromUser')))
    );
  }

  getReceivedRequests(): Observable<SwapRequestSummary[]> {
    const params = new HttpParams().set('type', 'received');

    return this.httpClient.get<SwapRequest[]>(`${this.apiBaseUrl}/requests`, { params }).pipe(
      map((requests) => requests.map((request) => this.toSummary(request, 'toUser')))
    );
  }

  sendRequest(payload: RequestPayload): Observable<SwapRequest> {
    return this.httpClient.post<SwapRequest>(`${this.apiBaseUrl}/requests/send`, payload);
  }

  acceptRequest(requestId: string): Observable<SwapRequest> {
    return this.httpClient.patch<SwapRequest>(`${this.apiBaseUrl}/requests/${requestId}/accept`, {});
  }

  rejectRequest(requestId: string): Observable<SwapRequest> {
    return this.httpClient.patch<SwapRequest>(`${this.apiBaseUrl}/requests/${requestId}/reject`, {});
  }

  cancelRequest(requestId: string): Observable<SwapRequest> {
    return this.httpClient.delete<SwapRequest>(`${this.apiBaseUrl}/requests/${requestId}/cancel`);
  }

  private toSummary(request: SwapRequest, direction: 'fromUser' | 'toUser'): SwapRequestSummary {
    const counterparty = direction === 'fromUser' ? request.toUser : request.fromUser;
    const teachSkill = request.teachSkillId;
    const learnSkill = request.learnSkillId;

    return {
      request,
      counterpartyName: typeof counterparty === 'string' ? 'Unknown user' : counterparty.name,
      counterpartyAvatarUrl: typeof counterparty === 'string' ? '' : counterparty.avatarUrl,
      teachSkillName: typeof teachSkill === 'string' ? 'Skill' : teachSkill.name,
      learnSkillName: typeof learnSkill === 'string' ? 'Skill' : learnSkill.name,
      teachTrackName: this.getTrackName(teachSkill),
      learnTrackName: this.getTrackName(learnSkill)
    };
  }

  private getTrackName(skill: string | { trackId: string | { name: string } }): string {
    if (typeof skill === 'string') {
      return 'General';
    }

    const track = skill.trackId;
    return typeof track === 'string' ? 'General' : track?.name ?? 'General';
  }

}
