import { NgModule } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { ViewFileModalComponent } from './view-file-modal.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { FlexLayoutModule } from '@angular/flex-layout';
import { PdfWrapperModule } from '../../shared/pdf-wrapper/pdf-wrapper.module';
import { PdfWrapperControlsModule } from '../../shared/pdf-wrapper-controls/pdf-wrapper-controls.module';



@NgModule({
  declarations: [ViewFileModalComponent],
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    FlexLayoutModule,
    PdfWrapperModule,
    PdfWrapperControlsModule
  ],
  exports: [ViewFileModalComponent]
})
export class ViewFileModalModule { }
