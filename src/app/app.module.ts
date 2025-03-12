import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { RouterModule, Routes } from '@angular/router';
import { AuthModule } from './auth/auth.module';
import { MainModulesModule } from './main-modules/main-modules.module';
import { SharedModule } from './shared/shared.module';
import { CoreModule } from './core/core.module';
import { LayoutModule } from './layout/layout.module';
import { PageNotFoundComponent } from './layout/components/page-not-found/page-not-found.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogRef } from '@angular/material/dialog';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ToastrModule } from 'ngx-toastr';
import { ResourceService } from './main-modules/resources/add-resources-service/resource.service';
import { DatePipe } from '@angular/common';
import { RequestService } from './main-modules/request/request-service/request.service';

const app_routes: Routes = [
	 {
		path: '',
		loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule),
	},
  {
		path: '',
		loadChildren: () => import('./main-modules/main-modules.module').then(m => m.MainModulesModule),
	},
]
@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AuthModule,
    MainModulesModule,
    SharedModule,
    CoreModule,
    LayoutModule,
	  ToastrModule.forRoot({
		toastClass: 'toast-custom',
		timeOut: 2000,
	  }),
	  RouterModule.forRoot(app_routes),
    HttpClientModule,
  ],
  providers: [
    ResourceService,
    RequestService,
    DatePipe,
    { provide: MatDialogRef, useValue: {} },
	{ provide: LocationStrategy, useClass: HashLocationStrategy },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
