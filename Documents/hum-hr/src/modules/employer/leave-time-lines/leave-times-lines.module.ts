import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EmployeeService } from '../../shared/services/employee.service';
import { CsPaginatorModule } from '../../shared/cs-paginator/cs-paginator.module';
import { AvatarModule } from 'ngx-avatar';
import { MatMenuModule } from '@angular/material/menu';
import { NgxMaskModule } from 'ngx-mask';
import { SharedPipeModule } from '../../shared/pipes/shared-pipe.module';
import { CsGridControlModule } from '../../shared/cs-grid-control/cs-grid-control.module';
import { ChapaModule } from '../../shared/chapa/chapa.module';
import { LeaveService } from '../../shared/services/leave.service';
import { MatIconModule } from '@angular/material/icon';
import {  MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { LeaveTimesLinesComponent } from './leave-times-lines.component';
import { EditTimeLineDialogComponent } from '../edit-time-line-dialog/edit-time-line-dialog.component';
import { MatCardModule } from '@angular/material/card';

@NgModule({
  declarations: [LeaveTimesLinesComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatMenuModule,
    MatRippleModule,
    FormsModule,
    CsPaginatorModule,
    AvatarModule,
    NgxMaskModule,
    SharedPipeModule.forRoot(),
    CsGridControlModule,
    ChapaModule,
    MatIconModule,
    MatExpansionModule,
    MatButtonModule,
    MatSelectModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    ReactiveFormsModule,
    MatCardModule
  ],
  exports:[LeaveTimesLinesComponent],
  providers: [
    EmployeeService,
    LeaveService
  ],
})
export class LeaveTimesLinesModule { }
