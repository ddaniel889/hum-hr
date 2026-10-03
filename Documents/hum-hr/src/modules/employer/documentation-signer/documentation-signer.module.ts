import { DocumentationSignerRoutingModule } from './documentation-signer-routing.module';
import { DocumentationSignerComponent } from './documentation-signer.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { ChapaModule } from '../../shared/chapa/chapa.module';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FileDocumentListModule } from '../../shared/file-document-list/file-document-list.module';
import { MatDialogModule } from '@angular/material/dialog';
import { FileDocumentSignMassiveDialogModule } from '../../shared/file-document-sign-massive-dialog/file-document-sign-massive-dialog.module';
import { MatRippleModule } from '@angular/material/core';

@NgModule({
  declarations: [DocumentationSignerComponent],
  imports: [
    CommonModule,
    DocumentationSignerRoutingModule,
    FlexLayoutModule,
    MatCardModule,
    MatButtonModule,
    MatExpansionModule,
    MatToolbarModule,
    ChapaModule,
    MatIconModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    FileDocumentListModule,
    MatDialogModule,
    FileDocumentSignMassiveDialogModule,
    MatRippleModule
  ],

  exports: [DocumentationSignerComponent]
})
export class DocumentationSignerModule { }
