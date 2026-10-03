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
import { FileProveDocumentViewModalComponent } from '../file-prove-document-view-modal/file-prove-document-view-modal.component';
import { documentFileSignaturesData } from "../models/documentFileSignatures.model";

@Component({
  selector: "app-file-prove-document-item",
  templateUrl: "./file-prove-document-item.component.html",
  styles: []
})
export class FileProveDocumentItemComponent implements OnInit {
  @Input() item: documentFileSignaturesData;
  @Input() showSmallChips: boolean;
  @Input() showSave = null;
  @Input() showView = null;
  @Input() orgUnits = [];
  @Input() autoview = false;
  @Input() active = false;
  @Input() showBadge = false;
  @Input() documentationTypes: DocumentationType[];
  contentTitle: String;
  documentId:number;
  proveDocumentId:number;
  temporalityTitle: any;

  constructor(
    
    private employeeDocumentService: FileDocumentService,
    public dialog: MatDialog,
    private router: Router
  ) { }

  ngOnInit() {
    
    if (!this.documentationTypes || this.documentationTypes.length < 1) {
           
     this.proveDocumentId=this.item.proveDocumentId;
      return;
    }

  
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
        dialogData.orgUnits = this.orgUnits;
        dialogData.isRRHH = true;
        dialogData.isFirmante = false;

        const dialogRef = this.dialog.open(FileProveDocumentViewModalComponent, {
          // height: '800px',
          // width: '1024px',
          data: dialogData
        });

        dialogRef.afterClosed().subscribe(result => { });
      });
  }

}
