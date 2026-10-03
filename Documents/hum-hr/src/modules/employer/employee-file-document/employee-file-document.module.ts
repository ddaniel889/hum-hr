import { FileDocumentSignModule } from '../../shared/file-document-sign/file-document-sign.module';
import { FileDocumentInboxBlockCalendarModule } from '../../shared/file-document-inbox-block-calendar/file-document-inbox-block-calendar.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeeFileDocumentRoutingModule } from './employee-file-document-view-routing.module';
import { MyMaterialModule } from '../../../app.material';
import { MessageService } from '../../shared/errorHandler/message.service';
import { FlexLayoutModule } from '@angular/flex-layout';
import { PdfWrapperModule } from '../../shared/pdf-wrapper/pdf-wrapper.module';
import { PdfWrapperControlsModule } from '../../shared/pdf-wrapper-controls/pdf-wrapper-controls.module';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { AvatarModule } from 'ngx-avatar';
import { FileDocumentInboxItemModule } from '../../shared/file-document-inbox-item/file-document-inbox-item.module';
import { EmployeeFileDocumentViewComponent } from './employee-file-document-view.component';
import { MatRippleModule } from '@angular/material/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AutocompleteChipModule } from '../../shared/autocomplete-chip/autocomplete-chip.module';
import { NgxMaskModule } from "ngx-mask";
import { FileDocumentDetailModule } from '../../shared/file-document-detail/file-document-detail.module';
import { InboxConfigService } from '../../shared/services/inbox-config.service';

@NgModule({
  declarations: [
    EmployeeFileDocumentViewComponent
  ],
  imports: [
    CommonModule,
    EmployeeFileDocumentRoutingModule,
    MyMaterialModule,
    FlexLayoutModule,
    PdfWrapperModule,
    PdfWrapperControlsModule,
    PdfViewerModule,
    AvatarModule,
    MatRippleModule,
    FileDocumentInboxItemModule,
    FileDocumentInboxBlockCalendarModule,
    FileDocumentSignModule,
    FileDocumentDetailModule,
    FormsModule,
    ReactiveFormsModule,
    AutocompleteChipModule,
    NgxMaskModule
  ],
  providers: [
    MessageService, InboxConfigService
  ],
  exports: [EmployeeFileDocumentViewComponent]
})
export class EmployeeFileDocumentModule { }
