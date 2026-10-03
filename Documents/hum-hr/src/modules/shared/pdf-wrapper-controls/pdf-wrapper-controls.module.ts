import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { PdfWrapperControlsComponent } from './pdf-wrapper-controls.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MyMaterialModule } from 'src/app/app.material';


@NgModule({
  imports: [
    CommonModule,
    PdfViewerModule,
    MyMaterialModule,
    FlexLayoutModule,
    FormsModule,
    MatIconModule
  ],
  declarations: [PdfWrapperControlsComponent],
  exports: [PdfWrapperControlsComponent]

})
export class PdfWrapperControlsModule {}
