import { FileDocumentInboxItemDocumentationModule } from '../file-document-inbox-item-documentation/file-document-inbox-item-documentation.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileDocumentInboxBlockOuComponent as FileDocumentInboxBlockOuComponent } from './file-document-inbox-block-ou.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MyMaterialModule } from 'src/app/app.material';
import { FileDocumentSignMassiveDialogModule } from '../file-document-sign-massive-dialog/file-document-sign-massive-dialog.module';
import { FileDocumentSignMassiveDialogComponent } from '../file-document-sign-massive-dialog/file-document-sign-massive-dialog.component';

@NgModule({
    declarations: [FileDocumentInboxBlockOuComponent],
    imports: [
        CommonModule,
        FlexLayoutModule,
        MyMaterialModule,
        FileDocumentInboxItemDocumentationModule,
        FileDocumentSignMassiveDialogModule
    ],
    exports: [FileDocumentInboxBlockOuComponent]
})
export class FileDocumentInboxBlockOuModule { }
