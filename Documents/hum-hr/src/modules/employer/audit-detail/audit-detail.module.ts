import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuditDetailComponent } from './audit-detail.component';
import { AuditDetailRoutingModule } from './audit-detail-routing.module';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { ChapaModule } from '../../shared/chapa/chapa.module';
import { SharedPipeModule } from '../../shared/pipes/shared-pipe.module';



@NgModule({
  imports: [
    CommonModule,
    AuditDetailRoutingModule,
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule,
    MatButtonModule,
    MatCardModule,
    ChapaModule,
    SharedPipeModule
  ],
  declarations: [AuditDetailComponent],
  exports: [AuditDetailComponent]
})
export class AuditDetailModule { }
