import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SignDocumentComponent } from './sign-document.component';
import { MatIconModule } from '@angular/material/icon';
import { MyMaterialModule } from '../../../app.material';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
    MyMaterialModule,
    FormsModule,
    FlexLayoutModule
  ],
  declarations: [SignDocumentComponent],
  exports: [SignDocumentComponent]
})
export class SignDocumentModule { }
