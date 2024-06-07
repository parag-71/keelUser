import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { HeaderComponent } from './components/header/header.component';
import { LeftSiteMenuComponent } from './components/left-site-menu/left-site-menu.component';
import { SharedModule } from '../shared/shared.module';
import { RouterModule } from '@angular/router';
import { LoaderComponent } from './components/loader/loader.component';
import { SearchFilterComponent } from './components/search-filter/search-filter.component';



@NgModule({
  declarations: [
    PageNotFoundComponent,
    HeaderComponent,
    LeftSiteMenuComponent,
    LoaderComponent,
    SearchFilterComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule
  ],
  exports:[
    HeaderComponent,
    LeftSiteMenuComponent,
    LoaderComponent
  ]
})
export class LayoutModule { }
