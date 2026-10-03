import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ChapaModule } from '../chapa/chapa.module';
import { FileDocumentStateModule } from '../file-document-state/file-document-state.module';
import { PdfWrapperControlsModule } from '../pdf-wrapper-controls/pdf-wrapper-controls.module';
import { PdfWrapperModule } from '../pdf-wrapper/pdf-wrapper.module';
import { FormioCardinalModule } from '../../formioCs/formio-cardinal.module';
import { FileDocumentDetailComponent } from './file-document-detail.component';
import { FileDocumentQueryModule } from '../file-document-query/file-document-query.module';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatProgressSpinnerModule,
    ChapaModule,
    MatToolbarModule,
    MatIconModule,
    FileDocumentStateModule,
    PdfWrapperControlsModule,
    PdfWrapperModule,
    MatButtonModule,
    FormioCardinalModule,
    MatDividerModule,
    FileDocumentQueryModule
  ],
  declarations: [FileDocumentDetailComponent],
  exports: [FileDocumentDetailComponent]
})
export class FileDocumentDetailModule { }
