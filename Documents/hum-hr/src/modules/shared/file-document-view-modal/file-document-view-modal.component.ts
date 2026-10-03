import { Component, OnInit, Inject } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EmployeeFileDocumentDialogData } from '../models/employee-file-document-dialog-data.model';
import { AuthService } from 'src/app/modules/shared/auth/auth.service';
import { FileDocument, StatusDoc } from '../models/file-document.model';
import { MessageAtributtes, MessageType } from '../models/message-types.model';
import { GenericBottomSheetComponent } from '../generic-bottom-sheet/generic-bottom-sheet.component';
import { FileDocumentService } from '../services/file-document.service';
import { MessageService } from 'src/app/modules/shared/errorHandler/message.service';
import { FileDocumentMetadataComponent } from '../file-document-metadata/file-document-metadata.component';
import { FileService } from '../services/file.service';
import { DocumentationTypeSetService } from "../../shared/services/documentation-type-set.service";

@Component({
  selector: 'app-file-document-view-modal',
  templateUrl: './file-document-view-modal.component.html',
  styles: []
})
export class FileDocumentViewModalComponent implements OnInit {
  workInProgress = true;
  canCancel: boolean;
  canDelete: boolean;
  showData: boolean = true;
  showRemove = false;
  canceledChapa = false;
  doc: FileDocument;
  filePdf = "";
  fileName = "";
  fileBlob: Blob;
  setId: number; 
  disableButtons = false;
  constructor(@Inject(MAT_DIALOG_DATA) public data: EmployeeFileDocumentDialogData,
    private fileDocumentService: FileDocumentService,
    private authService: AuthService,
    private msjService: MessageService,
    private _bottomSheet: MatBottomSheet,
    private fileService: FileService,
    private documentationTypeSetSvc: DocumentationTypeSetService,
    private dialogRef: MatDialogRef<FileDocumentViewModalComponent>) {
    if (data.showDocumentState == null) {
      data.showDocumentState = true;
    }
    this.doc = this.data.doc;
  }

  ngOnInit() {
    //Si es overseer y es empleado (El botón NO se visualiza)
    //Si no es overseer y es empleado (El botón NO se visualiza)
    //Si es overseer y no es empleado (El botón NO se visualiza)
    //Si no es overseer y no es empleado (El botón se visualiza)
    let overSeerEmployee = (!this.authService.isOverseer() && !this.data.isEmployee)
    this.canCancel = (this.authService.isRRHH() || this.authService.isCandidateAdmin() || this.authService.isGestorDocumental() || this.authService.isCandidateAdminBasic() || overSeerEmployee || this.data.isNotifyDocumentVac) && !this.authService.isLeaveApprov();
    this.canDelete = (this.authService.RRHHManagment() || this.authService.isCandidateAdmin() || this.authService.isCandidateAdminBasic() || overSeerEmployee || this.data.isNotifyDocumentVac) && (this.authService.RRHHManagment() || this.authService.isGestorDocumental());

    this.canceledChapa = this.isCanceled();
    this.showData = !this.data.isEmployee;
    if(this.doc.hasFiles){
      if(this.data.isModoPDF){
        this.fileService.getDocumentFilePdfByIdBase64(this.doc.id, this.data.employee.id).toPromise().then(
          file => {
          this.filePdf = file.base64;
          this.fileName = file.fileName;
          this.msjService.close();
        },
        err => this.msjService.showError(err)
        );
      }
      else{
        this.fileService.getMyDocumentFilePdfByIdBase64(this.doc.id).toPromise().then(
          file => {
          this.filePdf = file;
            this.fileName = this.fileDocumentService.getDocumentFileName(this.data.doc);
          this.msjService.close();
        },
        err => this.msjService.showError(err)
        );
      }
      if(this.doc != null && this.doc.employeeLegalId != null && this.doc.nroLegajo == null){
        this.documentationTypeSetSvc.getSetbyIdFiscal(this.doc.employeeLegalId,this.doc.organizationalUnitId).toPromise().then(
          data => {
            this.setId = data?.setId ?? 0
            this.workInProgress = false;
          },
          err => this.msjService.showError(err)
          );
      }else{
        this.workInProgress = false;
      }
      this.disableButtons = false;  
    }else{
      this.workInProgress = false;
      this.disableButtons = true;      
    }
  }

  isCanceled() {
    if (this.doc) {
      return this.doc.statusId == StatusDoc.Canceled;
    } else {
      return false;
    }
  }

  dialogClose() {
    this._bottomSheet.dismiss();
    this.dialogRef.close();
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
      inputHint: '*Puedes indicar un motivo de rechazo',
      type: MessageType.TextAreaYesNo
    };
    const t = this._bottomSheet.open(GenericBottomSheetComponent, { data: parameters, disableClose: true });
    t.instance.close.subscribe((buttonSheetResponse: any) => {
      if (buttonSheetResponse.response) {
        this.workInProgress = true;
        this.fileDocumentService.cancel(+this.doc.id, buttonSheetResponse.text, this.setId ?? 0).toPromise()
          .then(r => {
            this.msjService.showInfo('El Documento ha sido rechazado');
            this.workInProgress = false;
            this.doc.statusId = StatusDoc.Canceled;
            this.doc.rejectedMotive = buttonSheetResponse.text;
            this.doc.rejectedDate = new Date();
            const resp = {
              documentRejected:true,
              documentId:this.doc.id
            };
            this.dialogRef.close(resp);
          })
          .catch(e => {
            this.msjService.showError(e);
            this.workInProgress = false;
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
        this.workInProgress = true;
        this.fileDocumentService.inactive(+this.doc.id, this.setId ?? 0).toPromise()
          .then(r => {
            this.msjService.showInfo('Eliminado con éxito');
            this.workInProgress = false;
            const resp = {
              documentEliminated: true,
              documentId:this.doc.id
            };
            this.dialogRef.close(resp);
          })
          .catch(e => {
            this.msjService.showError(e);
            this.workInProgress = false;
          });
      }
    });
  }

  removeFile() {
  }
}
