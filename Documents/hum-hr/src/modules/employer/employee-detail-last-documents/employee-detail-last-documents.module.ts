import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeeDetailLastDocumentsComponent } from './employee-detail-last-documents.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MyMaterialModule } from 'src/app/app.material';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { PdfWrapperControlsModule } from '../../shared/pdf-wrapper-controls/pdf-wrapper-controls.module';
import { PdfWrapperModule } from '../../shared/pdf-wrapper/pdf-wrapper.module';
import { FileDocumentInboxItemModule } from '../../shared/file-document-inbox-item/file-document-inbox-item.module';

@NgModule({
  declarations: [EmployeeDetailLastDocumentsComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MyMaterialModule,
    PdfViewerModule,
    PdfWrapperControlsModule,
    PdfWrapperModule,
    FormsModule,
    FileDocumentInboxItemModule,
  ],
  exports: [EmployeeDetailLastDocumentsComponent]
})
export class EmployeeDetailLastDocumentsModule { }
