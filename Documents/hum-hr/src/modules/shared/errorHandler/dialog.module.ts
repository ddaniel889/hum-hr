import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogComponent } from './dialog.component';
import { MyMaterialModule } from 'src/app/app.material';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
  declarations: [
    DialogComponent
  ],
  imports: [
    CommonModule,
    MyMaterialModule,
    FlexLayoutModule
  ],
  exports: [
    DialogComponent
  ]
})
export class DialogModule { }
