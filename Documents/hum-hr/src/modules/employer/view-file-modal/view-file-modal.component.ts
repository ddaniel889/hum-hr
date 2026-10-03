import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MessageService } from '../../shared/errorHandler/message.service';
import { ViewFileModalData } from '../../shared/models/view-file-modal-data.model';
import { FileService, FILESIZE } from '../../shared/services/file.service';

@Component({
  selector: 'app-view-file-modal',
  templateUrl: './view-file-modal.component.html',
  styles: [
  ]
})
export class ViewFileModalComponent implements OnInit {
  isZip: boolean;
  fileName: string;
  fileBase64: string;
  viewPdf: boolean;
  fileId: number;


  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ViewFileModalData,
    private dialogRef: MatDialogRef<any>,
    private fileService: FileService,
    private msjService: MessageService,
    ) { }

  ngOnInit(): void {
    this.fileName = this.data.fileName;
    this.fileBase64 = this.data.fileBase64;
    this.fileId = this.data.fileId;
    if (this.fileService.isZIP(null, this.fileName)) {
      this.isZip = true;
      return;
    }else{
      this.isZip = false;
    }
  }

  close() {
    this.dialogRef.close();
  }
}
