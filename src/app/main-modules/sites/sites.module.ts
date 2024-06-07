import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SitesComponent } from './components/sites/sites.component';
import { SitesRoutingModule } from './sites-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { AddEditSitesComponent } from './components/add-edit-sites/add-edit-sites.component';
import { SiteUserPreviewComponent } from './components/site-user-preview/site-user-preview.component';



@NgModule({
  declarations: [
    SitesComponent,
    AddEditSitesComponent,
    SiteUserPreviewComponent,
  ],
  imports: [
    CommonModule,
    SitesRoutingModule,
    SharedModule
  ]
})
export class SitesModule { }
