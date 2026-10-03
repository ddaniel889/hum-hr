import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeeRrhhEditComponent } from './employee-rrhh-edit.component';
import { MatOptionModule } from '@angular/material/core';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MyMaterialModule } from 'src/app/app.material';
import { NgxMaskModule } from 'ngx-mask';

@NgModule({
  imports: [
    CommonModule,
    MatToolbarModule,
    MatRadioModule,
    MatStepperModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    MatOptionModule,
    MatSelectModule,
    MyMaterialModule,
    NgxMaskModule
  ],
  declarations: [EmployeeRrhhEditComponent],
  exports: [EmployeeRrhhEditComponent]
})
export class EmployeeRrhhEditModule { }
