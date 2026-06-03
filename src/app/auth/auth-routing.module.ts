import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthComponent } from './auth.component';
import { LoginComponent } from './components/login/login.component';
import { ForgetPasswordComponent } from './components/forget-password/forget-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { LandingPageComponent } from '../layout/components/landing-page/landing-page.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {
    path: '',
    component: AuthComponent,
    children: [
      
      {
        path: 'login',
        component: LoginComponent,
      },
      {
        path: 'forgot-password',
        component: ForgetPasswordComponent,
      },
      {
        path: 'reset-password/:data',
        component: ResetPasswordComponent,
      },
      // {
      //   path: 'Home',
      //   component: LandingPageComponent,
      // },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthRoutingModule {}
