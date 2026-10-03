import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { MessageService } from "../../shared/errorHandler/message.service";
import { OrganizationalUnit } from "../../shared/models";
import { FileDocument } from "../../shared/models/file-document.model";
import { Employee } from "../../shared/models/Employee/employee.model";
import { GroupEmployeeFileDocumentView } from "../../shared/models/group-employee-file-document-view.model";
import { FileDocumentService } from "../../shared/services/file-document.service";
import { EmployeeService } from "../../shared/services/employee.service";
import { FileService } from "../../shared/services/file.service";
import { OrganizationalUnitService } from "../../shared/services/organizational-unit.service";
import { DocumentationTypesService } from '../../shared/services/documentation-types.service';
import { DocumentationType } from '../../shared/models/documentation-type.model';
import { NotificationService } from "../../shared/services/notification.service";
import { NotificationSearchDto } from "../../shared/models/NotificationSearchDto.model";
import { Location } from '@angular/common';
import { InboxConfig } from "../../shared/models/inbox-config.model";
import { InboxConfigService } from "../../shared/services/inbox-config.service";

@Component({
  selector: 'app-employee-file-document-view',
  templateUrl: './employee-file-document-view.component.html',
  styles: []
})
export class EmployeeFileDocumentViewComponent implements OnInit, OnDestroy {
  loaded = false;
  loadingPeriod = false;
  loadingDocument = false;
  activeRow = 0;
  selectedPeriod: GroupEmployeeFileDocumentView = GroupEmployeeFileDocumentView.Actual;
  grupoPeriodo = GroupEmployeeFileDocumentView;
  items: FileDocument[] = [];
  isOpen = false;
  selectedDoc: FileDocument;
  emp: Employee;
  empId: number;
  setId: number;
  empFiscalIdMask: string;
  private empSub: any;
  initials: string;
  docId = 0;
  filePdf = "";
  fileName = "";
  docTitle = "";
  organizationalUnits: OrganizationalUnit[];
  filteredTypes: DocumentationType[] = [];
  docTypesStorage: DocumentationType[] = [];
  filteredTypesID: number[] = [];
  tmpFilter: DocumentationType[] = [];
  isFilterOpen = false;
  documentationTypes: DocumentationType[];
  hasNotificationPending = false;
  dto: NotificationSearchDto;
  selectedInboxConfig: InboxConfig;
  entryPoint: InboxConfig;
  dtNames: string;
  configs: InboxConfig[];
  itemClass: string;
  totalItems = 0;
  isCandidate = false;
  showQueries = false;
  showButtonPending:Boolean = false;
  constructor(private msjService: MessageService,
    private employeeDocumentService: FileDocumentService,
    private employeeService: EmployeeService,
    private fileService: FileService,
    private route: ActivatedRoute,
    private organizationalUnitService: OrganizationalUnitService,
    private documentationTypesService: DocumentationTypesService,
    private notifService: NotificationService,
    private _location: Location,
    private inboxConfigService: InboxConfigService
  ) { }

  ngOnInit() {
    this.dto = {} as NotificationSearchDto;
    this.items = [];
    this.employeeDocumentService.subscribeToPagedDocumentsList().subscribe(
      data => {
        this.items = data;
        this.totalItems = this.employeeDocumentService.getPagedEmployeeDocumentsCount();
        this.AdjetivationFiltered();
        this.showButtonPending = this.employeeDocumentService.showButtonPending(this.documentationTypes);
      },
      err => this.msjService.showError(err),
    );
    this.empSub = this.route.params.subscribe(params => {
      this.empId = +params['id'];
      this.docId = +params['idDoc'];
      this.isCandidate = params['isCand']== "true";
      this.employeeDocumentService.cleanDocuments();
      this.documentationTypesService.Clear();
    });

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
      .getContainer(id.toString())
      .subscribe(
        res => {
          this.emp = res;

          // Parseo del identificador fiscal
          this.empFiscalIdMask = this.organizationalUnits.find(x => x.id === this.emp.organizationalUnitId).country.fiscalIdMask;
          this.empFiscalIdMask = this.maskSplited(this.empFiscalIdMask);
          this.hasPending(res.userId);
          this.initials = this.emp.lastName + ' ' + this.emp.name;
          this.findDocumentsTypes(this.isCandidate);
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

  selectedDocumentationType($event) {
    this.documentationTypes.filter(t => t.name === $event).forEach(d => this.tmpFilter.push(d));
  }

  closeQueryDocument($event: boolean) {
    const index = this.items.findIndex(d => d.id === this.selectedDoc.id);
    if (index !== -1) {
      Object.assign(this.items[index], { threadClosed: $event });
      this.items = [...this.items];
    }
  }

  filter() {
    this.filteredTypes = this.tmpFilter;
    this.loadDocuments();
    this.toggleFilter();
  }

  clearFilter() {
    this.filteredTypes = [];
    this.loadDocuments();
    this.toggleFilter();
  }

  toggleFilter() {
    this.tmpFilter = this.filteredTypes;
    this.isFilterOpen = !this.isFilterOpen;
  }


  private loadDocuments() {
    let period: GroupEmployeeFileDocumentView;
    if (this.docId > 0) {
      this.employeeDocumentService.getDocumentDetail(this.docId).toPromise()
        .then(res => {
          this.selectedDoc = res;
          period = GroupEmployeeFileDocumentView.Actual;
          const hoy = new Date();
          if (this.selectedDoc.documentDate.getFullYear() == hoy.getFullYear()) {
            period = GroupEmployeeFileDocumentView.Actual;
          }
          if (this.selectedDoc.documentDate.getFullYear() == hoy.getFullYear() - 1) {
            period = GroupEmployeeFileDocumentView.Pasado;
          }
          if (this.selectedDoc.documentDate.getFullYear() < hoy.getFullYear() - 1) {
            period = GroupEmployeeFileDocumentView.Anterior;
          }
          this.refreshDocuments(period);
        });
    } else {
      //  Cargo periodo actual
      period = GroupEmployeeFileDocumentView.Actual;
      this.refreshDocuments(period);
    }

  }

  refreshDocuments(period: GroupEmployeeFileDocumentView) {
    this.loadingPeriod = true;
    this.selectedPeriod = period;
    this.employeeDocumentService.setSelectedPeriod(period);
    if (this.selectedInboxConfig.documentationTypeIds && this.selectedInboxConfig.documentationTypeIds.length > 0) {
      // Si es el inbox que tiene todos los docTypes, se limpian los filtros
      this.filteredTypes = [];
    }
    //Obtengo los tipos documentales que puede ver el actor logueado
    this.filteredTypesID = [];
    this.docTypesStorage = JSON.parse(localStorage.getItem("DocumentationTypes"));
    this.docTypesStorage.values[0].value.forEach(doctype => {
      this.filteredTypesID.push(doctype.id);
    });


    if (this.organizationalUnits == null) {
      this.organizationalUnitService.getTreeInMemory()
        .then(ous => {
          this.organizationalUnits = ous;
          this.doRefreshDocuments();
        },
          err => this.msjService.showError(err)
        );
    } else {
      this.doRefreshDocuments();
    }
  }

  private doRefreshDocuments() {    
    const docTypesToFilter = this.filteredTypes.length > 0
      ? this.filteredTypes.map(t => t.id)
      : this.filteredTypesID;
    this.employeeDocumentService.refreshDocuments(this.emp, this.organizationalUnits, docTypesToFilter, this.selectedInboxConfig).toPromise().then(() => {
      //Si tengo filtros por tipo documental a nivel de actor, los filtro
      this.items = this.items.filter(i => this.filteredTypesID.some(x => x.toString() == i.documentationTypeId));
      if (!this.selectedInboxConfig.isDefaultConfig) {
        //Si tengo una vista/filtro(InboxConfig) filtro por los tipos documentales configurados para esa vista
        this.items = this.items.filter(i => this.selectedInboxConfig.documentationTypeIds.includes(+i.documentationTypeId));
        this.selectedDoc = this.selectedDoc && this.selectedInboxConfig.documentationTypeIds.includes(+this.selectedDoc.documentationTypeId) ? this.selectedDoc : null;
        this.dtNames = this.selectedInboxConfig.documentationTypes.map(dt => dt.name).join(' / ');
      }
      if (this.items.length > 0) {
        let itemToLoad = 0;
        if (this.docId > 0) {
          for (let i = 0; i < this.items.length; i++) {
            if (this.items[i].id == this.docId) {
              itemToLoad = i;
              break;
            }
          }
        }
        if (this.docId > 0) {
          this.openDocument(this.items[itemToLoad]);
        }
      }
      this.loadingPeriod = false;
    });
  }

  changeExpander(period: GroupEmployeeFileDocumentView) {
    if (period !== this.selectedPeriod) {
      this.refreshDocuments(period);
    }
  }
  openDocument(doc: FileDocument) {
    this.loadingDocument = true;
    this.setIsOpen(true);
    this.activeRow = doc.id;
    this.filePdf = "";
    this.selectedDoc = null;
    this.employeeDocumentService.getDocumentDetail(doc.id).toPromise()
      .then(res => {
        const sDoc = res;
        if (!sDoc.isUploadPending()) {
          this.fileService.getDocumentFilePdfByIdBase64(sDoc.id, this.emp.id).toPromise().then(
            file => {
              this.selectedDoc = sDoc;
              this.selectedDoc.employeeCollaborationData = doc.employeeCollaborationData;
              this.selectedDoc.lawyerCollaborationData = doc.lawyerCollaborationData;
              this.docTitle = this.selectedDoc.documentationTypeName;
              this.filePdf = file.base64;
              const docTypeName = this.selectedDoc?.documentationTypeName?.toLowerCase() || '';
              this.showQueries = docTypeName.includes('recibos') || docTypeName.includes('de haberes');
              this.fileName = file.fileName;
              this.msjService.close();
              this.loadingDocument = false;
            },
            err => this.msjService.showError(err)
          );
        } else {
          this.selectedDoc = res;
          this.selectedDoc.employeeCollaborationData = doc.employeeCollaborationData;
          this.selectedDoc.lawyerCollaborationData = doc.lawyerCollaborationData;
          this.docTitle = this.selectedDoc.documentationTypeName;
          const docTypeName = this.selectedDoc?.documentationTypeName?.toLowerCase() || '';
          this.showQueries = docTypeName.includes('recibos') || docTypeName.includes('de haberes');
          this.filePdf = null;
          this.loadingDocument = false;
        }
      });

  }

  reloadDocument() {
  }


  notifToEmployee() {
    this.dto.userId = this.emp.userId.toString();
    this.notifService.notifPendingAction(this.dto).toPromise().then(
      () => {
        this.msjService.showInfo('Se ha notificado el empleado exitosamente');
      },
      error => this.msjService.showError(error)
    );
  }

  hasPending(userId: number) {
    this.notifService.hasPendingAction(userId).toPromise().then(
      result => {
        this.hasNotificationPending = result ? true : false;
      },
      error => {
        this.msjService.showError(error);
      }
    );
  }

  goEmployeeDetail() {
    this._location.back();
  }

  documentClose() {
    this.isOpen = false;
  }
  private getInboxConfigs() {
    return this.inboxConfigService.getByOuId(this.emp.organizationalUnitId).toPromise()
      .then(res => {
        this.configs = res;
        this.entryPoint = res.find(c => c.isEntryPoint);
        this.selectedInboxConfig = this.entryPoint;
        this.configs.forEach(config => {
          config.documentationTypes = [];
          config.isDefaultConfig = !config.documentationTypeIds;
          this.documentationTypes.forEach(dt => {
            if (!config.isDefaultConfig && config.documentationTypeIds.includes(dt.id)) {
              config.documentationTypes.push(dt);
            }
          });

        });
        this.loadDocuments();
      })
      .catch(() => Promise.resolve(null));
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

  findDocumentsTypes(isCand: boolean)
  {
    // por ahora que estamos en regresiva
    // condicionamos la búsqueda de los DocumentsType para Empleados y Candidatos
    if (!isCand)
    {
    this.documentationTypesService.get(this.emp.organizationalUnitId).toPromise().then(
      docTypes => {
        this.documentationTypes = docTypes;

        if (this.documentationTypes && this.documentationTypes.length > 1) {
          this.documentationTypes = this.documentationTypes.sort((a, b) => a.name ? a.name.localeCompare(b.name) : b.name ? -1 : 1);
        }

        this.loaded = true;
        this.getInboxConfigs();
      },
      err => this.msjService.showError(err)
    );
    }
    else{
      this.documentationTypesService.getToCandidates(this.emp.organizationalUnitId).toPromise().then(
        docTypes => {
          this.documentationTypes = docTypes;

          if (this.documentationTypes && this.documentationTypes.length > 1) {
            this.documentationTypes = this.documentationTypes.sort((a, b) => a.name ? a.name.localeCompare(b.name) : b.name ? -1 : 1);
          }

          this.loaded = true;
          this.getInboxConfigs();
        },
        err => this.msjService.showError(err)
      );
    }
  }
  AdjetivationFiltered(){
    if(this.documentationTypes)
      {
        this.documentationTypes = this.documentationTypes.filter(d => this.filteredTypesID.includes(d.id));
      }
  }
}
