import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MyMaterialModule } from '../../app.material';
import { LoginBrowserModule } from '../login-browser/login-browser.module';
import { AutocompleteChipModule } from '../shared/autocomplete-chip/autocomplete-chip.module';
import { TermsAndConditionsModule } from './../shared/terms-and-conditions/terms-and-conditions.module';
import { LoginRoutingModule } from './login-routing.module';
import { LoginComponent } from './login.component';
import { RecaptchaModule, RecaptchaFormsModule } from 'ng-recaptcha';

@NgModule({
  imports: [
    CommonModule,
    LoginRoutingModule,
    FormsModule,
    MyMaterialModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    LoginBrowserModule,
    TermsAndConditionsModule,
    MatAutocompleteModule,
    AutocompleteChipModule,
    RecaptchaModule,
    RecaptchaFormsModule, // if you need forms support
  ],
  declarations: [LoginComponent]
})
export class LoginModule { }
