import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MainModulesRoutingModule } from './main-modules-routing.module';
import { MainModulesComponent } from './main-modules.component';
import { LayoutModule } from '../layout/layout.module';
import { SharedModule } from '../shared/shared.module';
import { DashboradModule } from './dashborad/dashborad.module';
import { RequestModule } from './request/request.module';
import { ResourcesModule } from './resources/resources.module';
import { SitesModule } from './sites/sites.module';


@NgModule({
  declarations: [
    MainModulesComponent,
  ],
  imports: [
    CommonModule,
    MainModulesRoutingModule,
    DashboradModule,
    RequestModule,
    ResourcesModule,
    SitesModule,
    LayoutModule,
    SharedModule
  ]
})
export class MainModulesModule { }
