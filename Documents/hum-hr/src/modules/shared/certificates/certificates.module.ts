import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MyMaterialModule } from 'src/app/app.material';
import { CertificatesComponent } from './certificates.component';
import { EmployeeProcessService } from '../services/employee-process.service';
import { CertificateDeclarationModule } from '../../employer/certificate-declaration/certificate-declaration.module';

@NgModule({
  declarations: [CertificatesComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MyMaterialModule,
    CertificateDeclarationModule
  ],
  exports: [CertificatesComponent],
  providers: [
    EmployeeProcessService,
  ]
})
export class CertificatesModule { }
