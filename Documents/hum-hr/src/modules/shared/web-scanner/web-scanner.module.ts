import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebScannerComponent } from './web-scanner.component';
import { MyMaterialModule } from 'src/app/app.material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';


@NgModule({
  imports: [
    CommonModule,
    MyMaterialModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    MatOptionModule,
    MatSelectModule,
  ],
  declarations: [WebScannerComponent],
  exports: [WebScannerComponent]
})
export class WebScannerModule { }
