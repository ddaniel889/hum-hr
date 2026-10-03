import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddDocumentationDialogComponent } from './add-documentation-dialog.component';
import { AddDocumentationModule } from '../add-documentation/add-documentation.module';
import { FlexLayoutModule } from '@angular/flex-layout';



@NgModule({
  declarations: [AddDocumentationDialogComponent],
  imports: [
    CommonModule,AddDocumentationModule,FlexLayoutModule
  ],
  exports:[AddDocumentationDialogComponent]
})
export class AddDocumentationDialogModule { }
