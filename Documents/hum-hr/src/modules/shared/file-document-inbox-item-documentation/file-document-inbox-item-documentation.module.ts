import { MyMaterialModule } from '../../../app.material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileDocumentInboxItemDocumentationComponent } from './file-document-inbox-item-documentation.component';

@NgModule({
  declarations: [FileDocumentInboxItemDocumentationComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MyMaterialModule,
  ],
  exports: [FileDocumentInboxItemDocumentationComponent]
})
export class FileDocumentInboxItemDocumentationModule { }
