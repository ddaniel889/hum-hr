import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyMaterialModule } from 'src/app/app.material';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatRippleModule } from '@angular/material/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatRadioModule } from '@angular/material/radio';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgxMaskModule } from 'ngx-mask';
import { AutocompleteChipModule } from '../autocomplete-chip/autocomplete-chip.module';
import { AdvancedEmployeeSearchComponent } from './advanced-employee-search.component';
import { MatTabsModule } from '@angular/material/tabs';

@NgModule({
  declarations: [AdvancedEmployeeSearchComponent],
  imports: [
    CommonModule,
    MyMaterialModule,
    FormsModule,
    FlexLayoutModule,
    MatRippleModule,
    MatMenuModule,
    MatSlideToggleModule,
    NgxMaskModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    AutocompleteChipModule,
    MatRadioModule,
    MatTabsModule
  ],
  exports: [AdvancedEmployeeSearchComponent]
})
export class AdvancedEmployeeSearchModule { }
