import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { LeaveFindRoutingModule } from './leave-find-routing.module';
import { LeaveFindComponent } from './leave-find.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EmployeeService } from '../../shared/services/employee.service';
import { CsPaginatorModule } from '../../shared/cs-paginator/cs-paginator.module';
import { AvatarModule } from 'ngx-avatar';
import { MatRippleModule } from '@angular/material/core';
import { MatMenuModule } from '@angular/material/menu';
import { CertificateDeclarationModule } from '../certificate-declaration/certificate-declaration.module';
import { NgxMaskModule } from 'ngx-mask';
import { SharedPipeModule } from '../../shared/pipes/shared-pipe.module';
import { CsGridControlModule } from '../../shared/cs-grid-control/cs-grid-control.module';
import { AddDocumentationModule } from '../add-documentation/add-documentation.module';
import { ChapaModule } from '../../shared/chapa/chapa.module';
import { AddDocumentationDialogModule } from '../add-documentation-dialog/add-documentation-dialog.module';
import { LeaveRequestDetailModule } from '../leave-request-detail/leave-request-detail.module';
import { LeaveService } from '../../shared/services/leave.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ProgressMassiveApproveRequestsModule } from '../progress-massive-approve-requests/progress-massive-approve-requests.module';
import { AutocompleteChipModule } from '../../shared/autocomplete-chip/autocomplete-chip.module';

@NgModule({
  declarations: [
    LeaveFindComponent
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    LeaveFindRoutingModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatMenuModule,
    MatRippleModule,
    FormsModule,
    CsPaginatorModule,
    AvatarModule,
    CertificateDeclarationModule,
    LeaveRequestDetailModule,
    NgxMaskModule,    
    SharedPipeModule.forRoot(),
    CsGridControlModule,
    AddDocumentationModule,
    ChapaModule,
    MatIconModule,
    MatExpansionModule,
    MatButtonModule,
    MatSelectModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    AddDocumentationDialogModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    ReactiveFormsModule,
    MatTooltipModule,
    MatProgressBarModule,
    ProgressMassiveApproveRequestsModule,
    AutocompleteChipModule
  ],
  providers: [
    EmployeeService,
    LeaveService
  ],
})
export class LeaveFindModule { }
