import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LsdRoutingModule } from './lsd-routing.module';
import { LsdComponent } from './lsd.component';
import { CreateLsdModule } from '../create-lsd/create-lsd.module';
import { MatDialogModule } from '@angular/material/dialog';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatMenuModule } from '@angular/material/menu';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ChapaModule } from '../../shared/chapa/chapa.module';
import { MatBadgeModule } from '@angular/material/badge';
import { NgxMaskModule } from 'ngx-mask';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CustomControlModule } from '../../shared/custom-control/custom-control.module';
import { UploadFileModalModule } from '../upload-file-modal/upload-file-modal.module';
import { GenericBottomsheetModule } from '../../shared/generic-bottom-sheet/generic-bottom-sheet.module';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AutocompleteChipModule } from '../../shared/autocomplete-chip/autocomplete-chip.module';
import { SearchCustomControlModule } from '../../shared/search-custom-control/search-custom-control.module';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule } from '@angular/material/paginator';
import { CsPaginatorModule } from '../../shared/cs-paginator/cs-paginator.module';


@NgModule({
  declarations: [LsdComponent],
  imports: [
    CommonModule,
    LsdRoutingModule,
    CreateLsdModule,
    MatDialogModule,
    MatToolbarModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    FlexLayoutModule,
    MatMenuModule,
    MatExpansionModule,
    MatSlideToggleModule,
    ReactiveFormsModule,
    FormsModule,
    ChapaModule,
    MatBadgeModule,
    NgxMaskModule,
    MatListModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    CustomControlModule,
    UploadFileModalModule,
    GenericBottomsheetModule,
    AutocompleteChipModule,
    SearchCustomControlModule,
    MatSelectModule,
    CsPaginatorModule
  ]
})
export class LsdModule { }
