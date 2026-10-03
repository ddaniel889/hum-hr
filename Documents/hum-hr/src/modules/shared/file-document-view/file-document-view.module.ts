import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileDocumentViewComponent } from './file-document-view.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { PdfWrapperControlsModule } from '../pdf-wrapper-controls/pdf-wrapper-controls.module';
import { PdfWrapperModule } from '../pdf-wrapper/pdf-wrapper.module';
import { FileDocumentSignModule } from '../file-document-sign/file-document-sign.module';
import { FileDocumentStateModule } from '../file-document-state/file-document-state.module';
import { FileDocumentMetadataModule } from '../file-document-metadata/file-document-metadata.module';
import { MyMaterialModule } from 'src/app/app.material';
import { ChapaModule } from '../chapa/chapa.module';
import { FileDocumentWelcomeModule } from '../file-document-welcome/file-document-welcome.module';
import { FileDocumentUploadModule } from '../file-document-upload/file-document-upload.module';
import { FormioCardinalModule } from '../../formioCs/formio-cardinal.module';
import { FormsModule } from '@angular/forms';
import { FileDocumentQueryModule } from '../file-document-query/file-document-query.module';

@NgModule({
    declarations: [FileDocumentViewComponent],
    imports: [
        CommonModule,
        FlexLayoutModule,
        MyMaterialModule,
        ChapaModule,
        PdfViewerModule,
        PdfWrapperControlsModule,
        PdfWrapperModule,
        FileDocumentSignModule,
        FileDocumentWelcomeModule,
        FileDocumentStateModule,
        FileDocumentMetadataModule,
        FileDocumentUploadModule,
        FileDocumentQueryModule,
        FormioCardinalModule,
        FormsModule
    ],
    exports: [FileDocumentViewComponent]
})
export class FileDocumentViewModule { }
