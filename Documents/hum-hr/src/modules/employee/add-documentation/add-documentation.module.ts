import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddDocumentationRoutingModule } from './add-documentation-routing.module';
import { MatMenuModule } from '@angular/material/menu';
import { AddDocumentationComponent } from './add-documentation.component';
import { MyMaterialModule } from 'src/app/app.material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatRippleModule } from '@angular/material/core';
import { MatTabsModule } from '@angular/material/tabs';
import { DocumentationTypesService } from '../../shared/services/documentation-types.service';
import { FileDocumentViewModule } from '../../shared/file-document-view/file-document-view.module';
import { FormioCardinalModule } from '../../formioCs/formio-cardinal.module';
import { FileDocumentUploadModule } from '../../shared/file-document-upload/file-document-upload.module';
import { MetadataService } from '../../shared/services/metadatas.service';

@NgModule({
  imports: [
    CommonModule,
    MyMaterialModule,
    AddDocumentationRoutingModule,
    MatMenuModule,
    FlexLayoutModule,
    MatTabsModule,
    FileDocumentViewModule,
    FormioCardinalModule,
    FileDocumentUploadModule,
    MatRippleModule
  ],
  declarations: [AddDocumentationComponent],
  providers: [DocumentationTypesService,
    MetadataService]
})
export class AddDocumentationModule { }
