import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddTimeLineDialogComponent } from './add-dialog-time-lines.component';
import { MatOptionModule, MatRippleModule, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgxMaskModule } from 'ngx-mask';
import { MetadataService } from '../../shared/services/metadatas.service';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { EmployeeLeaveService } from '../../shared/services/employee-leave-requests.service';
import { LeaveService } from '../../shared/services/leave.service';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxMaskModule.forRoot(),
    MatDialogModule,
    FlexLayoutModule,
    MatStepperModule,
    MatRadioModule,
    MatOptionModule,
    MatSelectModule,
    MatDatepickerModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatRippleModule,
    MatNativeDateModule,
    MatSlideToggleModule
  ],
  declarations: [AddTimeLineDialogComponent],
  exports: [AddTimeLineDialogComponent],
  providers: [MetadataService, EmployeeLeaveService, LeaveService]
})
export class AddTimeLineDialogModule { }
