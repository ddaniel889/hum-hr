import { Component, OnInit, Inject } from '@angular/core';
import { ProcessHistoryStateDialogData } from '../../shared/models/process-history-state-dialog-data.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EmployerProcessService } from '../../shared/services/employer-process.service';
import { MessageService } from '../../shared/errorHandler/message.service';
import { TranslateService } from '../../shared/services/translate.service';

@Component({
  selector: 'app-process-state-history-dialog',
  templateUrl: './process-state-history-dialog.component.html',
  styles: []
})
export class ProcessStateHistoryDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: ProcessHistoryStateDialogData,
    private dialogRef: MatDialogRef<ProcessStateHistoryDialogComponent>,
    private employeeProcessService: EmployerProcessService,
    private messageService: MessageService,
    private translateService: TranslateService) { }

  ngOnInit() {

    this.employeeProcessService
      .getProcessDetail(this.data.process.id)
      .subscribe(
        res => {
          this.data.process = res;
          if (this.data.process.files) {
          }
        },
        err => { this.messageService.showError(err); }
      );
  }

  public translateStateName(state: string): string {
    return this.translateService.translateStateName(state);
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
