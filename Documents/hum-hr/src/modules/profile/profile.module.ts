import { NgModule } from '@angular/core';
import { ProfileComponent } from './profile.component';
import { CommonModule } from '@angular/common';
import { MyMaterialModule } from '../../app.material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CuilPipe } from '../shared/pipes/cuil.pipe';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CertificateDeclarationModule } from '../shared/certificate-declaration/certificate-declaration.module';
import { CertificateRenewModule } from '../shared/certificate-renew/certificate-renew.module';
import { PersonService } from '../shared/services/person.service';
import { CsUploadCropperControlModule } from '../shared/cs-upload-cropper-control/cs-upload-cropper-control.module';
import { MatRippleModule } from '@angular/material/core';

@NgModule({
  imports: [
    CommonModule,
    MyMaterialModule,
    FlexLayoutModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    CertificateDeclarationModule,
    CertificateRenewModule,
    CsUploadCropperControlModule,
    MatRippleModule
  ],
  declarations: [ProfileComponent,
    CuilPipe
  ],
  providers: [PersonService],
  exports: [ProfileComponent]
})
export class ProfileModule { }
