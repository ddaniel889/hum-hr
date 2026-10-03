import { Component, OnInit, ViewChild } from "@angular/core";
import { MessageService } from "../../shared/errorHandler/message.service";
import { ContainerTypeService } from "../../shared/services/container-type.service.";
import { Employee } from "../../shared/models/Employee/employee.model";
import { EmployeeService } from "../../shared/services/employee.service";
import { EmployeeFind } from "../../shared/models/Employee/employee-find.model.";
import { OrganizationalUnit, ContainerType } from "../../shared/models";
import { OrganizationalUnitService } from "../../shared/services/organizational-unit.service";
import { Router, ActivatedRoute } from "@angular/router";
import { EmployeeDetailComponent } from "../employee-detail/employee-detail.component";
import { FileService } from "../../shared/services/file.service";
import { EmployeeExport } from "../../shared/models/employee-export.model";
import { AdvancedEmployeeFilters } from "../../shared/models/Employee/advanced-employee-filters";
import { AuthService } from "../../shared/auth/auth.service";
import { KeyValuePair } from "../../shared/models/Generics/ikeyValuePair.model";
import { EmployeeMetadata } from "../../shared/models/employee-metadata.model";
import { UserService } from '../../shared/services/user.service';
import { DomSanitizer } from "@angular/platform-browser";
import { PersonService } from "../../shared/services/person.service";
import { MatBottomSheet } from "@angular/material/bottom-sheet";
import { WelcomeEmail, WelcomeParametersDTO } from "../../shared/models/email.model";
import { MessageAtributtes, MessageType } from "../../shared/models/message-types.model";
import { GenericBottomSheetComponent } from "../../shared/generic-bottom-sheet/generic-bottom-sheet.component";
import { MatDialog } from "@angular/material/dialog";
import { AddCandidateDialogComponent } from "../add-candidate-dialog/add-candidate-dialog.component";
import { LocalStorageService } from "../../shared/services/local-storage.service";
import { employeeFindFilters } from "../../shared/models/Employee/employee-find-filters";
import { AddDocumentationDialogComponent } from "../add-documentation-dialog/add-documentation-dialog.component";
import { AdjectiveRolesUser } from "../../shared/models/adjective-roles-user.model";
import { NotificationService } from "../../shared/services/notification.service";
import { CertificateService } from "../../shared/services/certificate.service";
import { AddLeaveDialogComponent } from "../../employee/add-leave-dialog/add-leave-dialog.component";
import { ConfigLeaveEmployee } from "../../shared/models/Employee/config-leave-employee.model";
import { LeaveService } from "../../shared/services/leave.service";
import { MinLeaveRequestData } from "../../shared/models/Employee/min-leave-request";
import { EmployeeLeaveService } from "../../shared/services/employee-leave-requests.service";

@Component({
  selector: "app-employee-find",
  templateUrl: "./employeeFind.component.html",
  styles: []
})

export class EmployeeFindComponent implements OnInit {
  @ViewChild(EmployeeDetailComponent) detail: EmployeeDetailComponent;

  employee = new Employee();
  employeeFindFilter: employeeFindFilters;
  organizationalUnitId: number;
  employees: Employee[];
  containerType: ContainerType;
  orderBy: string;
  orderAsc: boolean;
  allSelected = false;
  filterName: string;
  loading = true;
  pageIndex: number;
  itemsCount: number;
  searchOpened: boolean;
  organizationalUnits: OrganizationalUnit[];
  isCertificateDeclarationOpen = false;
  documentIds = new Array<number>();
  selectedOrganizationalUnit: OrganizationalUnit;
  active: boolean;
  isEmployeeEditOpened: boolean;
  selectedEmployee: Employee;
  selectedEmployees: Employee[];
  showDetail: any;
  showCertDec: boolean;
  withActiveCertificate: boolean;
  withPendingCertificate: boolean;
  withoutCertificate: boolean;
  empId = 0;
  isRRHH: boolean;
  isAdministrator: boolean;
  isRRHHAdmin:boolean;
  isCandidateAdmin: boolean;
  isCandidateAdminBasic: boolean;
  isLeaveApprove: boolean;
  employeeManagement: boolean;
  hasAdjetivation: boolean;
  columns: KeyValuePair<string, EmployeeMetadata>[] = [];
  exportColumns: KeyValuePair<string, EmployeeMetadata>[] = [];
  availableColumns: EmployeeMetadata[] = [];
  columnsClass: string;
  ConfigLeaveEmployee: ConfigLeaveEmployee[];
  private empSub: any;
  views: KeyValuePair<string, string>[] = [
    { key: 'Empleados', value: 'employer/employee-find' }
  ];
  selectedView: KeyValuePair<string, string>;
  showResults = false;
  urlBase = location.origin;
  useMassivePendingNotification = false;

  activeEmployees = true;
  inactiveEmployees = false;
  clickOnce = false;
  useSaml = false;
  hasFiltersMetadataEMPLOYEE = false;
  filtersmetadata: AdjectiveRolesUser[] = [];
  showNotifyPendingButton = false;// Advanced employee filters
  employeeFilters: AdvancedEmployeeFilters = {
    selectedEmployeeFind: [],
    segmentSearch: true,
    nroLegSearch: undefined,
    cuilSearch: undefined,
    inactiveSearch: false,
    activeSearch: true
  };
  leaveRequestsData: MinLeaveRequestData;
  public readonly ACTIVE = 'Activo';
  readonly NeverLoggedIn = WelcomeEmail.NeverLoggedIn;
  neverLoggedInUsers = 0;
  pendingUsers = 0;
  hasLogin: boolean;
  hasLoginFilter = true;
  hasNotLoginFilter = true;
  configEmpLeave: ConfigLeaveEmployee[];
  allAdjetivationEmployee: boolean = false;
  useWorkfloApprove: boolean;
  useHolidaysModule:boolean = false;
  showFolderIcon: boolean;

  constructor(
    private msjService: MessageService,
    private employeeService: EmployeeService,
    private containerTypeService: ContainerTypeService,
    private authService: AuthService,
    private organizationalUnitService: OrganizationalUnitService,
    private userService: UserService,
    private route: ActivatedRoute,
    private fileService: FileService,
    private router: Router,
    private sanitizer: DomSanitizer,
    private personService: PersonService,
    private _bottomSheet: MatBottomSheet,
    private dialog: MatDialog,
    private localStorageService: LocalStorageService,
    private notificationService: NotificationService,
    private certificateService:CertificateService,
    private readonly leaveService: LeaveService,
    private readonly employeeLeaveService: EmployeeLeaveService
  ) { }

  ngOnInit() {
    this.selectedView = this.views.find(v => v.key === 'Empleados');
    this.isAdministrator = this.authService.isAdministrator();
    this.employeeManagement = this.authService.employeeManagement();
    this.isRRHH = this.authService.isRRHH();
    this.isRRHHAdmin = this.authService.RRHHManagment();
    this.isCandidateAdmin = this.authService.isCandidateAdmin();
    this.isCandidateAdminBasic = this.authService.isCandidateAdminBasic();
    this.isLeaveApprove = this.authService.isLeaveApprov();
    this.isEmployeeEditOpened = false;
    this.loading = true;

    if (this.active == true || this.active == false) {
      this.activeEmployees = this.active;
      this.inactiveEmployees = !this.active;
    }
    this.employeeFindFilter = this.localStorageService.get("employeeFindFilter")
    const currentOu = this.organizationalUnitService.getCurrentOrChildOU();
    if (this.employeeFindFilter && currentOu.id == this.employeeFindFilter.previousOuID) {
      this.active = this.employeeFindFilter.employeeFind.active;
      this.hasLogin = this.employeeFindFilter.employeeFind.hasLogin;
      this.columns = this.employeeFindFilter.columns;
      this.exportColumns = this.employeeFindFilter.exportColumns;
      if (this.employeeFindFilter.inactiveEmployees) {
        this.activeEmployees = true;
        this.inactiveEmployees = true;
      }
      if (this.employeeFindFilter.hasLoginFilter || !this.employeeFindFilter.hasLoginFilter) {
        this.hasLoginFilter = this.employeeFindFilter.hasLoginFilter;
        this.hasNotLoginFilter = this.employeeFindFilter.hasNotLoginFilter;
      }
      else {
        this.hasLogin = null;
      }
    } else {
      this.active = true;
    }
    this.showDetail = false;
    this.showCertDec = false;
    this.withActiveCertificate = true;
    this.withPendingCertificate = true;
    this.withoutCertificate = true;

    this.views = this.authService.viewsAvailables();
    this.organizationalUnitService.getTreeInMemory()
      .then(ous => {
        this.organizationalUnits = ous.filter(o => o.isRoot === false);
        if (this.organizationalUnitService.getCurrentOrChildOU() == null || this.organizationalUnitService.getCurrentOrChildOU().isRoot) {
          this.selectedOrganizationalUnit = this.organizationalUnits[0];
          this.organizationalUnitService.setCurrentOU(this.selectedOrganizationalUnit);
          this.useMassivePendingNotification = this.selectedOrganizationalUnit.useMassivePendingNotification;
          this.organizationalUnitId = this.selectedOrganizationalUnit.id;
          this.ouUseWorkflowApprove();
        } else {
          this.selectedOrganizationalUnit = this.organizationalUnitService.getCurrentOrChildOU();
          this.useMassivePendingNotification = this.selectedOrganizationalUnit.useMassivePendingNotification;
          this.organizationalUnitId = this.selectedOrganizationalUnit.id;
          this.ouUseWorkflowApprove();
        }

        this.useSaml = this.selectedOrganizationalUnit.useSaml;
        
        this.getPendingWelcomeUsers(null);
        this.orderBy = this.employee.fechaActivoSystemName;
        this.orderAsc = true;

        this.getContainer()
          .then(() => {
            let param: EmployeeFind;
            param = this.employeeFindFilter ? this.employeeFindFilter.employeeFind : null;
            if (param && this.selectedOrganizationalUnit.id == param.organizationUnitIds[0]) {
              this.containerType.id = param.containerTypeId;
              this.orderBy = param.orderBy[0];
              this.orderAsc = param.orderAscendent;
              this.pageIndex = param.index;
              this.pageIndex = param.page;
              param.itemPerPage = 15;
              param.isPaged = true;
              this.active = this.employeeFindFilter.employeeFind.active;
              this.hasLogin = this.employeeFindFilter.employeeFind.hasLogin;
              this.filterName = param.name;
              this.withActiveCertificate = param.certificateParamter.withActiveCertificate;
              this.withPendingCertificate = param.certificateParamter.withPendingCertificate;
              this.withoutCertificate = param.certificateParamter.withoutCertificate;
              this.employeeFilters.selectedEmployeeFind = param.metadataParameters;
              this.employeeFilters.cuilSearch = param.cuil;
              this.employeeFilters.nroLegSearch = param.nroLegajo;
            }
            this.search();
            this.empSub = this.route.params.subscribe(params => {
              this.empId = +params['id'];
              this.loadEmployee();
            });
            this.hasMassiveNotify();
          })
          .catch(err => this.msjService.showError(err))
        //.then(() => this.loading = false);
      },
        err => this.msjService.showError(err)
      );
    this.filtersMetadataEmployee();
    this.hasFiltersMetadatos();
    this.allAdjetivationEmployee = JSON.parse(localStorage.getItem("allAdjetivationEmployee")) as boolean ?? false;
    this.showFolderIcon = this.authService.RRHHManagment();
  }

  getContainer(previousOu?: OrganizationalUnit) {
    const currentOu = this.organizationalUnitService.getCurrentOrChildOU();
    if (!this.containerType || !previousOu || this.containerType.organizationalUnitId !== currentOu.id) {
      return this.containerTypeService
        .getContainerType(currentOu.id.toString())
        .toPromise()
        .then(containerType => {
          this.containerType = containerType;
          this.availableColumns = [];
          containerType.metadata.forEach(meta => {
            if (meta.isResultCriteria) {
              this.availableColumns.push(meta);
            }
          });
          this.setDefaultColumns();
        });
    } else {
      return Promise.resolve();
    }
  }

  getPendingWelcomeUsers(resendMail = false) {
    if (!this.isAdministrator) {
      return;
    }

    this.userService.getPendingWelcome({
      functions: ['EMPLOYEE_2016', 'EMPLOYEE LD'],
      hasLogin: resendMail,
      organizationalUnitId: this.selectedOrganizationalUnit.id,
      locked: false
    }).toPromise()
      .then(users => {
        this.pendingUsers = users.pendingUsers;
        this.neverLoggedInUsers = users.neverLoggedInUsers;
      })
      .catch(() => {
        this.pendingUsers = 0;
        this.neverLoggedInUsers = 0;
      });
  }

  loadEmployee() {
    if (this.empId > 0) {
      this.employeeService.getContainer(this.empId.toString()).toPromise().then(
        data => {
          this.selectedEmployee = data;
          this.detail.getEmployeeDetail(this.selectedEmployee.id);
          this.showDetail = true;
        },
        err => {
          this.msjService.showError(err);
        }
      );
    }
  }

  errorStatus() {
    return !this.activeEmployees && !this.inactiveEmployees;
  }

  errorSignCondition() {
    return !this.withActiveCertificate && !this.withPendingCertificate && !this.withoutCertificate;
  }

  filteredSearch() {
    this.hasLogin = this.hasLoginFilter && this.hasNotLoginFilter ? null : this.hasLoginFilter && !this.hasNotLoginFilter ? true : false;
    this.active = this.activeEmployees && this.inactiveEmployees ? null : this.activeEmployees && !this.inactiveEmployees ? true : false;
    this.useSaml = this.selectedOrganizationalUnit.useSaml;
    this.pageIndex = 0;
    this.search();
    this.ouUseWorkflowApprove();
    this.hasMassiveNotify();
    this.showResults = true;
    this.useMassivePendingNotification = this.selectedOrganizationalUnit.useMassivePendingNotification;
  }

  search(refreshGridData: boolean = true) {
    if (!refreshGridData) {
      return;
    }

    const ouIds = [];
    const previousOu = this.organizationalUnitService.getCurrentOrChildOU();

    if (this.selectedOrganizationalUnit && this.selectedOrganizationalUnit.id != null) {
      this.loading = true;
      this.organizationalUnitService.setCurrentOU(this.selectedOrganizationalUnit);
      ouIds.push(this.selectedOrganizationalUnit.id);
      this.getPendingWelcomeUsers();
      if (previousOu && previousOu.id !== this.selectedOrganizationalUnit.id) {
        this.cleanFilters();
      }
    }

    this.getContainer(previousOu)
      .then(() => this.findEmployees(ouIds))
      .catch(err => {
        this.msjService.showError(err);
        this.loading = false;
      });
  }

  private findEmployees(ouIds: number[]) {
    this.allSelected = false;
    const orderBy = [];
    orderBy.push(this.orderBy);
    orderBy.push("_id");

    let param: EmployeeFind;
    param = {
      containerTypeId: this.containerType.id,
      orderBy: orderBy,
      orderAscendent: this.orderAsc,
      index: this.pageIndex,
      page: this.pageIndex,
      itemPerPage: 15,
      isPaged: true,
      organizationUnitIds: ouIds.length > 0 ? ouIds : null,
      active: this.active,
      hasLogin: this.hasLogin,
      name: this.filterName,
      certificateParamter: {
        withActiveCertificate: this.withActiveCertificate,
        withPendingCertificate: this.withPendingCertificate,
        withoutCertificate: this.withoutCertificate
      },
      metadataParameters: this.employeeFilters.selectedEmployeeFind,
      cuil: this.employeeFilters.cuilSearch,
      nroLegajo: this.employeeFilters.nroLegSearch
    };

    if (!this.employeeFilters.segmentSearch) {
      param.cuil = this.employeeFilters.cuilSearch;
      param.nroLegajo = this.employeeFilters.nroLegSearch;
    }
    if (!this.employeeFindFilter) {
      this.employeeFindFilter = {
        employeeFind: null,
        activeAdvancedSearch: null,
        hasLoginFilter: true,
        hasNotLoginFilter: true,
        inactiveEmployees: null,
        columns: [],
        exportColumns: [],
        previousOuID: null
      };
    }
    this.saveFilters(param);
    this.employeeService
      .getContainers(param)
      .toPromise()
      .then(
        data => {
          this.employees = data.values;
          this.itemsCount = data.total;
          this.selectedEmployee = undefined;
          this.showDetail = false;
          this.showCertDec = false;

          this.loading = false;
          this.employees.forEach(emp => {
            emp.avatar = emp.preview != null ? this.sanitizer.bypassSecurityTrustResourceUrl(emp.preview) : null;
          });
        },
        err => {
          this.msjService.showError(err);
          this.loading = false;
        }
      );
  }

  sortColumn(header: string) {
    this.orderBy = 'm.' + header;
    this.orderAsc = !this.orderAsc;
    this.search();
  }

  selectAllToogle() {
    if (this.employees) {
      this.employees.forEach(element => {
        element.selected = this.allSelected;
      });
    }
    this.showCertDec = this.employees.filter(function (x) { return x.selected; }).length > 0 && this.isRRHH;
  }

  checkEmployee(emp) {
    emp.selected = !emp.selected;
    this.selectedChange();
  }

  selectedChange() {
    this.showCertDec = this.employees.filter(function (x) { return x.selected; }).length > 0 && this.isRRHH;

    const allTheSame = this.employees.every((val, i, arr) => val.selected === arr[0].selected);
    if (allTheSame) {
      this.allSelected = this.employees[0].selected;
    } else {
      this.allSelected = false;
    }
  }

  selectedPageChanged(a) {
    this.search();
  }

  openEditEmployeeFile(emp) {
    emp.containerTypeId = this.containerType.id;
    this.selectedEmployee = emp;
    this.isEmployeeEditOpened = true;
  }

  gotoEmployeeDocumentView(emp: Employee) {
    this.router.navigate(['employer/employee-document-view', emp.id]);
  }

  toggleEmployeeDetail() {
    this.showDetail = !this.showDetail;
  }

  selectEmployee(emp: any) {
      emp.containerTypeId = this.containerType.id;
      this.selectedEmployee = emp;
      this.detail.getEmployeeDetail(this.selectedEmployee.id);
      this.showDetail = true;
  }

  closeEdit() {
    this.isEmployeeEditOpened = false;
    this.detail.getEmployeeDetail(this.selectedEmployee.id);
  }

  updatePreview(event: any) {
    const emp = this.employees.find(e => e.id == this.selectedEmployee.id);
    emp.avatar = this.sanitizer.bypassSecurityTrustResourceUrl(event);
  }

  closeCertificateDeclaration() {
    this.isCertificateDeclarationOpen = false;
  }

  openCertificateDeclaration() {
    this.documentIds = this.employees.filter(emp => emp.selected).map(emp => Number(emp.id));
    this.isCertificateDeclarationOpen = true;
  }

  enableEmployee(emp: Employee) {
    const name = emp.metadatas.find(o => o.metadataSystemName == '_nom')['metadataValue'];
    const lastName = emp.metadatas.find(o => o.metadataSystemName == '_ape')['metadataValue'];
    this.msjService
      .showOkCancel('¿Desea activar el Empleado Nro ' + emp.nroLeg + ' de ' + name + ' ' + lastName + '?', 'Si', 'No')
      .subscribe(result => {
        if (result == true) {
          this.loading = true;
          this.employeeService
            .activeEmployee(emp)
            .subscribe(
              data => {
                this.employee = new Employee();
                this.employee.id = data.id;
                this.employee.organizationalUnitId = data.organizationalUnitId;
                this.employee.organizationalUnitName = data.organizationalUnitName;
                this.employee.metadatas = data.metadatas;
                this.employee.containerTypeId = data.containerTypeId;
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

  disableEmployee(emp) {
    this.msjService
      .showYesNoCancel('¿Desea que el legajo continúe visualizando los documentos recibidos hasta este momento?')
      .subscribe(result => {
        if (result != undefined) {
          this.loading = true;
          this.employeeService
            .deleteEmployee(emp.id, !result)
            .subscribe(
              data => {
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

  isEmployeeSelected(): boolean {
    if (!this.employees && this.employees.length == 0) { return false; }
    return this.employees.filter(function (x) { return x.selected; }).length > 0;
  }

  exportAll() {
    this.loading = true;
    this.allSelected = false;
    const orderBy = [];
    const ouIds = [];
    orderBy.push(this.orderBy);


    if (this.selectedOrganizationalUnit && this.selectedOrganizationalUnit.id != null) {
      ouIds.push(this.selectedOrganizationalUnit.id);
    }
    if (!this.useHolidaysModule) {
      const param: EmployeeExport = {
        containerTypeId: this.containerType.id,
        orderBy: orderBy,
        orderAscendent: this.orderAsc,
        organizationUnitIds: ouIds.length > 0 ? ouIds : null,
        active: this.active,
        hasLogin: this.hasLogin,
        name: this.filterName,
        headers: this.exportColumns,
        sheetName: "Empleados",
        selectedEmployees: null,
        certificateParamter: {
          withActiveCertificate: this.withActiveCertificate,
          withPendingCertificate: this.withPendingCertificate,
          withoutCertificate: this.withoutCertificate
        },
        metadataParameters: this.employeeFilters.selectedEmployeeFind,
        includeLeavesBalance: false
      };
      if (!this.employeeFilters.segmentSearch) {
        param.cuil = this.employeeFilters.cuilSearch;
        param.nroLegajo = this.employeeFilters.nroLegSearch;
      }
      this.personService
        .export(param)
        .toPromise()
        .then(
          file => {
            const date = new Date().toISOString();
            const fileName = "Lista de Empleados " + ` [${date}].xlsx`;
            this.fileService.download(file, fileName, "application/excel");
            this.msjService.showInfo("Empleados exportados correctamente");
            this.loading = false;
          },
          err => {
            this.msjService.showError(err);
            this.loading = false;
          }
        );
    } else{
      let parameters: any = {};
      parameters.bodyText = '¿Desea agregar la información de saldos de licencias?';
      parameters.type = MessageType.YesNo;
      const t = this._bottomSheet.open(GenericBottomSheetComponent, { data: parameters, disableClose: false });
      t.instance.close.subscribe( response => {
        const param: EmployeeExport = {
          containerTypeId: this.containerType.id,
          orderBy: orderBy,
          orderAscendent: this.orderAsc,
          organizationUnitIds: ouIds.length > 0 ? ouIds : null,
          active: this.active,
          hasLogin: this.hasLogin,
          name: this.filterName,
          headers: this.exportColumns,
          sheetName: "Empleados",
          selectedEmployees: null,
          certificateParamter: {
            withActiveCertificate: this.withActiveCertificate,
            withPendingCertificate: this.withPendingCertificate,
            withoutCertificate: this.withoutCertificate
          },
          metadataParameters: this.employeeFilters.selectedEmployeeFind,
          includeLeavesBalance: response
        };
        if (!this.employeeFilters.segmentSearch) {
          param.cuil = this.employeeFilters.cuilSearch;
          param.nroLegajo = this.employeeFilters.nroLegSearch;
        }
        this.personService
          .export(param)
          .toPromise()
          .then(
            file => {
              const date = new Date().toISOString();
              const fileName = "Lista de Empleados " + ` [${date}].xlsx`;
              this.fileService.download(file, fileName, "application/excel");
              this.msjService.showInfo("Empleados exportados correctamente");
              this.loading = false;
            },
            err => {
              this.msjService.showError(err);
              this.loading = false;
            }
          );
      } )
    }

  }
  exportSelected() {
    const orderBy = [];
    const ouIds = [];
    orderBy.push(this.orderBy);


    if (this.selectedOrganizationalUnit && this.selectedOrganizationalUnit.id != null) {
      ouIds.push(this.selectedOrganizationalUnit.id);
    }


    const param: EmployeeExport = {
      containerTypeId: this.containerType.id,
      orderBy: orderBy,
      orderAscendent: this.orderAsc,
      organizationUnitIds: ouIds.length > 0 ? ouIds : null,
      active: this.active,
      name: this.filterName,
      hasLogin: this.hasLogin,
      headers: this.exportColumns,
      sheetName: "Empleados",
      selectedEmployees: this.employees.filter(function (x) { return x.selected; }),
      certificateParamter: {
        withActiveCertificate: this.withActiveCertificate,
        withPendingCertificate: this.withPendingCertificate,
        withoutCertificate: this.withoutCertificate
      },
      metadataParameters: this.employeeFilters.selectedEmployeeFind,
      includeLeavesBalance: false
    };

    if (!this.employeeFilters.segmentSearch) {
      param.cuil = this.employeeFilters.cuilSearch;
      param.nroLegajo = this.employeeFilters.nroLegSearch;
    }

    this.personService
      .export(param)
      .toPromise()
      .then(
        file => {
          const date = new Date().toISOString();
          const fileName = "Lista de empleados " + ` [${date}].xlsx`;
          this.fileService.download(file, fileName, "application/excel");
          this.msjService.showInfo("Empleados exportados correctamente");
          this.loading = false;
        },
        err => {
          this.msjService.showError(err);
          this.loading = false;
        }
      );

  }

  closeAdd() {
    this.isCertificateDeclarationOpen = false;
  }

  isColumnSelected(col: EmployeeMetadata): boolean {
    return this.columns.filter(c => c.key === col.metadataSystemName).length > 0;
  }

  isExportColumnSelected(col: EmployeeMetadata): boolean {
    return this.exportColumns.filter(c => c.key === col.metadataSystemName).length > 0;
  }

  selectColumn(col: EmployeeMetadata) {
    // Si ya estaba la saco
    if (this.isColumnSelected(col)) {
      if (this.columns.length == 1) {
        this.msjService.showInfo('Debes tener al menos un dato del legajo para Visualizar');
        return;
      }
      this.columns.splice(this.columns.findIndex(c => c.key === col.metadataSystemName), 1);
      return;
    }

    // Si no esta en exportar lo agrego
    if (!this.isExportColumnSelected(col)) {
      this.selectExportColumn(col);
    }

    // Si ya tengo 6 no agrego mas
    if (this.columns.length === 6) {
      return;
    }

    this.columns.push({
      key: col.metadataSystemName,
      value: col
    });
    this.saveFilters();

    // Calculo el valor del class
    this.columnsClass = (12 / this.columns.length).toString().replace('.', '');
  }

  selectExportColumn(col: EmployeeMetadata) {
    // Si ya estaba la saco
    if (this.isExportColumnSelected(col)) {
      if (this.exportColumns.length == 1) {
        this.msjService.showInfo('Debes tener al menos un dato del legajo para Exportar');
        return;
      }
      this.exportColumns.splice(this.exportColumns.findIndex(c => c.key === col.metadataSystemName), 1);
      return;
    }

    this.exportColumns.push({
      key: col.metadataSystemName,
      value: col
    });

    this.saveFilters();
  }

  setDefaultColumns() {
    const currentOu = this.organizationalUnitService.getCurrentOrChildOU();
    if (this.employeeFindFilter && this.employeeFindFilter.columns.length > 0 && currentOu.id == this.employeeFindFilter.previousOuID) {
      //Si tengo algo guardado
      this.columns = this.employeeFindFilter.columns;
      this.exportColumns = this.employeeFindFilter.exportColumns;
    }
    else {
      this.columns = new Employee().getDocumentationHeaders(this.containerType);
      this.exportColumns = new Employee().getDocumentationHeaders(this.containerType);
    }

    // Calculo el valor del class
    this.columnsClass = (12 / this.columns.length).toString().replace('.', '');
  }

  sendPendingWelcome(option = WelcomeEmail.Pending) {
    let parameters: MessageAtributtes;
    if (this.useSaml) {
      parameters = {
        bodyText: 'Habilitar Empleados',
        valueText: 'Vamos a habilitar ' + this.pendingUsers + (this.pendingUsers > 1 ? ' empleados' : ' empleado'),
        infoText: 'Puedes continuar con tus tareas, nosotros te avisaremos si ocurre algo inesperado',
        type: MessageType.SpanMsg
      };
    } else {
      parameters = {
        bodyText: 'Enviar Mail de Bienvenida a Empleados',
        valueText: 'Vamos a Enviar ' + this.pendingUsers + (this.pendingUsers > 1 ? ' Correos a quienes aún no han ingresado a huManage' : ' Correo a quien aún no ha ingresado a huManage'),
        infoText: 'Puedes continuar con tus tareas, nosotros te avisaremos si ocurre algo inesperado',
        type: MessageType.SpanMsg
      };
    }

    if (option == WelcomeEmail.NeverLoggedIn) {
      parameters.bodyText = 'Reenviar Mail de Bienvenida a Empleados',
        parameters.valueText = 'Vamos a Enviar ' + this.neverLoggedInUsers + (this.neverLoggedInUsers > 1 ? ' Correos Electrónicos' : ' Correo Electrónico'),
        parameters.infoText = 'Puedes continuar con tus tareas, nosotros te avisaremos si ocurre algo inesperado',
        parameters.type = MessageType.SpanMsg;
    }

    const dto = new WelcomeParametersDTO();
    dto.organizationalUnitId = this.selectedOrganizationalUnit.id;
    dto.OptionEmail = option;

    const t = this._bottomSheet.open(GenericBottomSheetComponent, { data: parameters, disableClose: true });
    t.instance.close.subscribe(async (response: boolean) => {
      if (response) {
        this.clickOnce = true;
        this.showDetail = false;
        this.msjService.showInfo("Hemos iniciado el envío de mails, puedes seguir usando Humanage con normalidad");
        await this.userService.pendingWelcome(dto).toPromise()
          .then(() => {
            if (this.showDetail && this.detail) {
              this.showDetail = this.detail.refresh();
            }

            this.getPendingWelcomeUsers();
          })
          .then(() => { this.clickOnce = false; });
      }
    });
  }

  executeFunction(event: any) {
    if (this[event.method]) {
      this[event.method](event.param);
    }
  }

  changeView(view: KeyValuePair<string, string>) {
    this.router.navigate([view.value]);
  }

  createDocumentation(employee: Employee) {
    this.selectedEmployee = employee;
    let dialogData: any = {
      selectedPerson: this.selectedEmployee,
      isCandidate: false
    };
    const dialogRef = this.dialog.open(AddDocumentationDialogComponent, {
      data: dialogData,
    });
  }

  public cleanFilters() {
    this.employeeFilters = {
      selectedEmployeeFind: [],
      segmentSearch: true,
      nroLegSearch: undefined,
      cuilSearch: undefined,
      inactiveSearch: false,
      activeSearch: true
    };
    this.activeEmployees = true;
    this.inactiveEmployees = false;
    this.withActiveCertificate = true;
    this.withPendingCertificate = true;
    this.withoutCertificate = true;
    this.hasLoginFilter = true;
    this.hasNotLoginFilter = true;
  }

  errorFilterLogin() {
    return !this.hasLoginFilter && !this.hasNotLoginFilter;
  }

  showAddPerson() {
    const dialogRef = this.dialog.open(AddCandidateDialogComponent, {
      data: this.employee,
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.search();
      }
    });
  }

  private saveFilters(param?: EmployeeFind) {
    if (!this.employeeFindFilter) {
      this.employeeFindFilter = {
        employeeFind: null,
        activeAdvancedSearch: null,
        hasLoginFilter: true,
        hasNotLoginFilter: true,
        inactiveEmployees: null,
        columns: [],
        exportColumns: [],
        previousOuID: null
      };
    }
    this.employeeFindFilter.hasLoginFilter = this.hasLoginFilter;
    this.employeeFindFilter.hasNotLoginFilter = this.hasNotLoginFilter;
    this.employeeFindFilter.activeAdvancedSearch = this.active;
    this.employeeFindFilter.inactiveEmployees = this.inactiveEmployees;
    this.employeeFindFilter.columns = this.columns;
    this.employeeFindFilter.exportColumns = this.exportColumns;
    this.employeeFindFilter.previousOuID = this.organizationalUnitService.getCurrentOrChildOU().id;
    if (param) {
      this.employeeFindFilter.employeeFind = param;
      this.employeeFindFilter.employeeFind.hasLogin = this.hasLogin;
    }
    this.localStorageService.set("employeeFindFilter", this.employeeFindFilter)
  }

  filtersMetadataEmployee() {
    this.authService.hasFiltersMetadatos().subscribe(metadata => {
      this.filtersmetadata = metadata;
      if (this.filtersmetadata.length > 0) {
        if (this.filtersmetadata.filter(x => x.personType == "EMPLEADO" && x.metadataId != null).length > 0) {
          this.hasFiltersMetadataEMPLOYEE = true;
        }
      }
      else {
        // en el caso que no tiene filtro para un metadato en particular coloco false
        this.hasFiltersMetadataEMPLOYEE = false;
      }
    });
  }

  hasMassiveNotify(){
    this.notificationService.getLastNotifyRequest(this.selectedOrganizationalUnit.id).subscribe(res => {
      if(res === null){
        this.showNotifyPendingButton = true
      }else{
        if(res.isMassive){
          this.showNotifyPendingButton =  this.isDateGreaterThan24Hours(res.creationDate)
        }else{
          this.showNotifyPendingButton = true
        }
      }
    });
  }

  isDateGreaterThan24Hours(date: Date) : boolean {
    const now = new Date();
    const differenceInHours = Math.abs((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    return differenceInHours >= 24;
  }

  notifyPendingsMassive(){
    this.msjService.showInfo("Notificación masiva en proceso, puedes seguir usando Humanage con normalidad");
    this.notificationService.notifPendingMassive(this.selectedOrganizationalUnit.id).subscribe(res => {
      if(res === null){
        this.showNotifyPendingButton = false
      }else{
        this.showNotifyPendingButton = !res
      }
      this.msjService.showInfo("Notificación masiva finalizada");
    });
  }

  renewMasiveCertificate()
  {
      let parameters: any = {};
      parameters.bodyText = '¿Desea confirmar la renovación masiva de certificados?';
      parameters.type = MessageType.YesNo;
      const t = this._bottomSheet.open(GenericBottomSheetComponent, { data: parameters, disableClose: false });
      t.instance.close.subscribe((response: any) => {
        if (response) {
         this.renewCertificateMasive()
        }
      });
  }

  async renewCertificateMasive()
  {
    this.certificateService.renewCertificatesMassive(this.urlBase,this.selectedOrganizationalUnit.id.toString()).toPromise()
    .then(result => {})
    .catch(error => {});
    this.msjService.showInfo("Renovando los certificados expirados, puede seguir utilizando Humanage");
  }

  notifyMassive()
  {
      let parameters: any = {};
      parameters.bodyText = '¿Desea confirmar la notificación masiva de documentación pendiente?';
      parameters.type = MessageType.YesNo;
      const t = this._bottomSheet.open(GenericBottomSheetComponent, { data: parameters, disableClose: false });
      t.instance.close.subscribe((response: any) => {
        if (response) {
         this.notifyPendingsMassive()
        }
      });
  }

  async createRequestLeaveDraft(emp: any): Promise<void> {
    try {
      this.loading = true;
      await this.findConfigLeaveEmployee(emp.userId);
      await this.findConfigLeaveOU(this.selectedOrganizationalUnit.id);
      await this.getMinLeaveRequest(emp);
    } catch (error) {
      console.error(error);
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
    this.loading = false
    dialogRef.afterClosed().subscribe(() => {
       this.search();
       this.detail.refresh();
    });
  }

  async findConfigLeaveEmployee(userId: number): Promise<void> {
    try {
      const configLeave = await this.leaveService.getConfigLeaveEmployee(userId).toPromise();
      this.ConfigLeaveEmployee = configLeave.filter(x => x.leaveType.id === 1 && x.configLeaveOu.enabled && x.configLeaveOu.organizationalUnitId === this.selectedOrganizationalUnit.id);
      localStorage.setItem('configLeave', JSON.stringify(configLeave));
    } catch (err) {
      this.msjService.showError(err);
    }
  }

  async findConfigLeaveOU(ouId: number): Promise<void> {
    try {
      const configOu = await this.leaveService.getConfigLeaveOu(ouId).toPromise();
      localStorage.setItem('configOU', JSON.stringify(configOu));

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

  onlyisLeaveApprove() {
    if (!localStorage.getItem("roles")) {
      return false;
    }
    const roles = localStorage.getItem("roles").split(",");
   return roles.length == 1 && this.isLeaveApprove;
  }

  hasFiltersMetadatos() {
    // como es la primera pantalla que se carga, espero a que se carguen los metadatos
    const interval = setInterval(() => {
      const updatedAdjetivation = localStorage.getItem("hasFiltersMetadata");
      if (updatedAdjetivation) {
        this.hasAdjetivation = JSON.parse(localStorage.getItem("hasFiltersMetadata")) as boolean ?? true;
        clearInterval(interval);
      }
    }, 500);
    return this.hasAdjetivation;
  }

  ouUseWorkflowApprove(){
    this.leaveService.getConfigLeaveOu(this.selectedOrganizationalUnit.id).toPromise().then(
      data => {
          if (data && data.length > 0) {
            this.useWorkfloApprove = data[0].leaveTypeOu.workflowApprove?.id != null;
            this.useHolidaysModule = true;
          }
        },
        err => {}
      );
  }
  
  getLoginStatus() {
    if (this.hasLoginFilter && this.hasNotLoginFilter) {
        return null;
    }
    return this.hasLoginFilter && !this.hasNotLoginFilter;
  }

  filteredSearchChangeOu() {
    this.hasLogin = this.getLoginStatus()
    this.active = true;
    this.useSaml = this.selectedOrganizationalUnit.useSaml;
    this.pageIndex = 0;
    this.search();
    this.ouUseWorkflowApprove();
    this.hasMassiveNotify();
    this.showResults = true;
    this.useMassivePendingNotification = this.selectedOrganizationalUnit.useMassivePendingNotification;
  }
}
