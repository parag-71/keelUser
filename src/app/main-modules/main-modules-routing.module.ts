import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainModulesComponent } from './main-modules.component';
import { AuthGuard } from '../core/guard/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: MainModulesComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadChildren: () => import('./dashborad/dashborad.module').then(x => x.DashboradModule),
      },
      {
        path: 'sites',
        loadChildren: () => import('./sites/sites.module').then(x => x.SitesModule),
        data: {
          preload: true
        }
      },
      {
        path: 'resources',
        loadChildren: () => import('./resources/resources.module').then(x => x.ResourcesModule),
      },
      {
        path: 'request',
        loadChildren: () => import('./request/request.module').then(x => x.RequestModule),
      },
      {
        path: 'planner',
        loadChildren: () => import('./planner/planner.module').then(x => x.PlannerModule),
      },
      {
        path: 'setting',
        loadChildren: () => import('./setting/setting.module').then(x => x.SettingModule),
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainModulesRoutingModule { }
