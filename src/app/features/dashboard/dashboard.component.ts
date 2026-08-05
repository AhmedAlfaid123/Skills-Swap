import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardData, RecentRequest } from '../../models/dashboard';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  dashboardData: DashboardData | null = null;
  loading = true;
  error: string | null = null;

  constructor(
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.fetchDashboardData();
  }

  fetchDashboardData(): void {
    
    this.loading = true;
    
    setTimeout(() => {
      this.dashboardData = {
        skillsOffered: 3,
        skillsToLearn: 2,
        totalMatches: 5,
        recentRequests: [
          { id: '1', userName: 'Alice', status: 'pending', createdAt: new Date().toISOString() },
          { id: '2', userName: 'Bob', status: 'accepted', createdAt: new Date(Date.now() - 86400000).toISOString() }
        ]
      };
      this.loading = false;
      this.cdr.detectChanges();
    }, 500);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'accepted': return 'status-accepted';
      case 'rejected': return 'status-rejected';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  }
}
