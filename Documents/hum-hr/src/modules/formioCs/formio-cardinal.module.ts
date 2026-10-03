import { FormioCardinalComponent } from './formio-cardinal.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppConfig } from '../../../config';
import { FormioModule, FormioAppConfig } from '@formio/angular';


@NgModule({
  imports: [
    CommonModule,
    FormioModule
  ],
  declarations: [FormioCardinalComponent],
  providers: [
    { provide: FormioAppConfig, useValue: AppConfig }
  ],
  exports: [FormioCardinalComponent]
})
export class FormioCardinalModule { }
