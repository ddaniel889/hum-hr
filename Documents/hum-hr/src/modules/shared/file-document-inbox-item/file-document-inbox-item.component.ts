import {
  Component,
  Input,
  OnInit
} from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { EmployeeFileDocumentDialogData } from "../models/employee-file-document-dialog-data.model";
import { Employee } from "../models/Employee/employee.model";
import { FileDocument } from "../models/file-document.model";
import { FileDocumentService } from "../services/file-document.service";
import { DocumentationType } from "../models/documentation-type.model";
import { FilterPipe } from "../pipes/filter.pipe";
import { FileDocumentViewModalComponent } from '../file-document-view-modal/file-document-view-modal.component';

@Component({
  selector: "app-file-document-inbox-item",
  templateUrl: "./file-document-inbox-item.component.html",
  styles: []
})
export class FileDocumentInboxItemComponent implements OnInit {
  @Input() item: FileDocument;
  @Input() showSmallChips: boolean;
  @Input() showSave = null;
  @Input() showView = null;
  @Input() showGoEmployee = null;
  @Input() selectedEmployee = new Employee();
  @Input() orgUnits = [];
  @Input() autoview = false;
  @Input() active = false;
  @Input() showBadge = false;
  @Input() documentationTypes: DocumentationType[];
  contentTitle: String;
  temporalityTitle: any;

  constructor(
    private employeeDocumentService: FileDocumentService,
    public dialog: MatDialog,
    private router: Router
  ) { }

  ngOnInit() {
    const filterPipe = new FilterPipe();
    if (!this.documentationTypes || this.documentationTypes.length < 1) {
      this.contentTitle = this.item.documentationTypeName;
      this.temporalityTitle = filterPipe.transform(
        FileDocument.dateSystemName,
        this.item.documentDate.toString()
      );
      return;
    }

    const docType = this.documentationTypes.filter(
      d => d.id === +this.item.documentationTypeId
    );
    if (docType && docType.length > 0) {
      const contentList: String[] = [];
      const temporalityList: String[] = [];
      docType[0].visualizationMetadatas.forEach(element => {
        const meta = this.item.metadatas.filter(
          m => m.systemName === element.systemName
        );

        if (meta.length === 1) {
          if (element.key === "content") {
            contentList[element.order] = meta[0].metadataValue;
            this.contentTitle = contentList.join(" - ");
          }

          if (element.key === "temporality") {
            this.temporalityTitle = filterPipe.transform(
              meta[0].systemName,
              meta[0].metadataValue
            );
            temporalityList[element.order] = this.temporalityTitle;
            this.temporalityTitle = temporalityList.join(" - ");
          }
        }
      });
    }
  }

  saveDocument(doc: FileDocument) {
    this.employeeDocumentService.saveDocument(
      doc,
      this.selectedEmployee.id,
      this.autoview
    );
  }

  openDocumentDialog(doc: FileDocument) {
    const docTemp = doc;
    this.employeeDocumentService
      .getDocumentDetail(doc.id)
      .toPromise()
      .then(res => {
        const dialogData = new EmployeeFileDocumentDialogData();
        dialogData.doc = res;
        dialogData.doc.employeeCollaborationData =
          docTemp.employeeCollaborationData;
        dialogData.doc.lawyerCollaborationData =
          docTemp.lawyerCollaborationData;
        dialogData.employerSign = false;
        dialogData.signEnabled = false;
        dialogData.showDocumentStateBottom = false;
        dialogData.showDocumentState = true;
        dialogData.showDocumentMetadata = true;
        dialogData.employee = this.selectedEmployee;
        dialogData.orgUnits = this.orgUnits;
        dialogData.isRRHH = true;
        dialogData.isFirmante = false;

        const dialogRef = this.dialog.open(FileDocumentViewModalComponent, {
          // height: '800px',
          // width: '1024px',
          data: dialogData
        });

        dialogRef.afterClosed().subscribe(result => { });
      });
  }

  gotoEmployeeDocumentViewAtDocument(doc: FileDocument) {
    if (this.selectedEmployee != null) {
      this.router.navigate([
        "employer/employee-document-view",
        this.selectedEmployee.id,
        doc.id
      ]);
    }
  }
}
