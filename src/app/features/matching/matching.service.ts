import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { API_BASE_URL } from '../../app.config';
import { FilterOption, Match, MatchFilters, MatchViewModel } from '../../models/match';

@Injectable({ providedIn: 'root' })
export class MatchingService {
  constructor(private readonly httpClient: HttpClient, @Inject(API_BASE_URL) private readonly apiBaseUrl: string) {}

  getMatches(): Observable<MatchViewModel[]> {
    // Using mock data for Day-1 as per requirements
    const mockApiResponse = {
      success: true,
      data: [
        {
          user: { _id: '1', name: 'Alice Smith', avatarUrl: '', bio: 'Frontend Developer' },
          track: { _id: 't1', name: 'Web Development', description: '' },
          skillsToTeach: [{ _id: 's1', trackId: 't1', name: 'Angular' }],
          skillsToLearn: [{ _id: 's2', trackId: 't1', name: 'React' }],
          matchPercentage: 90
        },
        {
          user: { _id: '2', name: 'Bob Jones', avatarUrl: '', bio: 'Backend Engineer' },
          track: { _id: 't2', name: 'Data Science', description: '' },
          skillsToTeach: [{ _id: 's3', trackId: 't2', name: 'Python' }],
          skillsToLearn: [{ _id: 's1', trackId: 't1', name: 'Angular' }],
          matchPercentage: 70
        }
      ]
    };
    return of(mockApiResponse.data).pipe(map((matches) => matches.map((match) => this.toViewModel(match as any))));
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