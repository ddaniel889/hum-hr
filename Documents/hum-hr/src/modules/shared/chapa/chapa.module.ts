import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChapaComponent } from './chapa.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatIconModule,
    MatButtonModule
  ],
  declarations: [ChapaComponent],
  exports: [ChapaComponent]
})
export class ChapaModule { }
