import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InboxComponent } from './inbox.component';
import { MyMaterialModule } from '../../../app.material';
import { EmployeeProcessService } from '../../shared/services/employee-process.service';
import { MessageService } from '../../shared/errorHandler/message.service';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
  imports: [
    CommonModule,
    MyMaterialModule,
    FlexLayoutModule
  ],
  providers: [
    EmployeeProcessService,
    MessageService
  ],
  declarations: [InboxComponent],
  exports: [InboxComponent]
})
export class InboxModule { }
