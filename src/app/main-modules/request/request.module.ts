import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RequestComponent } from './components/request/request.component';
import { RequestRoutingModule } from './request-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { SendCardComponent } from './components/send-card/send-card.component';



@NgModule({
  declarations: [
    RequestComponent,
    SendCardComponent
  ],
  imports: [
    CommonModule,
    RequestRoutingModule,
    SharedModule
  ]
})
export class RequestModule { }
