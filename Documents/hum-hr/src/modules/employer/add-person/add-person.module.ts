import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddPersonComponent } from './add-person.component';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CustomControlModule } from '../../shared/custom-control/custom-control.module';
import { NgxMaskModule } from 'ngx-mask';
import { DocumentationTypeSetService } from '../../shared/services/documentation-type-set.service';
import { MatRadioModule } from '@angular/material/radio';
import { ChapaModule } from '../../shared/chapa/chapa.module';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';

@NgModule({
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatDividerModule,
    MatProgressBarModule,
    MatSelectModule,
    MatInputModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    CustomControlModule,
    MatButtonModule,
    MatDatepickerModule,
    NgxMaskModule,
    MatRadioModule,
    ChapaModule,
    MatProgressSpinnerModule,
    MatCheckboxModule
  ],
  declarations: [AddPersonComponent],
  exports: [AddPersonComponent],
  providers: [DocumentationTypeSetService]

})
export class AddPersonModule { }
