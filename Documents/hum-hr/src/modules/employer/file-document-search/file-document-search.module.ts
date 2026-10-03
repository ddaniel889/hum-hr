import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileDocumentSearchRoutingModule } from './file-document-search-routing.module';
import { FileDocumentSearchComponent } from './file-document-search.component';
import { MyMaterialModule } from 'src/app/app.material';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatRippleModule } from '@angular/material/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatRadioModule } from '@angular/material/radio';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FileDocumentListModule } from '../../shared/file-document-list/file-document-list.module';
import { FileDocumentInboxBlockOuModule } from '../../shared/file-document-inbox-block-ou/file-document-inbox-block-ou.module';
import { CsPaginatorModule } from '../../shared/cs-paginator/cs-paginator.module';
import { NgxMaskModule } from 'ngx-mask';
import { CustomControlModule } from '../../shared/custom-control/custom-control.module';
import { MetadataFilterDialogModule } from '../../shared/metadata-filter-dialog/metadata-filter-dialog.module';
import { AutocompleteChipModule } from '../../shared/autocomplete-chip/autocomplete-chip.module';
import { AdvancedEmployeeSearchModule } from '../../shared/advanced-employee-search/advanced-employee-search.module';
import { SharedPipeModule } from '../../shared/pipes/shared-pipe.module';
import { FileDocumentViewModalModule } from '../../shared/file-document-view-modal/file-document-view-modal.module';
import { ChapaModule } from '../../shared/chapa/chapa.module';
import { MatTabsModule } from '@angular/material/tabs';
import { FileProveDocumentViewModalModule } from '../../shared/file-prove-document-view-modal/file-prove-document-view-modal.module';
import { FileProveDocumentItemModule } from '../../shared/file-prove-document-item/file-prove-document-item.module';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';

@NgModule({
  declarations: [
    FileDocumentSearchComponent],
  imports: [
    CommonModule,
    FileDocumentSearchRoutingModule,
    MyMaterialModule,
    FormsModule,
    FlexLayoutModule,
    MatRippleModule,
    MatMenuModule,
    FileDocumentInboxBlockOuModule,
    FileDocumentListModule,
    MatSlideToggleModule,
    CsPaginatorModule,
    NgxMaskModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    CustomControlModule,
    MetadataFilterDialogModule,
    AutocompleteChipModule,
    MatRadioModule,
    AdvancedEmployeeSearchModule,
    SharedPipeModule.forRoot(),
    FileDocumentViewModalModule,
    FileProveDocumentViewModalModule,
    ChapaModule,
    MatTabsModule,
    MatDatepickerModule
  ]
})
export class FileDocumentSearchModule { }
