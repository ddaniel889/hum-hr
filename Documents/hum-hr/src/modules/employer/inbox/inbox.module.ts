import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InboxComponent } from './inbox.component';
import { MyMaterialModule } from '../../../app.material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ProcessStateHistoryDialogComponent } from '../process-state-history-dialog/process-state-history-dialog.component';
import { ProcessStateHistoryDialogModule } from '../process-state-history-dialog/process-state-history-dialog.module';

@NgModule({
    imports: [
        CommonModule,
        MyMaterialModule,
        FlexLayoutModule,
        ProcessStateHistoryDialogModule
    ],
    providers: [],
    declarations: [InboxComponent],
    exports: [InboxComponent]
})
export class InboxModule { }
