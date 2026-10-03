import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AddHolidayDialogComponent } from './add-dialog-holiday.component'
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MetadataService } from '../../shared/services/metadatas.service';
import { LeaveService } from '../../shared/services/leave.service';
import { MatDialogModule } from '@angular/material/dialog';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatStepperModule } from '@angular/material/stepper';
import { MatRadioModule } from '@angular/material/radio';
import { MatNativeDateModule, MatOptionModule, MatRippleModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MessageService } from '../../shared/errorHandler/message.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatDialogModule,
    FlexLayoutModule,
    MatStepperModule,
    MatRadioModule,
    MatOptionModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatRippleModule,
    MatNativeDateModule,
    MatSlideToggleModule
  ],
  declarations: [
    AddHolidayDialogComponent
  ],
  exports: [
    AddHolidayDialogComponent
  ],
  providers: [
    MetadataService,
    LeaveService,
    MessageService
  ]
})
export class AddDialogHolidayModule { }
