import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileDocumentListComponent } from './file-document-list.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MyMaterialModule } from 'src/app/app.material';
import { ChapaModule } from '../chapa/chapa.module';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRippleModule } from '@angular/material/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { CsPaginatorModule } from '../cs-paginator/cs-paginator.module';
import { AvatarModule } from 'ngx-avatar';
import { FileDocumentViewModule } from '../file-document-view/file-document-view.module';
import { FileDocumentStateModule } from '../file-document-state/file-document-state.module';
import { FileDocumentWelcomeModule } from '../file-document-welcome/file-document-welcome.module';
import { NgxMaskModule } from 'ngx-mask';
import { BottomSheetDeleteComponent } from './bottom-sheet-delete.component';
import { AdvancedEmployeeSearchModule } from '../advanced-employee-search/advanced-employee-search.module';


@NgModule({
    declarations: [FileDocumentListComponent, BottomSheetDeleteComponent],
    imports: [
        CommonModule,
        FlexLayoutModule,
        MyMaterialModule,
        ChapaModule,
        MatCheckboxModule,
        MatRippleModule,
        MatSlideToggleModule,
        MatMenuModule,
        FormsModule,
        CsPaginatorModule,
        AvatarModule,
        FileDocumentWelcomeModule,
        FileDocumentViewModule,
        FileDocumentStateModule,
        NgxMaskModule,
        AdvancedEmployeeSearchModule
    ],
    exports: [FileDocumentListComponent]
})
export class FileDocumentListModule { }
