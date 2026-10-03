import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileDocumentInboxItemComponent as FileDocumentInboxItemComponent } from './file-document-inbox-item.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MyMaterialModule } from 'src/app/app.material';
import { FileDocumentStateModule } from '../file-document-state/file-document-state.module';
import { FilterPipe } from '../pipes/filter.pipe';

@NgModule({
  declarations: [FileDocumentInboxItemComponent, FilterPipe],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MyMaterialModule,
    FileDocumentStateModule
  ],
  exports: [
    FileDocumentInboxItemComponent
  ]
})
export class FileDocumentInboxItemModule { }
