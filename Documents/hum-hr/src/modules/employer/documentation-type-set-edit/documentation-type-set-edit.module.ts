import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentationTypeSetEditComponent } from './documentation-type-set-edit.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { FileDocumentDetailModule } from '../../shared/file-document-detail/file-document-detail.module';
import { FileDndModule } from '../../shared/file-dnd/file-dnd.module';
import { MatChipsModule } from '@angular/material/chips';
import { ChapaModule } from '../../shared/chapa/chapa.module';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';



@NgModule({
  declarations: [DocumentationTypeSetEditComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    MatInputModule,
    FileDocumentDetailModule,
    MatIconModule,
    FileDndModule,
    MatChipsModule,
    ChapaModule,
    MatSlideToggleModule,
    MatFormFieldModule
  ],
  exports: [DocumentationTypeSetEditComponent]
})
export class DocumentationTypeSetEditModule { }
