import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProcessListPage } from './pages/process-list/process-list.page';
import { ProcessDetailsPage } from './pages/process-details/process-details.page';
import { DeferredProcessesRoutingModule } from './deferred-processes-routing.module';
import { MyMaterialModule } from 'src/app/app.material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ProcessCardComponent } from './components/process-card/process-card.component';
import { MatRippleModule } from '@angular/material/core';
import { ProcessHistoryTableComponent } from './components/process-history-table/process-history-table.component';
import { AvatarModule } from 'ngx-avatar';
import { ProcessEmployeeDetailsTableComponent } from './components/process-employee-details-table/process-employee-details-table.component';
import { MetadataDocNamePipe } from './pipes/metadata-doc-name.pipe';
import { ProcessTypeNamePipe } from './pipes/process-type-name.pipe';
import { CeilPipe } from './pipes/ceil.pipe';
import { ProcessGroupedStateNamePipe } from './pipes/process-grouped-state-name.pipe';
import { ProcessStageNamePipe } from './pipes/process-stage-name.pipe';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChapaModule } from '../../shared/chapa/chapa.module';
import { MatPaginatorModule } from '@angular/material/paginator';
import { DeferredProcessesService } from './services/deferred-processes.service';
import { FileDocumentViewModalModule } from '../../shared/file-document-view-modal/file-document-view-modal.module';
import { CustomChipModule } from '../../shared/custom-chip/custom-chip.module';
import { ProcessGroupedStateChipTheme } from './pipes/process-grouped-state-chip-theme.pipe';
import { ProcessStageHistoryCardComponent } from './components/process-stage-history-card/process-stage-history-card.component';
import { CustomSearchInputModule } from '../../shared/custom-search-input/custom-search-input.module';
import { RelatedProcessCardComponent } from './components/related-process-card/related-process-card.component';

@NgModule({
  declarations: [
    ProcessListPage,
    ProcessDetailsPage,
    ProcessCardComponent,
    ProcessHistoryTableComponent,
    ProcessEmployeeDetailsTableComponent,
    MetadataDocNamePipe,
    ProcessTypeNamePipe,
    CeilPipe,
    ProcessGroupedStateNamePipe,
    ProcessGroupedStateChipTheme,
    ProcessStageNamePipe,
    ProcessStageHistoryCardComponent,
    RelatedProcessCardComponent,
  ],
  imports: [
    CommonModule,
    MyMaterialModule,
    FlexLayoutModule,
    DeferredProcessesRoutingModule,
    MatRippleModule,
    AvatarModule,
    FormsModule,
    CustomSearchInputModule,
    ReactiveFormsModule,
    ChapaModule,
    MatPaginatorModule,
    FileDocumentViewModalModule,
    CustomChipModule,
  ],
  providers: [DeferredProcessesService],
})
export class DeferredProcessesModule { }
