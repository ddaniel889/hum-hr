import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyMaterialModule } from 'src/app/app.material';
import { MultipleDocumentationAddDialogComponent } from './multiple-documentation-add-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatMenuModule } from '@angular/material/menu';
import { MatRippleModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTabsModule } from '@angular/material/tabs';
import { FormioCardinalModule } from '../../formioCs/formio-cardinal.module';
import { FileDndModule } from '../../shared/file-dnd/file-dnd.module';
import { WebScannerModule } from '../../shared/web-scanner/web-scanner.module';
import { FileDocumentDetailModule } from '../../shared/file-document-detail/file-document-detail.module';
import { DocumentationTypeSetEditModule } from '../documentation-type-set-edit/documentation-type-set-edit.module';
import { DocumentationTypesService } from '../../shared/services/documentation-types.service';
import { DocumentationService } from '../../shared/services/documentation.service';
import { CustomControlModule } from '../../shared/custom-control/custom-control.module';
import { MatChipsModule } from '@angular/material/chips';
import { ChapaModule } from '../../shared/chapa/chapa.module';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@NgModule({
  imports: [
    CommonModule,
    MyMaterialModule,
    FlexLayoutModule,
    MatDialogModule,
    MatMenuModule,
    MatRippleModule,
    MatDividerModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatTabsModule,
    FormioCardinalModule,
    FileDndModule,
    WebScannerModule,
    FileDocumentDetailModule,
    DocumentationTypeSetEditModule,
    CustomControlModule,
    MatChipsModule,
    ChapaModule,
    MatIconModule,
    MatInputModule,
    MatSlideToggleModule
  ],
  providers: [DocumentationTypesService, DocumentationService],
  declarations: [ MultipleDocumentationAddDialogComponent ],
  exports: [ MultipleDocumentationAddDialogComponent ]
})
export class MultipleDocumentationAddDialogModule { }
