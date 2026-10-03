import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TermsAndConditionsComponent } from './terms-and-conditions.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MyMaterialModule } from 'src/app/app.material';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { PdfWrapperControlsModule } from '../pdf-wrapper-controls/pdf-wrapper-controls.module';
import { PdfWrapperModule } from '../pdf-wrapper/pdf-wrapper.module';

@NgModule({
  declarations: [TermsAndConditionsComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MyMaterialModule,
    PdfViewerModule,
    PdfWrapperControlsModule,
    PdfWrapperModule
  ],
  exports: [TermsAndConditionsComponent]
})
export class TermsAndConditionsModule { }
