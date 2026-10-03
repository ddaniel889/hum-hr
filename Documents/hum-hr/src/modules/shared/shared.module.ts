import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedRoutingModule } from './shared-routing.module';
import { EmployeeProcessService } from './services/employee-process.service';
import { MessageService } from './errorHandler/message.service';
import { MsjDescriptionPipe } from './pipes/msj-description.pipe';

@NgModule({
  imports: [
    CommonModule,
    SharedRoutingModule
  ],
  declarations: [MsjDescriptionPipe],
  providers: [
    EmployeeProcessService,
    MessageService
  ]
})
export class SharedModule { }
