import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { FilterBarComponent } from './filter-bar/filter-bar';
import { MatchCardComponent } from './match-card/match-card.component';
import { MatchingService } from './matching.service';
import { FilterOption, MatchFilters, MatchViewModel } from '../../models/match';
import { RequestService } from '../requests/request.service';


@Component({
  selector: 'app-matching',
  standalone: true,
  imports: [CommonModule, FilterBarComponent, MatchCardComponent],
  templateUrl: './matching.component.html',
  styleUrl: './matching.component.css'
})
export class MatchingComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  protected allMatches: MatchViewModel[] = [];
  protected visibleMatches: MatchViewModel[] = [];
  protected trackOptions: FilterOption[] = [{ value: 'all', label: 'All Tracks' }];
  protected skillOptions: FilterOption[] = [{ value: 'all', label: 'All Skills' }];
  protected loading = true;
  protected errorMessage = '';
  protected searchTerm = '';
  protected selectedTrack = 'all';
  protected selectedSkill = 'all';
  protected toastMessage = '';
  protected toastVisible = false;

  constructor(
    private readonly matchingService: MatchingService,
    private readonly requestService: RequestService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadMatches();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadMatches(): void {
    this.loading = true;
    this.errorMessage = '';

    this.matchingService
      .getMatches()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (matches) => {
          this.allMatches = matches;
          this.visibleMatches = matches;
          const filterOptions = this.matchingService.getFilterOptions(matches);
          this.trackOptions = filterOptions.tracks;
          this.skillOptions = filterOptions.skills;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.errorMessage = 'We could not load your matches right now. Please try again.';
        }
      });
  }

  applyFilters(): void {
    const filters: MatchFilters = {
      searchTerm: this.searchTerm,
      trackName: this.selectedTrack,
      skillName: this.selectedSkill
    };

    this.visibleMatches = this.matchingService.applyFilters(this.allMatches, filters);
  }

  onSearchTermChange(searchTerm: string): void {
    this.searchTerm = searchTerm;
    this.applyFilters();
  }

  onSelectedTrackChange(trackId: string): void {
    this.selectedTrack = trackId;
    this.applyFilters();
  }

  onSelectedSkillChange(skillId: string): void {
    this.selectedSkill = skillId;
    this.applyFilters();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedTrack = 'all';
    this.selectedSkill = 'all';
    this.errorMessage = '';
    this.visibleMatches = this.matchingService.applyFilters(this.allMatches, {
      searchTerm: '',
      trackName: 'all',
      skillName: 'all'
    });
  }

  handleViewProfile(userId: string): void {
    void this.router.navigate(['/profile', userId]);
  }

  handleSendRequest(match: MatchViewModel): void {
    if (!match.teachSkillId || !match.learnSkillId) {
      this.showToast('This match is missing a requestable skill pair.');
      return;
    }

    this.requestService
      .sendRequest({ toUser: match.userId, teachSkillId: match.teachSkillId, learnSkillId: match.learnSkillId })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.showToast(`Swap request sent to ${match.userName}.`),
        error: () => {
          this.errorMessage = 'We could not send that swap request. Please retry.';
        }
      });
  }

  retry(): void {
    this.loadMatches();
  }

  private showToast(message: string): void {
    this.toastMessage = message;
    this.toastVisible = true;

    window.setTimeout(() => {
      this.toastVisible = false;
    }, 2800);
  }
}
