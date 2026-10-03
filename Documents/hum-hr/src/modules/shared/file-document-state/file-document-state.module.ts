
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileDocumentStateComponent } from './file-document-state.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MyMaterialModule } from 'src/app/app.material';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [FileDocumentStateComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MyMaterialModule,
    MatIconModule
  ],
  exports: [FileDocumentStateComponent]
})
export class FileDocumentStateModule { }
