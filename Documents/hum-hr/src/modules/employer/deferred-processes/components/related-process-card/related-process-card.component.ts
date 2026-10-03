import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DeferredProcessesService } from '../../services/deferred-processes.service';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-related-process-card',
  templateUrl: './related-process-card.component.html',
  styleUrls: ['./related-process-card.component.scss']
})
export class RelatedProcessCardComponent implements OnInit {
  process$ = this.deferredProcessService.relatedProcess$;
  isLoading$ = this.deferredProcessService.isLoading$;
  loadingState$: Observable<any>;

  constructor(
    public dialogRef: MatDialogRef<RelatedProcessCardComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: string, metadata: any },
    private readonly deferredProcessService: DeferredProcessesService,
  ) {}

  ngOnInit(): void {
    this.loadingState$ = combineLatest([this.isLoading$, this.process$]).pipe(
      map(([isLoading, process]) => ({ isLoading, process }))
    );
    
    if (this.data.id) {
      this.deferredProcessService.loadRelatedProcess(this.data.id);
    }
  }

  onClose(): void {
    this.dialogRef.close();
  }

}
