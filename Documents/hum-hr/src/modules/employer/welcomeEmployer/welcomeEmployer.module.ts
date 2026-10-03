import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChapaModule } from '../../shared/chapa/chapa.module';
import { MyMaterialModule } from '../../../app.material';
import { WelcomeEmployerComponent } from './welcomeEmployer.component';
import {FlexLayoutModule} from '@angular/flex-layout';
import { WelcomeEmployerRoutingModule } from './welcomeEmployer-routing.module';


@NgModule({
  imports: [
    CommonModule,
    MyMaterialModule,
    ChapaModule,
    FlexLayoutModule,
    WelcomeEmployerRoutingModule
  ],
  declarations: [ WelcomeEmployerComponent ]
})
export class WelcomeEmployerModule { }
