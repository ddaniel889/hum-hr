import { Component, OnInit } from '@angular/core';
import { FileDocument } from '../../shared/models/file-document.model';
import { FileDocumentService } from '../../shared/services/file-document.service';
import { DocumentationType } from '../../shared/models/documentation-type.model';
import { FileService } from '../../shared/services/file.service';
import { MessageService } from '../../shared/errorHandler/message.service';
import { Router } from '@angular/router';
import { GroupEmployeeFileDocumentView } from '../../shared/models/group-employee-file-document-view.model';
import { FilterPipe } from '../../shared/pipes/filter.pipe';
import { DocumentationTypesService } from '../../shared/services/documentation-types.service';
import { Certificate, CertificateType } from '../../shared/models/certificate.model';
import { ProfileService } from '../../shared/services/profile.service';
import { PersonService } from '../../shared/services/person.service';
import { UiNotificationsService } from '../../shared/services/ui-notifications.service';

@Component({
  selector: 'app-document-sign-massive',
  templateUrl: './document-sign-massive.component.html',
  styles: [
  ]
})
export class DocumentSignMassiveComponent implements OnInit {
  loaded = false;
  loading = true;
  isOpen = false;
  docOpenning = false;
  isProcessing = false;
  fileDocuments: any[] = [];
  selectedDoc: FileDocument;
  documentationType: DocumentationType;
  documentationTypes: DocumentationType[] = [];
  filePdf = "";
  fileName = "";
  selectedCertificate: Certificate;
  password: string;
  certificates: Certificate[] = [];
  countSelected = 0;

  constructor(
    private msjService: MessageService,
    private fileDocumentSvc: FileDocumentService,
    private fileService: FileService,
    private router: Router,
    private documentationTypesSvc: DocumentationTypesService,
    private profileService: ProfileService,
    private uiNotifSvc: UiNotificationsService,
    private personSvc: PersonService
  ) { }

  ngOnInit(): void {
    const loadings = [];
    loadings.push(this.documentationTypesSvc.get(localStorage.getItem("organizationId"), true).toPromise());
    loadings.push(this.profileService.getMySignCertificates(+localStorage.getItem("organizationId")));

    Promise.all(loadings).then(results => {
      this.documentationTypes = results[0];

      if (this.documentationTypes && this.documentationTypes.length > 1) {
        this.documentationTypes = this.documentationTypes.sort((a, b) => a.name ? a.name.localeCompare(b.name) : b.name ? -1 : 1);
      }

      this.certificates = results[1].filter(c => c.massiveSignatureAction && !c.isPending && c.typeId === CertificateType.Employee);
      if (this.certificates.length == 1) {
        this.selectedCertificate = this.certificates[0];
      }

      this.refresh();
    })
    .catch(err => this.msjService.showError(err))
    .then(() => this.loading = false);


    this.fileDocumentSvc.setSelectedDataGroup(GroupEmployeeFileDocumentView.SignPending);
    this.fileDocumentSvc.subscribeToDocumentsList().subscribe(
      data => {
        this.fileDocuments = data;
        this.fileDocuments.map(p => p.isSelected = true);
        this.countSelected = this.fileDocuments.length;
        this.setItemsLabels();
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

  viewtDocument(doc: any) {
    event.stopPropagation();
    this.docOpenning = true;
    this.getDocumentDetail(doc).then((detailedDoc) => {
      this.selectedDoc = detailedDoc;
      this.openSelectedDocument();
      this.docOpenning = false;
    });
  }

  selectedChange(doc: any) {
    doc.isSelected = !doc.isSelected;
    if (doc.isSelected) {
      this.countSelected++;
    } else {
      this.countSelected--;
    }
  }

  goBack() {
    this.router.navigate(['/employee/pendings']);
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

  getFileInfo(doc: FileDocument) {
    if (!doc.isUploadPending()) {
      this.fileService.getMyDocumentFilePdfByIdBase64(doc.id).toPromise().then(
        file => {
          this.filePdf = file;
          this.fileName = this.fileDocumentSvc.getDocumentFileName(doc);
          this.msjService.close();
        },
        err => {
          this.msjService.showError(err);
        }
      );
    } else {
      this.filePdf = null;
    }
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

  setIsOpen(value) {
    this.isOpen = value;
  }

  detailClass(): string {
    if (this.isOpen) {
      return 'is-open';
    } else {
      return '';
    }
  }

  onSigning() {
    this.isProcessing = true;
    const docs = this.fileDocuments.filter(d => d.isSelected);
    this.personSvc.multiplesignDocument(
      docs,
      this.selectedCertificate,
      this.password,
      null
    ).toPromise()
    .then(data => {
      this.uiNotifSvc.refreshNotifiationProcess();
      this.goBack();
    })
    .catch(err => this.msjService.showError(err))
    .then(() => this.isProcessing = false);
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

}
