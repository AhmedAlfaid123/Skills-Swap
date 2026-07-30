import { Routes } from '@angular/router';
import { homeComponent } from './home/home.component';
import { loginComponent } from './auth/login/login.component';
import { registerComponent } from './auth/register/register.component';
import { MatchingComponent } from './features/matching/matching.component';
import { RequestsComponent } from './features/requests/requests.component';
import { profileComponent } from './features/profile/profile.component';
export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: homeComponent },
  { path: 'register', component: registerComponent },
  { path: 'login', component: loginComponent },
  { path: 'matching', component: MatchingComponent },
  { path: 'requests', component: RequestsComponent },
  { path: 'profile' , component: profileComponent}
];