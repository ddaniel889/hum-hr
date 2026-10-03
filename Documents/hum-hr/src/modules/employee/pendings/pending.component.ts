import { Component, OnInit } from '@angular/core';
import { FileDocument } from '../../shared/models/file-document.model';
import { FileDocumentService } from '../../shared/services/file-document.service';
import { MessageService } from '../../shared/errorHandler/message.service';
import { GroupEmployeeFileDocumentView } from '../../shared/models/group-employee-file-document-view.model';
import { DocumentationType } from '../../shared/models/documentation-type.model';
import { DocumentationTypesService } from '../../shared/services/documentation-types.service';
import { FilterPipe } from '../../shared/pipes/filter.pipe';
import { FileService } from '../../shared/services/file.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ProfileService } from '../../shared/services/profile.service';
import { Certificate, CertificateType } from '../../shared/models/certificate.model';
import { OrganizationalUnit } from '../../shared/models';
import { OrganizationalUnitService } from '../../shared/services/organizational-unit.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-pending',
  templateUrl: './pending.component.html',
  styles: []
})
export class PendingComponent implements OnInit {
  loaded = false;
  isOpen = false;
  fileDocuments: any[] = [];
  documentationTypes: DocumentationType[] = [];
  documentationType: DocumentationType;
  selectedDoc: FileDocument;
  filePdf = "";
  fileName = "";
  docId = 0;
  certificates: Certificate[] = [];
  countSignatureFiles = 0;
  currentOu: OrganizationalUnit;
  showQueries = false;
  private docSub: any;


  constructor(private fileDocumentSvc: FileDocumentService,
    private msjService: MessageService,
    private documentationTypesSvc: DocumentationTypesService,
    private fileService: FileService,
    private profileService: ProfileService,
    private router: Router,
    private route: ActivatedRoute,
    private ref: ChangeDetectorRef,
    private organizationalUnitService: OrganizationalUnitService) { }

  ngOnInit() {
    this.fileDocumentSvc.setSelectedDataGroup(GroupEmployeeFileDocumentView.Pendings);
    this.fileDocumentSvc.subscribeToDocumentsList().subscribe(
      data => {
        this.countSignatureFiles = 0;
        this.fileDocuments = data;
        const signFiles = this.fileDocuments.filter(d => d.pendingIcon === 'signature');
        this.setItemsLabels();
      },
      err => this.msjService.showError(err),
    );

    this.docSub = this.route.params.subscribe(params => {
      this.docId = +params['idDoc'];
      this.fileDocumentSvc.cleanDocuments();
    });

    this.profileService.getMySignCertificates(+localStorage.getItem("organizationId")).then(
      certificates => {
        this.certificates = certificates.filter(c => c.massiveSignatureAction && !c.isPending && c.typeId === CertificateType.Employee);
        this.organizationalUnitService.getTreeInMemory().then(res => {
          this.currentOu = res.find(ou => ou.id === +localStorage.getItem("organizationId"));
        });
      },
      err => this.msjService.showError(err)
    );

    this.documentationTypesSvc.get(localStorage.getItem("organizationId"), true).toPromise().then(
      docTypes => {
        this.documentationTypes = docTypes;

        if (this.documentationTypes && this.documentationTypes.length > 1) {
          this.documentationTypes = this.documentationTypes.sort((a, b) => a.name ? a.name.localeCompare(b.name) : b.name ? -1 : 1);
        }

        this.refresh();
      },
      err => this.msjService.showError(err)
    );
  }

  refresh() {
    this.loaded = false;
    this.fileDocumentSvc.refreshMyDocuments().toPromise().then(() => {
      this.loaded = true;
    });
  }

  refreshPromise(): Promise<void> {
    this.loaded = false;
    return this.fileDocumentSvc.refreshMyDocuments().toPromise().then(() => {
      this.loaded = true;
    });
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

  openSelectedDocument() {
    if (!this.selectedDoc) {
      return;
    }
    if (!this.selectedDoc.employeeCollaborationData.viewDate) {
      this.selectedDoc.employeeCollaborationData.viewDate = new Date();
    }
    this.setIsOpen(true);
  }

  private async setItemsLabels() {
    const filterPipe = new FilterPipe();
    await this.fileDocuments.forEach(doc => {
      const docType = this.documentationTypes.find(
        d => d.id === +doc.documentationTypeId
      );
      if (docType) {
        const contentList: String[] = [];
        const temporalityList: String[] = [];

        // Agrego info del icono
        if (docType.documentationLoadContentName === 'EMPLEADO' && doc.isUploadPending()) {
          // Formulario pendiente
          if (docType.exteralForm && docType.exteralForm.length > 0) {
            doc.pendingIcon = 'form';
          } else {
            // Upload pendiente
            doc.pendingIcon = 'upload';
          }
        } else {
          if (doc.isEmployeeSignPending()) {
            // Firma pendiente
            doc.pendingIcon = 'signature';
            this.countSignatureFiles++;
          } else {
            // Visto pendiente
            doc.pendingIcon = 'view';
          }
        }


        docType.visualizationMetadatas.forEach(element => {
          const meta = doc.metadatas.find(
            m => m.systemName === element.systemName
          );

          if (meta) {
            if (element.key === "content") {
              contentList[element.order] = meta.metadataValue;
              doc.contentTitle = contentList.join(" - ");
            }

            if (element.key === "temporality") {
              doc.temporalityTitle = filterPipe.transform(
                meta.systemName,
                meta.metadataValue
              );
              temporalityList[element.order] = doc.temporalityTitle;
              doc.temporalityTitle = temporalityList.join(" - ");
            }
          }
        });
      }
    });
  }

  refreshDoc() {
    this.refreshPromise().then(() => {
      this.setIsOpen(false);
      if (this.selectedDoc.documentationTypeSelected.visualizationOption.systemName === 'HideWhenIsFinished') {
        this.selectedDoc = null;
        return;
      }
      const docInList = this.fileDocuments.find(x => x.id == this.selectedDoc.id);
      if (docInList && docInList.hasFiles && docInList.isEmployeeSignPending()) {
        // Si esta en la lista y esta pendiente de firma lo selecciono para firmar
        const docId = this.docId > 0 ? this.docId : docInList.id;
        if (docId > 0) {
          const docToSelect = this.fileDocuments.find(x => x.id == docId);
          if (docToSelect) {
            this.selectDocument(docToSelect);
            this.openSelectedDocument();
            return;
          }
        }
      }

      if (!docInList) {
        // Si no está en la lista no tengo que hacer nada más
        this.selectedDoc = null;
        return;
      }

      if (docInList.wasSignedByEmployee || !this.selectedDoc.isEmployeeSignPending()) {
        // Si está en la lista pero no tiene sentido que siga estando lo elimino de la lista
        this.removeSelectedDocument();
      } else {
        // Si esta en la lista y tiene sentido que esté lo vuelvo a seleccionar
        this.getDocumentDetail(docInList).then((detailedDoc) => {
          this.selectedDoc = detailedDoc;
        });
      }
      this.openSelectedDocument();
    });
  }

  submitFormio(event) {
    this.refreshDoc();
    // Fuerzo la deteccion de cambios para que se oculte mientras estoy reconstruyendo el modelo
    this.ref.detectChanges();
  }

  removeSelectedDocument() {
    const index = this.fileDocuments.map(x => x.id).indexOf(this.selectedDoc.id);
    if (this.fileDocuments[index].pendingIcon === 'signature') {
      // Si era firmable y lo estoy eliminando modifico el count de documentos a firmar
      this.countSignatureFiles--;
    }
    this.fileDocuments.splice(index, 1);
    this.selectedDoc = null;
  }

  replaceSelectedDocument(doc: FileDocument) {
    const index = this.fileDocuments.map(x => x.id).indexOf(doc.id);
    this.fileDocuments.splice(index, 1, doc);
    this.selectedDoc = doc;
  }

  getDocumentDetail(doc: FileDocument): Promise<FileDocument> {
    let docFinal: FileDocument;
    const docTemp = doc;
    return this.fileDocumentSvc.getMyDocumentDetail(doc.id).toPromise().then(newDoc => {
      docFinal = newDoc;
      docFinal.employeeCollaborationData = docTemp.employeeCollaborationData;
      docFinal.lawyerCollaborationData = docTemp.lawyerCollaborationData;

      this.documentationType = this.documentationTypes.find(dt => dt.id === +docFinal.documentationTypeId);
      this.getFileInfo(doc);
      return docFinal;
    },
      err => {
        this.msjService.showError(err);
        if (err.code === "WFPROF001" || err.code === "CPPAPIV011") {
          this.router.navigate(['/employee/pendings']);
          return null;
        }
        return null;
      });
  }

  selectDocument(doc: any) {
    doc.loading = true;
    // Borrar anterior si era solo lectura
    if (this.selectedDoc) {
      const docInList = this.fileDocuments.find(x => x.id == this.selectedDoc.id);
      if (docInList && doc.id !== this.selectedDoc.id) {
        if (!this.selectedDoc.isEmployeeActionPending() && docInList.employeeCollaborationData.viewDate) {
          this.removeSelectedDocument();
        }
      }
    }
    this.getDocumentDetail(doc).then((detailedDoc) => {
      this.selectedDoc = detailedDoc;
      const docTypeName = this.selectedDoc?.documentationTypeName?.toLowerCase() || '';
      this.showQueries = docTypeName.includes('recibos') || docTypeName.includes('de haberes');
      this.openSelectedDocument();
      doc.loading = false;
    });
  }

  getFileInfo(doc: FileDocument) {
    if (!doc.isUploadPending()) {
      this.fileService.getMyDocumentFilePdfByIdBase64(doc.id).toPromise().then(
        file => {
          this.filePdf = file;
          this.fileName = this.fileDocumentSvc.getDocumentFileName(doc);
          this.msjService.close();
          // Fuerzo la deteccion de cambios para que se oculte mientras estoy reconstruyendo el modelo
          this.ref.detectChanges();
        },
        err => {
          this.msjService.showError(err);
        }
      );
    } else {
      this.filePdf = null;
    }
  }

  goToMassiveSign() {
    this.router.navigate(['/employee/sign-massive']);
  }
}
