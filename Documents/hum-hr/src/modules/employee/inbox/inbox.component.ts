import { Component, OnInit } from "@angular/core";
import { EmployeeProcess } from "../../shared/models/employee-process.model";
import { EmployeeProcessService } from "../../shared/services/employee-process.service";
import { ActivatedRoute, Router } from "@angular/router";
import { MessageService } from "../../shared/errorHandler/message.service";
import { GroupPeriod } from '../../shared/models/GroupPeriod.models';

@Component({
  selector: 'app-inbox',
  templateUrl: './inbox.component.html',
  styles: []
})
export class InboxComponent implements OnInit {
  items: EmployeeProcess[] = [];
  loaded = false;
  loadingPeriod = false;
  activeRow = '';
  selectedPeriod: GroupPeriod = GroupPeriod.Actual;
  grupoPeriodo = GroupPeriod;

  constructor(
    private _employeeProcessService: EmployeeProcessService,
    private msjService: MessageService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.loaded = false;
    this._employeeProcessService.subscribeToProcessList().subscribe(
      data => {
        this.items = data;
      },
      err => this.msjService.showError(err),
    );

    // Set defaults
    this._employeeProcessService.selectedPeriod = GroupPeriod.Actual;
    this.items = [];

    this._employeeProcessService
      .refreshMyProcess()
      .toPromise()
      .then(() => this.loaded = true);

  }

  openDocument(document) {
    this.activeRow = document.id;
    this.msjService.showInfo('Abriendo documento');
    this.router.navigate(['detail', document.id], { relativeTo: this.route });
  }

  changeExpander(period: GroupPeriod) {
    if (period !== this.selectedPeriod) {
      this.loadingPeriod = true;
      this._employeeProcessService.setSelectedPeriod(period);
      this.selectedPeriod = period;
      this._employeeProcessService.refreshMyProcess().toPromise().then(() => this.loadingPeriod = false);
    }
  }
}
