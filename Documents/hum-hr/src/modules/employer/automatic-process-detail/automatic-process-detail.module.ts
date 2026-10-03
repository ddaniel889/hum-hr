import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AutomaticProcessDetailComponent, BottomSheetMetadata } from './automatic-process-detail.component';
import { AutomaticProcessDetailRoutingModule } from './automatic-process-detail-routing.module';
import { MyMaterialModule } from 'src/app/app.material';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CsPaginatorModule } from '../../shared/cs-paginator/cs-paginator.module';
import { MetadataFilterDialogModule } from '../../shared/metadata-filter-dialog/metadata-filter-dialog.module';
import { FileDocumentListModule } from '../../shared/file-document-list/file-document-list.module';
import { MatRippleModule } from '@angular/material/core';
import { MatMenuModule } from '@angular/material/menu';
import { BottomSheetDeleteComponent } from './bottom-sheet-delete.component';
import { ChapaModule } from '../../shared/chapa/chapa.module';


@NgModule({
    imports: [
        CommonModule,
        MyMaterialModule,
        AutomaticProcessDetailRoutingModule,
        FlexLayoutModule,
        FormsModule,
        MatRippleModule,
        CsPaginatorModule,
        MetadataFilterDialogModule,
        FileDocumentListModule,
        MatMenuModule,
        ChapaModule
    ],
    declarations: [AutomaticProcessDetailComponent, BottomSheetMetadata, BottomSheetDeleteComponent],
    bootstrap: [AutomaticProcessDetailComponent],
    providers: []
})
export class AutomaticProcessDetailModule { }
