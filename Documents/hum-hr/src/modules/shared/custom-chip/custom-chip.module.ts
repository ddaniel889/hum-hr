import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomChipComponent } from './custom-chip.component';
import { MatRippleModule } from '@angular/material/core';



@NgModule({
  declarations: [
    CustomChipComponent
  ],
  exports: [
    CustomChipComponent
  ],
  imports: [
    CommonModule,
    MatRippleModule
  ]
})
export class CustomChipModule { }
