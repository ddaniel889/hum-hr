import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginBrowserComponent } from './login-browser.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [LoginBrowserComponent],
  exports: [LoginBrowserComponent]
})
export class LoginBrowserModule { }
