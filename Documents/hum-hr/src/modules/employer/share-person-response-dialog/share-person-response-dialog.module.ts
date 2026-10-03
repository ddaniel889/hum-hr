import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddPersonModule } from '../add-person/add-person.module';
import { SharePersonResponseDialogComponent } from './share-person-response-dialog.component';



@NgModule({
  declarations: [SharePersonResponseDialogComponent],
  imports: [
    CommonModule,
    AddPersonModule
  ]
})
export class SharePersonResponseDialogModule { }
