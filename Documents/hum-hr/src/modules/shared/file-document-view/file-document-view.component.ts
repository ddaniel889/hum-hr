import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  ViewChild,
  ViewChildren,
  QueryList,
  AfterViewInit,
  ChangeDetectorRef
} from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { FileDocumentMetadataComponent } from '../file-document-metadata/file-document-metadata.component';
import { FileDocumentSignComponent } from '../file-document-sign/file-document-sign.component';
import { FileDocument, StatusDoc } from '../models/file-document.model';
import { FileDocumentUploadComponent } from '../file-document-upload/file-document-upload.component';
import { FileType } from '../models/file-type.model';
import { FileDocumentService } from '../services/file-document.service';
import { MessageService } from '../errorHandler/message.service';
import { DocumentationType } from '../models/documentation-type.model';
import { DocumentationService } from '../services/documentation.service';
import { FormioCardinalComponent } from '../../formioCs/formio-cardinal.component';
import { MessageAtributtes, MessageType } from '../models/message-types.model';
import { GenericBottomSheetComponent } from '../generic-bottom-sheet/generic-bottom-sheet.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-file-document-view',
  templateUrl: './file-document-view.component.html',
  styles: []
})
export class FileDocumentViewComponent implements OnInit, OnChanges, AfterViewInit {
  @ViewChild(FileDocumentSignComponent) signComponent: FileDocumentSignComponent;
  @ViewChild(FileDocumentUploadComponent) uploadComponent: FileDocumentUploadComponent;
  @ViewChildren(FormioCardinalComponent) formioCardinal: QueryList<FormioCardinalComponent>;

  @Output() dialogCloseEvent = new EventEmitter<boolean>();
  @Output() mobileCloseEvent = new EventEmitter<boolean>();
  @Output() refreshDocEvent = new EventEmitter<boolean>();
  @Output() submitFormioEvent = new EventEmitter<boolean>();
  @Output() finishCancelEvent = new EventEmitter<boolean>();
  @Output() queryChanged = new EventEmitter<boolean>();

  @Input() employerSign = false;
  @Input() signEnabled = false;
  @Input() uploadEnabled = false;
  @Input() autoView = false;
  @Input() isNewDocument = false;
  @Input() allowMultipleUploadFiles = true;
  @Input() doc: FileDocument;
  @Input() filePdf = "";
  @Input() fileName = "";
  @Input() FileHeaderTitle = "";
  @Input() filterDocumentationTypes = [];
  @Input() fileBlob: Blob;
  @Input() documentationType: DocumentationType;


  // Indicadores de que mostrar y que no
  @Input() showDocumentState = false;
  @Input() showDocumentStateBottom = false;
  @Input() showWelcome = false;
  @Input() showSpinner = true;
  @Input() showPrint = true;
  @Input() showSave = true;
  @Input() showZoomIn = true;
  @Input() showZoomOut = true;
  @Input() showRemove = false;
  @Input() showFileDocumentHeader = true;
  @Input() showFileHeader = false;
  @Input() showAll = true;

  @Input() isZip = false;
  @Input() showQueries = false;

  signing:boolean;
  allowsFormio = false;
  showFormio = false;
  showChapa = false;
  showUploader = false;
  fileImage: any;
  fileType: FileType;
  togglePreview = false;
  canceledChapa = false;

  isSignActive = false;
  isQueryActive = false;

  accion: Function;
  saving = false;
  constructor(private bottomSheet: MatBottomSheet,
    private fileDocumentService: FileDocumentService,
    private msjService: MessageService,
    private documentationService: DocumentationService,
    private _bottomSheet: MatBottomSheet,
    private router: Router,
    private ref: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.resetValues();
  }

  public ngAfterViewInit(): void {
    this.accion = function () {
      this.saving = true;
      this.formioCardinal.first.submitForm();
    };
  }
  private resetValues() {
    this.fileType = undefined;
    if (!this.doc) {
      this.showWelcome = true;
      this.showSpinner = false;
    } else {
      this.allowsFormio = false;
      // Fuerzo la deteccion de cambios para que se oculte mientras estoy reconstruyendo el modelo
      this.ref.detectChanges();

      this.showUploader = this.doc.isUploadPending() || this.isNewDocument;

      if (!this.showUploader) {
        this.showRemove = false;
      }

      this.showWelcome = false;
      this.showSpinner = false;
      this.allowsFormio = this.documentationType && this.documentationType.exteralForm != null && this.documentationType.documentationLoadContentName != 'RRHH';
      this.canceledChapa = this.doc.isCanceled();
    }

    this.showChapa = this.showWelcome || (this.doc.isCanceled() && !this.ShowPdf());
    this.showFormio = false;
    this.saving = false;
  }



  ngOnChanges() {
    this.resetValues();
  }

  dialogClose() {
    this.bottomSheet.dismiss();
    this.dialogCloseEvent.emit(true);
  }
  signClass(): string {
    if (this.signing) {
      return 'signed';
    }
    if (this.ShowEmployeeSignature()) {
      return 'not-signed';
    }
    return null;
  }

  ShowEmployeeAction(): boolean {
    if (this.doc == null && !this.ShowPdf() && !this.haveToShowSpinner()) {
      return false;
    }
    let fimEmp = false;
    if (this.doc) {
      fimEmp = this.doc && this.doc.employeeCollaborationData && this.doc.employeeCollaborationData.isActionPending() && !this.doc.isUploadPending();
    }

    return this.signEnabled && fimEmp;
  }

  ShowEmployeeSignature(): boolean {
    if (this.doc == null && !this.ShowPdf() && !this.haveToShowSpinner()) {
      return false;
    }
    let fimEmp = false;
    if (this.doc) {
      fimEmp = this.doc && this.doc.employeeCollaborationData && this.doc.employeeCollaborationData.isActionPending() && !this.doc.isUploadPending();
    }

    return this.signEnabled && fimEmp;
  }

  mobileClose() {
    this.mobileCloseEvent.emit(true);
  }

  showMetadatos() {
    this.bottomSheet.open(FileDocumentMetadataComponent, {
      hasBackdrop: true,
      data: {
        doc: this.doc,
        showOtrosMetadatos: true
      },
    });
  }

  deleteFileDocument() {
    const parameters: MessageAtributtes = {
      bodyText: '¡Estás por eliminar documentación!',
      infoText: 'Una vez realizada esta operación no podrá deshacerse.',
      type: MessageType.CaptchaNumbers
    };

    const t = this._bottomSheet.open(GenericBottomSheetComponent, { data: parameters, disableClose: true });
    t.instance.close.subscribe((response: boolean) => {
      if (response) {
        this.showSpinner = true;
        this.fileDocumentService.delete(+this.doc.id).toPromise()
          .then(r => {
            this.msjService.showInfo('Eliminado con éxito');
            this.filePdf = '';
            this.fileBlob = null;
            this.doc = null;
            this.resetValues();
            this.showSpinner = false;
            this.finishCancelEvent.emit(true);
          })
          .catch(e => {
            this.msjService.showError(e);
            this.showSpinner = false;
          });
      }
    });
  }
  cancelFileDocument() {
    const parameters: MessageAtributtes = {
      bodyText: 'Estás por rechazar un Documento',
      infoText: '¿Deseas continuar? Una vez realizada esta operación no podrá deshacerse',
      inputLabel: 'Motivo de rechazo*',
      inputHint:'*Puedes indicar un motivo de rechazo',
      type: MessageType.TextAreaYesNo
    };

    const t = this._bottomSheet.open(GenericBottomSheetComponent, { data: parameters, disableClose: true });
    t.instance.close.subscribe((buttonSheetResponse: any) => {
      if (buttonSheetResponse.response) {

        this.showSpinner = true;
        this.fileDocumentService.cancel(+this.doc.id, buttonSheetResponse.text,0).toPromise()
          .then(r => {
            this.msjService.showInfo('El Documento ha sido rechazado');
            this.showSpinner = false;
            this.doc.statusId = StatusDoc.Canceled;
            this.doc.rejectedMotive = buttonSheetResponse.text;
            this.doc.rejectedDate = new Date();
            this.finishCancelEvent.emit(true);
          })
          .catch(e => {
            this.msjService.showError(e);
            this.showSpinner = false;
          });
      }
    });
  }

  ShowPdf(): boolean {
    return (this.filePdf && this.filePdf != "") || this.fileBlob != null;
  }

  haveToShowSpinner(): boolean {
    return !this.ShowPdf() && this.showSpinner;
  }


  get DocumentStateClass(): string {
    if (this.showDocumentState) {
      return "w-chips";
    } else {
      return "no-chips";
    }
  }

  signingChanged(signingChange: boolean) {
    this.signing = signingChange;
    this.isSignActive = signingChange;
  }

  afterSigning(event: boolean) {
    if (event) {
      this.doc.employeeCollaborationData.signatureDate = new Date();
    }
    this.refreshDocEvent.emit(true);
    this.resetValues();
  }

  fileSelect(ev: FileType, openPreview = false) {
    this.fileType = ev;
    if (ev.isPdf) {
      this.filePdf = ev.base64;
    }
    this.showRemove = true;

    if (openPreview) {
      this.togglePreview = true;
    }
  }

  closePreview() {
    this.togglePreview = false;
  }

  toggleFormio(showFormio) {
    this.showFormio = showFormio;
  }

  submitFormio(submission) {
    if (!submission) {
      setTimeout(() => {
        this.saving = false;
        this.ref.detectChanges();
      }, 2000);
      this.ref.detectChanges();
      return;
    }

    this.saving = true;
    this.doc.formioFormAlias = this.documentationType.exteralForm;
    this.doc.formioSubmissionId = submission._id;
    this.doc.documentationTypeSelected = this.documentationType;

    if (this.isNewDocument) {
      // Creo el documento
      this.documentationService.createEmployeeDocument(this.doc, null).toPromise()
        .then(res => this.submitFormioEvent.emit(true))
        .catch(err => {
          this.msjService.showError(err);
          this.submitFormioEvent.emit(true);
        })
        .then(() => this.saving = false);
    } else {
      this.documentationService.employeeUpload(this.doc, null).toPromise()
        .then(() => {
          this.saving = false;
          this.submitFormioEvent.emit(true);
          this.router.navigate(['/employee/pendings']);
        })
        .catch(err => {
          this.msjService.showError(err);
          this.submitFormioEvent.emit(true);
          this.saving = false;
        });
    }
  }

  enviarFormulario() {
    this.accion();
  }

  fileUploaded(event: boolean) {
    if (this.doc.employeeCollaborationData) {
      this.doc.employeeCollaborationData.uploaded = event;
    }
    this.doc.hasFiles = true;
    this.refreshDocEvent.emit(event);
    this.filePdf = '';
    this.fileBlob = null;
    this.doc = null;
    this.resetValues();
  }

  isCanceled() {
    if (this.doc) {
      return this.doc.statusId == StatusDoc.Canceled;
    } else {
      return false;
    }
  }
  cleanFiles() {
    this.filePdf = null;
    this.fileBlob = null;
    this.fileType = undefined;
  }
}
