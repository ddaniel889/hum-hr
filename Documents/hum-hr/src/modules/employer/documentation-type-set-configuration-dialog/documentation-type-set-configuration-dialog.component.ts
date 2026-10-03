import { Component, Inject, OnInit } from '@angular/core';
import { MessageService } from '../../shared/errorHandler/message.service';
import { DocumentationTypeSetService } from '../../shared/services/documentation-type-set.service';
import { OrganizationalUnitService } from '../../shared/services/organizational-unit.service';
import { DocumentationTypeSet, DocumentationTypeSetFind } from '../../shared/models/documentationTypeSet.model';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-documentation-type-set-configuration-dialog',
  templateUrl: './documentation-type-set-configuration-dialog.component.html',
  styles: [
  ]
})
export class DocumentationTypeSetConfigurationDialogComponent implements OnInit {
  loading = false;
  currentStep = 'list';
  documentationTypeSets: DocumentationTypeSet[];
  selectDocumentationTypeSet: DocumentationTypeSet;
  addSetFormGroup: UntypedFormGroup;
  showDisabled = false;


  constructor(
    private messageService: MessageService,
    private documentationTypeSetSvc: DocumentationTypeSetService,
    private organizationalUnitService: OrganizationalUnitService,
    private _formBuilder: UntypedFormBuilder,
  ) { }

  ngOnInit(): void {
    this.loadSets();


  }

  enabledStateIcon(dt): string{
    if (dt.enabled) return 'fa-check'
    else return 'fa-ban';
  }

  actionEnabledStateIcon(dt): string{
    if (!dt.enabled) return 'fa-check'
    else return 'fa-ban';
  }

  actionEnabledStateTitle(dt): string{
    if (!dt.enabled) return 'Activar Set'
    else return 'Desactivar Set';
  }

  changeEnabledState(dt){
    dt.enabled = !dt.enabled;
    this.documentationTypeSetSvc.modify(dt).toPromise()
      .then(data => {
        this.messageService.showInfo('El Set ha sido cambiado de estado.');
        this.loadSets ();
      })
      .catch(err => this.messageService.showError(err));
    return;
  }
  changeShowDisabled() {
    this.showDisabled = !this.showDisabled;
    this.loadSets();
  }

  private loadSets() {
    this.loading = true;

    const findParameters: DocumentationTypeSetFind = {
      organizationalUnitId: this.organizationalUnitService.getCurrentOrChildOU().id,
      enabled: !this.showDisabled
      };
    this.documentationTypeSetSvc.get(findParameters).toPromise()
      .then(data => {
        this.documentationTypeSets = data;
      })
      .catch(err => this.messageService.showError(err))
      .then(() => this.loading = false);
  }

  addSet() {
    this.addSetFormGroup = this._formBuilder.group({
      nameFrmCtrl: ['', Validators.required],
      descriptionFrmCtrl: [''],
    });

    this.currentStep = 'addForm';

  }

  openEdit(dt) {
    this.currentStep = 'editOpen';
    this.selectDocumentationTypeSet = dt;
  }

  createSet() {
    if (this.addSetFormGroup.invalid) {
      // this.messageService.showError('CPPAPIV001');
      return;
    }

    this.selectDocumentationTypeSet = {
      id: 0,
      name: this.addSetFormGroup.value.nameFrmCtrl,
      description: this.addSetFormGroup.value.descriptionFrmCtrl,
      documentationTypeSetItem: [],
      organizationalUnitId: this.organizationalUnitService.getCurrentOrChildOU().id,
      enabled: true,
      disabledDateTime: null,
      metricsSet:null
    };

    this.currentStep = 'editOpen';
  }

  closeEditSet() {
    this.currentStep = 'list';
    this.loadSets();
  }
}
