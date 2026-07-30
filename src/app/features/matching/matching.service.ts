import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { map, Observable, timeout } from 'rxjs';
import { API_BASE_URL } from '../../app.config';
import { FilterOption, Match, MatchFilters, MatchViewModel } from '../../models/match';

@Injectable({ providedIn: 'root' })
export class MatchingService {
  constructor(private readonly httpClient: HttpClient, @Inject(API_BASE_URL) private readonly apiBaseUrl: string) {}

  getMatches(): Observable<MatchViewModel[]> {
    return this.httpClient.get<Match[]>(`${this.apiBaseUrl}/matches`).pipe(
      timeout(5000),
      map((matches) => matches.map((match) => this.toViewModel(match)))
    );
  }

  searchMatches(searchTerm: string): Observable<MatchViewModel[]> {
    return this.getMatches().pipe(map((matches) => this.applyFilters(matches, { searchTerm, trackName: 'all', skillName: 'all' })));
  }

  filterMatches(filters: MatchFilters): Observable<MatchViewModel[]> {
    return this.getMatches().pipe(map((matches) => this.applyFilters(matches, filters)));
  }

  applyFilters(matches: MatchViewModel[], filters: MatchFilters): MatchViewModel[] {
    const normalizedSearchTerm = filters.searchTerm.trim().toLowerCase();

    return matches.filter((match) => {
      const matchesSearch =
        !normalizedSearchTerm ||
        [match.userName, match.bio, match.trackName, ...match.teachSkills, ...match.learnSkills].join(' ').toLowerCase().includes(normalizedSearchTerm);

      const matchesTrack = filters.trackName === 'all' || match.trackName === filters.trackName;
      const matchesSkill =
        filters.skillName === 'all' ||
        match.teachSkills.some((skill) => skill === filters.skillName) ||
        match.learnSkills.some((skill) => skill === filters.skillName);

      return matchesSearch && matchesTrack && matchesSkill;
    });
  }

  getFilterOptions(matches: MatchViewModel[]): { tracks: FilterOption[]; skills: FilterOption[] } {
    const trackNames = Array.from(new Set(matches.map((match) => match.trackName).filter(Boolean)));
    const skillNames = Array.from(new Set(matches.flatMap((match) => [...match.teachSkills, ...match.learnSkills]).filter(Boolean)));

    return {
      tracks: [{ value: 'all', label: 'All Tracks' }, ...trackNames.map((name) => ({ value: name, label: name }))],
      skills: [{ value: 'all', label: 'All Skills' }, ...skillNames.map((name) => ({ value: name, label: name }))]
    };
  }

  private toViewModel(match: Match): MatchViewModel {
    const user = match.user;
    const trackName = match.track?.name ?? 'General';
    const teachSkills = (match.skillsToTeach ?? []).map((skill) => skill.name);
    const learnSkills = (match.skillsToLearn ?? []).map((skill) => skill.name);

    return {
      userId: user._id,
      userName: user.name,
      bio: user.bio || 'Open to exchanging practical knowledge and project experience.',
      avatarUrl: user.avatarUrl,
      trackName,
      teachSkills,
      learnSkills,
      matchPercentage: Math.max(0, Math.min(100, Math.round(match.matchPercentage))),
      teachSkillId: match.skillsToTeach?.[0]?._id ?? '',
      learnSkillId: match.skillsToLearn?.[0]?._id ?? ''
    };
  }
}
