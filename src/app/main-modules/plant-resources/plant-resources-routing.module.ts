import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PlantResourcesComponent } from './components/plant-resources/plant-resources.component';

const routes: Routes = [
    {
		path: '',
		component: PlantResourcesComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PlantResourcesRoutingModule { }
