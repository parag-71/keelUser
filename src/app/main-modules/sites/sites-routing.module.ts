import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SitesComponent } from './components/sites/sites.component';
import { SiteUserPreviewComponent } from './components/site-user-preview/site-user-preview.component';

const routes: Routes = [
  {
    path: '',
    component: SitesComponent,
  },
  {
    path: 'preview-site-user/:siteId',
    component: SiteUserPreviewComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SitesRoutingModule { }
