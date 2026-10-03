import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MyMaterialModule } from 'src/app/app.material';
import { FileDocumentUploadComponent } from './file-document-upload.component';
import { FileDndModule } from '../file-dnd/file-dnd.module';
import { DocumentationService } from '../services/documentation.service';
import { CustomControlModule } from '../custom-control/custom-control.module';
import { CsCropperControlModule } from '../cs-cropper-control/cs-cropper-control.module';

@NgModule({
  declarations: [FileDocumentUploadComponent],
  imports: [
    CommonModule,
    MatIconModule,
    MyMaterialModule,
    FormsModule,
    FlexLayoutModule,
    FileDndModule,
    CustomControlModule,
    ReactiveFormsModule,
    CsCropperControlModule
  ],
  exports: [FileDocumentUploadComponent],
  providers: [DocumentationService]
})
export class FileDocumentUploadModule { }
