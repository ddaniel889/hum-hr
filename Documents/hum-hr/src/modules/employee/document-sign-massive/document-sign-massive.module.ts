import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DocumentSignMassiveRoutingModule } from './document-sign-massive-routing.module';
import { DocumentSignMassiveComponent } from './document-sign-massive.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ChapaModule } from '../../shared/chapa/chapa.module';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { FileDocumentDetailModule } from '../../shared/file-document-detail/file-document-detail.module';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';



@NgModule({
  declarations: [DocumentSignMassiveComponent],
  imports: [
    CommonModule,
    DocumentSignMassiveRoutingModule,
    MatToolbarModule,
    MatCardModule,
    MatSidenavModule,
    MatIconModule,
    MatDividerModule,
    FlexLayoutModule,
    MatProgressSpinnerModule,
    MatRippleModule,
    MatButtonModule,
    ChapaModule,
    FileDocumentDetailModule,
    MatCheckboxModule,
    FormsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule
   ]
})
export class DocumentSignMassiveModule { }
