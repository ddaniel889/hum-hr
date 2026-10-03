import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DocumentationInProgressRoutingModule } from './documentation-in-progress-routing.module';
import { DocumentationInProgressComponent } from './documentation-in-progress.component';
import { MyMaterialModule } from 'src/app/app.material';
import { MatMenuModule } from '@angular/material/menu';
import { MatRadioModule } from '@angular/material/radio';
import { ProfileModule } from '../../profile/profile.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FileDocumentListModule } from '../../shared/file-document-list/file-document-list.module';
import { FileDocumentInboxBlockOuModule } from '../../shared/file-document-inbox-block-ou/file-document-inbox-block-ou.module';

@NgModule({
  declarations: [DocumentationInProgressComponent],
  imports: [
    CommonModule,
    DocumentationInProgressRoutingModule,
    MyMaterialModule,
    MatRadioModule,
    ProfileModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MatMenuModule,
    FileDocumentInboxBlockOuModule,
    FileDocumentListModule

  ]
})
export class DocumentationInProgressModule { }
