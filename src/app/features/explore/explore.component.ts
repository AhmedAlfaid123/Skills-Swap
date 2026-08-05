import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { DiscoveryService } from '../../services/discovery.service';
import { User } from '../../models/user';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-explore',
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})



export class ExploreComponent implements OnInit {
  users: User[] = [];
  tracks: { id: string; name: string }[] = [];

  searchTerm = '';
  selectedTrackId = '';

  page = 1;
  limit = 20;
  total = 0;

  loading: boolean = false;
  errorMessage: string = '';

  constructor(
    private discoveryService: DiscoveryService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadTracks();
    this.loadUsers();
  }

  loadTracks(): void {
    this.discoveryService.getTracks().subscribe({
      next: (response) => {
        this.tracks = response.data;
        this.cdr.detectChanges();
      },
      error: () => { },
    });
  }

  loadUsers(): void {
    this.loading = true;
    this.errorMessage = '';

    this.discoveryService.getAllUsers(this.page, this.limit).subscribe({
      next: (response) =>
        this.applyResults(response.data.users, response.data.total),
      error: () => this.applyError('Failed to load users.'),
    });
  }

  onSearch(): void {
    const term = this.searchTerm.trim();

    if (!term) {
      this.loadUsers();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.discoveryService.searchBySkill(term, this.page, this.limit).subscribe({
      next: (response) =>
        this.applyResults(response.data.users, response.data.total),
      error: () => this.applyError('Search failed.'),
    });
  }

  onFilterByTrack(): void {
    if (!this.selectedTrackId) {
      this.loadUsers();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.discoveryService
      .filterByTrack(this.selectedTrackId, this.page, this.limit)
      .subscribe({
        next: (response) =>
          this.applyResults(response.data.users, response.data.total),
        error: () => this.applyError('Filtering failed.'),
      });
  }

  goToUserDetails(userId: string): void {
    this.router.navigate(['/users', userId]);
  }

  private applyResults(users: User[], total: number): void {
    this.users = users;
    this.total = total;
    this.loading = false;
    this.cdr.detectChanges();
  }

  private applyError(message: string): void {
    this.errorMessage = message;
    this.loading = false;
    this.cdr.detectChanges();
  }
}