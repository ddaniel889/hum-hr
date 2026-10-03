import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MessageService } from '../../shared/errorHandler/message.service';
import { OrganizationalUnit } from "../../shared/models";
import { MatDialog } from '@angular/material/dialog';
import { OrganizationalUnitService } from '../../shared/services/organizational-unit.service';
import { AuthService } from '../../shared/auth/auth.service';
import { LeaveService } from '../../shared/services/leave.service';
import { LeaveRequest } from '../../shared/models/leave-request.model';
import { LeaveRequestDetail } from '../../shared/models/leave-request-detail.model';
import { AdditionalDays } from '../../shared/models/Employee/additional-type.model';
import { GenericBottomSheetComponent } from '../../shared/generic-bottom-sheet/generic-bottom-sheet.component';
import { MessageType } from '../../shared/models/message-types.model';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ConfigLeaveOu } from '../../shared/models/Employee/config-leave-ou.model';
import { LeaveApprovers } from '../../shared/models/approvers.model';
import { LeaveState } from '../../shared/models/Employee/leave-state.model';

@Component({
  selector: 'app-leave-request-detail',
  templateUrl: './leave-request-detail.component.html',
  styleUrls: []
})

export class LeaveRequestDetailComponent implements OnInit {
  @Output() detailClose = new EventEmitter<boolean>();
  @Output() detailloading = new EventEmitter<boolean>();
  @Output() refreshGrid = new EventEmitter<boolean>();
  @Input() selectedLeaveRequest: LeaveRequest;
  @Input() hasConfigLeave: boolean;
  loading = true;
  leaveRequest = new LeaveRequestDetail();
  organizationalUnits: OrganizationalUnit[];
  maskFiscalId: string;
  maskFiscalIdInput: string;
  configLeaveOu = new ConfigLeaveOu();
  canApprove: boolean;

  constructor(
    private msjService: MessageService,
    public dialog: MatDialog,
    private authService: AuthService,
    private organizationalUnitService: OrganizationalUnitService,
    private leaveService: LeaveService,
    private _bottomSheet: MatBottomSheet) {

  }

  ngOnInit() {
    this.organizationalUnitService.getTreeInMemory().then(ous => {
      this.loading = true;
      this.organizationalUnits = ous;
    },
      err => this.msjService.showError(err)
    );
    if (this.selectedLeaveRequest != null || this.selectedLeaveRequest != undefined) {
      this.loading = true;
      this.getLeaveRequestDetail(this.selectedLeaveRequest)
    }
  }


  getLeaveRequestDetail(selectedLeaveRequest: LeaveRequest) {
    this.loading = true;
    this.leaveService.getLeaveRequest(selectedLeaveRequest.id).toPromise().then(data => {
      this.leaveRequest = data;
      if (this.leaveRequest?.state?.key !== '1') {
        this.leaveRequest.availableDays = this.availableDays(this.leaveRequest);
        // this.leaveRequest.daysAferApprovation = this.availableDaysAfterApproval(this.leaveRequest)
      }

      this.leaveService.getConfigLeaveOu(selectedLeaveRequest.organizationalUnitId).toPromise().then(
        data => {
          if (data && data.length > 0) {
            this.configLeaveOu = data.find(x => x.id === this.leaveRequest.configLeaveEmployee.configLeaveOu.id);
          }
          this.canApprove = this.canApproveRequest();
        },
        err => {
          this.msjService.showError(err);
          this.loading = false;
        }
      ).finally(() => {
        this.loading = false;
        this.detailloading.emit(false);
      });
    },
      err => {
        this.msjService.showError(err);
        this.loading = false;
      }
    );
  }

  close() {
    this.detailClose.emit(true);
  }

  requestedDays(leaveRequest: LeaveRequestDetail): number {
    if (leaveRequest == undefined || leaveRequest == null) return 0
    const startDate = new Date(leaveRequest.startDate);
    const endDate = new Date(leaveRequest.endDate);
    const differenceInTime = endDate.getTime() - startDate.getTime();
    const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));
    return differenceInDays;
  }

  availableDays(leaveRequest: LeaveRequestDetail): number {
    return leaveRequest?.availableDays;
  }

  getDaysAdditional(additionalDays: AdditionalDays[]): number {
    let totalDays = 0;
    for (const day of additionalDays) {
      totalDays += day.days;
    }
    return totalDays;
  }

  availableDaysAfterApproval(leaveRequest: LeaveRequestDetail): number {
    if (leaveRequest.startDate != null && leaveRequest.endDate != null) {
      return this.availableDays(leaveRequest) - this.requestedDays(leaveRequest)
    }
    else {
      return this.availableDays(leaveRequest) - leaveRequest.daysConsumed;
    }
  }

  getOriginDate(leaveRequest: LeaveRequestDetail) {
    if (leaveRequest != null || leaveRequest != undefined) {
      if (leaveRequest.startDate != null || leaveRequest.startDate != undefined) {
        const renewalMonthKey = leaveRequest.configLeaveOu.renewalMonthKey
        const startDate = new Date(leaveRequest.startDate);
        const startDateMonth = startDate.getMonth() + 1;
        const startDateYear = startDate.getFullYear();
        if (renewalMonthKey <= startDateMonth) {
          return startDateYear.toString() + ' - ' + (startDateYear + 1).toString();
        }
        else {
          return (startDateYear - 1).toString() + ' - ' + (startDateYear).toString();
        }
      }
      else {
        const renewalMonthKey = leaveRequest.configLeaveOu.renewalMonthKey
        const requestDate = new Date(leaveRequest.requestDate);
        const requestDateMonth = requestDate.getMonth() + 1;
        const requestDateYear = requestDate.getFullYear();
        if (renewalMonthKey <= requestDateMonth) {
          return requestDateYear.toString() + ' - ' + (requestDateYear + 1).toString();
        }
        else {
          return (requestDateYear - 1).toString() + ' - ' + (requestDateYear).toString();
        }
      }
    }

    return
  }

  getLeaveTypeIcon(leaveRequest: LeaveRequestDetail): string {
    if (leaveRequest.startDate == null) {
      return 'fa-money-check'
    }
    return 'fa-umbrella-beach'
  }

  getLeaveTypeName(leaveRequest: LeaveRequestDetail): string {
    if (leaveRequest.startDate == null) {
      return 'Vacaciones vencidas'
    }
    return 'Vacaciones'
  }

  getAccionName(stateId: string): string {
    switch (stateId) {
      case "2":
        return "aprobó";
      case "3":
        return "rechazó";
    }
  }

  getName(stateId: string): string {
    switch (stateId) {
      case "2":
        return "aprobada";
      case "3":
        return "rechazada";
    }
  }

  //formateo las fechas
  aDosDigitos(num: number) {
    return num.toString().padStart(2, '0');
  }

  formatDate(date: Date) {
    return (
      [
        this.aDosDigitos(date.getDate()),
        this.aDosDigitos(date.getMonth() + 1),
        date.getFullYear(),
      ].join('/')
      //no necesito la hora :D
      // +
      // ' ('
      // +
      // [
      //   this.aDosDigitos(date.getHours()),
      //   this.aDosDigitos(date.getMinutes()),
      // ].join(':') +
      // ')'
    );
  }

  approveReject(approve: boolean, leave: LeaveRequest) {
    let parameters: any = {};
    if (approve) {
      parameters.bodyText = 'Aprobar solicitud';
      parameters.infoText = this.getApproveInfoText(leave);
      parameters.buttonText = 'Aprobar';
    } else {
      parameters.bodyText = 'Rechazar solicitud';
      parameters.infoText = this.getRejectInfoText(leave);
      parameters.inputLabel = 'Motivo de rechazo';
      parameters.placeHolder = 'Ingresa el motivo de rechazo';
      parameters.buttonText = 'Rechazar';
    }
    parameters.type = MessageType.ApproveReject;
    parameters.approve = approve;
      const t = this._bottomSheet.open(GenericBottomSheetComponent, { data: parameters, disableClose: true });
    t.instance.close.subscribe((response: any) => {
      if (response.response) {
        this.loading = true;
        leave.note = response.text;
        this.leaveService.approveOrRejectLeaveRequest(leave, approve).subscribe(
          data => {
            this.loading = false;
            this.refreshGrid.emit(true);
          },
          err => {
            this.msjService.showError(err);
            this.loading = false;
          }
        );
      }
    });
  }

  getCurrentDate(): Date {
    return new Date();
  }

  private getApproveInfoText(leave: LeaveRequest) {
    const usuario = leave.userName;
    const fechaSolicitud = leave.requestDate == null ? '' : this.formatDate(leave.requestDate);
    const fechaDesde = leave.startDate == null ? '' : this.formatDate(leave.startDate);
    const fechaHasta = leave.endDate == null ? '' : this.formatDate(leave.endDate);
    if (fechaDesde != '') {
      return 'Estás por aprobar las Vacaciones de ' + usuario + ' solicitadas desde el ' + fechaDesde + ' hasta el ' + fechaHasta + '. Revisa los datos antes de confirmar la operación.';
    }
    if (fechaDesde == '') {
      return 'Estás por aprobar las Vacaciones vencidas de ' + usuario + ' solicitadas el ' + fechaSolicitud + '. Revisa los datos antes de confirmar la operación.';
    }
  }

  private getRejectInfoText(leave: LeaveRequest) {
    const usuario = leave.userName;
    const fechaSolicitud = leave.requestDate == null ? '' : this.formatDate(leave.requestDate);
    const fechaDesde = leave.startDate == null ? '' : this.formatDate(leave.startDate);
    const fechaHasta = leave.endDate == null ? '' : this.formatDate(leave.endDate);
    if (fechaDesde != '') {
      return 'Estás por rechazar las Vacaciones de ' + usuario + ' solicitadas desde el ' + fechaDesde + ' hasta el ' + fechaHasta + '. A continuación deberás indicar el motivo del rechazo.';
    }
    if (fechaDesde == '') {
      return 'Estás por rechazar las Vacaciones vencidas de ' + usuario + ' solicitadas  el ' + fechaSolicitud + '. A continuación deberás indicar el motivo del rechazo.';
    }
  }

  getYear(period: string): string {
    const year = this.extractYear(period)
    return year ? `(Año: ${year})` : '';
  }

  extractYear(input: string): string {
    try {
      const parts = input.split(':');
      if (parts.length < 2) {
        return '';
      }
      const yearPart = parts[1].trim();
      const year = yearPart.substring(0,4);
      return year;
    } catch (error) {
      return '';
    }
  }

  canApproveRequest(): boolean {
    if(this.configLeaveOu.leaveTypeOu.workflowApprove?.id === 3 && this.selectedLeaveRequest.actionApprovers.length > 0){
      return false;
    }else{
      return true;
    }
  }

  isLeaveApprovedByValidator(leave: LeaveRequest): boolean {
    const workflowApproveTypeId = this.configLeaveOu.leaveTypeOu.workflowApprove?.id;
    switch(workflowApproveTypeId) {
      case 3:
        return leave.actionApprovers.length == 0;
      case 4:
        return leave.actionApprovers.some(ap=>ap.action === 2) || leave.actionApprovers.length == 0;
      default:
        return false;
    }
  }

  getOtherApprovers(
    workFlowApproveId: number,
    actionApprovers: LeaveApprovers[],
    state: LeaveState
  ): boolean {
    let resultActionApprovers: LeaveApprovers[] = [];
    switch (workFlowApproveId) {
      case 1: // "Aprobación opcional de JEFE y requerida de RRHH"
        return actionApprovers.length > 0;
      case 2: // "Aprobación basada en RRHH"
        return false;
      case 3: // "Aprobación basada en JEFE"
      case 4: // "Aprobación requerida de JEFE y RRHH"
        resultActionApprovers = actionApprovers.filter(x => x.userId != state.userId);
        return resultActionApprovers.length > 0;
      default:
        return false; // Manejo de casos no especificados
    }
  }

  getLabelOtherApprovers(
    workFlowApproveId: number,
    action: number
  ): string {
    switch (workFlowApproveId) {
      case 1: //"Aprobación opcional de JEFE y requerida de RRHH"
      case 3: //"Aprobación basada en JEFE"
      case 4: //"Aprobación requerida de JEFE y RRHH"
        if(action == 1){
          return 'Solicitud pendiente de validación por';
        } else if(action == 2){
          return 'Solicitud validada por';
        } else if(action == 3){
          return 'Solicitud rechazada por';
        }
        break;
    }
    return '';
  }

  getDateOtherApprovers(
    key: number,
    action: number
  ): boolean {
    return key != 2 && action == 2;
  }

  showRejectBtn(): boolean{
    if((this.selectedLeaveRequest.startDate > this.getCurrentDate() || this.selectedLeaveRequest.stateId == '1') && this.isLeaveApprovedByValidator(this.selectedLeaveRequest))
      return true;
    else if((this.selectedLeaveRequest.startDate > this.getCurrentDate() || this.selectedLeaveRequest.stateId == '1') && this.configLeaveOu.leaveTypeOu.workflowApprove?.id !== 4 && this.configLeaveOu.leaveTypeOu.workflowApprove?.id !== 3)
      return true;
    return false;
  }

  showApproveBtn(): boolean {
    if(this.selectedLeaveRequest.stateId == '1' && this.isLeaveApprovedByValidator(this.selectedLeaveRequest))
      return true;
    else if(this.selectedLeaveRequest.stateId == '1' && this.configLeaveOu.leaveTypeOu.workflowApprove?.id !== 4 && this.configLeaveOu.leaveTypeOu.workflowApprove?.id !== 3)
      return true;
    return false;
  }
}
