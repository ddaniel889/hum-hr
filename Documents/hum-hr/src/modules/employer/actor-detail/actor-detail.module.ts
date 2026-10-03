import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActorDetailComponent } from './actor-detail.component';
import { MyMaterialModule } from 'src/app/app.material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActorDetailRoutingModule } from './actor-detail-routing.module';
import { AutocompleteChipModule } from '../../shared/autocomplete-chip/autocomplete-chip.module';
import { MatMenuModule } from '@angular/material/menu';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CertificatesModule } from '../../shared/certificates/certificates.module';
import { RoleAdjetivationDetailModule } from '../role-adjetivation-detail/role-adjetivation-detail.module';


@NgModule({
  declarations: [ActorDetailComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MyMaterialModule,
    FormsModule,
    MatMenuModule,
    ActorDetailRoutingModule,
    ReactiveFormsModule,
    AutocompleteChipModule,
    MatSlideToggleModule,
    CertificatesModule,
    RoleAdjetivationDetailModule
  ],
  exports: [ActorDetailComponent]
})
export class ActorDetailModule { }



