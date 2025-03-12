import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatListModule} from '@angular/material/list';
import {MatTableModule} from '@angular/material/table';
import {MatDialogModule} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon'
import {MatSelectModule} from '@angular/material/select';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatTabsModule} from '@angular/material/tabs';
import {MatCheckboxModule} from '@angular/material/checkbox'
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';
import {MatCardModule} from '@angular/material/card';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { CalendarModule } from 'primeng/calendar';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatMenuModule} from '@angular/material/menu';
import {MatBadgeModule} from '@angular/material/badge';
import { MatChipsModule } from '@angular/material/chips';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatButtonModule} from '@angular/material/button';
import {MatRadioModule} from '@angular/material/radio';
const modules = [
  MatSidenavModule,
  MatListModule,
  MatTableModule,
  MatDialogModule,
  MatIconModule,
  MatSelectModule, 
  MatSlideToggleModule,
  MatInputModule,
  MatFormFieldModule,
  MatTabsModule,
  MatCheckboxModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatCardModule,
  MatPaginatorModule,
  MatProgressSpinnerModule,
  CalendarModule,
  DragDropModule,
  MatTooltipModule,
  MatExpansionModule,
  MatMenuModule,
  MatBadgeModule,
  MatChipsModule,
  MatButtonToggleModule,
  MatAutocompleteModule,
  MatButtonModule,
  MatRadioModule
]
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    modules
  ],
  exports: [
    modules
  ]
})
export class MaterialModule { }
