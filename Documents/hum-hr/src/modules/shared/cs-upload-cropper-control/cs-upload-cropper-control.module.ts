import { NgModule } from '@angular/core';
import { CsUploadCropperControlComponent } from './cs-upload-cropper-control.component';
import { CommonModule } from '@angular/common';
import { MyMaterialModule } from 'src/app/app.material';
import { ImageCropperModule } from 'ngx-image-cropper';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { ChapaModule } from '../chapa/chapa.module';

@NgModule({
  imports: [
    CommonModule,
    MyMaterialModule,
    ImageCropperModule,
    FlexLayoutModule,
    MatButtonModule,
    ChapaModule
  ],
  declarations: [CsUploadCropperControlComponent],
  exports: [CsUploadCropperControlComponent]

})
export class CsUploadCropperControlModule { }
