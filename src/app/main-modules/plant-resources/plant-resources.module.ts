import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextFieldModule } from '@angular/cdk/text-field';
import { PlantResourcesComponent } from './components/plant-resources/plant-resources.component';
import { PlantResourcesRoutingModule } from './plant-resources-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { AddEditPlantResourcesComponent } from './components/add-edit-plant-resources/add-edit-plant-resources.component';
import { PreviewPlantResourcesComponent } from './components/preview-plant-resources/preview-plant-resources.component';



@NgModule({
  declarations: [
    PlantResourcesComponent,
    AddEditPlantResourcesComponent,
    PreviewPlantResourcesComponent
  ],
  imports: [
    CommonModule,
    PlantResourcesRoutingModule,
    SharedModule,
    TextFieldModule
  ]
})
export class PlantResourcesModule { }
