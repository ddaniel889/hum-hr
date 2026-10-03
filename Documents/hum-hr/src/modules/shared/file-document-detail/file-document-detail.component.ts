import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit, ViewChildren, QueryList, OnChanges, ChangeDetectorRef } from '@angular/core';
import { FileDocument, StatusDoc } from '../models/file-document.model';
import { AuthService } from '../auth/auth.service';
import { MessageAtributtes, MessageType } from '../models/message-types.model';
import { GenericBottomSheetComponent } from '../generic-bottom-sheet/generic-bottom-sheet.component';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { FileDocumentService } from '../services/file-document.service';
import { DocumentationTypesService } from "../../shared/services/documentation-types.service";
import { MessageService } from '../errorHandler/message.service';
import { FileDocumentMetadataComponent } from '../file-document-metadata/file-document-metadata.component';
import { DocumentationType } from '../models/documentation-type.model';
import { DocumentationService } from '../services/documentation.service';
import { FormioCardinalComponent } from '../../formioCs/formio-cardinal.component';
import { DocumentationTypeSetService } from "../../shared/services/documentation-type-set.service";
import {$e} from "codelyzer/angular/styles/chars";

@Component({
  selector: 'app-file-document-detail',
  templateUrl: './file-document-detail.component.html',
  styles: []
})
export class FileDocumentDetailComponent implements OnInit, OnChanges, AfterViewInit {
  @ViewChildren(FormioCardinalComponent) formioCardinal: QueryList<FormioCardinalComponent>;

  @Input() filePdf = "";
  @Input() fileBlob: Blob;
  @Input() doc: FileDocument;
  @Input() documentationType: DocumentationType;
  @Input() isZip = false;
  @Input() fileName = "";
  @Input() setId = null;

  // Habilitan o deshabilitan cosas visuales
  @Input() showFileDocumentHeader = true;
  @Input() showCancel = false;
  @Input() showWelcome = false;
  @Input() showPrint = true;
  @Input() showSave = true;
  @Input() showZoomIn = true;
  @Input() showZoomOut = true;
  @Input() showRemove = false;
  @Input() showDelete = true;
  @Input() showAll = true;
  @Input() showMetadatas = true;
  @Input() floatingMode: false;
  @Input() showQuery = false;

  // Outputs
  @Output() finishCancelEvent = new EventEmitter<boolean>();
  @Output() submitFormioEvent = new EventEmitter<boolean>();
  @Output() mobileCloseEvent = new EventEmitter<boolean>();
  @Output() goBackEvent = new EventEmitter<boolean>();

  @Output() closedQuery = new EventEmitter<boolean>();


  canCancel: boolean;
  canDelete: boolean;
  showSpinner = false;
  showFormio = false;
  saving = false;
  allowsFormio = false;
  showChapa = false;
  canceledChapa = false;
  accion: Function;
  autoSizeDoc = false;
  isQueryActive = false;

  constructor(private authService: AuthService,
    private _bottomSheet: MatBottomSheet,
    private fileDocumentService: FileDocumentService,
    private msjService: MessageService,
    private documentationService: DocumentationService,
    private documentationTypesService: DocumentationTypesService,
    private documentationTypeSetService: DocumentationTypeSetService,
    private ref: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.resetValues();
  }

  ngOnChanges() {
    this.resetValues();
    if(this.doc != null && this.doc.employeeLegalId != null && this.doc.nroLegajo == null){
      this.documentationTypeSetService.getSetbyIdFiscal(this.doc.employeeLegalId,this.doc.organizationalUnitId).toPromise().then(
        data => {
          this.setId = data?.setId ?? 0
        },
        err => this.msjService.showError(err)
      );
    }
  }

  public ngAfterViewInit(): void {
    this.formioCardinal.changes.subscribe((comps: QueryList<FormioCardinalComponent>) => {
      this.accion = function () { this.saving = true; comps.first.submitForm(); };
    });
  }

  ShowPdf(): boolean {
    return this.filePdf != "" || this.fileBlob != null;
  }

  mobileClose() {
    this.mobileCloseEvent.emit(true);
  }

  showMetadatos() {
    this._bottomSheet.open(FileDocumentMetadataComponent, {
      hasBackdrop: true,
      data: {
        doc: this.doc,
        showOtrosMetadatos: true
      },
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
        this.fileDocumentService.cancel(+this.doc.id,buttonSheetResponse.text,this.setId ?? 0).toPromise()
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
        // this.fileDocumentService.delete(+this.doc.id).toPromise()
        this.fileDocumentService.inactive(+this.doc.id, this.setId ?? 0).toPromise()
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

  removeFile() {
    this.filePdf = null;
  }

  submitFormio(submission) {
    if (!submission) {
      setTimeout(() => {
        this.saving = false;
        this.ref.detectChanges();
      }, 2000);
      return;
    }

    this.saving = true;
    this.doc.formioFormAlias = this.documentationType.exteralForm;
    this.doc.formioSubmissionId = submission._id;
    this.doc.documentationTypeSelected = this.documentationType;

    this.documentationService.employeeUpload(this.doc, null).toPromise()
      .then(() => {
        this.submitFormioEvent.emit(true);
        this.saving = false;
      })
      .catch(err => {
        this.msjService.showError(err);
        this.submitFormioEvent.emit(true);
        this.saving = false;
      });
  }

  private resetValues() {
    if (!this.doc) {
      this.showWelcome = true;
      this.showSpinner = false;
    } else {
      this.canDelete = this.authService.RRHHManagment() || this.authService.isGestorDocumental() || this.authService.isCandidateAdmin() || this.authService.isCandidateAdminBasic();
      this.canCancel = this.authService.isRRHH() || this.authService.isCandidateAdmin() || this.authService.isGestorDocumental() || this.authService.isCandidateAdminBasic();
      this.showWelcome = false;
      this.showSpinner = false;
      this.allowsFormio = this.documentationType && this.documentationType.exteralForm != null && this.documentationType.documentationLoadContentName == 'EMPLEADO';
      this.canceledChapa = this.doc.isCanceled();
    }
    this.showChapa = this.showWelcome || this.doc.isUploadPending() || (this.doc.isCanceled() && !this.ShowPdf());
    this.showFormio = false;
    this.saving = false;
  }
  goBack() {
    this.goBackEvent.emit(true);
  }
  hideChapa() {
    this.canceledChapa = false;
    this.autoSizeDoc = !this.autoSizeDoc
  }

  protected readonly $e = $e;
}
