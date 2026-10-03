import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PdfWrapperComponent } from './pdf-wrapper.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MyMaterialModule } from 'src/app/app.material';

@NgModule({
  imports: [
    CommonModule,
    MyMaterialModule,
    PdfViewerModule,
    FlexLayoutModule,
    FormsModule,
    MatIconModule
  ],
  declarations: [PdfWrapperComponent],
  exports: [PdfWrapperComponent]

})
export class PdfWrapperModule {}
