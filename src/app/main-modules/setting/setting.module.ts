import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingComponent } from './components/setting/setting.component';
import { AddUpdateSettingComponent } from './components/add-update-setting/add-update-setting.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { CoreModule } from 'src/app/core/core.module';

const routes: Routes = [
  { path: '', component: SettingComponent }  // Default route to PlannerComponent
];

@NgModule({
  declarations: [
    SettingComponent,
    AddUpdateSettingComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
    CoreModule
  ]
})
export class SettingModule { }
