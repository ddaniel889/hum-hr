import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DocumentConfigurationRoutingModule } from './document-configuration-routing.module';
import { DocumentConfigurationComponent } from './document-configuration.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { ChapaModule } from '../../shared/chapa/chapa.module';
import { MatTabsModule } from '@angular/material/tabs';
import { MatRippleModule } from '@angular/material/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';


@NgModule({
  declarations: [DocumentConfigurationComponent],
  imports: [
    CommonModule,
    DocumentConfigurationRoutingModule,
    MatToolbarModule,
    MatCardModule,
    FlexLayoutModule,
    MatIconModule,
    MatMenuModule,
    MatSlideToggleModule,
    MatExpansionModule,
    MatButtonModule,
    ChapaModule,
    MatTabsModule,
    MatRippleModule,
    MatProgressBarModule
  ]
})
export class DocumentConfigurationModule { }
