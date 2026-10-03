import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CsPaginatorComponent } from './cs-paginator.component';
import { MatPaginatorModule, MatPaginatorIntl } from '@angular/material/paginator';
import { getEsPaginatorIntl } from './es-paginator-intl';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
  imports: [
    CommonModule,
    MatPaginatorModule,
    MatSelectModule,
    FormsModule,
    FlexLayoutModule
  ],
  declarations: [
    CsPaginatorComponent
  ],
  exports: [
    CsPaginatorComponent
  ],
  providers: [
    { provide: MatPaginatorIntl, useValue: getEsPaginatorIntl() }
  ]
})
export class CsPaginatorModule { }
