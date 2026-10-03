 import { NgModule } from '@angular/core';
 import { CsChartsControlComponent } from './cs-charts-control.component';
 import { NgChartsModule } from 'ng2-charts';
 
 @NgModule({
   imports: [
     NgChartsModule
   ],
   declarations: [CsChartsControlComponent],
   exports: [CsChartsControlComponent]
 })
 export class CsChartsControlModule {}
