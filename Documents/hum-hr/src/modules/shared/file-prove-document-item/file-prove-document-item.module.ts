import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileProveDocumentItemComponent } from './file-prove-document-item.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MyMaterialModule } from 'src/app/app.material';
import { FileDocumentStateModule } from '../file-document-state/file-document-state.module';


@NgModule({
  declarations: [FileProveDocumentItemComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MyMaterialModule,
    FileDocumentStateModule
  ],
  exports: [
    FileProveDocumentItemComponent
  ]
})
export class FileProveDocumentItemModule { }
