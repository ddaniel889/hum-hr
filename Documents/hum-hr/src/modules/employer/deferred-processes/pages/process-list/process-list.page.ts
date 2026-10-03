import { Component, OnDestroy, OnInit } from '@angular/core';
import { OrganizationalUnit } from 'src/app/modules/shared/models';
import { OrganizationalUnitService } from 'src/app/modules/shared/services/organizational-unit.service';
import { DeferredProcessesService } from '../../services/deferred-processes.service';
import { processOrchestatorTypeChoices } from '../../data/process-type.data';
import { processGroupedStateChoices } from '../../data/process-grouped-state.data';
import { UntypedFormGroup } from '@angular/forms';
import { HistoryProcessOrchestrationDto, OngoingProcessOrchestrationDto } from '../../models/deferred-processes.model';
import { Subject } from 'rxjs';
import { skip, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-process-list',
  templateUrl: './process-list.page.html',
  styleUrls: ['./process-list.page.scss'],
})
export class ProcessListPage implements OnInit, OnDestroy {
  selectedOrganizationalUnit: OrganizationalUnit;

  inCourse: OngoingProcessOrchestrationDto[] = null;
  history: HistoryProcessOrchestrationDto[] = null;
  isLoading = true;

  typeChoices = processOrchestatorTypeChoices;
  groupedStateChoices = processGroupedStateChoices;

  historyParamsForm: UntypedFormGroup;
  private unsubscribeAll = new Subject<void>();

  constructor(
    private organizationalUnitService: OrganizationalUnitService,
    private deferredProcessesService: DeferredProcessesService
  ) {}

  ngOnInit(): void {
    this.organizationalUnitService.getTreeInMemory().then((tree) => {
      this.selectedOrganizationalUnit =
        tree.find((ou) => ou.isRoot) || (tree.length > 0 ? tree[0] : null);
    });

    this.historyParamsForm = this.deferredProcessesService.historyParamsForm;
    this.deferredProcessesService.loadAllProcesses();
    this.deferredProcessesService.isLoading$
      .pipe(skip(1), takeUntil(this.unsubscribeAll))
      .subscribe((res) => this.isLoading = res > 0);

    this.deferredProcessesService.inCourse$
      .pipe(takeUntil(this.unsubscribeAll))
      .subscribe((res) => this.inCourse = res);

    this.deferredProcessesService.history$
      .pipe(takeUntil(this.unsubscribeAll))
      .subscribe((res) => this.history = res);
  }

  ngOnDestroy(): void {
    this.deferredProcessesService.cancelRequestFor('ongoing');
    this.deferredProcessesService.cancelRequestFor('history');
    this.deferredProcessesService.stopPollingProcessesData();
    this.unsubscribeAll.next();
    this.unsubscribeAll.complete();
  }

  refreshAll(): void {
    this.deferredProcessesService.refreshAllProcesses();
  }

  refreshHistory(): void {
    this.historyParamsForm.controls['pageNumber'].setValue(1);
    this.deferredProcessesService.loadHistoryProcesses(true);
  }

  clearDates() {
    this.historyParamsForm.controls['createdFrom'].setValue(null);
    this.historyParamsForm.controls['createdTo'].setValue(null);
    this.refreshHistory();
  }
}
