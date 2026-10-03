import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatMenuModule } from '@angular/material/menu';
import { MatRippleModule } from '@angular/material/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { LeavesRoutingModule } from './leaves-routing.module';
import { LeavesComponent } from './leave.component';
import { ProfileModule } from '../../profile/profile.module';
import { WelcomeModule } from '../welcome/welcome.module';
import { ChapaModule } from '../../shared/chapa/chapa.module';
import { EmployeeLeaveService } from '../../shared/services/employee-leave-requests.service';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { LeaveService } from '../../shared/services/leave.service';
import { FormsModule } from '@angular/forms';
import { CsPaginatorModule } from '../../shared/cs-paginator/cs-paginator.module';
@NgModule({
  declarations: [LeavesComponent],
  imports: [
    CommonModule,
    FormsModule,  
    FlexLayoutModule,
    MatMenuModule,
    MatRippleModule,
    MatSidenavModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatToolbarModule,
    MatCardModule,
    LeavesRoutingModule,
    ProfileModule,
    WelcomeModule,
    ChapaModule,
    MatTabsModule,
    MatSelectModule,    
    CsPaginatorModule
  ],
  providers: [EmployeeLeaveService,LeaveService],
})
export class LeavesModule { }
