import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreateLsdComponent } from './create-lsd.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { ChapaModule } from '../../shared/chapa/chapa.module';
import { MatStepperModule } from '@angular/material/stepper';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FileDndModule } from '../../shared/file-dnd/file-dnd.module';
import { NgxMaskModule } from 'ngx-mask';
import { MatDialogModule } from '@angular/material/dialog';
import { CustomControlModule } from '../../shared/custom-control/custom-control.module';
import { MatTabsModule } from '@angular/material/tabs';
import { PdfWrapperModule } from '../../shared/pdf-wrapper/pdf-wrapper.module';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PdfWrapperControlsModule } from '../../shared/pdf-wrapper-controls/pdf-wrapper-controls.module';


@NgModule({
  declarations: [CreateLsdComponent],
  imports: [
    CommonModule,
    MatIconModule,
    MatSelectModule,
    MatInputModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatRadioModule,
    MatRadioModule,
    ChapaModule,
    MatStepperModule,
    MatProgressBarModule,
    MatFormFieldModule,
    FileDndModule,
    NgxMaskModule,
    MatDialogModule,
    CustomControlModule,
    MatTabsModule,
    PdfWrapperModule,
    PdfWrapperControlsModule,
    MatToolbarModule,
    MatProgressSpinnerModule
  ],
  exports:[CreateLsdComponent]
})
export class CreateLsdModule { }
