import { Component, OnInit, ViewChild, ChangeDetectorRef, NgZone } from "@angular/core";
import { MessageService } from "../../shared/errorHandler/message.service";
import { ContainerTypeService } from "../../shared/services/container-type.service.";
import { OrganizationalUnit, ContainerType, User } from "../../shared/models";
import { OrganizationalUnitService } from "../../shared/services/organizational-unit.service";
import { DocumentationTypesService } from "../../shared/services/documentation-types.service";
import { KeyValuePair } from "../../shared/models/Generics/ikeyValuePair.model";
import { Candidate } from "../../shared/models/Employee/candidate.model";
import { CandidateService } from "../../shared/services/candidate.service";
import {
  CandidateFind,
  CandidateExport,
} from "../../shared/models/Employee/candidate-find.model.";
import { Router } from "@angular/router";
import { UserService } from "../../shared/services/user.service";
import { EmployeeDetailComponent } from "../employee-detail/employee-detail.component";
import { MatBottomSheet } from "@angular/material/bottom-sheet";
import { MatDialog } from "@angular/material/dialog";
import { AdvancedEmployeeFilters } from "../../shared/models/Employee/advanced-employee-filters";
import { GenericBottomSheetComponent } from "../../shared/generic-bottom-sheet/generic-bottom-sheet.component";
import {
  MessageAtributtes,
  MessageType,
} from "../../shared/models/message-types.model";
import { CsGridControlComponent } from "../../shared/cs-grid-control/cs-grid-control.component";
import { CandidatePromotionComponent } from "../candidate-promotion/candidate-promotion.component";
import { PersonService } from "../../shared/services/person.service";
import { FileService } from "../../shared/services/file.service";
import { WelcomeParametersDTO } from "../../shared/models/email.model";
import { AuthService } from "../../shared/auth/auth.service";
import { MultipleDocumentationAddDialogComponent } from "../multiple-documentation-add-dialog/multiple-documentation-add-dialog.component";
import { DocumentationTypeSetConfigurationDialogComponent } from "../documentation-type-set-configuration-dialog/documentation-type-set-configuration-dialog.component";
import { AddCandidateDialogComponent } from "../add-candidate-dialog/add-candidate-dialog.component";
import { AuthGuardService } from "./../../shared/services/auth-guard.service";
import { RoleService } from "../../shared/services/role.service";
import { Role } from "../../shared/models/role.model";
import { DocumentStatistic } from "../../shared/services/file-document.service";
import { ErrorSamlModule } from "../../errorSaml/errorSaml.module";

@Component({
  selector: "app-candidate-find",
  templateUrl: "./candidateFind.component.html",
  styles: [],
})
export class CandidateFindComponent implements OnInit {
  @ViewChild(EmployeeDetailComponent) detail: EmployeeDetailComponent;
  @ViewChild(CsGridControlComponent) gridTable: CsGridControlComponent;
  candite = new Candidate();
  orderBy: string;
  orderAsc: boolean;
  loading = false;
  pageIndex: number;
  itemsCount: number;
  pageSize: number;
  containerType: ContainerType;
  organizationalUnits: OrganizationalUnit[];
  selectedOrganizationalUnit: OrganizationalUnit;
  candidates: Candidate[] = [];
  welcomePendingUsers: User[] = [];
  selectedCandidate: Candidate;
  views: KeyValuePair<string, string>[] = [
    { key: "Candidatos", value: "employer/candidate-find" },
  ];
  selectedView: KeyValuePair<string, string>;
  showDetail: boolean;
  actionText: string;
  searchFilters: AdvancedEmployeeFilters = {
    selectedEmployeeFind: [],
    segmentSearch: true,
    nroLegSearch: undefined,
    cuilSearch: undefined,
    inactiveSearch: false,
    activeSearch: true,
  };
  filterName: string;
  showResults = false;
  active = true;
  columns = [];
  isAddCandidateOpen = false;
  candidate = new Candidate();
  roles: Role[];
  candidatePromoteIncompletePermission: Boolean;
  rolPromover:string;
  roleBasicCandidateAdmin:string;
  roleCandidateAdmin:string;
  promote:boolean;
  basicCandidateAdmin:boolean;
  saCandidateAdmin:boolean;

  exportColumns: KeyValuePair<string, any>[];
  constructor(
    private msjService: MessageService,
    private candidateService: CandidateService,
    private containerTypeService: ContainerTypeService,
    private organizationalUnitService: OrganizationalUnitService,
    private documentationTypesService: DocumentationTypesService,
    private userService: UserService,
    private router: Router,
    private _bottomSheet: MatBottomSheet,
    private dialog: MatDialog,
    private personService: PersonService,
    private fileService: FileService,
    private authService: AuthService,
    private authGuardService: AuthGuardService,
    private roleService: RoleService,
    private ref: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit() {    
    this.selectedView = this.views.find((v) => v.key === "Candidatos");
    this.loading = true;
    this.pageIndex = 1;
    this.pageSize = 15;
    this.orderBy = "m." + Candidate.startDateSystemName;
    this.orderAsc = true;
    this.showDetail = false;
    this.actionText = "Cargando";
    this.rolPromover = "CANDIDATE_PROMOTE";
    this.roleBasicCandidateAdmin = "ADMIN_CANDIDATE_BASIC";
    this.roleCandidateAdmin = "CANDIDATEADMIN";
    this.organizationalUnitService.getTreeInMemory().then((ous) => {
      this.organizationalUnits = ous.filter((o) => o.isRoot === false);
      if (
        this.organizationalUnitService.getCurrentOrChildOU() == null ||
        this.organizationalUnitService.getCurrentOrChildOU().isRoot
      ) {
        this.selectedOrganizationalUnit = this.organizationalUnits[0];
        this.organizationalUnitService.setCurrentOU(
          this.selectedOrganizationalUnit
        );
      } else {
        this.selectedOrganizationalUnit =
          this.organizationalUnitService.getCurrentOrChildOU();
      }
      this.candidatePromoteIncompletePermission =
        this.hasCandidatePromoteIncompletePermission();
      this.getPendingWelcomeUsers();
      this.search();
    });
    let rolesUser = localStorage.getItem("roles");
   
    this.promote = rolesUser.split(",").includes(this.rolPromover);
    this.saCandidateAdmin =  rolesUser.split(",").includes(this.roleCandidateAdmin);
    this.basicCandidateAdmin = rolesUser.split(",").includes(this.roleBasicCandidateAdmin);

    this.views = this.authService.viewsAvailables();
  }
  hasCandidatePromoteIncompletePermission() {
    if (this.selectedOrganizationalUnit.useCandidatePromoteIncomplete) {
      return this.authGuardService.userHasFunction([
        "CANDIDATE_PROMOTE_INCOMPLETE",
      ]);
    } else {
      return true;
    }
  }

  populateActions(cand: Candidate) {
    cand.actions = [];
    cand.actions.push({
      title: "Actualizar Avance",
      icon: "fa-repeat",
      method: "refreshStatisticsByCandidate",
      param: cand,
    });
    cand.actions.push({
      title: "Ver Documentación",
      icon: "fa-folder",
      method: "gotoCandidateDocumentView",
      param: cand,
    });
    if (cand.state == "Activo") {
      cand.actions.push({
        title: "Agregar documentación",
        icon: "fa-file-upload",
        method: "createDocumentation",
        param: cand,
      });
      cand.actions.push({
        title: "Cancelar Candidato",
        icon: "fa-user-slash",
        method: "cancelCandidate",
        param: cand,
      });
      if(this.validatePromote() === false){
          cand.actions.push({
            title: "Promover Candidato",
            icon: "fa-user-check",
            method: "progressDocumentation",
            param: cand,
           });
      }
    }

    const foundUser =
      this.welcomePendingUsers.filter((usr) => cand.userId === usr.id).length >
      0;
    if (foundUser) {
      cand.actions.push({
        title: "Enviar Mail de Bienvenida",
        icon: "fa-envelope",
        method: "sendPendingWelcome",
        param: cand,
      });
    }
  }

  getPendingWelcomeUsers() {
    if (this.selectedOrganizationalUnit) {
      this.userService
        .get({
          functions: ["CANDIDATE"],
          welcomeSent: false,
          organizationalUnitId: this.selectedOrganizationalUnit.id,
          enabled: this.active,
          locked: false,
        })
        .toPromise()
        .then((users) => (this.welcomePendingUsers = users));
    }
  }

  sendPendingWelcome(candidate: Candidate) {
    event.stopPropagation();
    this.loading = true;
    const dto = new WelcomeParametersDTO();
    dto.userId = candidate.userId;
    dto.organizationalUnitId = this.selectedOrganizationalUnit.id;
    dto.isCandidate = true;
    this.userService
      .pendingWelcome(dto)
      .toPromise()
      .then(async () => {
        this.msjService.showInfo(
          "El correo electrónico de bienvenida será enviado al candidato."
        );

        // actualiza la grilla sin refrehs
        const usuario = this.welcomePendingUsers.find(
          (u) => u.id == candidate.userId
        );
        if (usuario) {
          const n = this.welcomePendingUsers.indexOf(usuario);
          this.welcomePendingUsers.splice(n, 1);
        }

        const action = candidate.actions.find(
          (a) => a.method == "sendPendingWelcome"
        );
        if (action) {
          const n = candidate.actions.indexOf(action);
          candidate.actions.splice(n, 1);
        }
        this.detail.refresh();
      })
      .catch((err) => this.msjService.showError(err))
      .then(() => (this.loading = false));
  }

  createDocumentation(candidate: Candidate) {
    event.stopPropagation();
    this.selectedCandidate = candidate;

    const dialogRef = this.dialog.open(
      MultipleDocumentationAddDialogComponent,
      {
        data: candidate,
        disableClose: false,
      }
    );
    const sub = dialogRef.componentInstance.finishCloseDialog.subscribe(
      (result) => {
        if (result) {
          this.ngZone.run(() => {
            dialogRef.close();
          });

          this.dialog.closeAll();
          this.ref.detectChanges();
          this.refresh(true);
        }
      }
    );

    dialogRef.afterClosed().subscribe((result) => {
      this.refresh(true);
    });
  }

  filteredSearch() {
    this.showDetail = false;
    this.pageIndex = 1;
    this.search();
    this.showResults = true;
  }

  search(refreshGridData: boolean = true) {
    this.actionText = "Cargando";
    if (!refreshGridData) {
      this.gridTable.refreshTable();
      return;
    }
    this.getPendingWelcomeUsers();
    this.loading = true;
    const ouIds = [];
    this.showDetail = false;

    if (this.gridTable) {
      this.gridTable.refreshTable();
    }

    const previousOu = this.organizationalUnitService.getCurrentOrChildOU();
    if (
      this.selectedOrganizationalUnit &&
      this.selectedOrganizationalUnit.id != null
    ) {
      this.organizationalUnitService.setCurrentOU(
        this.selectedOrganizationalUnit
      );
      ouIds.push(this.selectedOrganizationalUnit.id);
    }
    this.getContainer(previousOu)
      .then(() => this.findCandidates(ouIds))
      .catch((err) => {
        if (err.code === "INTE009") {
          err.code = "INTE009C";
        }
        this.msjService.showError(err);
        this.loading = false;
      });
  }

  getContainer(previousOu?: OrganizationalUnit) {
    const currentOu = this.organizationalUnitService.getCurrentOrChildOU();
    if (!this.containerType || !previousOu || previousOu.id !== currentOu.id) {
      return this.containerTypeService
        .getContainerType(currentOu.id.toString(), true)
        .toPromise()
        .then((containerType) => {
          this.containerType = containerType;
          this.setDefaultColumns();
        });
    } else {
      return Promise.resolve();
    }
  }

  refreshStatisticsByCandidate(candidate: Candidate) {
    event.stopPropagation();
    this.candidateService.cleanStatistics(candidate.id);
    candidate.documentStateProgress.totalDocuments = null;
    candidate.documentStateProgress.error = false;
    this.searchDocuments(candidate);
  }

  // gotoCandidateDocumentView(empId: number) {
  gotoCandidateDocumentView(cand: any) {
    event.stopPropagation();
    this.candidateService.cleanStatistics(cand.id);    
    this.router.navigate(["employer/employee-document-view", cand.id,0, true]);
  }

  private findCandidates(ouIds: number[]) {
    
    ouIds = [];
    ouIds.push(this.organizationalUnitService.getCurrentOrChildOU().id);
    const orderBy = [];
    orderBy.push(this.orderBy);
    orderBy.push("_id");
    this.active =
      this.searchFilters.activeSearch && this.searchFilters.inactiveSearch
        ? null
        : this.searchFilters.activeSearch && !this.searchFilters.inactiveSearch
        ? true
        : false;
    const param: CandidateFind = {
      containerTypeId: this.containerType.id,
      orderBy: orderBy,
      orderAscendent: this.orderAsc,
      index: this.pageIndex,
      page: this.pageIndex,
      itemPerPage: this.pageSize,
      isPaged: true,
      name: this.filterName,
      active: this.active,
      organizationUnitIds: ouIds.length > 0 ? ouIds : null,
    };

    this.candidateService
      .getCandidates(param)
      .toPromise()
      .then(
        (data) => {
          this.candidates = data.values;
          this.itemsCount = data.total;
          this.loading = false;
           var userIds = this.candidates.map(x=>x.userId);
           
           this.searchStatistic(userIds);
            
          /*this.candidates.forEach((cnd) => {
            this.searchDocuments(cnd);
          });*/
        },
        (err) => {
          this.msjService.showError(err);
          this.loading = false;
        }
      );
  }
  searchStatistic(userIds : number[])
  {
    this.candidateService.
    getCPPDocumentStatistics(userIds).toPromise()
    .then(
      (data) => {             
           this.candidates.forEach((cnd) => {
            var docProgress = data.find(x=> x.userId == cnd.userId && x.state == cnd.state);            
            cnd.documentStateProgress = new DocumentStatistic();
            cnd.documentStateProgress = docProgress;
            this.loading = false;
            this.populateActions(cnd);
          });        
        },
      (err) => {
        this.candidates.forEach((cnd) => {                    
          cnd.documentStateProgress = new DocumentStatistic();
          cnd.documentStateProgress.error = err;          
        });
        this.msjService.showError(err);
        this.loading = false;
      }
    );
  }
  searchDocuments(candidate: Candidate) {
    const ouIds = [];
    ouIds.push(this.organizationalUnitService.getCurrentOrChildOU().id);
    const orderBy = [];
    orderBy.push(this.orderBy);
    const param: CandidateFind = {
      containerTypeId: this.containerType.id,
      id: +candidate.id,
      active: true,
      organizationUnitIds: ouIds.length > 0 ? ouIds : null,
      cuil: candidate.cuil,
    };

    this.candidateService
      .getDocumentStatistics(param)
      .toPromise()
      .then(
        (data) => {
          if (data == null) {
            candidate.documentStateProgress = new DocumentStatistic();
            candidate.documentStateProgress.error = true;
          } else {
            candidate.documentStateProgress = data;
            if (this.selectedCandidate != undefined) {
              this.selectedCandidate.documentStateProgress = data;
            }
          }
          this.loading = false;
          this.populateActions(candidate);
        },
        (err) => {
          candidate.documentStateProgress = new DocumentStatistic();
          candidate.documentStateProgress.error = true;
          this.msjService.showError(err);
          this.loading = false;
        } 
      );
  }

  sortColumn(header) {
    this.orderBy = "m." + header.orderBy;
    this.orderAsc = header.orderAsc;
    this.pageIndex = 1;
    this.showDetail = false;
    this.search();
  }

  changeView(view: KeyValuePair<string, string>) {
    this.router.navigate([view.value]);
  }

  changePage(page) {
    this.pageIndex = page + 1;
    this.showDetail = false;
    this.search();
  }

  executeFunction(event: any) {
    if (this[event.method]) {
      this[event.method](event.param);
    }
  }

  selectCandidate(candidate: Candidate) {
    this.showDetail = true;
    candidate.containerTypeId = this.containerType.id;
    this.selectedCandidate = candidate;
    this.detail.getEmployeeDetail(this.selectedCandidate.id, this.selectedCandidate.candidateSet.setId);
    this.refreshStatistics();
  }

  toggleCandidateDetail() {
    this.showDetail = !this.showDetail;
    this.gridTable.refreshTable();
  }

  cancelCandidate(candidate: Candidate) {
    event.stopPropagation();
    const parameters = {
      bodyText: "Cancelar Candidato",
      infoText: "¿Está seguro que desea cancelar el ingreso del Candidato?",
      type: MessageType.YesNo,
    } as MessageAtributtes;

    const t = this._bottomSheet.open(GenericBottomSheetComponent, {
      data: parameters,
      disableClose: true,
    });
    t.instance.close.subscribe((response: boolean) => {
      if (response) {
        this.candidateService
          .inactive(candidate)
          .toPromise()
          .then(
            (data) => {
              this.refresh();
              this.msjService.showInfo("El Candidato se canceló con éxito");
            },
            (error) => {
              this.msjService.showError(error)
            }
          );
      }
    });
  }

  promoteCandidate(candidate: Candidate) {
    const dialogRef = this.dialog.open(CandidatePromotionComponent, {
      // height: '800px',
      // width: '1024px',
      data: candidate,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.search();
    });
  }

  selectedPageChanged(a) {
    this.search();
  }

  refresh(reloadStatistics = false) {
    if (reloadStatistics) {
      this.candidateService.cleanAllStatistics();
    }
    this.pageIndex = 1;
    this.search();
  }

  refreshStatistics() {
    this.candidateService.cleanStatistics(this.selectedCandidate.id);
    this.searchDocuments(this.selectedCandidate);
  }

  exportAllWithDocuments() {
    this.exportSelected(true, true);
  }

  exportAll() {
    this.exportSelected(true);
  }

  exportSelected(exportAll = false, withDocuments = false) {
    this.actionText = "Exportando";
    const ouIds = [];
    ouIds.push(this.organizationalUnitService.getCurrentOrChildOU().id);
    const orderBy = [];
    orderBy.push(this.orderBy);
    this.loading = true;
    this.active =
      this.searchFilters.activeSearch && this.searchFilters.inactiveSearch
        ? null
        : this.searchFilters.activeSearch && !this.searchFilters.inactiveSearch
        ? true
        : false;

    const param: CandidateExport = {
      containerTypeId: this.containerType.id,
      orderBy: orderBy,
      orderAscendent: this.orderAsc,
      index: this.pageIndex,
      page: this.pageIndex,
      itemPerPage: this.pageSize,
      isPaged: false,
      name: this.filterName,
      active: this.active,
      organizationUnitIds: ouIds.length > 0 ? ouIds : null,
      sheetName: "Candidatos",
      selectedCandidates: exportAll
        ? null
        : this.candidates.filter(function (x) {
            return x.selected;
          }),
      headers: this.exportColumns,
      isCandidate: true,
      withDocuments: withDocuments,
    };

    this.personService
      .export(param)
      .toPromise()
      .then(
        (file) => {
          const date = new Date().toISOString();
          var fileName = "Lista de candidatos " + ` [${date}].xlsx`;
          if (withDocuments) {
            fileName =
              "Lista de candidatos con Documentacion" + ` [${date}].xlsx`;
          }
          this.fileService.download(file, fileName, "application/excel");
          this.msjService.showInfo("Candidatos exportados correctamente");
          this.loading = false;
        },
        (err) => {
          this.msjService.showError(err);
          this.loading = false;
        }
      );
  }

  setDefaultColumns() {
    this.columns = new Candidate().getDocumentationHeaders(this.containerType);
    this.exportColumns = new Candidate().getDocumentationHeadersExports(
      this.containerType
    );
  }

  openConfigurationSet() {
    const dialogRef = this.dialog.open(
      DocumentationTypeSetConfigurationDialogComponent,
      {
        disableClose: true,
      }
    );

    dialogRef.afterClosed().subscribe((result) => {});
  }

  showAddCandidate() {
    const dialogRef = this.dialog.open(AddCandidateDialogComponent, {
      data: this.candidate,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.refresh();
      }
    });
  }

  canPromoteCandidateBecauseDocumentation(candidate: any): boolean {
    if (!this.candidatePromoteIncompletePermission) {
      return candidate.documentStateProgress.percentage === 100;
    } else {
      return true;
    }
  }

  progressDocumentation(selectedCandidate: any) {

    event.stopPropagation();
    var addPromoteCandidateAction =
      this.canPromoteCandidateBecauseDocumentation(selectedCandidate);
    if (
      selectedCandidate.documentStateProgress.error ||
      selectedCandidate.documentStateProgress.percentage < 100
    ) {
      if (addPromoteCandidateAction) {
        const parameters: MessageAtributtes = {
          bodyText:
            "¡Estás por Promover un Candidato sin la documentación Completa!",
          infoText: "Una vez realizada esta operación no podrá deshacerse.",
          type: MessageType.CaptchaNumbers,
          candidate: true,
        };
        const t = this._bottomSheet.open(GenericBottomSheetComponent, {
          data: parameters,
          disableClose: true,
        });
        t.instance.close.subscribe((response: boolean) => {
          if (response) {
            this.promoteCandidate(selectedCandidate);
          }
        });
      } else {
        this.msjService.showInfo(
          "¡Este Candidato no puede ser promovido por que no tiene la documentación Completa!",
          true,
          true
        );
      }
    } else {
      this.promoteCandidate(selectedCandidate);
    }
  }

  validatePromote() {
    return ((this.saCandidateAdmin === false) && (this.basicCandidateAdmin === true) && (this.promote === false));
  }
}
