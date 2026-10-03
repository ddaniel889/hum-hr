import { Component, OnInit, ViewChild, HostListener } from "@angular/core";
import { MatMenuTrigger } from '@angular/material/menu';
import { MessageService } from "../../shared/errorHandler/message.service";
import { ContainerType, Employee, EmployeeFind, OrganizationalUnit } from "../../shared/models";
import { OrganizationalUnitService } from "../../shared/services/organizational-unit.service";
import { Router,ActivatedRoute } from "@angular/router";
import { AuthService } from "../../shared/auth/auth.service";
import { KeyValuePair } from "../../shared/models/Generics/ikeyValuePair.model";
import { MatBottomSheet } from "@angular/material/bottom-sheet";
import { MessageType } from "../../shared/models/message-types.model";
import { GenericBottomSheetComponent } from "../../shared/generic-bottom-sheet/generic-bottom-sheet.component";
import { LocalStorageService } from "../../shared/services/local-storage.service";
import { LeaveService } from "../../shared/services/leave.service";
import { LeaveRequestFind } from "../../shared/models/leave-request-find.model";
import { LeaveRequest } from "../../shared/models/leave-request.model";
import { leaveFindFilters } from "../../shared/models/leave-find-filters";
import { LeaveRequestDetailComponent } from "../leave-request-detail/leave-request-detail.component";
import { LeaveStateFind } from "../../shared/models/Employee/leave-state.model";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from "@angular/forms";
import { UiNotificationsService } from "../../shared/services/ui-notifications.service";
import { EmployeeFileDocumentDialogData } from "../../shared/models/employee-file-document-dialog-data.model";
import { FileDocumentViewModalComponent } from "../../shared/file-document-view-modal/file-document-view-modal.component";
import { FileDocumentService } from "../../shared/services/file-document.service";
import { MatDialog } from "@angular/material/dialog";
import { EmployeeService } from "../../shared/services/employee.service";
import { ContainerTypeService } from "../../shared/services/container-type.service.";
import { FileDocumentCollaborationData } from "../../shared/models/file-document-sign-data.model";
import { ProgressMassiveApproveRequestsComponent } from "../progress-massive-approve-requests/progress-massive-approve-requests.component";
import { FileService } from "../../shared/services/file.service";
import { LeaveApprovers } from "../../shared/models/approvers.model";
import { EmployeeLeaveService } from "../../shared/services/employee-leave-requests.service";
import { WorkflowApproveType } from "../../shared/models/Employee/leave-type-ou.model";


@Component({
  selector: "app-leave-find",
  templateUrl: "./leave-find.component.html",
  styleUrls: ['./leave-find.component.scss']
})
export class LeaveFindComponent implements OnInit {
  @ViewChild('selectState') selectState: any;
  @ViewChild(LeaveRequestDetailComponent) detail: LeaveRequestDetailComponent;
  @ViewChild('menuTrigger') menuTrigger!: MatMenuTrigger;
  leaveFindFilter: leaveFindFilters;
  organizationalUnitId: string;
  leaves: LeaveRequest[];
  orderBy: string[];
  orderAsc: boolean;
  filterName: string;
  loading = false;
  loadingDetail = false;
  pageIndex: number;
  itemsCount: number;
  searchOpened: boolean;
  organizationalUnits: OrganizationalUnit[];
  selectedOrganizationalUnit: OrganizationalUnit;
  selectedLeaveStateFind: number = LeaveStateFind.pendiente;
  selectedLeaveSearchAdvancedStateFind: number = LeaveStateFind.pendiente;
  active: boolean;
  selectedLeaveRequest: LeaveRequest;
  showDetail: any;
  allSelected = false;
  showApproveLeaves = false;
  selectRequestId = undefined;
  containerType: ContainerType;
  containerTypeId: number;
  employee:Employee;
  views: KeyValuePair<string, string>[] = [
    { key: 'Licencias', value: 'employer/leave-find' }
  ];
  selectedView: KeyValuePair<string, string>;
  showResults = false;
  isLeaveEditOpened: boolean;
  leaveTypeIcon: string;
  statesFilters: KeyValuePair<number, string>[] = [
    { key: 5, value: 'Ver Todos' }, { key: 1, value: 'Solicitudes Pendientes' }, { key: 2, value: 'Solicitudes Aprobadas' }, { key: 3, value: 'Solicitudes Rechazadas' }, { key: 4, value: 'Solicitudes Canceladas' }, { key: 0, value: 'Solicitudes Borrador' }];
  idFiscalMask:string;
  fechaInicio: Date;
  fechaFin: Date;
  MaxFromStart:Date;
  MinFromStart:Date;
  MaxUntilStart:Date;
  MinUntilStart:Date;
  MinFromCreate:Date;
  MaxFromCreate:Date;
  MaxUntilCreate:Date;
  MinUntilCreate:Date;
  StartDate: UntypedFormControl;
  InitDate:UntypedFormControl;
  UntilDate:UntypedFormControl;
  EndDate: UntypedFormControl;
  filterDateFormLeave: UntypedFormGroup;
  selectApproverAccion: number = 0;
  selectStateModel: number = 1;
  currentOu:number = 0;
  workflowApproveType: WorkflowApproveType;
  placeHolder="Sin Seleccionar";
  approversOptions = [
    {value: 1, viewValue: 'A validar por Aprobador de Equipo'},
    {value: 2, viewValue: 'Validada por Aprobador de Equipo'},
    {value: 3, viewValue: 'Rechazada por Aprobador de Equipo'},
  ];
  approverActionsByState: { [key: number]: any[] } = {
    5: [
      { value: 1, viewValue: 'A validar por Aprobador de Equipo' },
      { value: 2, viewValue: 'Validada por Aprobador de Equipo' },
      { value: 3, viewValue: 'Rechazada por Aprobador de Equipo' }
    ],
    1: [
      { value: 1, viewValue: 'A validar por Aprobador de Equipo' },
      { value: 2, viewValue: 'Validada por Aprobador de Equipo' }
    ],
    2: [
      { value: 2, viewValue: 'Validada por Aprobador de Equipo' }
    ],
    3: [
      { value: 2, viewValue: 'Validada por Aprobador de Equipo' },
      { value: 3, viewValue: 'Rechazada por Aprobador de Equipo' }
    ],
    4: [
      { value: 2, viewValue: 'Validada por Aprobador de Equipo' },
    ]
  };
  filterApprovers:LeaveApprovers[];
  selectedApprovers:LeaveApprovers[]=[];
  showMassiveApproveCheck: boolean;
  constructor(
    private route: ActivatedRoute,
    private msjService: MessageService,
    private authService: AuthService,
    private organizationalUnitService: OrganizationalUnitService,
    private router: Router,
    private _bottomSheet: MatBottomSheet,
    private localStorageService: LocalStorageService,
    private leaveService: LeaveService,
    private _formBuilder: UntypedFormBuilder,
    private uiNotificationsService: UiNotificationsService,
    private fileDocumentService: FileDocumentService,
    private dialog: MatDialog,
    private employeeService: EmployeeService,
    private containerTypeService: ContainerTypeService,
    private readonly messageService: MessageService,
    private readonly fileService: FileService,
    private readonly employeeLeaveService: EmployeeLeaveService
  ) {
    this.filterDateFormLeave = this._formBuilder.group({
      FromDateCreate: [""],
      UntilDateCreate: [""],
      FromDateStart:[""],
      UntilDateStart:[""],
      selectApproverAccion:null,
      selectState:null,
    });
  }

  @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent) {
      if (this.selectState?.panelOpen) {
        const target = event.target as HTMLElement;
        const componentRoot = document.querySelector('app-leave-find');
        if (componentRoot && !componentRoot.contains(target)) {
            this.selectState.close();
            this.onMatSelectClosed();
        }
      }
    }

      onMatSelectClosed() {
        if (this.selectState?._elementRef) {
          const el = this.selectState._elementRef.nativeElement;
          el.classList.add('invisible-item');
        }
      }

  ngOnInit() {
    this.subscribeGotoLeave();
    this.showDetail = false;
    this.loading = true;
    this.selectedView = this.views.find(v => v.key === 'Licencias');
    this.organizationalUnitId = localStorage.getItem("organizationId");
    try
    {
      const currentOuRes = this.organizationalUnitService.getCurrentOrChildOU();
      this.currentOu = currentOuRes.id;
    }catch{
      this.currentOu = parseInt(this.organizationalUnitId);
    }
    this.validateWorkFlow(this.currentOu);
    this.leaveFindFilter = this.localStorageService.get("leaveFindFilter")

    this.route.params.subscribe(param =>{this.selectRequestId = this.selectRequestId != undefined ? undefined : param['id']});
    if(this.selectRequestId)
    {
        this.loadLeave();
    }
    else
    {
      this.initialComponent();
    }
    this.approversOptions = this.approverActionsByState[this.selectedLeaveStateFind] || [];
    this.showCheckbox();
  }

  setDateEndCreate(event: any) {
    this.filterDateFormLeave.get('UntilDateCreate')?.setValue(event.value);
  }
  validateWorkFlow(ouId:number){
    this.employeeLeaveService.getMyConfigLeaveOU(ouId).toPromise().then(
      data => {
          if (data && data.length > 0) {
            this.workflowApproveType = data[0].leaveTypeOu.workflowApprove ?? null;
          }
        },
        err => {
        }
      );
  }
  resetDateForm(){
    this.filterDateFormLeave.reset();
    this.selectedApprovers= [];
    this.getFilterApprovers(this.currentOu);
    this.selectedLeaveSearchAdvancedStateFind = LeaveStateFind.pendiente;
  }

  findButtonEnable()
  {
    const { UntilDate, InitDate, FromDateInit, UntilDateInit, selectApproverAccion,selectState } = this.filterDateFormLeave.value;
    if(this.selectedApprovers.length > 0)
    {
      return false;
    }
    else{
      return (((FromDateInit === null || UntilDateInit === "")|| (FromDateInit === "" || UntilDateInit === null) || (InitDate === "" || UntilDate === null) || (UntilDate === "" || InitDate === null)) && (selectApproverAccion === 0 || selectApproverAccion === null) && (selectState === 0 || selectState === null));
    }
  }

  closeFindAdvanced(){
    this.menuTrigger.closeMenu();
  }

  getLeaveTypeIcon(leave: LeaveRequest): string { //vaca
    switch (leave.leaveTypeName) {
      case 'Vacaciones':
        if (leave.startDate == null || leave.endDate == null) {
          return 'fa-money-check'
        }
        return 'fa-umbrella-beach'
    }
  }

  getLeaveTypeName(leave: LeaveRequest): string {
    switch (leave.leaveTypeName) {
      case 'Vacaciones':
        if (leave.startDate == null || leave.endDate == null) {
          return 'Vacaciones vencidas'
        }
        return 'Vacaciones'
    }
  }

  getLeaveStatusName(leave: LeaveRequest): string {
    switch (leave.stateId) {
      case '0': return 'Borrador'
      case '1': return 'Pendiente'
      case '2': return 'Aprobada'
      case '3': return 'Rechazada'
      case '4': return 'Cancelada'
    }
  }

  getLeaveStatusIcon(leave: LeaveRequest): string {
    switch (leave.stateId) {
      case '0': return 'fa-pencil'
      case '1': return 'fa-hourglass-half'
      case '2': return 'fa-thumbs-up'
      case '3': return 'fa-thumbs-down'
      case '4': return 'fa-times-circle'
    }
  }
  getLeaveStatusClass(leave: LeaveRequest): string {
    switch (leave.stateId) {
      case '1': return 'pending'
      case '2': return 'ok'
      case '3': return 'not-ok'
      case '4': return 'cancelled'
    }
  }

  numberOfDays(endDate: Date, startDate: Date): number {
    if (startDate != null || startDate != undefined || endDate != null || endDate != undefined) {
      const differenceInMilliseconds = Math.abs(endDate?.getTime() - startDate?.getTime());
      // Convierte la diferencia a días
      let days: number = Math.ceil(differenceInMilliseconds / (1000 * 60 * 60 * 24));
      return days;
    }
    return 0
  }

  canReject(leaveRequest:LeaveRequest): boolean {
    //Puedo rechazar si es estado pendiente
    if (leaveRequest.stateId == "1") {
      return true;
    }
    //Puedo rechazar si la fecha de inicio de la licencia es mayor a la de hoy , aunque ya este aprobada
    if (leaveRequest.startDate > new Date()) {
      if (leaveRequest.stateId == "2") {
        return true;
      }

    } else {
      // Si ya entro en vigencia y esta aprobada no se puede rechazar
      if (leaveRequest.stateId == "2") {
        return false;
      }
    }
    // Los demas casos (solicitudes rechazadas) no se pueden rechazar
    return false;
  }

  loadLeave() {
      this.organizationalUnitService.getTreeInMemory()
      .then(ous => {
        this.organizationalUnits = ous.filter(o => o.isRoot === false);
        if (this.organizationalUnitService.getCurrentOrChildOU() == null || this.organizationalUnitService.getCurrentOrChildOU().isRoot) {
          this.selectedOrganizationalUnit = this.organizationalUnits[0];
          this.organizationalUnitService.setCurrentOU(this.selectedOrganizationalUnit);
        } else {
          this.selectedOrganizationalUnit = this.organizationalUnitService.getCurrentOrChildOU();
        }
        let param: LeaveRequestFind;
        param = {
          id:this.selectRequestId,
          orderBy: this.orderBy,
          orderAscendent: this.orderAsc,
          page: this.pageIndex == 0 ? 1 : this.pageIndex,
          itemPerPage: 15,
          isPaged: true,
        };
        if (!this.leaveFindFilter) {
          this.leaveFindFilter = {
            leaveRequestFind: null,
            columns: [],
            exportColumns: [],
            previousOuID: null
          };
        }
        // this.saveFilters(param);
        this.leaveService
          .getLeaveRequests(param)
          .toPromise()
          .then(
            data => {
              this.leaves = data.values;
              this.selectedLeaveRequest = data.values.find(f => f.id == this.selectRequestId);
              this.selectedLeaveStateFind = Number.parseInt(this.selectedLeaveRequest.stateId);
              this.itemsCount = this.leaves.length;
              this.showDetail = true;
              this.loadingDetail = true;
              this.showCheckbox();
              this.loading = false;
              this.selectedOrganizationalUnit = this.organizationalUnits.find(o => o.id == this.selectedLeaveRequest.organizationalUnitId);
            },
            err => {
              this.msjService.showError(err);
              this.loading = false;
            }
          );
          this.idFiscalMask = this.maskSplited(this.selectedOrganizationalUnit.country.fiscalIdMask)
      });


  }

  filteredSearch() {
    this.selectedLeaveSearchAdvancedStateFind = this.selectedLeaveStateFind;
    this.pageIndex = 0;
    this.search();
    this.showResults = true;
    this.menuTrigger.closeMenu();

  }

  filteredAdvancedSearch() {
    this.selectedLeaveStateFind = this.selectedLeaveSearchAdvancedStateFind;
    this.pageIndex = 0;
    this.search();
    this.showResults = true;
    this.menuTrigger.closeMenu();

  }
  filteredSearchRefresh(id = undefined) {
    this.resetDateForm();
    if(id != undefined){
      this.validateWorkFlow(id);
    }
    this.resetDateForm();
    this.pageIndex = 0;
    this.search();
    this.showResults = true;
    this.menuTrigger.closeMenu();

  }

  search(refreshGridData: boolean = true) {
    this.allSelected = false;
    this.showApproveLeaves = false;
    this.loading = true;
    if (!refreshGridData) {
      return;
    }
    let ouId = 0;
    const previousOu = this.organizationalUnitService.getCurrentOrChildOU();
    if (this.selectedOrganizationalUnit && this.selectedOrganizationalUnit.id != null) {

      this.organizationalUnitService.setCurrentOU(this.selectedOrganizationalUnit);
      ouId = this.selectedOrganizationalUnit.id;

      if (previousOu && previousOu.id !== this.selectedOrganizationalUnit.id) {
        this.cleanFilters();
      }
    }
    this.findLeaves(this.selectedOrganizationalUnit.id);
    this.idFiscalMask = this.maskSplited(this.selectedOrganizationalUnit.country.fiscalIdMask);
  }

  private findLeaves(ouId: number) {
    let param: LeaveRequestFind;
    const { FromDateCreate, UntilDateCreate,FromDateStart,UntilDateStart } = this.filterDateFormLeave.value;
    param = {
      orderBy: this.orderBy,
      orderAscendent: this.orderAsc,
      page: this.pageIndex == 0 ? 1 : this.pageIndex,
      itemPerPage: 15,
      isPaged: true,
      organizationalUnitId: ouId,
      stateId: (this.selectedLeaveStateFind != null && this.selectedLeaveStateFind != 5) ? this.selectedLeaveStateFind.toString() : null,
      textSearch: this.filterName,
      fromDateCreate: FromDateCreate?? '',
      untilDateCreate: UntilDateCreate?? '',
      fromDateStart: FromDateStart?? '',
      untilDateStart: UntilDateStart?? '',
      approverAction: this.selectApproverAccion?? null,
      approverUserdIds:this.selectedApprovers.map(s => s.userId)
    };
    if (!this.leaveFindFilter) {
      this.leaveFindFilter = {
        leaveRequestFind: null,
        columns: [],
        exportColumns: [],
        previousOuID: null
      };
    }
    this.leaveService
      .getLeaveRequests(param)
      .toPromise()
      .then(
        data => {
          this.leaves = data.values.sort((a, b) => Number.parseInt(a.stateId) - Number.parseInt(b.stateId));
          this.itemsCount = data.total;
          this.selectedLeaveRequest = undefined;
          this.showDetail = false;
          this.showCheckbox();
          this.loading = false;
          this.pageIndex = data.page;
          this.getFilterApprovers(this.selectedOrganizationalUnit.id);
        },
        err => {
          this.msjService.showError(err);
          this.loading = false;
        }
      );
  }

  selectedPageChanged(a) {
    this.search();
  }

  toggleLeaveDetail() {
    this.showDetail = !this.showDetail;
    this.selectedLeaveRequest = undefined;
  }

  selectLeaveRequest(leaveRequest: LeaveRequest) {
    if (leaveRequest != null && leaveRequest != undefined) {
      this.selectedLeaveRequest = leaveRequest;
      if (this.detail != null && this.detail != undefined) this.detail.getLeaveRequestDetail(leaveRequest)
      this.showDetail = true;
      this.loadingDetail = true;
    }
  }

  closeEdit() {
    this.isLeaveEditOpened = false;
    this.detail.getLeaveRequestDetail(this.selectedLeaveRequest);
  }

  executeFunction(event: any) {
    if (this[event.method]) {
      this[event.method](event.param);
    }
  }

  changeView(view: KeyValuePair<string, string>) {
    this.router.navigate([view.value]);
  }

  private cleanFilters() {
    this.leaveFindFilter = {
      leaveRequestFind: null,
      previousOuID: this.selectedOrganizationalUnit.id //TODO: Corroborar si se debe colocar la ouid seleccionada cuando se limpian los filtros
    };
    this.loading = false;
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
    );
  }

  maskSplited(mask: string) {
    let masksplited = mask.split("||")
    if (masksplited.length > 1) {
      let i = masksplited.length - 1;
      return masksplited[i];
    }
    return mask;
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
            if(approve)
              this.msjService.showInfo("Se pudo aprobar la solicitud con éxito");
            else
            this.msjService.showInfo("Se pudo rechazar la solicitud con éxito");
            this.search();
          },
          err => {
            this.msjService.showError(err);
            this.loading = false;
          }
        );
      }
    });
  }

  private getApproveInfoText(leave: LeaveRequest)
  {
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
  private getRejectInfoText(leave: LeaveRequest)
  {
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
  selectAllToogle()
  {
    if (this.leaves) {
      this.leaves.forEach(element => {
        if(this.workflowApproveType?.id === 3 && element.actionApprovers.length > 0){
          element.selected = false;
        } else if(this.workflowApproveType?.id === 4 && (!element.actionApprovers.some(a => a.action === 2) && element.actionApprovers.length > 0)){
          element.selected = false;
        }
        else{
          element.selected = this.allSelected;
        }
      });
    }
    this.showApproveLeaves = this.leaves.filter(function (x) { return x.selected; }).length > 0;
  }
  selectedChange() {
    this.showApproveLeaves = this.leaves.filter(function (x) { return x.selected; }).length > 0 && (this.authService.isLeaveManager() ||  this.authService.isLeaveApprov());

    const allTheSame = this.leaves.every((val, i, arr) => val.selected === arr[0].selected);
    if (allTheSame) {
      this.allSelected = this.leaves[0].selected;
    } else {
      this.allSelected = false;
    }
  }
  ApproveLeaveRequests()
  {
    let parameters: any = {};
    parameters.type = MessageType.ApproveReject;
    parameters.approve = true;
    parameters.bodyText = 'Aprobar solicitudes seleccionadas';
    parameters.infoText = "Estas por aprobar las solicitudes seleccionadas. Revise los datos antes de confirmar la operación.";
    parameters.buttonText = 'Aprobar';
    const t = this._bottomSheet.open(GenericBottomSheetComponent, { data: parameters, disableClose: true });
    t.instance.close.subscribe((response: any) => {
      if (response.response)
         {
            const dialogRef = this.dialog.open(ProgressMassiveApproveRequestsComponent, {
            disableClose: true,
            data: this.leaves.filter(l => l.selected).map(m=> m.id)
            });
            dialogRef.afterClosed().subscribe((res) => {
            this.allSelected = false;
            this.showApproveLeaves = false;
            this.search();});
         }
      else
         {
           this.search();
         }
  });



  }

  ShowMessage(success: any)
  {
    if (success == true)
    {
      this.msjService.showInfo("Se aprobaron todas las solicitudes seleccionadas éxitosamente.");
    }
    else
    {
      this.msjService.showInfo("Algunas Solicitudes seleccionadas no pudieron ser aprobadas.");
    }
  }
  hidedetailLoading()
  {
    this.loadingDetail = false;
  }
  initialComponent()
  {
    this.organizationalUnitService.getTreeInMemory()
      .then(ous => {
        this.organizationalUnits = ous.filter(o => o.isRoot === false);
        if (this.organizationalUnitService.getCurrentOrChildOU() == null || this.organizationalUnitService.getCurrentOrChildOU().isRoot) {
          this.selectedOrganizationalUnit = this.organizationalUnits[0];
          this.organizationalUnitService.setCurrentOU(this.selectedOrganizationalUnit);
        } else {
          this.selectedOrganizationalUnit = this.organizationalUnitService.getCurrentOrChildOU();
        }
        // this.orderBy =
        this.orderAsc = true;
        let param: LeaveRequestFind;
        param = this.leaveFindFilter ? this.leaveFindFilter.leaveRequestFind : null;
        if (param && this.selectedOrganizationalUnit.id == param.organizationalUnitId) {
          this.orderBy = param.orderBy;
          this.orderAsc = param.orderAscendent;
          this.pageIndex = param.page;
          param.itemPerPage = 15;
          param.isPaged = true;
          this.filterName = param.textSearch;
        }
        this.search();
        this.idFiscalMask = this.maskSplited(this.selectedOrganizationalUnit.country.fiscalIdMask)
      });
  }
  subscribeGotoLeave()
  {
    this.uiNotificationsService.gotoLeave.subscribe(id =>{
      this.selectedLeaveRequest = undefined;
      this.selectRequestId = id;
      this.loadLeave();

    })
  }

  getLeaveValidationIcon(leave: LeaveRequest) {
   let actionApprovers = leave.actionApprovers.sort((a,b)=> b.action-a.action)[0];
   switch(actionApprovers.action){
     case 1:
       return 'fa-check-circle';
     case 2:
       return 'fa-check-circle';
     case 3:
      return 'fa-times-circle';
    default: return '';
   }
  }

  setDateEndStart(event: any) {
    this.filterDateFormLeave.get('UntilDateStart')?.setValue(event.value);
  }

  getLeaveValidationClass(leave: LeaveRequest) {
   let actionApprovers = leave.actionApprovers.sort((a, b)=> b.action-a.action)[0];
   switch(actionApprovers.action){
      case 1: return 'pending';
      case 2: return 'ok';
      case 3: return 'rejected';
      default: return '';
   }
  }

  onAccionSelected(accion){
    this.selectApproverAccion = accion;
  }

  onStateSelected(state:number){
    this.approversOptions = this.approverActionsByState[state] || [];
  }

  private createEmployeeFindParam(containerTypeId: number, userId: number, organizationUnitIds: number[]): EmployeeFind {
    return {
        containerTypeId: containerTypeId,
        userid: userId,
        orderBy: ["m.factivo"],
        orderAscendent: true,
        itemPerPage: 0,
        organizationUnitIds: organizationUnitIds,
        hasLogin: null,
        active: true,
        certificateParamter: {
            withActiveCertificate: true,
            withPendingCertificate: true,
            withoutCertificate: true
        },
        metadataParameters: []
    };
  }

  getFilterApprovers(ouId: number){
    this.leaveService.getApproversByOu(ouId).toPromise()
    .then(res =>{
        this.filterApprovers = res;
    }).catch(err =>{
    })
  }

  viewDocument(leave: LeaveRequest) {
    this.containerTypeService
      .getContainerType(this.currentOu.toString(), false)
      .toPromise()
      .then(containerType => {
        this.containerType = containerType;
        this.containerTypeId = this.containerType.id;
        let param: EmployeeFind;
        const organizationUnitIds: number[] = [this.currentOu];
        param = this.createEmployeeFindParam(this.containerTypeId, parseInt(leave.userId), organizationUnitIds);
        this.employeeService
          .getContainers(param)
          .toPromise()
          .then(
            data => {
              this.employee = data.values[0];
              this.openDocumentLeave(leave.documentId,this.currentOu);
          })
          .catch(error => {
            this.messageService.showError('Error al obtener los contenedores del empleado');
          });
        })
        .catch(error => {
          this.messageService.showError('Error al obtener el tipo de contenedor');
        });
    }

    private openDocumentLeave(documentId:number,organizationalUnitId:number)
    {
      const results = [];
      results.push(this.fileDocumentService.getCollaboration(documentId,organizationalUnitId).toPromise().catch(error=>{this.messageService.showInfo('El documento ha sido eliminado')}));
      results.push(this.fileDocumentService.getSignatures(documentId).toPromise().catch(error=>{this.messageService.showInfo('El documento ha sido eliminado')}));
      Promise.all(results).then(promises =>{
        this.fileDocumentService.getDocumentDetail(documentId).toPromise()
        .then(re => {
          if(this.employee != undefined)
          {
                const dialogData = new EmployeeFileDocumentDialogData();
                dialogData.doc = re;
                promises[0].forEach((colaboracion) => {
                  if (colaboracion.userId != null)
                  {
                    dialogData.doc.employeeCollaborationData = this.LoadColaboracion(
                      colaboracion,
                      promises[1],
                      true,
                      dialogData.doc.employeeCollaborationData);
                  }
                  else
                  {
                    dialogData.doc.lawyerCollaborationData = this.LoadColaboracion(
                      colaboracion,
                      promises[1],
                      false,
                      dialogData.doc.employeeCollaborationData);
                  }
                });


                dialogData.employerSign = false;
                dialogData.signEnabled = false;
                dialogData.employee = this.employee;
                dialogData.employee.id = this.employee.id.toString();
                dialogData.showDocumentStateBottom = true;
                dialogData.showDocumentState = true;
                dialogData.showDocumentMetadata = true;
                dialogData.isNotifyDocumentVac = false;
                dialogData.isModoPDF = true;
                const dialogRef = this.dialog.open(FileDocumentViewModalComponent, {
                  data: dialogData
                });
                dialogRef.afterClosed().subscribe(result => {
                });

          }
          else
          {
            this.messageService.showInfo('El empleado que tiene esta licencia no está activo');
          }
        })
        .catch(error => {
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

    exportAll() {
      this.loading = true;
      const { FromDateCreate, UntilDateCreate,FromDateStart,UntilDateStart } = this.filterDateFormLeave.value;
      let params: LeaveRequestFind;
      params = {
      orderBy: this.orderBy,
      orderAscendent: this.orderAsc,
      page: this.pageIndex == 0 ? 1 : this.pageIndex,
      isPaged: false,
      organizationalUnitId: this.selectedOrganizationalUnit.id,
      stateId: (this.selectedLeaveStateFind != null && this.selectedLeaveStateFind != 5) ? this.selectedLeaveStateFind.toString() : null,
      textSearch: this.filterName,
      fromDateCreate: FromDateCreate?? '',
      untilDateCreate: UntilDateCreate?? '',
      fromDateStart: FromDateStart?? '',
      untilDateStart: UntilDateStart?? '',
      approverAction: this.selectApproverAccion?? null,
      approverUserdIds:this.selectedApprovers.map(s => s.userId),
      };
      this.leaveService.exportLeaves(params).toPromise().then(
        file => {
          const date = new Date().toISOString();
          const filename = `Lista de solicitudes [${date}].xlsx`;
          this.fileService.download(file, filename, "application/excel");

          this.loading = false;
        },
        err => {
          this.msjService.showError(`Fallo la exportación de las licencias.`);
          this.loading = false;
        }
      );
      this.loading = false;
    }

    removeApprover(event: any) {
      if (!this.filterApprovers.some(approver => approver.id === event.id)) {
          this.filterApprovers.push(event);
      }
      this.selectedApprovers = this.selectedApprovers.filter(a => a.id !== event.id);
  }
   selectApprover(approverName) {
    const filterapprover = this.filterApprovers.find(dt => dt.name == approverName);
    if (filterapprover) {
      this.selectedApprovers.push(filterapprover);
      this.filterApprovers = this.filterApprovers.filter(a => !this.selectedApprovers.includes(a));
    }
  }

  showCheckbox(): void {
    const workflowApproveTypeId = this.workflowApproveType?.id;
    switch(workflowApproveTypeId){
      case 3:
        this.showMassiveApproveCheck = this.leaves.some(l => l.actionApprovers.length == 0);
        break;
      case 4:
        this.showMassiveApproveCheck = this.leaves.filter(l => l.actionApprovers.some(ap => ap.action === 2)).length > 0 || this.leaves.some(l => l.actionApprovers.length == 0);
        break;
      default:
        this.showMassiveApproveCheck = true;
        break;
    }
  }

  isLeaveApprovedByValidator(leave: LeaveRequest): boolean {
    const workflowApproveTypeId = this.workflowApproveType?.id;
    switch(workflowApproveTypeId){
      case 3:
        return leave.actionApprovers.length == 0;
      case 4:
        return leave.actionApprovers.some(ap=>ap.action === 2) || leave.actionApprovers.length == 0;
      default:
        return true
    }
  }

  shouldShowCheck(approvalFlowId: number,stateId:string,approvers:LeaveApprovers[]): boolean
  {
      if(approvers.length > 0 && stateId != '0')
      {
        switch (approvalFlowId) {
            case 1:
                // Opcional jefe y requerido RRHH
                return true;
            case 2:
                // Basado en recursos humanos
                return false;
            case 3:
                // Basado en jefe
                return false;
            case 4:
                // Requerido jefe y requerido RRHH
                return true;
            default:
                // Requerido Jefe y Recursos Humanos
                return false;
        }
      }
      else
      {
        return false;
      }
    }
}
