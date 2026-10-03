import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FileDocumentSignMassiveDialogComponent } from '../file-document-sign-massive-dialog/file-document-sign-massive-dialog.component';
import { OrganizationalUnit } from '../models';
import { DocumentationGroupData } from '../models/documentation-group-data.model';
import { FileDocumentSignMassiveDialogData } from '../models/file-document-sign-massive-dialog-data.model';

@Component({
  selector: 'app-file-document-inbox-block-ou',
  templateUrl: './file-document-inbox-block-ou.component.html',
  styles: []
})
export class FileDocumentInboxBlockOuComponent implements OnInit {
  @Input() organizationalUnit: OrganizationalUnit;
  @Input() showSignAll: boolean;
  @Input() expanded: boolean;
  @Input() items: DocumentationGroupData[] = [];
  @Input() progressBarDisplay: boolean;
  @Output() openProcess = new EventEmitter<DocumentationGroupData>();
  @Output() signingFinished = new EventEmitter<Boolean>();


  loaded = false;
  loadingPeriod = false;
  activeRow = '';

  constructor(public dialog: MatDialog) {
  }

  ngOnInit() {

  }

  onOpenProcess(process: DocumentationGroupData) {
    this.openProcess.emit(process);
  }

  updateList() {
    this.signingFinished.emit(true);
  }

  signAllDocuments(event: Event) {
    event.stopPropagation();

    const dialogData = new FileDocumentSignMassiveDialogData();
    dialogData.organizationalUnitId = this.organizationalUnit.id;
    dialogData.organizationalUnitName = this.organizationalUnit.name;

    const dialogRef = this.dialog.open(FileDocumentSignMassiveDialogComponent, {
      // height: '800px',
      // width: '1024px',
      data: dialogData,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.signingFinished.emit(true);
      }
    });
  }
}
