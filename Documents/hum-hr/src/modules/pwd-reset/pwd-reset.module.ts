import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PwdResetComponent } from './pwd-reset.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MyMaterialModule } from 'src/app/app.material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { PwdResetRoutingModule } from './pwd-reset.routes';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MyMaterialModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    PwdResetRoutingModule
  ],
  declarations: [PwdResetComponent]
})
export class PwdResetModule { }
