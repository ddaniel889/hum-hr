import { PdfViewerModule } from 'ng2-pdf-viewer';
import { BrowserModule } from '@angular/platform-browser';
import { LOCALE_ID, NgModule } from '@angular/core';
import { APP_ROUTING } from './app.routes';
import { AppComponent } from './app.component';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { APP_INITIALIZER } from '@angular/core';
import { AppConfig } from './app.config';
import localeEs from '@angular/common/locales/es';
import { registerLocaleData, DatePipe } from '@angular/common';
registerLocaleData(localeEs);
import {FlexLayoutModule} from '@angular/flex-layout';

// Material animation -- Optional
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MyMaterialModule } from './app.material';
import { MatStepperModule } from '@angular/material/stepper';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TokenInterceptor } from './modules/shared/auth/token-interceptor';
import { MsjDescriptionPipe } from './modules/shared/pipes/msj-description.pipe';
import { DialogComponent } from './modules/shared/errorHandler/dialog.component';
import { DialogModule } from './modules/shared/errorHandler/dialog.module';
import { FileDocumentViewModalComponent } from './modules/shared/file-document-view-modal/file-document-view-modal.component';
import { FileDocumentViewModalModule } from './modules/shared/file-document-view-modal/file-document-view-modal.module';
import { FileDocumentMetadataComponent } from './modules/shared/file-document-metadata/file-document-metadata.component';
import { FileDocumentMetadataModule } from './modules/shared/file-document-metadata/file-document-metadata.module';
import { AddMenuDialogModule } from './modules/employer/add-menu-dialog/add-menu-dialog.module';
import { AddMetadataValueDialogModule } from './modules/employer/add-metadata-value-dialog/add-metadata-value-dialog.module';
import { EditMetadataValueDialogModule } from './modules/employer/edit-metadata-value-dialog/edit-metadata-value-dialog.module';
import { MultipleDocumentationAddDialogComponent } from './modules/employer/multiple-documentation-add-dialog/multiple-documentation-add-dialog.component';
import { MultipleDocumentationAddDialogModule } from './modules/employer/multiple-documentation-add-dialog/multiple-documentation-add-dialog.module';
import { DocumentationTypeSetConfigurationDialogModule } from './modules/employer/documentation-type-set-configuration-dialog/documentation-type-set-configuration-dialog.module';
import { ViewFileModalModule } from './modules/employer/view-file-modal/view-file-modal.module';
import { CreateLsdModule } from './modules/employer/create-lsd/create-lsd.module';
import { CreateLsdComponent } from './modules/employer/create-lsd/create-lsd.component';
import { ViewFileModalComponent } from './modules/employer/view-file-modal/view-file-modal.component';
import { UploadFileModalComponent } from './modules/employer/upload-file-modal/upload-file-modal.component';
import { HotjarModule } from './modules/hotjar/hotjar.module';
import {AddLeaveDialogModule } from './modules/employee/add-leave-dialog/add-leave-dialog.module';
import { AddTimeLineDialogModule } from './modules/employer/add-dialog-timeLines/add-dialog-time-lines.module';
import { AddDialogHolidayModule } from './modules/employer/add-dialog-holiday/add-dialog-holiday.module';
import { ProgressMassiveApproveRequestsModule } from './modules/employer/progress-massive-approve-requests/progress-massive-approve-requests.module';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MY_DATE_FORMATS } from './modules/shared/models/date-formats';
import { CreateYearDialogModule } from './modules/employer/create-year-dialog/create-year-dialog.module';

export function initializeApp(appConfig: AppConfig) {
  return () => appConfig.load();
}

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        APP_ROUTING,
        BrowserAnimationsModule,
        FlexLayoutModule,
        DialogModule,
        FileDocumentViewModalModule,
        FileDocumentMetadataModule,
        AddMenuDialogModule,
        AddLeaveDialogModule,
        AddMetadataValueDialogModule,
        EditMetadataValueDialogModule,
        MultipleDocumentationAddDialogModule,
        DocumentationTypeSetConfigurationDialogModule,
        ViewFileModalModule,
        CreateLsdModule,
        HotjarModule,
        AddTimeLineDialogModule,
        AddDialogHolidayModule,
        CreateYearDialogModule,
        ProgressMassiveApproveRequestsModule,
        MatMomentDateModule
    ],
    providers: [
        AppConfig, { provide: APP_INITIALIZER, useFactory: initializeApp, deps: [AppConfig], multi: true },
        { provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: { duration: 5000 } },
        { provide: LOCALE_ID, useValue: 'es', deps: [MAT_DATE_LOCALE] },
        {provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS},
        { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
        MsjDescriptionPipe,
        DatePipe
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
