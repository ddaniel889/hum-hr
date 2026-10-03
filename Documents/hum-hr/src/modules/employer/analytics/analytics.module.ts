import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsComponent } from './analytics.component';
import { AnalyticsRoutingModule } from './analytics-routing.module';
import { CsChartsControlModule } from '../../shared/cs-charts-control/cs-charts-control.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatRippleModule } from '@angular/material/core';
import { MatMenuModule } from '@angular/material/menu';
import { MyMaterialModule } from 'src/app/app.material';
import { FormsModule } from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';
import { AutocompleteChipModule } from '../../shared/autocomplete-chip/autocomplete-chip.module';
import { ChapaModule } from '../../shared/chapa/chapa.module'; 

@NgModule({
    declarations: [AnalyticsComponent],
    imports: [
        CommonModule,
        FlexLayoutModule,
        MatRippleModule,
        MyMaterialModule,
        AnalyticsRoutingModule,
        CsChartsControlModule,
        FormsModule,
        NgxMaskModule,
        AutocompleteChipModule,
        MatMenuModule,
        ChapaModule
    ],
    exports: [AnalyticsComponent]
})
export class AnalyticsModule { }
