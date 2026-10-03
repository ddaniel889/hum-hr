import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatStepperModule } from '@angular/material/stepper';
import { MatIconModule } from '@angular/material/icon';
import { FlexLayoutModule } from '@angular/flex-layout';
import { HelpIndexComponent } from './help-index.component';

@NgModule({
  imports: [
    CommonModule,
    MatStepperModule,
    MatListModule,
    MatIconModule,
    MatCardModule,
    FlexLayoutModule,
    MatButtonModule
  ],
  declarations: [HelpIndexComponent],
  exports: [HelpIndexComponent]
})
export class HelpIndexModule { }
