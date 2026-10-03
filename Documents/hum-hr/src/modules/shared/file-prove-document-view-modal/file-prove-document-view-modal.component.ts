import { Component, OnInit, Inject, Input, Output, EventEmitter } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FileDocument, StatusDoc } from '../models/file-document.model';
import { FileDocumentService } from '../services/file-document.service';
import { MessageService } from 'src/app/modules/shared/errorHandler/message.service';
import { FileService } from '../services/file.service';
import { documentFileSignaturesData } from '../models/documentFileSignatures.model';

@Component({
  selector: 'app-file-prove-document-view-modal',
  templateUrl: './file-prove-document-view-modal.component.html',
  styleUrls: ['_fileProveDocumentModal.scss']
})
export class FileProveDocumentViewModalComponent implements OnInit {
  doc: FileDocument;
  filePdf = "";
  fileName = "";
  fileBlob: Blob;
  items=  [];
  employeeId="0";


  constructor(@Inject(MAT_DIALOG_DATA) public data: FileDocument,
    private fileDocumentService: FileDocumentService,  
    private msjService: MessageService,
    private _bottomSheet: MatBottomSheet,
    private fileService: FileService,
    private dialogRef: MatDialogRef<FileProveDocumentViewModalComponent>) {
    
    this.doc = this.data; 
    this.items=this.data.documentFileSignaturesData;
    
    this.setSignedBy(this.data.collaboration,this.items);
    
  }

  ngOnInit() {   
    this.fileService.getDocumentFilePdfByIdBase64(this.doc.id, this.employeeId).toPromise().then(
      file => {
        this.filePdf = file;
        this.fileName = this.fileDocumentService.getDocumentFileName(this.doc);
        this.msjService.close();
      },
      err => this.msjService.showError(err)
    );
  }


  onOpenDocument(sign:documentFileSignaturesData){
    
    this.doc.id=sign.proveDocumentId;
    this.doc.documentDate = new Date(sign.signedDate);
    this.fileService.getDocumentFilePdfByIdBase64(sign.proveDocumentId, this.employeeId).toPromise().then(
      file => {
        this.filePdf = file;
        this.fileName = this.fileDocumentService.getDocumentFileName(this.doc);
        this.msjService.close();
        
      },
      err => this.msjService.showError(err)
    );
  }

  dialogClose() {
    this._bottomSheet.dismiss();
    this.dialogRef.close();
  }

  setSignedBy(collaborations: any,items: documentFileSignaturesData[])
  {
      items.forEach(i => {        
       if(collaborations.find(col => col.userId===i.userId)==undefined)
       {
          i.signedBy="Firmante"
       }   
       else
       {
        i.signedBy="Empleado"
       }     
      });
  }
  
}
