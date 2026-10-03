import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyMaterialModule } from '../../../app.material';
import { MessageService } from '../../shared/errorHandler/message.service';
import { FlexLayoutModule } from '@angular/flex-layout';
import { PdfWrapperModule } from '../../shared/pdf-wrapper/pdf-wrapper.module';
import { PdfWrapperControlsModule } from '../../shared/pdf-wrapper-controls/pdf-wrapper-controls.module';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { AvatarModule } from 'ngx-avatar';
import { MatRippleModule } from '@angular/material/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AutocompleteChipModule } from '../../shared/autocomplete-chip/autocomplete-chip.module';
import { NgxMaskModule } from "ngx-mask";
import { EmployeeLeavesRoutingModule } from './employee-leaves-view-routing.module';
import { EmployeeLeavesViewComponent } from './employee-leaves-view.component';
import { CsPaginatorModule } from '../../shared/cs-paginator/cs-paginator.module';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { ChapaModule } from '../../shared/chapa/chapa.module';
import { WelcomeModule } from '../welcome/welcome.module';
import { MatCardModule } from '@angular/material/card';
import { ProfileModule } from '../../profile/profile.module';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LeaveService } from '../../shared/services/leave.service';
import { EmployeeLeaveService } from '../../shared/services/employee-leave-requests.service';

@NgModule({
  declarations: [
    EmployeeLeavesViewComponent
  ],
  imports: [
    CommonModule,
    EmployeeLeavesRoutingModule,
    MyMaterialModule,
    FlexLayoutModule,
    PdfWrapperModule,
    PdfWrapperControlsModule,
    PdfViewerModule,
    AvatarModule,
    MatRippleModule,
    FormsModule,
    ReactiveFormsModule,
    AutocompleteChipModule,
    NgxMaskModule,
    CsPaginatorModule,
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
    ProfileModule,
    WelcomeModule,
    ChapaModule,
    MatSelectModule
  ],
  providers: [
    MessageService,EmployeeLeaveService,LeaveService
  ],
  exports: [EmployeeLeavesViewComponent]
})
export class EmployeeLeavesModule { }
