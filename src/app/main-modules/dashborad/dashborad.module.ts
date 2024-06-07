import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboradComponent } from './components/dashborad/dashborad.component';
import { DashboradRoutingModule } from './dashborad-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { PreviewDashboardUserComponent } from './components/preview-dashboard-user/preview-dashboard-user.component';



@NgModule({
  declarations: [
    DashboradComponent,
    PreviewDashboardUserComponent
  ],
  imports: [
    CommonModule,
    DashboradRoutingModule,
    SharedModule
  ]
})
export class DashboradModule { }
