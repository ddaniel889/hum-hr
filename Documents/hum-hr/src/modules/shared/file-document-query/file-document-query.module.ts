import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

import { FileDocumentQueryComponent } from './file-document-query.component';
import { FileDocumentQueryService } from '../services/file-document-query.service';
import { MyMaterialModule } from 'src/app/app.material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { HelpStepperModule } from '../help-stepper/help-stepper.module';
import { GenericBottomsheetModule } from '../generic-bottom-sheet/generic-bottom-sheet.module';
import { CertificateDeclarationModule } from '../certificate-declaration/certificate-declaration.module';
import {AvatarModule} from "ngx-avatar";

@NgModule({
  declarations: [
    FileDocumentQueryComponent,
  ],
  imports: [
    CommonModule,
    MatIconModule,
    MyMaterialModule,
    FormsModule,
    FlexLayoutModule,
    HelpStepperModule,
    GenericBottomsheetModule,
    CertificateDeclarationModule,
    AvatarModule
  ],
  providers: [
    FileDocumentQueryService
  ],
  exports: [
    FileDocumentQueryComponent
  ]
})
export class FileDocumentQueryModule { }
