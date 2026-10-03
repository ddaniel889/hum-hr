import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoleUserDetailComponent } from './role-user-detail.component';
import { MyMaterialModule } from 'src/app/app.material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RoleUserDetailRoutingModule } from './role-user-detail-routing.module';
import { AutocompleteChipModule } from '../../shared/autocomplete-chip/autocomplete-chip.module';
import { MatMenuModule } from '@angular/material/menu';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CertificatesModule } from '../../shared/certificates/certificates.module';


@NgModule({
  declarations: [RoleUserDetailComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MyMaterialModule,
    FormsModule,
    MatMenuModule,
    RoleUserDetailRoutingModule,
    ReactiveFormsModule,
    AutocompleteChipModule,
    MatSlideToggleModule,
    CertificatesModule
  ],
  exports: [RoleUserDetailComponent]
})
export class RoleUserDetailModule { }



