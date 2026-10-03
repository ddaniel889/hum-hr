import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MyMaterialModule } from 'src/app/app.material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CertificatePwdRoutingModule } from './certificate-pwd.routes';
import { CertificatePwdComponent } from './certificate-pwd.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MyMaterialModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    CertificatePwdRoutingModule
  ],
  declarations: [CertificatePwdComponent]
})
export class CertificatePwdModule { }
