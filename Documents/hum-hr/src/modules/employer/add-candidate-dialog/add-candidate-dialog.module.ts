import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddCandidateDialogComponent } from './add-candidate-dialog.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MyMaterialModule } from 'src/app/app.material';
import { MatDialogModule } from '@angular/material/dialog';
import { AddPersonModule } from '../add-person/add-person.module';



@NgModule({
  declarations: [AddCandidateDialogComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatToolbarModule,
    MyMaterialModule,
    MatButtonModule,
    MatInputModule,
    MatDialogModule,
    AddPersonModule
  ]
})
export class AddCandidateDialogModule { }
