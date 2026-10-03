import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoleUserAddComponent } from './role-user-add.component';
import { MyMaterialModule } from 'src/app/app.material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RoleUserAddRoutingModule } from './role-user-add-routing.module';
import { AutocompleteChipModule } from '../../shared/autocomplete-chip/autocomplete-chip.module';
import { MatMenuModule } from '@angular/material/menu';
import { MatStepperModule } from '@angular/material/stepper';
import { ChapaModule } from '../../shared/chapa/chapa.module';
import { MatRadioModule } from '@angular/material/radio';


@NgModule({
  declarations: [RoleUserAddComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MyMaterialModule,
    FormsModule,
    MatMenuModule,
    RoleUserAddRoutingModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatRadioModule,
    AutocompleteChipModule,
    ChapaModule
  ],
  exports: [RoleUserAddComponent]
})
export class RoleUserAddModule { }



