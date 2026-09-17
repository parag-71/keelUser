import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextFieldModule } from '@angular/cdk/text-field';
import { RouterModule, Routes } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import { SharedModule } from 'src/app/shared/shared.module';
import { CoreModule } from 'src/app/core/core.module';
import { VacancyPlannerComponent } from './components/vacancy-planner/vacancy-planner.component';
import { CreateVacancyEventComponent } from './components/create-vacancy-event/create-vacancy-event.component';
import { AddVacancyRoleComponent } from './components/add-vacancy-role/add-vacancy-role.component';
import { AddVacancyPlantComponent } from './components/add-vacancy-plant/add-vacancy-plant.component';
import { ManagePlannerEntitiesComponent } from './components/manage-planner-entities/manage-planner-entities.component';

const routes: Routes = [
  { path: '', redirectTo: 'people', pathMatch: 'full' },
  { path: 'people', component: VacancyPlannerComponent, data: { vacancyType: 'people' } },
  { path: 'plant', component: VacancyPlannerComponent, data: { vacancyType: 'plant' } }
];

@NgModule({
  declarations: [
    VacancyPlannerComponent,
    CreateVacancyEventComponent,
    AddVacancyRoleComponent,
    AddVacancyPlantComponent,
    ManagePlannerEntitiesComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FullCalendarModule,
    SharedModule,
    TextFieldModule,
    CoreModule
  ]
})
export class VacancyPlannerModule { }
