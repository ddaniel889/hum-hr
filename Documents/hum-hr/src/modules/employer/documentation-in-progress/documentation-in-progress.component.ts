import { Component, OnInit } from '@angular/core';
import { MessageService } from '../../shared/errorHandler/message.service';
import { OrganizationalUnit } from '../../shared/models';
import { DocumentationGroupData } from '../../shared/models/documentation-group-data.model';
import { FileDocumentService } from '../../shared/services/file-document.service';
import { OrganizationalUnitService } from '../../shared/services/organizational-unit.service';

@Component({
  selector: 'app-documentation-in-progress',
  templateUrl: './documentation-in-progress.component.html',
  styles: []
})
export class DocumentationInProgressComponent implements OnInit {
  ouSelected: OrganizationalUnit;
  loaded = false;
  isOpen = false;
  loadingPeriod = false;
  itemClass: string;
  selectedProcess: DocumentationGroupData;
  organizationalUnits: OrganizationalUnit[];
  items: DocumentationGroupData[] = [];

  constructor(private msjService: MessageService,
    private employeeDocumentService: FileDocumentService,
    private organizationalUnitService: OrganizationalUnitService) { }

  ngOnInit() {
    this.loaded = false;
    this.items = [];
    this.employeeDocumentService.getDocumentationTypesGroup().subscribe(
      data => {
        this.items = data;
      },
      err => this.msjService.showError(err),
    );
    this.organizationalUnitService.getTreeInMemory()
      .then(ous => {
        this.organizationalUnits = ous.filter(o => o.isRoot === false);
        if (this.organizationalUnits.length > 0) {
          this.ouSelected = this.organizationalUnits[0];
          this.refresh();
        }


        this.loaded = true;
      },
        err => this.msjService.showError(err)
      );
  }

  changeExpander(ou: OrganizationalUnit) {
    this.ouSelected = ou;
    this.refresh();
  }

  refresh(): void {
    this.loaded = false;
    
    this.items = [];
    this.loadingPeriod = true;
    this.employeeDocumentService.cleanDocumentationTypesGroup();
    this.employeeDocumentService.refreshDocumentationInProgres(this.ouSelected).toPromise().then(() => {
      this.loadingPeriod = false;
      this.loaded = true;
    });
  }

  progressChildDisplay(ou: OrganizationalUnit): boolean {
    return this.loadingPeriod && ou.id == this.ouSelected.id;
  }

  openProcess(process: DocumentationGroupData) {
    this.setIsOpen(true);
    event.stopPropagation();
    this.selectedProcess = process;
    
  }

  detailClass(): string {
    if (this.isOpen) {
      return 'is-open';
    } else {
      return '';
    }
  }

  setIsOpen(value) {
    this.isOpen = value;
  }

   changeDetailClass(detailClass: string) {
    this.itemClass = detailClass;
  }

  isFirstOu(ou: OrganizationalUnit): boolean {
    if (this.organizationalUnits != null && this.organizationalUnits.length > 0) {
      return this.organizationalUnits[0].id == ou.id;
    }

    return false;
  }

}
