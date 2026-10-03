import { NgModule } from '@angular/core';
import { CsGridControlComponent } from './cs-grid-control.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MyMaterialModule } from 'src/app/app.material';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@NgModule({
  imports: [
    NgxDatatableModule,
    CommonModule,
    FlexLayoutModule,
    MyMaterialModule,
    MatProgressBarModule
  ],
  declarations: [CsGridControlComponent],
  exports: [CsGridControlComponent]

})
export class CsGridControlModule {}
