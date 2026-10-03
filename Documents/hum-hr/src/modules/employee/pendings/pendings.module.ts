import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PendingsRoutingModule } from './pendings-routing.module';
import { PendingComponent } from './pending.component';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatRippleModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FileDocumentViewModule } from '../../shared/file-document-view/file-document-view.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ChapaModule } from '../../shared/chapa/chapa.module';
import { DocumentSignMassiveModule } from '../document-sign-massive/document-sign-massive.module';

@NgModule({
  imports: [
    CommonModule,
    PendingsRoutingModule,
    MatToolbarModule,
    MatCardModule,
    MatSidenavModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatDividerModule,
    MatRippleModule,
    FileDocumentViewModule,
    FlexLayoutModule,
    MatButtonModule,
    ChapaModule,
    DocumentSignMassiveModule
  ],
  declarations: [PendingComponent],
  exports: [PendingComponent]
})
export class PendingsModule { }
