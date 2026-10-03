import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

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
import { LeaveRequestDetailRoutingModule } from './leave-request-detail-routing.module';
import { EmployeeDetailComponent } from '../employee-detail/employee-detail.component';
import { LeaveRequestDetailComponent } from './leave-request-detail.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    FormsModule,
    LeaveRequestDetailRoutingModule,
    AvatarModule,
    MatSlideToggleModule,
    MatDialogModule,
    PdfViewerModule,
    PdfWrapperControlsModule,
    PdfWrapperModule,
    EmployeeDetailLastDocumentsModule,
    UserSecurityDetailModule,
    CertificatesModule,
    NgxMaskModule,
    CsUploadCropperControlModule,
    ReactiveFormsModule,
    CustomControlModule,
    MatDividerModule,
    SharePersonDialogModule
  ],
  providers: [EmployeeProcessService, PersonService],
  declarations: [LeaveRequestDetailComponent],
  exports: [LeaveRequestDetailComponent]
})
export class LeaveRequestDetailModule { }
