import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { HistoryProcessOrchestrationDto } from "../../models/deferred-processes.model";
import { PageEvent } from "@angular/material/paginator";
import { DeferredProcessesService } from "../../services/deferred-processes.service";

@Component({
  selector: "app-process-history-table",
  templateUrl: "./process-history-table.component.html",
  styleUrls: ["./process-history-table.component.scss"],
})
export class ProcessHistoryTableComponent implements OnChanges {
  displayedColumns: string[] = [
    "date",
    "organizationalUnitName",
    "processType",
    "documentTypeName",
    "totalProcessed",
    "totalWarnings",
    "totalErrors",
    "createdBy",
    "state",
  ];
  dataSource = new MatTableDataSource<HistoryProcessOrchestrationDto>([]);
  @Input() data: HistoryProcessOrchestrationDto[] = [];

  isLoading$ = this.deferredProcessesService.isLoading$;
  paginationInfo$ = this.deferredProcessesService.historyPagination$;
  historyParamsForm = this.deferredProcessesService.historyParamsForm;

  constructor(private deferredProcessesService: DeferredProcessesService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.dataSource = new MatTableDataSource<HistoryProcessOrchestrationDto>(this.data);
    }
  }

  handlePageEvent(e: PageEvent) {
    this.historyParamsForm.controls['pageNumber'].setValue(e.pageIndex + 1);
    this.historyParamsForm.controls['pageSize'].setValue(e.pageSize);
    this.deferredProcessesService.loadHistoryProcesses(false);
  }
}
