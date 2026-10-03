import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { MessageService } from "../../shared/errorHandler/message.service";
import { OrganizationalUnit } from "../../shared/models";
import { Employee } from "../../shared/models/Employee/employee.model";
import { EmployeeService } from "../../shared/services/employee.service";
import { OrganizationalUnitService } from "../../shared/services/organizational-unit.service";
import { KeyValuePair } from "../../shared/models/Generics/ikeyValuePair.model";
import { LeaveStateFind } from "../../shared/models/Employee/leave-state.model";
import { LeaveRequestHeaders } from "../../shared/models/Employee/leave-request-header.model";
import { LeaveTimeLine } from "../../shared/models/times-lines.model";
import { LeaveRequestFind } from "../../shared/models/leave-request-find.model";
import { LeaveService } from "../../shared/services/leave.service";
import { AuthService } from "../../shared/auth/auth.service";

@Component({
  selector: 'app-employee-leaves-view',
  templateUrl: './employee-leaves-view.component.html',
  styleUrls: []
})
export class EmployeeLeavesViewComponent implements OnInit, OnDestroy {
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
  selectedLeaveStateFind: number = LeaveStateFind.pendiente;
  pageIndex: number;
  itemsCount: number;
  
  statesFilters: KeyValuePair<number, string>[] = [
    {key: 6, value: 'Ver Todos' },{ key: 5, value: 'Para Aprobar' },  { key: 1, value: 'Solicitudes Pendientes' }, { key: 2, value: 'Solicitudes Aprobadas' }, { key: 3, value: 'Solicitudes Rechazadas' }, { key: 4, value: 'Solicitudes Canceladas' }, { key: 0, value: 'Solicitudes Borrador' }];
  loaded = false;
  loadingPeriod = false;
  loadingDocument = false;
  activeRow = 0;
  isOpen = false;
  emp: Employee;
  empId: number;
  empUserid: number
  setId: number;
  empFiscalIdMask: string;
  private empSub: any;
  initials: string;
  docId = 0;
  filePdf = "";
  fileName = "";
  docTitle = "";
  organizationalUnits: OrganizationalUnit[];
  selectedou:OrganizationalUnit;
  isFilterOpen = false;
  hasNotificationPending = false;
  itemClass: string;
  totalItems = 0;
  isCandidate = false;
  showButtonPending:boolean = false;
  constructor(private readonly msjService: MessageService,
    private readonly employeeService: EmployeeService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly organizationalUnitService: OrganizationalUnitService,
    private readonly leaveService: LeaveService,
    private readonly authService: AuthService
  ) { }

  ngOnInit() {    
    this.empSub = this.route.params.subscribe(params => {      
      this.empId = +params['id'];
      this.empUserid = +params['userid'];
    });
    this.isLoading = true;
    this.organizationalUnitService.getTreeInMemory()
      .then(ous => {
        this.organizationalUnits = ous;
        this.getEmployee(this.empId);   
      },
        err => this.msjService.showError(err)
      );


  }

  ngOnDestroy() {
    this.empSub.unsubscribe();
  }

  getEmployee(id: number) {
    this.loaded = false;
    this.loadingPeriod = true;   
    this.employeeService
      .getTeamEmployee({"userId": this.empUserid, "employeeId": id.toString()})
      .subscribe(
        res => {          
          this.emp = res;
          this.selectedou = this.organizationalUnits.find(x => x.id === this.emp.organizationalUnitId);
          this.empFiscalIdMask = this.organizationalUnits.find(x => x.id === this.emp.organizationalUnitId).country.fiscalIdMask;
          this.empFiscalIdMask = this.maskSplited(this.empFiscalIdMask);
          this.initials = this.emp.lastName + ' ' + this.emp.name;  
          this.FindLeaveRequestToApprovers();  
        },
        err => this.msjService.showError(err)
      );
  }

  maskSplited(mask: string) {
    let masksplited = mask.split("||")
    if (masksplited.length > 1) {
      //Las mascaras de Id Fiscales cuando son mas de una por pais, al ser de distintas longitudes y estar ordenadas de menor a mayor longitud, 
      //siempre elijo la mayor que queda en la ultima posicion del arreglo
      let i = masksplited.length - 1;
      return masksplited[i];
    }
    return mask;
  }

  goEmployeeDetail() {    
    this.router.navigate(["employee/team"])
  } 

  detailClass(): string {
    if (this.isOpen) {
      return 'is-open';
    } else {
      return '';
    }
  }

  setIsOpen(value) {
    this.isOpen = value;
  }

  changeDetailClass(detailClass: string) {
    this.itemClass = detailClass;
  }
  
  FindLeaveRequestToApprovers() {    
    this.selectedLeave = undefined;
    let param: LeaveRequestFind;
    param = {
      itemPerPage: 15,
      isPaged: true,
      page: this.pageIndex == 0 ? 1 : this.pageIndex,
      organizationalUnitId: this.selectedou.id,
      userId: this.emp.userId,
      orderBy: ["startDate"],
      orderAscendent: this.stateToFilterOrder(),
      stateId: this.selectedLeaveStateFind.toString(),
      approverId: +this.authService.getUserId()
    };
    this.leaveService.getLeaveRequests(param).toPromise()
    .then(leaves =>{      
        if(leaves != undefined) {  
          this.leaveRequests = leaves.values;
          this.itemsCount = leaves.total;
          this.pageIndex = leaves.page;          
          if(this.selectRequestId != null && this.selectRequestId != undefined){
              this.selectedItem = this.leaveRequests.find(x => x.id == this.selectRequestId);
              if (this.selectedItem != undefined && this.selectedItem != null) {
                    this.tabToApprover = true;
                    this.isApprover = true;
                    this.selectLeave(this.selectedItem);
              }
              else {                
                this.router.navigate(["welcome"], { relativeTo: this.route });
            } 
          }
          else
          {
            this.router.navigate(["welcome"], { relativeTo: this.route });
          }
        }
        this.isLoading = false;
      });
  }
 
  openDetailRequest(id: string) {    
    this.router.navigate(["detalle", id, true], { relativeTo: this.route });
    this.isLoading = false;
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

  subscribeReload(componentRef){
    componentRef.reloadEvent?.subscribe(()=>{
      this.refresh();
    });
  }

  refresh() {    
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
  selectedPageChanged(a) {   
    this.isLoading = true;
    this.FindLeaveRequestToApprovers();
  }

  loadRequestToToApprovers()
  {
    this.pageIndex = 0;
    this.isLoading = true;
    this.FindLeaveRequestToApprovers();
  }

  stateToFilterOrder(){
    if(this.selectedLeaveStateFind == 5 || this.selectedLeaveStateFind == 1 || this.selectedLeaveStateFind == 0) return true;
    return false;
  }

}
