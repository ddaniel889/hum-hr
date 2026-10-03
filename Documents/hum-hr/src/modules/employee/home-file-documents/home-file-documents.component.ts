import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from '../../shared/errorHandler/message.service';
import { OrganizationalUnit } from '../../shared/models';
import { FileDocument } from '../../shared/models/file-document.model';
import { GroupEmployeeFileDocumentView } from '../../shared/models/group-employee-file-document-view.model';
import { FileDocumentService } from '../../shared/services/file-document.service';
import { FileService } from '../../shared/services/file.service';
import { DocumentationTypesService } from '../../shared/services/documentation-types.service';
import { DocumentationType } from '../../shared/models/documentation-type.model';
import { InboxConfigService } from '../../shared/services/inbox-config.service';
import { InboxConfig } from '../../shared/models/inbox-config.model';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-home-file-documents',
  templateUrl: './home-file-documents.component.html',
  styles: []
})
export class HomeFileDocumentsComponent implements OnInit {
  isOpen = false;
  loaded = false;
  loadingPeriod = false;
  activeRow = 0;
  selectedPeriod: GroupEmployeeFileDocumentView = GroupEmployeeFileDocumentView.Actual;
  grupoPeriodo = GroupEmployeeFileDocumentView;
  items: FileDocument[] = [];
  selectedDoc: FileDocument;

  showQueryView = false;

  filePdf = "";
  fileName = "";
  docTitle = "";
  organizationalUnits: OrganizationalUnit[];
  legend: string;
  docId = 0;
  documentationTypes: DocumentationType[];
  filteredTypes: DocumentationType[] = [];
  tmpFilter: DocumentationType[] = [];
  tittleThisYear = 'Actualmente';
  tittleLastYear = 'El año pasado';
  tittlepreviously = 'Anteriormente';
  isFilterOpen = false;
  documentationType: DocumentationType;
  ouId: string;
  configs: InboxConfig[];
  entryPoint: InboxConfig;
  selectedInboxConfig: InboxConfig;
  dtNames: string;
  totalItems = 0;
  showQueries: boolean = false;

  private docSub: any;

  constructor(private employeeDocumentService: FileDocumentService,
    private msjService: MessageService,
    private fileService: FileService,
    private inboxConfigService: InboxConfigService,
    private route: ActivatedRoute,
    private documentationTypesService: DocumentationTypesService,
    private ref: ChangeDetectorRef,
    private router: Router) { }

    toggleQueryView() {
      this.showQueryView = !this.showQueryView;
    }

    onQueryChanged(hasQuery: boolean) {
      if (this.selectedDoc) {
        (this.selectedDoc as any).hasQuery = hasQuery;
      }
    }

  ngOnInit() {
    this.loaded = false;
    this.loadingPeriod = true;
    this.ouId = localStorage.getItem("organizationId");

    this.employeeDocumentService.subscribeToPagedDocumentsList().subscribe(
      data => {
        this.items = data;
        this.totalItems = this.employeeDocumentService.getPagedEmployeeDocumentsCount();
      },
      err => this.msjService.showError(err),
    );

    this.docSub = this.route.params.subscribe(params => {
      this.docId = +params['idDoc'];
      this.employeeDocumentService.cleanDocuments();
    });

    this.documentationTypesService.get(this.ouId, true).toPromise().then(
      docTypes => {
        this.documentationTypes = docTypes;

        if (this.documentationTypes && this.documentationTypes.length > 1) {
          this.documentationTypes = this.documentationTypes.sort((a, b) => a.name ? a.name.localeCompare(b.name) : b.name ? -1 : 1);
        }

        this.getInboxConfigs();
      },
      err => this.msjService.showError(err)
    );

    this.legend = this.route.snapshot.data['legend'];

    if (this.legend) {
      this.msjService.showInfo(this.legend);
    }

  }

  setIsOpen(value) {
    this.isOpen = value;
  }

  refresh(isInboxChange = false): void {
    if (isInboxChange) {
      this.filteredTypes = [];
      this.tmpFilter = [];
    }
    this.loadDocuments();
  }

  filter() {
    this.filteredTypes = this.tmpFilter;
    this.refresh();
    this.toggleFilter();
  }

  clearFilter() {
    this.filteredTypes = [];
    this.refresh();
    this.toggleFilter();
  }

  toggleFilter() {
    this.tmpFilter = this.filteredTypes;
    this.isFilterOpen = !this.isFilterOpen;
  }

  selectedDocumentationType($event) {
    this.documentationTypes.filter(t => t.name === $event).forEach(d => this.tmpFilter.push(d));
  }

  private loadDocuments() {
    let period: GroupEmployeeFileDocumentView;
    if (this.docId > 0) {
      this.employeeDocumentService.getMyDocumentDetail(this.docId).toPromise().then(res => {
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
      },
        err => {
          if (err.code === "WFPROF001" || err.code === "CPPAPIV011") {
            this.router.navigate(['/employee/home-file-documents']);
          }
          this.msjService.showError(err);
        }
      );
    } else {
      period = GroupEmployeeFileDocumentView.Actual;
      this.refreshDocuments(period);
    }
  }

  refreshDocuments(period: GroupEmployeeFileDocumentView) {
    this.loadingPeriod = true;
    this.employeeDocumentService.cleanDocuments();
    this.selectedPeriod = period;
    this.employeeDocumentService.setSelectedPeriod(this.selectedPeriod);
    this.doRefreshDocuments();
  }

  queryChange($event: boolean) {
    const index = this.items.findIndex(d => d.id === this.selectedDoc.id);
    if (index !== -1) {
      Object.assign(this.items[index], {
        hasMessage: $event,
        threadClosed: false
      });
      this.items = [...this.items];
      this.selectedDoc.hasMessage = $event;
      this.selectedDoc.threadClosed = false;
    }
  }

  private doRefreshDocuments() {
    this.loaded = false;
    this.employeeDocumentService.refreshMyDocuments(this.filteredTypes.map(t => t.id), this.selectedInboxConfig).toPromise().then(() => {
      if (!this.selectedInboxConfig.isDefaultConfig) {
        this.items = this.items.filter(i => this.selectedInboxConfig.documentationTypeIds.includes(+i.documentationTypeId));
        this.selectedDoc = this.selectedDoc && this.selectedInboxConfig.documentationTypeIds.includes(+this.selectedDoc.documentationTypeId) ? this.selectedDoc : null;
        this.dtNames = this.selectedInboxConfig.documentationTypes.map(dt => dt.name).join(' / ');
      }

      if (this.selectedDoc) {
        if (this.items.length > 0) {
          const docId = this.docId > 0 ? this.docId : (this.selectedDoc ? this.selectedDoc.id : this.docId);
          if (docId > 0) {
            this.selectedDoc = this.items.find(x => x.id == docId);
            if (this.selectedDoc != null) {
              this.openDocument(this.selectedDoc);
            }
          }
        }
      }
      this.loaded = true;
      this.loadingPeriod = false;
    });
  }

  private getInboxConfigs() {
    return this.inboxConfigService.getByOuId(+this.ouId).toPromise()
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

  changeExpander(period: GroupEmployeeFileDocumentView) {
    if (period !== this.selectedPeriod) {
      this.refreshDocuments(period);
    }
  }

  detailClass(): string {
    if (this.isOpen) {
      return 'is-open';
    } else {
      return '';
    }
  }

  openDocument(doc: FileDocument) {

    this.filePdf = "";
    this.activeRow = doc.id;
    const docTemp = doc;
    this.employeeDocumentService.getMyDocumentDetail(doc.id).toPromise().then(newDoc => {
      doc.employeeCollaborationData.viewDate = new Date();
      this.selectedDoc = newDoc;
      this.selectedDoc.employeeCollaborationData = docTemp.employeeCollaborationData;
      this.selectedDoc.lawyerCollaborationData = docTemp.lawyerCollaborationData;
      this.docTitle = this.selectedDoc.documentationTypeName;
      this.setIsOpen(true);
      const docTypeName = this.selectedDoc?.documentationTypeName?.toLowerCase() || '';
      this.showQueries = docTypeName.includes('recibos') || docTypeName.includes('de haberes');
      this.documentationType= this.documentationTypes.find(dt => dt.id === +this.selectedDoc.documentationTypeId);

      if (!this.selectedDoc.isUploadPending()) {
        this.fileService.getMyDocumentFilePdfByIdBase64(doc.id).toPromise().then(
          file => {
            this.filePdf = file;
            this.fileName = this.employeeDocumentService.getDocumentFileName(this.selectedDoc);
            this.msjService.close();
          },
          err => {
            this.msjService.showError(err);
            this.setIsOpen(false);
          }
        )
        .then(() => this.ref.detectChanges());
      } else {
        this.filePdf = null;
      }
    },
      err => {
        if (err.code === "WFPROF001" || err.code === "CPPAPIV011") {
          this.router.navigate(['/employee/home-file-documents']);
        }

        this.msjService.showError(err);
        this.setIsOpen(false);
      }
    );
  }

  submitFormio(event) {
    this.doRefreshDocuments();
  }

  refreshDoc(doc: FileDocument) {
    if (doc.documentationTypeSelected.visualizationOption.systemName === 'HideWhenIsFinished') {
      return;
    }

    this.doRefreshDocuments();
  }
}
