import { Component, Input } from '@angular/core';
import { ProcessOrchestratorDto } from '../../models/deferred-processes.model';
import { MatDialog } from '@angular/material/dialog';
import { RelatedProcessCardComponent } from '../related-process-card/related-process-card.component';

@Component({
  selector: 'app-process-stage-history-card',
  templateUrl: './process-stage-history-card.component.html',
  styleUrls: ['./process-stage-history-card.component.scss']
})
export class ProcessStageHistoryCardComponent {
  @Input() process: ProcessOrchestratorDto;
  @Input() isSmall: boolean = false;

  constructor(public dialog: MatDialog) {}

  onViewRelatedProcess(id: string) {
    this.dialog.open(RelatedProcessCardComponent, {
      data: { id, metadata: this.process.metadata },
    });
  }
}
