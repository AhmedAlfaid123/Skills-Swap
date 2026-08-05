import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { User } from '../../../models/user';
import { DiscoveryService } from '../../../services/discovery.service';

@Component({
  selector: 'app-user-details',
  standalone: true,
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.css'],
  imports: [CommonModule, RouterLink]
})
export class UserDetailsComponent implements OnInit {
  user: User | null = null;
  loading = false;
  errorMessage = '';

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly route: ActivatedRoute,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('userId');
    if (!userId) {
      this.applyError('User not found.');
      return;
    }

    this.loading = true;
    this.discoveryService.getUserById(userId).subscribe({
      next: (response) => {
        this.user = response.data as unknown as User;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => this.applyError('Failed to load this user profile.')
    });
  }

  private applyError(message: string): void {
    this.errorMessage = message;
    this.loading = false;
    this.cdr.detectChanges();
  }
}
