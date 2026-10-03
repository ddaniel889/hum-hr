import { FileDocumentSignModule } from '../../shared/file-document-sign/file-document-sign.module';
import { FileDocumentViewModule } from '../../shared/file-document-view/file-document-view.module';
import { FileDocumentInboxBlockCalendarModule } from '../../shared/file-document-inbox-block-calendar/file-document-inbox-block-calendar.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyMaterialModule } from '../../../app.material';
import { WelcomeModule } from '../welcome/welcome.module';
import { ProfileModule } from '../../profile/profile.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatMenuModule } from '@angular/material/menu';
import { HomeFileDocumentsRoutingModule } from './home-file-documents-routing.module';
import { HomeFileDocumentsComponent } from './home-file-documents.component';
import { FileDocumentInboxItemModule } from '../../shared/file-document-inbox-item/file-document-inbox-item.module';
import { DocumentationTypesService } from '../../shared/services/documentation-types.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AutocompleteChipModule } from '../../shared/autocomplete-chip/autocomplete-chip.module';
import { FormioCardinalModule } from '../../formioCs/formio-cardinal.module';
import { MatRippleModule } from '@angular/material/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { InboxConfigService } from '../../shared/services/inbox-config.service';
import { FileDocumentQueryModule } from '../../shared/file-document-query/file-document-query.module';

@NgModule({
  imports: [
    CommonModule,
    HomeFileDocumentsRoutingModule,
    MyMaterialModule,
    MatRippleModule,
    WelcomeModule,
    ProfileModule,
    FlexLayoutModule,
    MatMenuModule,
    FileDocumentInboxBlockCalendarModule,
    FileDocumentInboxItemModule,
    FileDocumentViewModule,
    FileDocumentSignModule,
    FormsModule,
    ReactiveFormsModule,
    AutocompleteChipModule,
    FormioCardinalModule,
    MatSlideToggleModule,
    FileDocumentQueryModule
  ],
  declarations: [HomeFileDocumentsComponent],
  providers: [DocumentationTypesService, InboxConfigService]
})
export class HomeFileDocumentsModule {}
