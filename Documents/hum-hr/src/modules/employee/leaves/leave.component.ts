import { Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Router, ActivatedRoute } from "@angular/router";
import { EmployeeLeaveService } from "../../shared/services/employee-leave-requests.service";
import { AddLeaveDialogComponent } from "../add-leave-dialog/add-leave-dialog.component";
import { LeaveRequestHeaders } from "../../shared/models/Employee/leave-request-header.model";
import { MessageService } from "../../shared/errorHandler/message.service";
import { LeaveService } from "../../shared/services/leave.service";
import { LeaveTimeLine } from "../../shared/models/times-lines.model";
import { AuthService } from "../../shared/auth/auth.service";
import { LeaveRequestFind } from "../../shared/models/leave-request-find.model";
import { MatTabGroup } from "@angular/material/tabs";
import { UiNotificationsService } from "../../shared/services/ui-notifications.service";
import { LeaveStateFind } from "../../shared/models/Employee/leave-state.model";
import { KeyValuePair } from "../../shared/models/Generics/ikeyValuePair.model";
import { LocalStorageService } from '../../shared/services/local-storage.service';
import { ConfigLeaveOu } from "../../shared/models/Employee/config-leave-ou.model";
import { ConfigLeaveEmployee } from "../../shared/models/Employee/config-leave-employee.model";

@Component({
  selector: "app-leave",
  templateUrl: "./leave.component.html",
  styles: [],
})
export class LeavesComponent implements OnInit {
  @ViewChild("tabGroup", { static: false }) tabGroup: MatTabGroup;
  returnUrl: string;
  processClass: string;
  isLoading = false;
  closeFloatMode = false;
  isPendingVisible = true;
  leaveRequests: LeaveRequestHeaders[] = [];
  leaveRequestsToApprover: LeaveRequestHeaders[] = [];
  selectedLeave: LeaveRequestHeaders;
  timeslines: LeaveTimeLine[];
  disabled = false;
  isApprover = false;
  tabToApprover = false;
  eventRender = false;
  selectedItem: LeaveRequestHeaders;
  selectRequestId:string;
  freeLeave = true;
  isValidated:boolean;
  selectedLeaveStateFind: number = LeaveStateFind.paraAprobar;
  pageIndex: number;
  itemsCount: number;
  useWorkflowApprove: boolean;
  filterByIdNotif: boolean;
  configLeave: ConfigLeaveOu[];
  configLeaveEmployee: ConfigLeaveEmployee[]
  selectedTabIndex;

  statesFilters: KeyValuePair<number, string>[] = [
    {key: 6, value: 'Ver Todos' },{ key: 5, value: 'Para Aprobar' },  { key: 1, value: 'Solicitudes Pendientes' }, { key: 2, value: 'Solicitudes Aprobadas' }, { key: 3, value: 'Solicitudes Rechazadas' }, { key: 4, value: 'Solicitudes Canceladas' }, { key: 0, value: 'Solicitudes Borrador' }];
    constructor(
    private readonly employeeLeaveService: EmployeeLeaveService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly messageService: MessageService,
    public dialog: MatDialog,
    private readonly leaveService: LeaveService,
    private readonly authService: AuthService,
    private readonly localStorage: LocalStorageService,
    private readonly uiNotificationsService: UiNotificationsService

  ) { }

  async ngOnInit() {
    this.route.params.subscribe(param =>{this.selectRequestId = this.selectRequestId != undefined ? undefined : param['id']});
    this.filterByIdNotif = this.selectRequestId != null;
    this.subscribeGotoApprover();
    this.employeeLeaveService.reload$.subscribe(() => {
      this.loadRequestLeave();
      this.findConfigLeaveEmployee();
      this.FindLeaveRequestToApprovers();
      this.loadLeaveType();
      if(this.tabToApprover)
        this.router.navigate(["welcome"], { relativeTo: this.route });
      });
    this.isRequestApprover();
    this.router.navigate(["welcome"], { relativeTo: this.route });
    if (!this.eventRender && this.selectedItem?.id != null) {
      this.loadLeaveToApprover(this.selectedItem.id);
    }
  }

  loadRequestLeave() {
    this.isLoading = true;
    try {
      this.getListLeaveRequests();

    } catch (err) {
      this.messageService.showError('Error al obtener las solicitudes de licencias:', err);

    }
  }
  openDetailRequest(id: string) {
    this.router.navigate(["detalle", id, (this.isApprover && this.tabToApprover)], { relativeTo: this.route });
    this.isLoading = false;
  }

  openAddRequestDialog(): void {
    const dialogRef = this.dialog.open(AddLeaveDialogComponent, {
      disableClose: true,
      data: {configLeaveEmployee: this.configLeaveEmployee}
    });
    dialogRef.afterClosed().subscribe(() => {
      this.loadRequestLeave();
      this.findConfigLeaveEmployee();
    });
  }

  getDateRequets(id: string) {
    let detailLeaveRequest = this.leaveRequests.find(e => e.id == id);
      if (detailLeaveRequest) {
        return detailLeaveRequest.requestDate;
      }
    detailLeaveRequest = this.leaveRequestsToApprover.find(e => e.id == id);
      if (detailLeaveRequest) {
        return detailLeaveRequest.requestDate;
      }
    return "";
  }

  getDaysRequets(id: string) {
    const detailLeaveRequest = this.leaveRequests.find(e => e.id == id);
    if (detailLeaveRequest) {
      const startDate = new Date(detailLeaveRequest.startDate);
      const endDate = new Date(detailLeaveRequest.endDate);
      const differenceInTime = endDate.getTime() - startDate.getTime();
      const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));
      return differenceInDays;
    }
    return "";
  }

  getFormattedDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear());

    return `${day}/${month}/${year}`;
  }

  getTypeRequestName(id: string): string {
    return this.getAttributeDetail(id, "name");
  }
  getName(id: string): string {
    return this.getAttributeDetail(id, "state");
  }
  getTypeRequestIcon(id: string): string {
    return this.getAttributeDetail(id, "icon");
  }

  getTypeRequestDetailIcon(id: string): string {
    return this.getAttributeDetail(id, "detailIcon");
  }

  getClassNameColor(id: string) {
    return this.getAttributeDetail(id, "classNameColor");
  }

  getStatusName(id: string) {
    return this.getAttributeDetail(id, "statusName");
  }

  getTypeLeave(id: string) {
    return this.getAttributeDetail(id, "typeName");
  }

  getAttributeDetail(id: string, attr: string) {
    let detailLeaveRequest = this.leaveRequests.find(e => e.id == id);
    if(detailLeaveRequest === undefined)
      detailLeaveRequest = this.leaveRequestsToApprover.find(e => e.id == id)
    if (detailLeaveRequest) {
      if (attr === "name") {
        return 'Vacaciones';
      }

      if (attr == "state"){
        switch(detailLeaveRequest.stateId){
          case "0":
            return "propuestas";
          case "1":
            return "solicitadas"
        }
      }

      if (attr === "icon") {
        if (detailLeaveRequest.startDate === null || detailLeaveRequest.startDate === undefined && detailLeaveRequest.endDate === null || detailLeaveRequest.endDate === undefined) {
          return 'fa-money-check'
        }
        return "fa-umbrella-beach";
      }

      if (attr === "detailIcon") {
        switch (detailLeaveRequest.stateName) {
          case "PENDIENTE":
            return "fa-hourglass-half";
          case "RECHAZADO":
            return "fa-thumbs-down";
          case "APROBADO":
            return "fa-thumbs-up";
          case "CANCELADO":
            return 'fa-times-circle';
          case "BORRADOR":
            return "fa-pencil-alt";
        }
      }

      if (attr === "classNameColor") {
        let detailLeaveRequest = this.leaveRequests.find(e => e.id == id);
        if(detailLeaveRequest === undefined)
          detailLeaveRequest = this.leaveRequestsToApprover.find(e => e.id == id)
        switch (detailLeaveRequest.stateName) {
          case "PENDIENTE":
            return "pending";
          case "RECHAZADO":
            return "not-ok";
          case "APROBADO":
            return "ok";
          case "CANCELADO":
            return 'cancel';
          case "BORRADOR":
            return 'draft';
        }
      }

      if (attr === "statusName") {
        switch (detailLeaveRequest.stateName) {
          case "PENDIENTE":
            return "Solicitud Pendiente";
          case "RECHAZADO":
            return "Solicitud Rechazada";
          case "APROBADO":
            return "Solicitud Aprobada";
          case "CANCELADO":
            return 'Solicitud Cancelada';
          case "BORRADOR":
            return 'Solicitud Propuesta';
        }
      }

      if (attr === "typeName") {
        if(detailLeaveRequest.stateName == "BORRADOR") {
            return 'propuestos ';
        } else{
            return 'solicitados ';
        }
      }

      return "";
    }

    return "";
  }

  reloadLeaves(componentRef){
    componentRef.reloadEvent?.subscribe(()=>{
      this.refresh();
    });
  }

  refresh() {
    this.pageIndex = 0;
    this.loadRequestLeave();
    this.loadRequestToToApprovers();
  }

  selectLeave(leave: any) {
    this.selectedLeave = leave;
    leave.loading = true;
    if (this.selectLeave) {
      this.openDetailRequest(leave.id);
      leave.loading = false;
    }
  }

  getListLeaveRequests() {
    try {
      this.employeeLeaveService.getLeaveRequests().toPromise()
        .then(data => {
          if (data != undefined){
              this.leaveRequests = data;
          }

          this.isLoading = false;
        },
          error => {
            this.messageService.showError('Error al obtener las solicitudes de licencia:', error);
            this.isLoading = false;
          });
    } catch (error) {
      this.messageService.showError('Error al obtener las solicitudes de licencia:', error);
      this.isLoading = false;
    }
  }

  private findConfigLeaveEmployee() {
    this.employeeLeaveService.getMyConfigLeaveEmployee().toPromise().then(
      configLeave => {
        localStorage.setItem('configLeave', JSON.stringify(configLeave));
        this.configLeaveEmployee = configLeave;
        if (configLeave.length > 0){
          this.disabled = configLeave[0].configEmployeesTimeLines.length == 0;
          if (this.disabled)
            {
              this.messageService.showInfo("No posee asignado vigencias");
            }
        }
      }).catch(err => {
        throw err;
      })
  }

  isRequestApprover() {
    this.leaveService.getApproverByUserId(this.authService.getUserId()).toPromise()
    .then((approver) => {this.isApprover = approver !== null; });
  }

  FindLeaveRequestToApprovers() {
    this.selectedLeave = undefined;
    let param: LeaveRequestFind;
    this.selectedLeaveStateFind = this.filterByIdNotif ? 6 : this.selectedLeaveStateFind;
    param = {
      filterId: this.filterByIdNotif ? this.selectRequestId : null,
      itemPerPage: 15,
      isPaged: true,
      page: this.pageIndex == 0 ? 1 : this.pageIndex,
      stateId: this.filterByIdNotif ? "" : this.selectedLeaveStateFind.toString(),
      organizationalUnitId:Number.parseInt(this.authService.getOrganizationId()),
      approverId: Number.parseInt(this.authService.getUserId())
    };
    this.leaveService.getLeaveRequests(param).toPromise()
    .then(leaves =>{
      if(leaves != undefined) {
          this.leaveRequestsToApprover = leaves.values;
          this.itemsCount = leaves.total;
          this.pageIndex = leaves.page;
          this.filterByIdNotif = false;
          if(this.selectRequestId != null && this.selectRequestId != undefined){
              this.selectedItem = this.leaveRequestsToApprover.find(x => x.id == this.selectRequestId);
              if (this.selectedItem != undefined && this.selectedItem != null) {
                    this.tabToApprover = true;
                    this.isApprover = true;
                    this.selectLeave(this.selectedItem);
                    this.tabGroup.selectedIndex = 1
                  } else {
                    this.router.navigate(["welcome"], { relativeTo: this.route });
                  }
                }
                else
                {
                  if((this.isApprover && this.selectedTabIndex === undefined) || this.selectedTabIndex === 1) this.tabToApprover = true;
                  this.router.navigate(["welcome"], { relativeTo: this.route });
                }
              }
          this.isLoading = false;
      });
  }

  loadLeaveType(){ // usamos localStorage temporalmente hasta que se implemente nuevo flujo de aprobación
    this.configLeave = this.localStorage.get('configOU');
    this.useWorkflowApprove = this.configLeave.some(cl => cl.leaveTypeOu);
  }

  selectedPageChanged(a) {
    this.isLoading = true;
    this.FindLeaveRequestToApprovers();
  }
  isframeApprover(value: any) {
      this.router.navigate(["welcome"], { relativeTo: this.route });
      if(value.index == 0){
        this.tabToApprover = false;
        this.selectedTabIndex = 0;
      } else {
        this.tabToApprover = true;
        this.selectedTabIndex = 1;
        if(this.selectedItem?.id !== undefined) {
          this.openDetailRequest(this.selectedItem.id);
        }
      }
  }

  subscribeGotoApprover() {
    if(this.selectRequestId) {
      this.freeLeave = true;
    }
    this.uiNotificationsService.gotoApproverLeave.subscribe(id =>{
      this.eventRender = true;
      this.selectRequestId = id;
      this.filterByIdNotif = true;
      this.loadLeaveToApprover(this.selectRequestId);
    })
  }

  subscribeGotoDraftApprov() {
    if(this.selectRequestId) {
      this.freeLeave = true;
    }
    this.uiNotificationsService.gotoDraftLeave.subscribe(id =>{
      this.eventRender = true;
      this.selectRequestId = id;
      this.selectedItem = this.leaveRequestsToApprover.find(x => x.id == this.selectRequestId);
      this.tabGroup.selectedIndex = 0;
      this.selectLeave(this.selectedItem);
    })
  }

  loadRequestToToApprovers()
  {
    this.pageIndex = 0;
    this.isLoading = true;
    this.FindLeaveRequestToApprovers();
  }

  loadLeaveToApprover(id:string) {
    if (id != undefined && id != null) {
      if(this.eventRender){
        this.FindLeaveRequestToApprovers();
      }
    }
  }

  ngAfterViewChecked() {
    if(this.tabGroup && this.freeLeave  && this.selectRequestId != null && this.selectRequestId != undefined){
      this.freeLeave = false;
      this.tabGroup.selectedIndex = 1;
      this.FindLeaveRequestToApprovers();
      this.filterByIdNotif = false;
    }
  }

  getTextChapa(stateId)
  {
      switch (stateId) {
        case 1:
          return "Aún no tienes licencias pendientes de tu equipo...";
        case 2:
            return "Aún no tienes licencias aprobadas de tu equipo...";
        case 3:
            return "Aún no tienes licencias rechazadas de tu equipo...";
        case 4:
            return "Aún no tienes licencias canceladas de tu equipo...";
        case 5:
            return "Aún no tienes licencias para aprobar...";
        case 0:
            return "Aún no tienes licencias en borrador de tu equipo...";
        case 6:
          return "Aún no tienes licencias";
      }

  }
}
