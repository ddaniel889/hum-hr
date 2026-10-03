import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppearanceComponent } from './appearance.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FileDndModule } from '../../shared/file-dnd/file-dnd.module';
import { CsUploadCropperControlModule } from '../../shared/cs-upload-cropper-control/cs-upload-cropper-control.module';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ChapaModule } from '../../shared/chapa/chapa.module';


@NgModule({
  declarations: [AppearanceComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatIconModule,
    MatButtonModule,
    FileDndModule,
    CsUploadCropperControlModule,
    MatProgressSpinnerModule,
    MatButtonToggleModule,
    MatSlideToggleModule,
    FormsModule,
    MatCardModule,
    MatToolbarModule,
    ChapaModule
  ],
  exports: [AppearanceComponent]
})
export class AppearanceModule { }
