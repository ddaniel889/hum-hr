import { Component, OnInit, ViewChild } from "@angular/core";
import { Employee } from "../../shared/models/Employee/employee.model";
import { EmployeeService } from "../../shared/services/employee.service";
import { AuthService } from "../../shared/auth/auth.service";
import { KeyValuePair } from "../../shared/models/Generics/ikeyValuePair.model";
import { EmployeeMetadata } from "../../shared/models/employee-metadata.model";
import { LeaveService } from "../../shared/services/leave.service";
import { EmployeeFind } from "../../shared/models/Employee/employee-find.model.";
import { employeeFindFilters } from "../../shared/models/Employee/employee-find-filters";
import { ConfigLeaveEmployee } from "../../shared/models/Employee/config-leave-employee.model";
import { ConfigLeaveOu } from "../../shared/models/Employee/config-leave-ou.model";
import { MessageService } from "../../shared/errorHandler/message.service";
import { MinLeaveRequestData } from "../../shared/models/Employee/min-leave-request";
import { AddLeaveDialogComponent } from "../../employee/add-leave-dialog/add-leave-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { EmployeeDetailComponent } from "../../employer/employee-detail/employee-detail.component";
import { ContainerType } from "../../shared/models";
import { EmployeeFindApprover } from "../../shared/models/Employee/employeeFindApprover.model";
import { Router } from "@angular/router";

@Component({
  selector: 'app-employee-team',
  templateUrl: './employee-team.component.html',
  styleUrls: ['./employee-team.component.scss']
})
export class EmployeeTeamComponent implements OnInit {
  @ViewChild(EmployeeDetailComponent) detail: EmployeeDetailComponent;

  showDetail: any
  loading = false;
  showToolbar: boolean = false;
  isLeaveApprove: boolean;
  organizationaloUnitId: string;
  filterName: string;
  organizationalUnitId: string;
  employeeIds: number[];
  employees: Employee[]= [];
  columns: KeyValuePair<string, EmployeeMetadata>[] = [];
  availableColumns: EmployeeMetadata[] = [];
  itemsCount: number;
  pageIndex: number;
  employeeFindFilters: employeeFindFilters;
  allSelected = false;
  columnsClass: string = '3';
  ConfigLeaveEmployee: ConfigLeaveEmployee[];
  configLeaveOu: ConfigLeaveOu;
  leaveRequestsData: MinLeaveRequestData;
  findEmployees: EmployeeFind;
  isValidator: boolean;
  containerType: ContainerType;
  empId = 0;
  selectedEmployee: Employee;
  employeeFindApprover: EmployeeFindApprover;

  constructor(
    private employeeService: EmployeeService,
    private authService: AuthService,
    private leaveService: LeaveService,
    private msjService: MessageService,
    private readonly dialog: MatDialog,
    private readonly router: Router
  ){}

  ngOnInit() {
    this.loading = true;
    this.showDetail = false;
    this.isLeaveApprove = this.authService.isLeaveApprov();
    this.organizationalUnitId = localStorage.getItem("organizationId");
    this.employeeIds = JSON.parse(localStorage.getItem("employeesIds"));
    this.findEmployees = {
      name: this.filterName,
      active: true
    };

    this.employeeService.getTeamContainer(this.findEmployees).toPromise().then(
      res => {
          this.employees = res.values;
          this.itemsCount = res.total;
          this.showDetail = false;
          this.pageIndex = res.page;
          this.setDefaultColumns(res.values);
          this.showToolbar = true;
          this.loading = false;
        }
      );
    }

      setDefaultColumns(employess: Employee[]){
        this.columns = [
          {
            key: "_ape",
            value: {
              metadataLabel: "Apellido",
              metadataType: "text",
              metadataId: 0,
              legSystemName: "",
              metadataSystemName: "",
              optionValues: [],
              isRequired: false,
              isReplicated: false,
              metadataValue: undefined,
              metadataMask: "",
              metadataMaskPlaceHolder: "",
              periodPattern: ""
            }
          },
          {
            key: "_nom",
            value: {
              metadataLabel: "Nombre",
              metadataType: "text",
              metadataId: 0,
              legSystemName: "",
              metadataSystemName: "",
              optionValues: [],
              isRequired: false,
              isReplicated: false,
              metadataValue: undefined,
              metadataMask: "",
              metadataMaskPlaceHolder: "",
              periodPattern: ""
            }
          },
          {
            key: "_nroleg",
            value: {
              metadataLabel: "Nro Legajo",
              metadataType: "text",
              metadataId: 0,
              legSystemName: "",
              metadataSystemName: "",
              optionValues: [],
              isRequired: false,
              isReplicated: false,
              metadataValue: undefined,
              metadataMask: "",
              metadataMaskPlaceHolder: "",
              periodPattern: ""
            }
          },
          {
            key: "_cuil",
            value: {
              metadataLabel: "CUIL",
              metadataType: "text",
              metadataMask: "00-00000000-0",
              metadataId: 0,
              legSystemName: "",
              metadataSystemName: "",
              optionValues: [],
              isRequired: false,
              isReplicated: false,
              metadataValue: undefined,
              metadataMaskPlaceHolder: "",
              periodPattern: ""
            }
          }
        ];
        this.columns.forEach( m => {
          this.availableColumns.push(m.value);
        } );
      }

      search(refreshGridData: boolean = true) {
        if (!refreshGridData) {
          return;
        }
        this.loading = true;
        this.findEmployees.name = this.filterName;
        this.employeeService.getTeamContainer(this.findEmployees).toPromise().then(
          res => {
            this.employees = res.values;
            this.itemsCount = res.total;
            this.showDetail = false;
            this.pageIndex = res.page;
            this.setDefaultColumns(res.values);
            this.loading = false;
          }
        );
      }

      async createRequestLeaveDraft(emp: any): Promise<void> {
          this.loading = true;
          const promesas = [];
          promesas.push(this.leaveService.getConfigLeaveByApprover(emp.userId).toPromise());
          promesas.push(this.leaveService.getConfigLeaveOu(parseInt(this.organizationalUnitId)).toPromise());
          Promise.all(promesas).then(res =>{
          this.ConfigLeaveEmployee = res.find(y => y.find(x => x?.leaveType?.id === 1 && x?.configLeaveOu?.enabled && x?.configLeaveOu?.organizationalUnitId === parseInt(this.organizationalUnitId)));
          localStorage.setItem('configLeave', JSON.stringify(res[0]));
          this.configLeaveOu = res[1];
          localStorage.setItem('configOU', JSON.stringify(res[1]));
          this.getMinLeaveRequest(emp);
        }).
         catch (error => {
          console.error(error);
          this.msjService.showInfo('El empleado no posee configuración de vacaciones o No pertence al Equipo del validador');
          this.filteredSearch();
        });
      }

      findConfigLeaveEmployee(userId: number){
          this.leaveService.getConfigLeaveByApprover(userId).toPromise().then(
          configLeave =>{

        }).catch (err=> {
          this.msjService.showInfo('El empleado no posee configuración de vacaciones o No pertence al Equipo del validador');
        });
    }
      async findConfigLeaveOU(ouId: number): Promise<void> {
        try {
          const configOu = await this.leaveService.getConfigLeaveOu(ouId).toPromise();
          if (configOu && configOu.length > 0) {
            this.configLeaveOu = configOu[0];
            localStorage.setItem('configOU', JSON.stringify(configOu));
          }
        } catch (err) {
          this.msjService.showError(err);
          this.loading = false;
        }
      }

      async getMinLeaveRequest(emp: any): Promise<void> {
        try {
          let leaveData = {
            userEmail: '',
            userId: 0,
            nroLegajo: '',
            userIdFiscal: 0,
            firstName: '',
            lastName: ''
          };

          const metadataMap = new Map<string, (value: any) => void>([
            ['_mail', (value) => leaveData.userEmail = value],
            ['_userId', (value) => leaveData.userId = value],
            ['_nroleg', (value) => leaveData.nroLegajo = value],
            ['_cuil', (value) => leaveData.userIdFiscal = value],
            ['_nom', (value) => leaveData.firstName = value],
            ['_ape', (value) => leaveData.lastName = value]
          ]);
          emp.metadatas.forEach((element: any) => {
            const updateFunction = metadataMap.get(element.metadataSystemName);
            if (updateFunction) {
              updateFunction(element.metadataValue);
            }
          });

          this.leaveRequestsData = { ...leaveData };
          this.openAddRequestDialog();
        } catch (err) {
          console.error('Error getMinLeaveRequest', err);
        }
      }

      openAddRequestDialog(): void {
        const dialogRef = this.dialog.open(AddLeaveDialogComponent, {
          disableClose: true,
          data: {
            ...this.leaveRequestsData,
            configLeaveEmployee: this.ConfigLeaveEmployee
          }
        });
        this.loading = false;
        dialogRef.afterClosed().subscribe(() => {
           this.detail.refresh();
           this.search();
        });
      }

      filteredSearch(){
        this.pageIndex = 0;
        this.search();
      }

      toggleEmployeeDetail() {
        this.showDetail = !this.showDetail;
      }

      selectEmployee(emp: any) {
        emp.containerTypeId = 1;
        this.selectedEmployee = emp;
        this.detail.getEmployeeDetailByValidator(this.selectedEmployee);
        this.showDetail = true;
    }
    goLeaves(emp: any)
  {
    this.router.navigate(['employee/employee-leaves-view', emp.id, emp.userId]);
  }
  }
