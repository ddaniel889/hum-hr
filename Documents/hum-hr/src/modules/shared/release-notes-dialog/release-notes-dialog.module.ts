import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyMaterialModule } from 'src/app/app.material';
import { ReleaseNotesDialogComponent } from './release-notes-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
    imports: [
        CommonModule,
        MyMaterialModule,
        FlexLayoutModule,
        MatDialogModule
    ],
    declarations: [ReleaseNotesDialogComponent],
    exports: [ReleaseNotesDialogComponent]
})
export class ReleaseNotesDialogModule { }
