import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProcessDetailComponent } from './process-detail.component';
import { ProcessDetailRoutingModule } from './process-detail-routing.module';
import { MyMaterialModule } from 'src/app/app.material';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CsPaginatorModule } from '../../shared/cs-paginator/cs-paginator.module';
import { MatRippleModule } from '@angular/material/core';
import { ChapaModule } from '../../shared/chapa/chapa.module';

@NgModule({
  declarations: [ProcessDetailComponent],
  imports: [
    CommonModule,
    ProcessDetailRoutingModule,
    MyMaterialModule,
    MatRippleModule,
    FlexLayoutModule,
    FormsModule,
    CsPaginatorModule,
    ChapaModule
  ]
})
export class ProcessDetailModule { }
