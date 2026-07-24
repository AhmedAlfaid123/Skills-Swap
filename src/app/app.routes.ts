import { Routes } from '@angular/router';
import { homeComponent } from './home/home.component';
import { loginComponent } from './auth/login/login.component';
import { registerComponent } from './auth/register/register.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: homeComponent },
  { path: 'register', component: registerComponent },
  { path: 'login', component: loginComponent }
];
