import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileProveDocumentViewModalComponent } from './file-prove-document-view-modal.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ChapaModule } from '../chapa/chapa.module';
import { FileDocumentStateModule } from '../file-document-state/file-document-state.module';
import { PdfWrapperControlsModule } from '../pdf-wrapper-controls/pdf-wrapper-controls.module';
import { PdfWrapperModule } from '../pdf-wrapper/pdf-wrapper.module';
import { FileProveDocumentItemModule } from '../file-prove-document-item/file-prove-document-item.module';
import { MyMaterialModule } from 'src/app/app.material';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatProgressSpinnerModule,
    ChapaModule,
    MatToolbarModule,
    MatIconModule,
    FileDocumentStateModule,
    MatDialogModule,
    PdfWrapperControlsModule,
    PdfWrapperModule,
    MatButtonModule,
    MatProgressBarModule,
    MyMaterialModule,
    FileProveDocumentItemModule
  ],
  declarations: [FileProveDocumentViewModalComponent],
  exports: [FileProveDocumentViewModalComponent]
})
export class FileProveDocumentViewModalModule { }
