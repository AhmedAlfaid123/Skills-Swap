import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DiscoveryService } from '../../../../services/discovery.service';
import { User } from '../../../../models/user';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.css'],
  imports: [CommonModule, RouterLink]
})

export class UserDetailsComponent implements OnInit {
 
 user: User | null = null;
  tracks: { id: string; name: string }[] = [];

  searchTerm = '';
  selectedTrackId = '';

  page = 1;
  limit = 20;
  total = 0;

  loading = false;
  errorMessage = '';

  constructor(
    private discoveryService: DiscoveryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadTracks();
    this.loadUsers();
  }

  loadTracks(): void {
    this.discoveryService.getTracks().subscribe({
      next: (response) => (this.tracks = response.data),
      error: () => {
       
      },
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
    this.user = users[0] || null;
    this.total = total;
    this.loading = false;
  }

  private applyError(message: string): void {
    this.errorMessage = message;
    this.loading = false;
  }
}