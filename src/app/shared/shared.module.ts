import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from './material/material.module';
import {TableModule} from 'primeng/table';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MaterialModule,
    TableModule,
    FormsModule,
    ReactiveFormsModule,
    DragDropModule,

  ],
  exports:[
    MaterialModule,
    TableModule,
    FormsModule,
    ReactiveFormsModule,
    DragDropModule
  ]
})
export class SharedModule { }
