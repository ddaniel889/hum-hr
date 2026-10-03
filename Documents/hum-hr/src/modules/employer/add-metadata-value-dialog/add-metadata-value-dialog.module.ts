import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddMetadataValueDialogComponent } from './add-metadata-value-dialog.component';
import { AddMenuDialogComponent } from '../add-menu-dialog/add-menu-dialog.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MyMaterialModule } from 'src/app/app.material';
import { MatDialogModule } from '@angular/material/dialog';



@NgModule({
  declarations: [AddMetadataValueDialogComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatToolbarModule,
    FormsModule,
    MyMaterialModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule
  ]
})
export class AddMetadataValueDialogModule { }
