import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResourcesComponent } from './components/resources/resources.component';
import { ResourcesRoutingModule } from './resources-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { AddEditResourcesComponent } from './components/add-edit-resources/add-edit-resources.component';
import { PreviewResourcesComponent } from './components/preview-resources/preview-resources.component';



@NgModule({
  declarations: [
    ResourcesComponent,
    AddEditResourcesComponent,
    PreviewResourcesComponent
  ],
  imports: [
    CommonModule,
    ResourcesRoutingModule,
    SharedModule
  ]
})
export class ResourcesModule { }
