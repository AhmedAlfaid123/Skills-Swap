export interface RecentRequest {
  id: string;
  userName: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  createdAt: string;
}

export interface DashboardData {
  skillsOffered: number;
  skillsToLearn: number;
  totalMatches: number;
  recentRequests: RecentRequest[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  code?: string;
}
