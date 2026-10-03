import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadFileModalComponent } from './upload-file-modal.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FileDndModule } from '../../shared/file-dnd/file-dnd.module';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PdfWrapperModule } from '../../shared/pdf-wrapper/pdf-wrapper.module';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PdfWrapperControlsModule } from '../../shared/pdf-wrapper-controls/pdf-wrapper-controls.module';

@NgModule({
  declarations: [ UploadFileModalComponent ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    FileDndModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    PdfWrapperModule,
    MatToolbarModule,
    MatProgressSpinnerModule,
    PdfWrapperModule,
    PdfWrapperControlsModule
  ],
  exports: [ UploadFileModalComponent ]
})
export class UploadFileModalModule { }
