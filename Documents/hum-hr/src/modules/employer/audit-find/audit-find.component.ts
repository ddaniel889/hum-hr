import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, UntypedFormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MessageService } from '../../shared/errorHandler/message.service';
import { ActionTypes, AuditParameters, Audit } from '../../shared/models/audit.model';
import { ITEMSPERPAGE } from '../../shared/models/paged.model.';
import { AuditService } from '../../shared/services/audit.service';
import { FileService } from '../../shared/services/file.service';
import { OrganizationalUnitService } from '../../shared/services/organizational-unit.service';

@Component({
  selector: 'app-audit-find',
  templateUrl: './audit-find.component.html',
  styles: [
  ]
})
export class AuditFindComponent implements OnInit {

  loading: boolean;
  actionTypes: ActionTypes[];
  selectedAudit: any;
  audits: Audit[];
  searchDto: AuditParameters = {
    page: 0,
    itemPerPage: ITEMSPERPAGE
  };
  organizationalUnits: any[];

  auditForm: UntypedFormGroup;
  userNameFrmCtrl = new UntypedFormControl('');
  dateToFrmCtrl = new UntypedFormControl('');
  dateFromFrmCtrl = new UntypedFormControl('');
  ourganizationaUnitIdFrmCtrl = new UntypedFormControl('');
  actionTypeIdFrmCtrl = new UntypedFormControl('');
  today = new Date();
  showDetail = false;
  selectedActionTypes = [];
  showResults = false;
  floatFilter = false;
  // PAGINATOR
  itemsCount: number;
  pageIndex = 0;
  defaultValueOu = { "id": -1, "name": "[TODAS]" };
  constructor(private auditService: AuditService,
    private msjService: MessageService,
    private ouService: OrganizationalUnitService,
    private fileService: FileService,
    private _formBuilder: UntypedFormBuilder,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.selectedActionTypes = [];
    this.auditForm = this._formBuilder.group({});
    this.getActionTypes();
    this.getOus();
    this.auditForm.addControl('userNameFrmCtrl', this.userNameFrmCtrl);
    this.auditForm.addControl('dateFromFrmCtrl', this.dateFromFrmCtrl);
    this.auditForm.addControl('dateToFrmCtrl', this.dateToFrmCtrl);
    this.auditForm.addControl('ourganizationaUnitIdFrmCtrl', this.ourganizationaUnitIdFrmCtrl);
    this.auditForm.addControl('actionTypeIdFrmCtrl', this.actionTypeIdFrmCtrl);
  }

  clean() {
    this.auditForm.reset();
    this.userNameFrmCtrl.reset();
    this.dateFromFrmCtrl.reset();
    this.dateToFrmCtrl.reset();
    this.ourganizationaUnitIdFrmCtrl.reset();
    this.actionTypeIdFrmCtrl.reset();
    this.selectedActionTypes = [];
    this.searchDto.actionType = null;
  }

  search(IsPageChange = false) {
    this.loading = true;
    this.showResults = true;
    this.populateAuditDTO();
    if (!IsPageChange) {
      this.searchDto.page = 0;
      this.pageIndex = 0;
    }
    this.auditService.get(this.searchDto).toPromise().then(
      data => {
        this.audits = data.values;
        this.itemsCount = data['count'];
        this.loading = false;
      },
      error => {
        this.msjService.showError(error);
        this.loading = false;
      }
    );
  }

  selectedPageChanged(a) {
    this.searchDto.page = this.pageIndex;
    this.search(true);
  }

  getActionTypes() {
    this.loading = true;
    this.auditService.getActionTypes().toPromise().then(
      data => {
        this.actionTypes = data;
        this.loading = false;
      },
      error => {
        this.msjService.showError(error);
        this.loading = false;
      }
    );
  }

  getOus() {
    this.loading = true;
    this.ouService.getTreeInMemory().then(
      data => {
        this.organizationalUnits = data;
        if (data.length > 1) {
          this.organizationalUnits.push(this.defaultValueOu);
        } else {
          this.ourganizationaUnitIdFrmCtrl.setValue(this.organizationalUnits[0].id);
        }

        this.organizationalUnits.sort((a, b) => a.id > b.id ? 1 : -1);
        this.loading = false;
      }, error => {
        this.msjService.showError(error);
        this.loading = false;
      }
    );
  }

  export() {
    this.loading = true;
    this.populateAuditDTO();
    this.auditService.export(this.searchDto).toPromise().then(
      data => {
        const date = new Date().toISOString();
        const fileName = "Lista de Auditorias " + ` [${date}].xlsx`;
        this.fileService.download(data['value'], fileName, "application/excel");
        this.msjService.showInfo("Auditorias exportadas correctamente");
        this.loading = false;
      },
      error => {
        this.msjService.showError(error);
        this.loading = false;
      }
    );
  }

  populateAuditDTO() {
    this.searchDto.organizationalUnitId = this.ourganizationaUnitIdFrmCtrl.value;
    this.searchDto.userName = this.userNameFrmCtrl.value;
    this.searchDto.dateFrom = this.dateFromFrmCtrl.value != '' && this.dateFromFrmCtrl.value != null ? this.dateFromFrmCtrl.value.format('MM/DD/YYYY') : null;
    this.searchDto.dateTo = this.dateToFrmCtrl.value != '' && this.dateToFrmCtrl.value != null ? this.dateToFrmCtrl.value.format('MM/DD/YYYY') : null;
  }

  selectActionType(name) {
    const element = this.actionTypes.find(dt => dt.name == name);
    this.searchDto.actionType = element.id;
    this.selectedActionTypes = [element];
  }

  itemRemoved() {
    this.searchDto.actionType = null;
  }

  selectAudit(audit) {
    if (this.selectedAudit == audit) {
      this.selectedAudit = null;
      this.showDetail = false;
    } else {
      this.selectedAudit = audit;
      this.showDetail = true;
    }
  }

  closeDetail() {
    this.showDetail = false;
  }
}

