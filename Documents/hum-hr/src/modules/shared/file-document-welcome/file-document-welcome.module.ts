import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyMaterialModule } from '../../../app.material';
import {FlexLayoutModule} from '@angular/flex-layout';
import { FileDocumentWelcomeComponent } from './file-document-welcome.component';
import { FileDocumentWelcomeRoutingModule } from './file-document-welcome-routing.module';

@NgModule({
  declarations: [FileDocumentWelcomeComponent],
  imports: [
    CommonModule,
    FileDocumentWelcomeRoutingModule,
    MyMaterialModule,
    FlexLayoutModule
  ],
  exports: [FileDocumentWelcomeComponent]
})
export class FileDocumentWelcomeModule { }
