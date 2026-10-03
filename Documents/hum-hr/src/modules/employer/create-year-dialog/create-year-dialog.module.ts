import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreateYearDialogComponent } from './create-year-dialog.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { NgxMaskModule } from 'ngx-mask';

@NgModule({
  declarations: [
    CreateYearDialogComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    FlexLayoutModule,
    MatSelectModule,
    MatMenuModule,
    MatTooltipModule,
    NgxMaskModule.forRoot()
  ],
  exports: [
    CreateYearDialogComponent
  ],
  entryComponents: [
    CreateYearDialogComponent
  ]
})
export class CreateYearDialogModule { }
