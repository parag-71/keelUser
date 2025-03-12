import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlannerComponent } from './components/planner/planner.component';
import { RouterModule, Routes } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CreateEventComponent } from './components/create-event/create-event.component'; // FullCalendar module
import { SharedModule } from 'src/app/shared/shared.module';
import { CoreModule } from 'src/app/core/core.module';
import { PlannerDummyResourceComponent } from './components/planner-dummy-resource/planner-dummy-resource.component';

const routes: Routes = [
  { path: '', component: PlannerComponent }  // Default route to PlannerComponent
];

@NgModule({
  declarations: [
    PlannerComponent,
    CreateEventComponent,
    PlannerDummyResourceComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FullCalendarModule,
    SharedModule,
    CoreModule
  ]
})
export class PlannerModule { }
