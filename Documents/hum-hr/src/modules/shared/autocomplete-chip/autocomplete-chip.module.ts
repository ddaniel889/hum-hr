import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AutocompleteChipComponent } from './autocomplete-chip.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  imports: [
    CommonModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatIconModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatListModule,
    MatButtonModule
  ],
  declarations: [AutocompleteChipComponent],
  exports: [AutocompleteChipComponent]
})
export class AutocompleteChipModule { }
