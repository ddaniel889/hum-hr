import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomControlComponent } from './custom-control.component';
import { MyMaterialModule } from 'src/app/app.material';
import { FormsModule } from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';
import { AddMetadataValueDialogModule } from '../../employer/add-metadata-value-dialog/add-metadata-value-dialog.module';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MyMaterialModule,
    FlexLayoutModule,
    NgxMaskModule.forRoot(),
    AddMetadataValueDialogModule
    ],
  declarations: [CustomControlComponent],
  exports: [CustomControlComponent]
})
export class CustomControlModule { }
