import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyMaterialModule } from 'src/app/app.material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatRippleModule } from '@angular/material/core';
import { SharePersonDialogComponent } from './share-person-dialog.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharePersonResponseDialogComponent } from '../share-person-response-dialog/share-person-response-dialog.component';

@NgModule({
    declarations: [SharePersonDialogComponent],
    imports: [
        CommonModule,
        MyMaterialModule,
        FlexLayoutModule,
        MatRippleModule,
        FormsModule,
        ReactiveFormsModule
    ],
    exports: [SharePersonDialogComponent]
})
export class SharePersonDialogModule { }
