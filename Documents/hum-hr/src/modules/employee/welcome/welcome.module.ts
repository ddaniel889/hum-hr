import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WelcomeRoutingModule } from './welcome-routing.module';
import { MyMaterialModule } from '../../../app.material';
import { WelcomeComponent } from './welcome.component';
import {FlexLayoutModule} from '@angular/flex-layout';
import { ChapaModule } from '../../shared/chapa/chapa.module';

@NgModule({
  imports: [
    CommonModule,
    WelcomeRoutingModule,
    ChapaModule,
    MyMaterialModule,
    FlexLayoutModule
  ],
  declarations: [ WelcomeComponent ]
})
export class WelcomeModule { }
