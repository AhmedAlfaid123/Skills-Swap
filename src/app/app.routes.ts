import { Routes } from '@angular/router';
import { homeComponent } from './home/home.component';
import { loginComponent } from './auth/login/login.component';
import { registerComponent } from './auth/register/register.component';
import { MatchingComponent } from './features/matching/matching.component';
import { RequestsComponent } from './features/requests/requests.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { NotificationsComponent } from './features/notifications/notifications.component';
import { ProfileComponent } from './features/profile/profile.component';
import { ExploreComponent } from './features/explore/explore.component';
import { UserDetailsComponent } from './features/explore/user-details/user-details.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: homeComponent },
  { path: 'register', component: registerComponent },
  { path: 'login', component: loginComponent },
  { path: 'explore', component: ExploreComponent},
  { path: 'users/:userId', component: UserDetailsComponent },
  { path: 'matching', component: MatchingComponent },
  { path: 'requests', component: RequestsComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'notifications', component: NotificationsComponent },
  { path: 'profile', component: ProfileComponent },
];
