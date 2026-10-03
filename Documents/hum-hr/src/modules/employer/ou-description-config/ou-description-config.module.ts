import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatInputModule } from '@angular/material/input';
import { OuDescriptionConfigComponent } from './ou-description-config.component';
import { MatDividerModule } from '@angular/material/divider';


@NgModule({
  declarations: [OuDescriptionConfigComponent],
  imports: [
    CommonModule, 
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule, 
    MatInputModule,
    MatButtonModule,
    MatIconModule, 
    MatDividerModule
  ], exports:[OuDescriptionConfigComponent]
})
export class OuDescriptionConfigModule { }
