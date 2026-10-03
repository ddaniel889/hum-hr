import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FileDocument } from '../models/file-document.model';
import { GroupEmployeeFileDocumentView } from '../models/group-employee-file-document-view.model';
import { DocumentationType } from '../models/documentation-type.model';
import { FileDocumentService } from '../services/file-document.service';

@Component({
  selector: 'app-file-document-inbox-block-calendar',
  templateUrl: './file-document-inbox-block-calendar.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileDocumentInboxBlockCalendarComponent implements OnInit {
  @Input() expanded = null;
  @Input() progressBarDisplay = false;
  @Input() title = "";
  @Input() blockValue: GroupEmployeeFileDocumentView;
  @Input() items: FileDocument[] = [];
  @Input() showSmallChips: boolean;
  @Input() activeRow = 0;
  @Input() showBadge = false;
  @Input() documentationTypes: DocumentationType[];
  @Input() totalItems: number = 0;
  @Output() click = new EventEmitter<GroupEmployeeFileDocumentView>();
  @Output() openDocument = new EventEmitter<FileDocument>();

  pageSize = 15;
  pageIndex = 1;

  constructor(private employeeDocumentService: FileDocumentService) { }

  ngOnInit() {
  }


  onOpenDocument(doc: FileDocument) {
    this.activeRow = doc.id;
    this.openDocument.emit(doc);
  }

  getMore() {
    this.employeeDocumentService.getMorePagedEmployeeDocuments();
  }

  selectedPageChanged(resetPage = false) {
    if (resetPage) {
      this.pageIndex = 0;
    }

    this.employeeDocumentService.getPagedEmployeeDocuments(this.pageIndex, this.pageSize);
  }
}
