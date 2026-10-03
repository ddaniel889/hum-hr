import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeaveDetailComponent } from './leave-detail.component';
import { LeaveDetailRoutingModule } from './leave-detail-routing.module';
import { MyMaterialModule } from 'src/app/app.material';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CsPaginatorModule } from '../../shared/cs-paginator/cs-paginator.module';
import { MatRippleModule } from '@angular/material/core';
import { ChapaModule } from '../../shared/chapa/chapa.module';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EmployeeProcessService } from '../../shared/services/employee-process.service';
import { PersonService } from '../../shared/services/person.service';
import { LeaveService } from '../../shared/services/leave.service';

@NgModule({
  providers: [LeaveService],
  declarations: [LeaveDetailComponent],
  imports: [
    CommonModule,
    LeaveDetailRoutingModule,
    FlexLayoutModule,
    MatIconModule,
    MatProgressSpinnerModule,
    ChapaModule
  ]
})
export class LeaveDetailModule { }
