import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PwdChangeComponent } from './pwd-change.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MyMaterialModule } from 'src/app/app.material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { PwdChangeRoutingModule } from './pwd-change.routes';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MyMaterialModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    PwdChangeRoutingModule
  ],
  declarations: [PwdChangeComponent]
})
export class PwdChangeModule { }
