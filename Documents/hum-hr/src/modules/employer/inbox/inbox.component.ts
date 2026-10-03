import { Component, OnInit, Output, EventEmitter, Input,ViewChild,AfterViewChecked } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { MessageService } from "../../shared/errorHandler/message.service";
import { EmployerProcessService } from "../../shared/services/employer-process.service";
import { GroupState } from "../../shared/models/GroupState.models";
import { DeferedProcess, ProcessType } from "../../shared/models/defered-process.model";
import { ProcessHistoryStateDialogData } from "../../shared/models/process-history-state-dialog-data.model";
import { MatDialog } from '@angular/material/dialog';
import { ProcessStateHistoryDialogComponent } from "../process-state-history-dialog/process-state-history-dialog.component";
import { ITEMSPERPAGE } from "../../shared/models/paged.model.";
import { TranslateService } from "../../shared/services/translate.service";
import {  MatExpansionPanel } from '@angular/material/expansion';
import { AuthService } from "../../shared/auth/auth.service";

@Component({
  selector: 'app-inbox',
  templateUrl: './inbox.component.html',
  styles: []
})
export class InboxComponent implements OnInit {  
  @ViewChild('finalizado')  finalizado:MatExpansionPanel;

  constructor(
    private _employerProcessService: EmployerProcessService,
    private msjService: MessageService,
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    private translateService: TranslateService,
    private authServices: AuthService,
  ) { }

  acumulador = 0;
  disableAddLines = true;
  @Output() processSelected = new EventEmitter<string>();
  items: DeferedProcess[] = [];
  loaded = false;
  @Input() loadingDeferedProcess = false;
  activeRow = '';
  selectedState: GroupState = GroupState.EnProceso;
  grupoState = GroupState;
  currentPage:number;
  process: DeferedProcess;

  ngOnInit() {   
  this.subscribeEventDelete(); 
    this.loaded = false;
    this._employerProcessService.subscribeToProcessList().subscribe(
      data => {
        if (this._employerProcessService.currentPage === 1) {
          this.items = [];
        }
        this.items = this.items.concat(data);
        this.disableAddLines = data.length === 0 ||  (data.length % ITEMSPERPAGE) > 0;
      },
      err => this.msjService.showError(err),
    );
    this._employerProcessService.roles = this.authServices.getUserRoles();    
    // Set defaults
    this.items = [];
    this._employerProcessService.setSelectedState(this.selectedState);
    this._employerProcessService
      .refreshMyProcessWithCurrentStage(ITEMSPERPAGE)
      .toPromise()
      .then(() => this.loaded = true);

  }

  openProcess(process: DeferedProcess) {     
    this.currentPage =Math.trunc((this.items.indexOf(process)/ITEMSPERPAGE)+1);
    this.activeRow = process.id;
    if (process.processTypeId == ProcessType.ALTA_DOCUMENTACION_IDENTIFICACION_AUTOMATICA || process.processTypeId === ProcessType.ALTA_RECIBOS_FIRMADOS_HUSIGNERPRO || process.processTypeId === ProcessType.FIRMA_DOCUMENTOS_HUSIGNERPRO) {
      this.router.navigate(['detalleConIdentificacion', process.id], { relativeTo: this.route });
    } else {
      this.router.navigate(['detalle', process.id], { relativeTo: this.route });
    }
    this.processSelected.emit(process.stateClass());
  }

  openStateHistory(process: DeferedProcess) {    
    const dialogData = new ProcessHistoryStateDialogData();
    dialogData.process = process;

    const dialogRef = this.dialog.open(ProcessStateHistoryDialogComponent, {
      // height: '800px',
      // width: '1024px',
      
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
    });

  }

  changeExpander(state: GroupState, addPage = 0) {    
    
    if (state !== this.selectedState) {
      this._employerProcessService.setCurrentPage(1);
      this.items = [];
    }
  
    if (state === this.selectedState && addPage == 0) {
      return;
    }

    this.loadingDeferedProcess = true;
    this.selectedState = state;
    this._employerProcessService.setSelectedState(this.selectedState);
    this._employerProcessService
      .refreshMyProcessWithCurrentStage(ITEMSPERPAGE, true)
      .toPromise()
      .then(() => {
        this.loadingDeferedProcess = false;

      });
     
    
  }

  translateStateName(state: string) {
    return this.translateService.translateStateName(state);
  }

  getMoreResults(state: GroupState) {    
    this._employerProcessService.getMoreResults(ITEMSPERPAGE)
    .toPromise();
  }

  subscribeEventDelete()
{     
  if (this._employerProcessService.subsVar ==undefined) {    
    this._employerProcessService.subsVar = this._employerProcessService.    
    invokeInboxDeleteProcess.subscribe((name:string) => {    
      this.RenderInboxAfterDelete();    
    });    
  } 
}

  RenderInboxAfterDelete(){      
    this._employerProcessService.setCurrentPage(this.currentPage);
    this.loaded = false;
    this.loadingDeferedProcess = true;
    this._employerProcessService.refreshMyProcessWithCurrentStage(ITEMSPERPAGE,true)
    .toPromise()
    .then((data) => {
      this.items=[];      
      this.items=  this.items.concat(data),
      this.loaded = true,
      this.loadingDeferedProcess=false
      window.scroll(0,0);
    });
  }   


}
