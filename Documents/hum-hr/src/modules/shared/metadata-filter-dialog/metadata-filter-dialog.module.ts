import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyMaterialModule } from 'src/app/app.material';
import { MetadataFilterDialogComponent } from './metadata-filter-dialog.component';
import { SearchCustomControlModule } from '../search-custom-control/search-custom-control.module';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';

@NgModule({
    imports: [
        CommonModule,
        MyMaterialModule,
        SearchCustomControlModule,
        MatProgressSpinnerModule,
        FlexLayoutModule,
        MatCheckboxModule,
        FormsModule
    ],
    declarations: [MetadataFilterDialogComponent],
    exports: [MetadataFilterDialogComponent]
})
export class MetadataFilterDialogModule { }
