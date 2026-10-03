import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MyMaterialModule } from 'src/app/app.material';
import { FileDocumentInboxBlockCalendarComponent as FileDocumentInboxBlockCalendarComponent } from './file-document-inbox-block-calendar.component';
import { FileDocumentInboxItemModule } from '../file-document-inbox-item/file-document-inbox-item.module';
import {ScrollingModule} from '@angular/cdk/scrolling';
import { CsPaginatorModule } from '../cs-paginator/cs-paginator.module';


@NgModule({
  declarations: [FileDocumentInboxBlockCalendarComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MyMaterialModule,
    FileDocumentInboxItemModule,
    ScrollingModule,
    CsPaginatorModule
  ],
  exports: [FileDocumentInboxBlockCalendarComponent]
})
export class FileDocumentInboxBlockCalendarModule { }
