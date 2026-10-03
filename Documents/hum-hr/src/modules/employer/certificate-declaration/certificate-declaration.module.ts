import { CertificateService } from './../../shared/services/certificate.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CertificateDeclarationComponent } from './certificate-declaration.component';
import { MatOptionModule, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ReactiveFormsModule, FormsModule, FormGroup } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MyMaterialModule } from 'src/app/app.material';
import {NgxMaskModule} from 'ngx-mask';
import {MAT_MOMENT_DATE_FORMATS, MomentDateAdapter} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';



@NgModule({
  imports: [
    CommonModule,
    MatStepperModule,
    MatToolbarModule,
    MatRadioModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    MatOptionModule,
    MatSelectModule,
    MyMaterialModule,
    MatDatepickerModule,
    MatNativeDateModule,
    NgxMaskModule.forRoot()
  ],
  declarations: [CertificateDeclarationComponent],
  exports: [CertificateDeclarationComponent],
  providers: [
    CertificateService,
    {provide: MAT_DATE_LOCALE, useValue: 'es-AR'},
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
    {provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS},
  ],
})

export class CertificateDeclarationModule { }


