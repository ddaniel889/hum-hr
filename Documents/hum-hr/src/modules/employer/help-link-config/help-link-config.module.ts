import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HelpLinkConfigRoutingModule } from './help-link-config-routing.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { HelpLinkConfigComponent } from './help-link-config.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';



@NgModule({
  declarations: [HelpLinkConfigComponent],
  imports: [
    CommonModule, FormsModule,
    ReactiveFormsModule,
    HelpLinkConfigRoutingModule, FlexLayoutModule, MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  exports: [HelpLinkConfigComponent]
})
export class HelpLinkConfigModule { }