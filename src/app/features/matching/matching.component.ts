import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { FilterBarComponent } from './filter-bar/filter-bar';
import { MatchCardComponent } from './match-card/match-card.component';
import { MatchingService } from './matching.service';
import { FilterOption, MatchFilters, MatchRequestSelection, MatchViewModel } from '../../models/match';
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
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef
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
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error.name === 'TimeoutError' || error.status === 0
            ? 'The backend is not running on localhost:5000. Start it, then retry.'
            : error.error?.message ?? 'We could not load your matches right now. Please try again.';
          this.cdr.detectChanges();
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
    this.cdr.detectChanges();
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
    this.cdr.detectChanges();
  }

  handleViewProfile(userId: string): void {
    void this.router.navigate(['/users', userId]);
  }

  handleSendRequest(selection: MatchRequestSelection): void {
    const { match, teachSkillId, learnSkillId } = selection;

    if (!teachSkillId || !learnSkillId) {
      this.showToast('This match is missing a requestable skill pair.');
      return;
    }

    this.requestService
      .sendRequest({ toUser: match.userId, teachSkillId, learnSkillId })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showToast(`Swap request sent to ${match.userName}.`);
          void this.router.navigate(['/requests']);
        },
        error: (error) => {
          this.errorMessage = error.status === 401
            ? 'Please log in before sending a swap request.'
            : error.error?.message ?? 'We could not send that swap request. Please retry.';
          this.cdr.detectChanges();
        }
      });
  }

  retry(): void {
    this.loadMatches();
  }

  private showToast(message: string): void {
    this.toastMessage = message;
    this.toastVisible = true;
    this.cdr.detectChanges();

    window.setTimeout(() => {
      this.toastVisible = false;
      this.cdr.detectChanges();
    }, 2800);
  }
}
