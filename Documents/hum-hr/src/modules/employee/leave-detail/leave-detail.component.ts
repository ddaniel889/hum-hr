import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from '../../shared/errorHandler/message.service';
import { EmployeeLeaveService } from '../../shared/services/employee-leave-requests.service';
import { LeaveRequestHeaders } from '../../shared/models/Employee/leave-request-header.model';
import { LeaveRequest } from '../../shared/models/leave-request.model';
import { LeaveService } from '../../shared/services/leave.service';
import { LeaveRequestDetail } from '../../shared/models/leave-request-detail.model';
import { MessageType } from "../../shared/models/message-types.model";
import { GenericBottomSheetComponent } from "../../shared/generic-bottom-sheet/generic-bottom-sheet.component";
import { MatBottomSheet } from "@angular/material/bottom-sheet";
import { ContainerTypeService } from '../../shared/services/container-type.service.';
import { FileDocumentService } from '../../shared/services/file-document.service';
import { ContainerType, Employee } from '../../shared/models';
import { EmployeeFileDocumentDialogData } from '../../shared/models/employee-file-document-dialog-data.model';
import { FileDocumentViewModalComponent } from '../../shared/file-document-view-modal/file-document-view-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { FileDocumentCollaborationData } from '../../shared/models/file-document-sign-data.model';
import { AuthService } from '../../shared/auth/auth.service';

@Component({
  selector: 'app-leave-detail',
  templateUrl: './leave-detail.component.html',
  styleUrls: []
})
export class LeaveDetailComponent implements OnInit {
  @Output() reloadEvent = new EventEmitter();
  isLoading = false;
  itemsCount: number;
  contentType: string;
  leaveId: string;
  leaveDetail: LeaveRequestDetail;
  leave: LeaveRequest = new LeaveRequest;
  leaveRequests: LeaveRequestHeaders[];
  stateName: string;
  filters: any;
  pageIndex: number;
  daysRequests: number;
  requestDate: string;
  isApprover: boolean = false;
  documentId: number;
  isDocument: boolean = false;
  employee:Employee;
  showResults = false;
  containerType: ContainerType;
  containerTypeId: number;
  isHollyday = true;
  dateFrom: Date;
  dateTo: Date;
  validDate = false;
  rejectionStatement = 'Motivo del rechazo cargado por RRHH'
  loading = false;
  currentOu:number = 0;
  leaveRequestDraft = false;
  textDraft:string = "";
  isValidated:boolean;
  constructor(
    private route: ActivatedRoute,
    private messageService: MessageService,
    private employeeLeaveService: EmployeeLeaveService,
    private leaveService: LeaveService,
    private msjService: MessageService,
    private _bottomSheet: MatBottomSheet,
    private containerTypeService: ContainerTypeService,
    private fileDocumentService: FileDocumentService,
    private readonly authService: AuthService,
    private readonly router: Router,
    private dialog: MatDialog,
  ) {
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.isLoading = true;
      let leaveId = params["id"]
      this.isApprover =  params["isApprover"] == "true";
      this.currentOu = parseInt(localStorage.getItem("organizationId"));
      this.getLeaveDetail(leaveId);
    });
  }

  headerDraftText(): string {
    if (this.leaveRequestDraft) {
      const formattedDateFrom = new Date(this.dateFrom).toLocaleDateString('es-ES'); // Formatea la fecha
      const formattedDateTo = new Date(this.dateTo).toLocaleDateString('es-ES'); // Formatea la fecha

      const dayText = this.daysRequests > 1 ? 'días propuestos' : 'día propuesto';

      return `${this.daysRequests} ${dayText} por ${this.leaveDetail.createdBy.firstName} ${this.leaveDetail.createdBy.lastName} desde el ${formattedDateFrom} hasta el ${formattedDateTo}`;
    } else {
      return '';
    }
  }

  getDaysRequests(): number {
    const startDate = new Date(this.leaveDetail.startDate);
    const endDate = new Date(this.leaveDetail.endDate);
    const differenceInTime = endDate.getTime() - startDate.getTime();
    const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));
    return differenceInDays;
  }

  getLeaveDetail(id: string) {
    try {
      this.leaveService.getLeaveRequest(id).toPromise()
        .then(data => {
          this.isHollyday = (data.startDate != null && data.endDate != null);
          this.rejectionStatement = data.state.note;
          this.leaveDetail = data;
          this.validateLeaveVisibility(this.leaveDetail);
          this.daysRequests = data.daysConsumed;
          this.requestDate = this.leaveDetail.requestDate.toString();
          this.stateName = this.leaveDetail.state.name;
          this.leaveRequestDraft = (this.leaveDetail.state.name == "BORRADOR")
          this.isLoading = false;
          this.dateFrom = this.leaveDetail.startDate;
          this.dateTo = this.leaveDetail.endDate;
          this.documentId = this.leaveDetail.documentId;
          this.isDocument = this.leaveDetail.documentId != undefined;
          const dateNow = new Date();
          const dateStart = new Date(this.leaveDetail.startDate);
          const dateNowMs = dateNow.getTime();
          const dateStartMs = dateStart.getTime();
          this.validDate = dateNowMs < dateStartMs ? true : false;
          this.isLeaveValidated(this.leaveDetail);
        },
          err => {
            this.messageService.showError('Error al obtener el detalle de la solicitud:', err);
            this.isLoading = false;
          });
    } catch (error) {
      this.messageService.showError('Error al obtener el detalle de la solicitud:', error);
      this.isLoading = false;
    }
  }

  calculateDateDifferenceInDays(startDate: Date, endDate: Date): number {
    const oneDay = 24 * 60 * 60 * 1000;
    const firstDate = new Date(startDate);
    const secondDate = new Date(endDate);
    const diffDays = Math.round(Math.abs((firstDate.getTime() - secondDate.getTime()) / oneDay));
    return diffDays;
  }

  getLeaveClassName() {
    return this.getAttributeDetail("getLeaveClassName");
  }
  getLeaveIcon() {
    return this.getAttributeDetail("getLeaveIcon");
  }
  getLeaveText() {
    return this.getAttributeDetail("getLeaveText");
  }
  getLeaveSubtext() {
    return this.getAttributeDetail("getLeaveSubtext");
  }
  getInfoExtra(){
    return this.getAttributeDetail("getInfoExtra");
  }

  cancelLeave() {
    let parameters: any = {};
    parameters.bodyText = 'Cancelar solicitud';
    parameters.infoText = this.leaveDetail?.note ?? "Ingrese motivo de cancelación";
    parameters.inputLabel = 'Motivo de cancelación';
    parameters.placeHolder = 'Ingresa el motivo de cancelación';
    parameters.buttonText = 'Aceptar';
    parameters.type = MessageType.CancelLeave;

    const t = this._bottomSheet.open(GenericBottomSheetComponent, { data: parameters, disableClose: true });
    t.instance.close.subscribe((response: any) => {
      if (response.response) {
        this.loading = true;
        this.leaveDetail.note = response.text;
        this.leaveService.cancelLeaveRequest(this.leaveDetail).subscribe(
          data => {
            this.getLeaveDetail(this.leaveDetail.id);
            this.employeeLeaveService.triggerReload();
            this.msjService.showInfo('Cancelado con exito');
          },
          err => {
            this.msjService.showError(err);
            this.loading = false;
          }
        );
      }
    });
  }
  getAttributeDetail(attr: string) {
    const states = {
      "APROBADO": {
        className: 'ok',
        icon: 'fa-thumbs-up',
        text: 'Solicitud Aprobada',
        subtext: '¡Que disfrutes tu muy merecido descanso!.'
      },
      "RECHAZADO": {
        className: 'not-ok',
        icon: 'fa-thumbs-down',
        text: 'Solicitud Rechazada',
        subtext: this.rejectionStatement
      },
      "PENDIENTE": {
        className: 'pending',
        icon: 'fa-hourglass-half',
        text: 'Solicitud Pendiente',
        subtext: 'Actualiza la página o regresa mas tarde para ver cambios.'
      },
      "CANCELADO": {
        className: 'cancelled',
        icon: 'fa-times-circle',
        text: 'Solicitud Cancelada',
        subtext: 'La solicitud ha sido cancelada.'
      },
      "BORRADOR": {
        className: 'draft',
        icon: 'fa-pencil-alt',
        text: 'Solicitud en Borrador',
        subtext: 'Tu empresa te propone esta licencia por vacaciones, ¿Estás de acuerdo?.'
      }
    };

    const state = states[this.stateName];

    if (state) {
      switch (attr) {
        case "getLeaveClassName":
          return state.className;
        case "getLeaveIcon":
          return state.icon;
        case "getLeaveText":
          return state.text;
        case "getLeaveSubtext":
          return state.subtext;
        case "getTextDraft":
          return this.stateName === "BORRADOR" ? "Seleccioná una opción" : "";
      }
    }

    return "";
}

  getIsApprover()
  {
    return this.isApprover;
  }
  private getApproveInfoText(leave: LeaveRequestDetail) {
    const usuario = leave.userName;
    const fechaSolicitud = leave.requestDate == null ? '' : this.formatDate(new Date(leave.requestDate));
    const fechaDesde = leave.startDate == null ? '' : this.formatDate(new Date(leave.startDate));
    const fechaHasta = leave.endDate == null ? '' : this.formatDate(new Date(leave.endDate));
    if(this.leaveRequestDraft)
    {
      return 'Estás por aceptar las Vacaciones propuestas por tu Empresa desde el ' + fechaDesde + ' hasta el ' + fechaHasta + '. Revisa los datos antes de confirmar la operación.';
    }
    else{
      if (fechaDesde != '') {
        return 'Estás por aprobar las Vacaciones de ' + usuario + ' solicitadas desde el ' + fechaDesde + ' hasta el ' + fechaHasta + '. Revisa los datos antes de confirmar la operación.';
      }
      if (fechaDesde == '') {
        return 'Estás por aprobar las Vacaciones vencidas de ' + usuario + ' solicitadas el ' + fechaSolicitud + '. Revisa los datos antes de confirmar la operación.';
      }
    }
  }

  private getRejectInfoText(leave: LeaveRequestDetail) {
    const usuario = leave.userName;
    const fechaSolicitud = leave.requestDate == null ? '' : this.formatDate(new Date(leave.requestDate));
    const fechaDesde = leave.startDate == null ? '' : this.formatDate(new Date(leave.startDate));
    const fechaHasta = leave.endDate == null ? '' : this.formatDate(new Date(leave.endDate));

    if(this.leaveRequestDraft){
      return 'Estás por desestimar las Vacaciones propuestas por tu empresa. A continuación deberás indicar el motivo del rechazo.';
    }
    else
    {
      if (fechaDesde != '') {
        return 'Estás por rechazar las Vacaciones de ' + usuario + ' solicitadas desde el ' + fechaDesde + ' hasta el ' + fechaHasta + '. A continuación deberás indicar el motivo del rechazo.';
      }
      if (fechaDesde == '') {
        return 'Estás por rechazar las Vacaciones vencidas de ' + usuario + ' solicitadas  el ' + fechaSolicitud + '. A continuación deberás indicar el motivo del rechazo.';
      }
    }
  }
  formatDate(date: Date) {
    return (
      [
        this.aDosDigitos(date.getDate()),
        this.aDosDigitos(date.getMonth() + 1),
        date.getFullYear(),
      ].join('/')
    );
  }
  //formateo las fechas
  aDosDigitos(num: number) {
    return num.toString().padStart(2, '0');
  }

  approveReject(value: any) {
    let approve = value;
    let parameters: any = {};
    if (approve) {
      if(this.leaveDetail.state.name == "BORRADOR")
      {
        parameters.bodyText = 'Aprobar propuesta';
        parameters.infoText = this.getApproveInfoText(this.leaveDetail);
        parameters.buttonText = 'Aprobar';

      }else{
        parameters.bodyText = 'Aprobar solicitud';
        parameters.infoText = this.getApproveInfoText(this.leaveDetail);
        parameters.buttonText = 'Aprobar';
      }
    } else {
      if(this.leaveDetail.state.name == "BORRADOR")
        {
          parameters.bodyText = 'Rechazar propuesta';
          parameters.infoText = this.getRejectInfoText(this.leaveDetail);
          parameters.inputLabel = 'Motivo de rechazo';
          parameters.placeHolder = 'Ingresa el motivo de rechazo';
          parameters.buttonText = 'Rechazar';

        }else{
          parameters.bodyText = 'Rechazar solicitud';
          parameters.infoText = this.getRejectInfoText(this.leaveDetail);
          parameters.inputLabel = 'Motivo de rechazo';
          parameters.placeHolder = 'Ingresa el motivo de rechazo';
          parameters.buttonText = 'Rechazar';
        }
    }
    parameters.type = MessageType.ApproveReject;
    parameters.approve = approve;
    if(this.leaveDetail.state.name == "BORRADOR")
    {
      if(approve)
      {
        const t = this._bottomSheet.open(GenericBottomSheetComponent, { data: parameters, disableClose: true });
        t.instance.close.subscribe((response: any) => {
          if (response.response) {
            this.isLoading = true;
            this.leaveDetail.note = response.text;
            this.leaveService.ApprovProposalLeave(this.leaveDetail).subscribe(
              data => {
                location.reload();
                this.isLoading = false;
              },
              err => {
                this.msjService.showError(err);
                this.isLoading= false;
              }
            );
          }
        });
      } else {
        const t = this._bottomSheet.open(GenericBottomSheetComponent, { data: parameters, disableClose: true });
        t.instance.close.subscribe((response: any) => {
          if (response.response) {
            this.loading = true;
            this.leaveDetail.note = response.text;
            this.leaveService.cancelLeaveRequest(this.leaveDetail).subscribe(
              data => {
                this.msjService.showInfo('Rechazada la propuesta con exito');
                location.reload();
                this.loading = false;
              },
              err => {
                this.msjService.showError(err);
                this.loading = false;
              }
            );
          }
        });
      }
    }
    else
    {
      const t = this._bottomSheet.open(GenericBottomSheetComponent, { data: parameters, disableClose: true });
      t.instance.close.subscribe((response: any) => {
        if (response.response) {
          this.isLoading = true;
          this.leaveDetail.note = response.text;
          if(this.leaveDetail.configLeaveOu.leaveTypeOu.workflowApprove?.id === 3)
          {
            this.leaveService.approveAsLeader(this.leaveDetail, approve).subscribe(
              data => {
                this.msjService.showInfo(approve ? "Solicitud aprobada con éxito" : "Solicitud rechazada con éxito");
                this.reloadLeaves();
              },
              err => {
                this.msjService.showError(err);
                this.isLoading= false;
              }
            )
          }
          else
          {
            this.leaveService.ValidateOrRejectLeaveRequest(this.leaveDetail, approve).subscribe(
              data => {
                this.reloadLeaves();
              },
              err => {
                this.msjService.showError(err);
                this.isLoading= false;
              }
            );
          }
        }
      });
    }
  }

  reloadLeaves() {
    this.reloadEvent.emit();
  }

  getCurrentDate(): Date {
    return new Date();
  }

  viewDocument() {
    let leave: LeaveRequestDetail;
    leave = this.leaveDetail
    this.containerTypeService
      .getContainerType(this.currentOu.toString(), false)
      .toPromise()
      .then(containerType => {
        this.containerType = containerType;
        this.containerTypeId = this.containerType.id;
        this.openMyDocument(leave.documentId,this.currentOu);
        })
        .catch(error => {
          this.messageService.showError('Error al obtener el tipo de contenedor');
      });
  }

  private openMyDocument(documentId:number,organizationalUnitId:number){

    const results = [];
    results.push(this.fileDocumentService.getCollaboration(documentId,organizationalUnitId).toPromise());

    Promise.all(results).then(promises =>{
      this.fileDocumentService.getMyDocumentDetail(documentId).toPromise()
      .then(re => {
              const dialogData = new EmployeeFileDocumentDialogData();
              dialogData.doc = re;

              promises[0].forEach((colaboracion) => {
                if (colaboracion.userId != null) {
                   dialogData.doc.employeeCollaborationData = this.LoadColaboracion(
                    colaboracion,
                    promises[1],
                    true,
                    dialogData.doc.employeeCollaborationData);
                }
             });

              dialogData.employerSign = false;
              dialogData.signEnabled = false;
              dialogData.showDocumentStateBottom = true;
              dialogData.showDocumentState = true;
              dialogData.showDocumentMetadata = true;
              dialogData.isNotifyDocumentVac = false;
              dialogData.isModoPDF = false;
              dialogData.isEmployee = JSON.parse(localStorage.getItem("isEmployee")) as boolean ?? false;
              const dialogRef = this.dialog.open(FileDocumentViewModalComponent, {
                data: dialogData
              });
              dialogRef.afterClosed().subscribe(result => {
              });

      })
      .catch(error => {
        this.messageService.showError('Error al obtener los detalles del documento');
      });
    });
  }

  private LoadColaboracion(colaboracion: any, documentFileSignature: any, employeeSignature: boolean, previousData?: FileDocumentCollaborationData): FileDocumentCollaborationData {
    const data = previousData || new FileDocumentCollaborationData();
    this.updateEnabledState(colaboracion, data);
    this.updateViewDate(colaboracion, data);
    this.handleAction(colaboracion, documentFileSignature, employeeSignature, data);
    return data;
  }

  private updateEnabledState(colaboracion: any, data: FileDocumentCollaborationData): void {
    data.enabled = colaboracion.action?.enabled ?? false;
  }

  private updateViewDate(colaboracion: any, data: FileDocumentCollaborationData): void {
    if (colaboracion.fechaPrimeraColaboracion != null) {
      const date = new Date(colaboracion.fechaPrimeraColaboracion);
      data.viewDate = data.viewDate && data.viewDate > date ? data.viewDate : date;
    }
  }

  private handleAction(colaboracion: any, documentFileSignature: any, employeeSignature: boolean, data: FileDocumentCollaborationData): void {
    if (colaboracion.action == null) {
      data.requiredSignature = false;
      return;
    }

    if (colaboracion.action.action !== "UPLOAD") {
      this.handleNonUploadAction(colaboracion, documentFileSignature, employeeSignature, data);
    } else {
      this.handleUploadAction(colaboracion, data);
    }
  }

  private handleNonUploadAction(colaboracion: any, documentFileSignature: any, employeeSignature: boolean, data: FileDocumentCollaborationData): void {
    if (data.enabled) {
      data.requiredSignature = true;
    }

    if (colaboracion.action?.fechaPrimerUso != null) {
      data.signatureDate = new Date(colaboracion.action.fechaPrimerUso);
      data.signatureState = "firmado";
      if (employeeSignature) {
        this.updateSignatureState(documentFileSignature, colaboracion.userid, data);
      }
    } else {
      if (colaboracion.action?.requiredSignature) {
        data.error = colaboracion.action.requiredSignature;
      }
      data.signatureState = "no-firmado";
    }
  }

  private handleUploadAction(colaboracion: any, data: FileDocumentCollaborationData): void {
    data.uploaded = colaboracion.action?.fechaPrimerUso != null;
    if (colaboracion.action.fechaPrimerUso != null) {
      data.uploadDate = new Date(colaboracion.action?.fechaPrimerUso);
    }
  }

  private updateSignatureState(documentFileSignature: any, userId: string, data: FileDocumentCollaborationData): void {
    if (documentFileSignature != null) {
      for (const dfs of documentFileSignature) {
        if (this.isUserSignature(dfs, userId)) {
          this.updateStateForUserSignature(dfs, data);
          if (data.signatureState === "firmado-no-conforme") {
            break;
          }
        } else if (this.isExternalSignature(dfs)) {
          this.updateStateForExternalSignature(dfs, data);
          if (data.signatureState === "firmado-no-conforme") {
            break;
          }
        }
      }
    }
  }

  private isUserSignature(dfs: any, userId: string): boolean {
    return dfs.userid === userId;
  }

  private isExternalSignature(dfs: any): boolean {
    return dfs.isExternal && dfs.signatureResult;
  }

  private updateStateForUserSignature(dfs: any, data: FileDocumentCollaborationData): void {
    if (dfs.signatureResult === "C" || dfs.signatureResult === "c") {
      data.signatureState = "firmado-conforme";
    } else {
      data.signatureState = "firmado-no-conforme";
    }
  }

  private updateStateForExternalSignature(dfs: any, data: FileDocumentCollaborationData): void {
    if (dfs.signatureResult === "C" || dfs.signatureResult === "c") {
      data.signatureState = "firmado-conforme";
    } else if (dfs.signatureResult === "NC" || dfs.signatureResult === "nc") {
      data.signatureState = "firmado-no-conforme";
    }
  }
  private isLeaveValidated(leave: LeaveRequestDetail)
  {
    this.isValidated = false;
     let valid = leave.actionApprovers.find(a => a.action == 3 || a.action == 2);
     if(valid)
     {
        this.isValidated = true;
     }
  }
  isLeaveApprovedByValidator(): boolean {
    let actionApprovers = this.leaveDetail.actionApprovers.filter(ap=>ap.action === 2);
    return actionApprovers.length > 0 && this.leaveDetail.configLeaveOu.leaveTypeOu.workflowApprove?.id === 4 && this.authService.isLeaveApprov();
  }

  validateLeaveVisibility(leaveDetail: LeaveRequestDetail){
    const isMyLeave = leaveDetail.configLeaveEmployee.userId == +this.authService.getUserId();
    if (leaveDetail.state.name == "BORRADOR" && !isMyLeave && !this.isApprover) {
      this.router.navigate(['employee/leaves/welcome']);
    }
    if (leaveDetail.state.name == "PENDIENTE" && (isMyLeave && this.isApprover)) {
      this.router.navigate(['employee/leaves/welcome']);
    }
    if (leaveDetail.state.name == "PENDIENTE" && (!isMyLeave && !this.isApprover)) {
      this.router.navigate(['employee/leaves/welcome']);
    }
    if (leaveDetail.state.name == "APROBADO" && (!isMyLeave && !this.isApprover)) {
      this.router.navigate(['employee/leaves/welcome']);
    }
    if (leaveDetail.state.name == "APROBADO" && (isMyLeave && this.isApprover)) {
      this.router.navigate(['employee/leaves/welcome']);
    }
    if(leaveDetail.state.name == "RECHAZADO" && (!isMyLeave && !this.isApprover)) {
      this.router.navigate(['employee/leaves/welcome']);
    }
  }
}
