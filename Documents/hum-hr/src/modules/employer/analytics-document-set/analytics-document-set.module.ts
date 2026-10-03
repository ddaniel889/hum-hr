import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsDocumentSetComponent } from './analytics-document-set.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import { MatRippleModule } from '@angular/material/core';
import { MatMenuModule } from '@angular/material/menu';
import { NgxMaskModule } from 'ngx-mask';
import { MyMaterialModule } from 'src/app/app.material';
import { AutocompleteChipModule } from '../../shared/autocomplete-chip/autocomplete-chip.module';
import { ChapaModule } from '../../shared/chapa/chapa.module';
import { CsChartsControlModule } from '../../shared/cs-charts-control/cs-charts-control.module';
import { AnalyticsDocumentSetRoutingModule } from './analytics-document-set-routing.module';
import { CsPaginatorModule } from '../../shared/cs-paginator/cs-paginator.module';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';



@NgModule({
  declarations: [AnalyticsDocumentSetComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatRippleModule,
    MyMaterialModule,
    AnalyticsDocumentSetRoutingModule,
    CsChartsControlModule,
    FormsModule,
    MatTooltipModule,
    MatRippleModule,
    NgxMaskModule,
    AutocompleteChipModule,
    MatMenuModule,
    MatSlideToggleModule,
    ChapaModule,
    CsPaginatorModule
  ],
  exports: [AnalyticsDocumentSetComponent]
})
export class AnalyticsDocumentSetModule { }
