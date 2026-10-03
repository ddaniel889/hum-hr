import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentationTypeSetConfigurationDialogComponent } from './documentation-type-set-configuration-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { DocumentationTypeSetEditModule } from '../documentation-type-set-edit/documentation-type-set-edit.module';
import { ChapaModule } from '../../shared/chapa/chapa.module';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';



@NgModule({
  declarations: [DocumentationTypeSetConfigurationDialogComponent],
  imports: [
    CommonModule,
    MatDialogModule,
    DocumentationTypeSetEditModule,
    ChapaModule,
    MatListModule,
    MatProgressSpinnerModule,
    FlexLayoutModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    MatInputModule
  ],
  exports: [DocumentationTypeSetConfigurationDialogComponent]
})
export class DocumentationTypeSetConfigurationDialogModule { }
