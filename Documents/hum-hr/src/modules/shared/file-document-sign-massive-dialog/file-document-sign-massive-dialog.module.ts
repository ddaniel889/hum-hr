import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MyMaterialModule } from 'src/app/app.material';
import { FileDocumentSignMassiveDialogComponent } from './file-document-sign-massive-dialog.component';
import { FileDocumentSignModule } from '../file-document-sign/file-document-sign.module';
import { NgxMaskModule } from 'ngx-mask';

@NgModule({
  declarations: [FileDocumentSignMassiveDialogComponent],
  imports: [
    CommonModule,
    MatDialogModule,
    FlexLayoutModule,
    MyMaterialModule,
    FileDocumentSignModule,
    NgxMaskModule
  ],
  exports: [FileDocumentSignMassiveDialogComponent]
})
export class FileDocumentSignMassiveDialogModule { }
