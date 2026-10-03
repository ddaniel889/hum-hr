import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoleAdjetivationDetailComponent } from './role-adjetivation-detail.component';
import { MyMaterialModule } from 'src/app/app.material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RoleAdjetivationDetailRoutingModule } from './role-adjetivation-detail-routing.module';
import { AutocompleteChipModule } from '../../shared/autocomplete-chip/autocomplete-chip.module';
import { MatMenuModule } from '@angular/material/menu';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';


@NgModule({
  declarations: [RoleAdjetivationDetailComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MyMaterialModule,
    FormsModule,
    MatMenuModule,
    RoleAdjetivationDetailRoutingModule,
    ReactiveFormsModule,
    AutocompleteChipModule,
    MatSlideToggleModule
  ],
  exports: [RoleAdjetivationDetailComponent]
})
export class RoleAdjetivationDetailModule { }



