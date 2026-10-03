import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProcessStateHistoryDialogComponent } from './process-state-history-dialog.component';
import { MyMaterialModule } from 'src/app/app.material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatRippleModule } from '@angular/material/core';

@NgModule({
  declarations: [ProcessStateHistoryDialogComponent],
  imports: [
    CommonModule,
    MyMaterialModule,
    FlexLayoutModule,
    MatRippleModule
  ],
  exports: [ProcessStateHistoryDialogComponent]
})
export class ProcessStateHistoryDialogModule { }
