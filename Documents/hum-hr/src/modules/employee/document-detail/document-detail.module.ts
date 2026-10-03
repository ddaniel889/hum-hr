import { PdfWrapperModule } from './../../shared/pdf-wrapper/pdf-wrapper.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentDetailRoutingModule } from './document-detail-routing.module';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { DocumentDetailComponent } from './document-detail.component';
import { MyMaterialModule } from 'src/app/app.material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { SignDocumentModule } from '../sign-document/sign-document.module';
import { PdfWrapperControlsModule } from '../../shared/pdf-wrapper-controls/pdf-wrapper-controls.module';

@NgModule({
  imports: [
    CommonModule,
    DocumentDetailRoutingModule,
    PdfViewerModule,
    MyMaterialModule,
    FlexLayoutModule,
    FormsModule,
    MatIconModule,
    SignDocumentModule,
    PdfWrapperModule,
    PdfWrapperControlsModule
  ],
  declarations: [DocumentDetailComponent]

})
export class DocumentDetailModule {}
