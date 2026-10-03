import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeeDetailComponent } from './employee-detail.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MyMaterialModule } from 'src/app/app.material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EmployeeDetailRoutingModule } from './employee-detail-routing.module';
import { EmployeeProcessService } from '../../shared/services/employee-process.service';
import { AvatarModule } from 'ngx-avatar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialogModule } from '@angular/material/dialog';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { PdfWrapperControlsModule } from '../../shared/pdf-wrapper-controls/pdf-wrapper-controls.module';
import { PdfWrapperModule } from './../../shared/pdf-wrapper/pdf-wrapper.module';
import { EmployeeDetailLastDocumentsModule } from '../employee-detail-last-documents/employee-detail-last-documents.module';
import { UserSecurityDetailModule } from '../../shared/user-security-detail/user-security-detail.module';
import { CertificatesModule } from '../../shared/certificates/certificates.module';
import { NgxMaskModule } from 'ngx-mask';
import { CsUploadCropperControlModule } from '../../shared/cs-upload-cropper-control/cs-upload-cropper-control.module';
import { PersonService } from '../../shared/services/person.service';
import { CustomControlModule } from '../../shared/custom-control/custom-control.module';
import { SharePersonDialogModule } from '../share-person-dialog/share-person-dialog.module';
import { LeaveConfigEmployeeModule } from '../leave-config-employee/leave-config-employee.module';
import { LeaveService } from '../../shared/services/leave.service';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    MyMaterialModule,
    FormsModule,
    EmployeeDetailRoutingModule,
    AvatarModule,
    MatSlideToggleModule,
    MatDialogModule,
    PdfViewerModule,
    PdfWrapperControlsModule,
    PdfWrapperModule,
    EmployeeDetailLastDocumentsModule,
    UserSecurityDetailModule,
    LeaveConfigEmployeeModule,
    CertificatesModule,
    NgxMaskModule,
    CsUploadCropperControlModule,
    ReactiveFormsModule,
    CustomControlModule,
    SharePersonDialogModule
  ],
  providers: [EmployeeProcessService, PersonService,LeaveService],
  declarations: [EmployeeDetailComponent],
  exports: [EmployeeDetailComponent]
})
export class EmployeeDetailModule { }
