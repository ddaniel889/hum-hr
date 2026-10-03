import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccessDeniedRoutingModule } from './access-denied-routing.module';
import { AccessDeniedComponent } from './access-denied.component';
import { MyMaterialModule } from '../../app.material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    AccessDeniedRoutingModule,
    MyMaterialModule,
    FlexLayoutModule,
    FormsModule
  ],
  declarations: [ AccessDeniedComponent ]
})
export class AccessDeniedModule { }
