import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileDropDirective } from './file-dnd.directive';
import { UploadFormComponent } from './file-dnd.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MyMaterialModule } from 'src/app/app.material';
import { FileSizePipe } from '../pipes/file-size.pipe';

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatListModule,
    MatIconModule,
    FlexLayoutModule,
    MyMaterialModule
  ],
  exports: [
    UploadFormComponent
  ],
  declarations: [
    FileDropDirective,
    UploadFormComponent,
    FileSizePipe
  ]
})
export class FileDndModule { }
