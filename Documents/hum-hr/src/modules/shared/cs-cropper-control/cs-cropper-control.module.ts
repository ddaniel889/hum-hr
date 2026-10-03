import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CsCropperControlComponent } from './cs-cropper-control.component';
import { ImageCropperModule } from 'ngx-image-cropper';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';



@NgModule({
  declarations: [CsCropperControlComponent],
  imports: [
    CommonModule,
    ImageCropperModule,
    FlexLayoutModule,
    MatButtonModule,
  ],
  exports: [CsCropperControlComponent]
})
export class CsCropperControlModule { }
