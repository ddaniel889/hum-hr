import { Component, OnInit, Input } from '@angular/core';
import { Employee } from '../../shared/models/Employee/employee.model';
import { FileDocument } from '../../shared/models/file-document.model';
import { FileDocumentService } from '../../shared/services/file-document.service';
import { MatDialog } from '@angular/material/dialog';
import { MessageService } from '../../shared/errorHandler/message.service';
import { GroupEmployeeFileDocumentView } from '../../shared/models/group-employee-file-document-view.model';
import { Router } from '@angular/router';
import { OrganizationalUnitService } from '../../shared/services/organizational-unit.service';
import { OrganizationalUnit } from '../../shared/models';
import { DocumentationType } from '../../shared/models/documentation-type.model';
import { DocumentationTypesService } from '../../shared/services/documentation-types.service';

@Component({
  selector: 'app-employee-detail-last-documents',
  templateUrl: './employee-detail-last-documents.component.html',
  styles: []
})
export class EmployeeDetailLastDocumentsComponent implements OnInit {
  @Input() selectedEmployee = new Employee();

  items: FileDocument[] = [];
  organizationalUnits: OrganizationalUnit[];
  loading: boolean;
  documentationTypes: DocumentationType[];

  constructor(
    private msjService: MessageService,
    private employeeDocumentService: FileDocumentService,
    public dialog: MatDialog,
    private organizationalUnitService: OrganizationalUnitService,
    private documentationTypesService: DocumentationTypesService) { }

  ngOnInit() {
    this.loading = true;
    this.employeeDocumentService.subscribeToDocumentsList().subscribe(
      data => {
        this.items = data;
      },
      err => this.msjService.showError(err),
    );

    this.items = [];

    this.organizationalUnitService.getTreeInMemory()
      .then(ous => {
        this.organizationalUnits = ous;
            if (this.selectedEmployee != null) {
              this.refreshDocuments();
            }
      },
        err => this.msjService.showError(err)
      );
  }


  refreshDocuments() {
    if (this.employeeDocumentService != null &&  this.organizationalUnits != null) {
      this.loading = true;
      const loadings = [];

      this.employeeDocumentService.setSelectedPeriod(GroupEmployeeFileDocumentView.Ultimos);
      loadings.push(this.documentationTypesService.get(this.selectedEmployee.organizationalUnitId).toPromise());
      loadings.push(this.employeeDocumentService.refreshDocuments(this.selectedEmployee, this.organizationalUnits).toPromise());
      Promise.all(loadings)
      .then(res => {
        if (res && res.length > 0) {
          this.documentationTypes = res[0];
        }
      })
      .catch(err => this.msjService.showError(err))
      .then(() => this.loading = false);
    }
  }

}
