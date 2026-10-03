import { Component, Input, OnInit } from '@angular/core';
import { FileDocument } from '../models/file-document.model';
import { FileDocumentService } from '../services/file-document.service';
import { FileProveDocumentViewModalComponent } from '../file-prove-document-view-modal/file-prove-document-view-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { documentFileSignaturesData } from '../models/documentFileSignatures.model';
import { MessageService } from '../errorHandler/message.service';
import {LocalStorageService} from "../services/local-storage.service";



@Component({
  selector: 'app-file-document-state',
  templateUrl: './file-document-state.component.html',
  styles: []
})
export class FileDocumentStateComponent implements OnInit {
  @Input() item: FileDocument;
  @Input() sign: documentFileSignaturesData;
  @Input() showSmallChips: boolean;

  useDocComments = false;

  constructor(
    private readonly fileDocumentService: FileDocumentService,
    private readonly dialog: MatDialog,
    private readonly msjService: MessageService,
    private readonly localStorage: LocalStorageService
  ) {

  }

  ngOnInit() {
    this.useDocComments = this.localStorage.get('useDocComments');
  }

  verEvidenciasdeFirmas(item: FileDocument)
  {
    const docTemp = item;
    var collaboration = [];
    this.fileDocumentService.getCollaboration(item.id,item.organizationalUnitId).subscribe
    (coll=> {
      collaboration=coll;
      this.fileDocumentService.getDocumentDetail(item.documentFileSignaturesData[0].proveDocumentId).toPromise()
        .then(res => {
          const dialogData = res;
          dialogData.employeeCollaborationData = docTemp.employeeCollaborationData;
          dialogData.lawyerCollaborationData = docTemp.lawyerCollaborationData;
          dialogData.documentFileSignaturesData=docTemp.documentFileSignaturesData;
          dialogData.collaboration=collaboration;
          dialogData.documentDate=new Date(docTemp.documentFileSignaturesData[0].signedDate);
          const dialogRef = this.dialog.open(FileProveDocumentViewModalComponent, {
          data: dialogData
          });


        })
        .catch(error => {
            this.msjService.showInfo(error.description);
        });
      });
  }

}
