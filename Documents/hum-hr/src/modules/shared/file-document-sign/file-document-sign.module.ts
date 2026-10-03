import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileDocumentSignComponent } from './file-document-sign.component';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MyMaterialModule } from 'src/app/app.material';
import { DocumentationTypesService } from '../services/documentation-types.service';
import { HelpStepperModule } from '../help-stepper/help-stepper.module';
import { GenericBottomsheetModule } from '../generic-bottom-sheet/generic-bottom-sheet.module';
import { CertificateDeclarationModule } from '../certificate-declaration/certificate-declaration.module';

@NgModule({
  declarations: [FileDocumentSignComponent],
  imports: [
    CommonModule,
    MatIconModule,
    MyMaterialModule,
    FormsModule,
    FlexLayoutModule,
    HelpStepperModule,
    GenericBottomsheetModule,
    CertificateDeclarationModule
  ],
  exports: [FileDocumentSignComponent],
  providers: [DocumentationTypesService]
})
export class FileDocumentSignModule { }
