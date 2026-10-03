import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GenericBottomSheetComponent } from './generic-bottom-sheet.component';
import { HelpIndexModule } from '../help-index/help-index.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HelpStepperModule } from '../help-stepper/help-stepper.module';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatRadioModule } from '@angular/material/radio';


@NgModule({
    declarations: [GenericBottomSheetComponent],
    imports: [
        CommonModule,
        HelpIndexModule,
        FlexLayoutModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        HelpStepperModule,
        MatDatepickerModule,
        MatCardModule,
        MatCheckboxModule,
        MatRadioModule
    ]
})
export class GenericBottomsheetModule {
  exports: []
 }
