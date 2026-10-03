import { Component, OnInit, Inject, EventEmitter } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MessageService } from '../../shared/errorHandler/message.service';
import { maxFiles } from '../../shared/models/documentation-type.model';
import { FileService, FILESIZE } from '../../shared/services/file.service';

@Component({
  selector: 'app-upload-file-modal',
  templateUrl: './upload-file-modal.component.html',
  styles: [
  ]
})
export class UploadFileModalComponent implements OnInit {
  maxFiles = 1;
  acceptedExtensions = '*.pdf';
  files: File[] = [];
  canViewFile = true;
  canRemove = true;
  multipleSelection = true;
  isSaving = false;

  showingFile = false;
  fileImage: any;
  fileName: string;
  isZip = false;
  fileBase64: string;
  viewPdf = true;
  MAX_SIXE_FILE = 5 * FILESIZE.MB;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<any>,
    private msgSvc: MessageService,
    private fileService: FileService,

  ) { }

  ngOnInit(): void {
    if (this.data.maxFiles) {
      this.maxFiles = this.data.maxFiles;
    }

    if (this.data.acceptedExtensions) {
      this.acceptedExtensions = this.data.acceptedExtensions;
    }
    if (this.data.canRemove) {
      this.canRemove = this.data.canRemove;
    }
    if (this.data.canViewFile) {
      this.canViewFile = this.data.canViewFile;
    }
    if (this.data.multipleSelection) {
      this.multipleSelection = this.data.multipleSelection;
    }
  }

  onSelectedFile(file: File, showFile: boolean) {
    this.isZip = false;
    this.fileImage = undefined;
    this.fileName = file.name;

    if (this.fileService.isZIP(file)) {
      this.isZip = true;
      this.showingFile = true;
      return;
    }

    if (this.fileService.isPDF(file)) {
      const myReader: FileReader = new FileReader();
      myReader.onloadend = (e) => {
        this.viewPdf = file.size <= this.MAX_SIXE_FILE;
        this.fileBase64 = myReader.result.toString().split(',')[1];
      };
      myReader.readAsDataURL(file);
    } else {
      const myReader: FileReader = new FileReader();
      myReader.onloadend = (e) => {
        this.fileImage = 'data:image/jpeg;base64,' + myReader.result.toString().split(',')[1];
      };
      myReader.readAsDataURL(file);
    }

    this.showingFile = true;
  }

  onFilesChanged(files: File[]) {
    this.isZip = false;
    if (files.length > 0) {
      if (files.length > this.maxFiles) {
        files = files.slice(0, this.maxFiles);
      }
      const lastSelected = files[files.length - 1];
        this.files = files;

        if (this.fileService.isZIP(lastSelected)) {
        this.isZip = true;
        this.files = [lastSelected];
        this.maxFiles = 1;
        return;
      }
    } else {
      this.fileBase64 = null;
      this.fileImage = null;
      this.showingFile = false;
    }
  }

  save() {
    this.isSaving = true;
    this.data.uploadFunction(this.files)
      .then(data => {
        this.dialogRef.close(true);
      })
      .catch(err => this.msgSvc.showError(err))
      .then(() => this.isSaving = false);
  }

  close() {
    this.dialogRef.close(false);
  }
}
