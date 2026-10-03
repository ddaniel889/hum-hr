import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LeaveRulesComponent } from './leave-rules.component';
import { EmployeeService } from '../../shared/services/employee.service';
import { LeaveService } from '../../shared/services/leave.service';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { CsPaginatorModule } from '../../shared/cs-paginator/cs-paginator.module';
import { ChapaModule } from '../../shared/chapa/chapa.module';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { SharedPipeModule } from '../../shared/pipes/shared-pipe.module';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { CsGridControlModule } from '../../shared/cs-grid-control/cs-grid-control.module';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule} from '@angular/material/card';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
@NgModule({
  declarations: [
    LeaveRulesComponent
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatMenuModule,
    MatRippleModule,
    FormsModule,
    CsPaginatorModule,
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
    MatDialogModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatCardModule,
    MatButtonToggleModule,
    MatTooltipModule
  ],
  exports: [
    LeaveRulesComponent
  ],
  providers: [
    EmployeeService,
    LeaveService
  ]
})
export class LeaveRulesModule { }
