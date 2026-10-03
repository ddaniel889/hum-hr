import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { FileDocumentSignMassiveDialogData } from '../models/file-document-sign-massive-dialog-data.model';
import { MatDialog } from '@angular/material/dialog';
import { DocumentationGroupData } from '../models/documentation-group-data.model';
import { FileDocumentSignMassiveDialogComponent } from '../file-document-sign-massive-dialog/file-document-sign-massive-dialog.component';

@Component({
  selector: 'app-file-document-inbox-item-documentation',
  templateUrl: './file-document-inbox-item-documentation.component.html',
  styles: []
})
export class FileDocumentInboxItemDocumentationComponent implements OnInit {

  @Input() item: DocumentationGroupData;
  @Input() showSignAll: boolean;
  @Input() active: boolean;
  @Output() signingFinished = new EventEmitter<Boolean>();

  constructor(public dialog: MatDialog) { }

  ngOnInit() {
  }

  signAllDocuments(event: Event) {
    event.stopPropagation();

    const dialogData = new FileDocumentSignMassiveDialogData();
    dialogData.organizationalUnitId = this.item.ou.id;
    dialogData.organizationalUnitName = this.item.ou.name;
    dialogData.documentationId = this.item.documentationId;
    dialogData.documentationName = this.item.documentationName;
    dialogData.documentationDate = this.item.documentationDate;
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
