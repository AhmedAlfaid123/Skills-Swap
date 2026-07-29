import { Routes } from '@angular/router';
import { homeComponent } from './home/home.component';
import { loginComponent } from './auth/login/login.component';
import { registerComponent } from './auth/register/register.component';
import { MatchingComponent } from './features/matching/matching.component';
import { RequestsComponent } from './features/requests/requests.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { NotificationsComponent } from './features/notifications/notifications.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: homeComponent },
  { path: 'register', component: registerComponent },
  { path: 'login', component: loginComponent },
  { path: 'matching', component: MatchingComponent },
  { path: 'requests', component: RequestsComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'notifications', component: NotificationsComponent }
];
