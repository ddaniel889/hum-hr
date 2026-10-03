import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { OrganizationalUnit } from '../../shared/models/organizational-unit.model';
import { OrganizationalUnitService } from '../../shared/services/organizational-unit.service';
import { DocumentationType } from '../../shared/models/documentation-type.model';
import { DocumentationTypesService } from '../../shared/services/documentation-types.service';
import { MessageService } from '../../shared/errorHandler/message.service';
import { Router } from '@angular/router';
import { FormsService } from '../../shared/services/forms.service';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { AppConfig } from 'src/app/app.config';

@Component({
  selector: 'app-document-configuration',
  templateUrl: './document-configuration.component.html',
  styles: [
  ]
})
export class DocumentConfigurationComponent implements OnInit {
  showDetail = false;
  isEditing = false;
  loading = false;
  noContainerType = true;
  showSearchBar = false;
  documentationTypes: DocumentationType[];
  selectedOrganizationalUnit: OrganizationalUnit;
  archiveDocumentationTypes: DocumentationType[] = [];
  formioDocumentationTypes: DocumentationType[] = [];

  @Output()   focusChange: EventEmitter<MatTabChangeEvent>


  constructor(
    private organizationalUnitService: OrganizationalUnitService,
    private msgService: MessageService,
    private docTypeSvc: DocumentationTypesService,
    private formsService: FormsService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.selectedOrganizationalUnit = this.organizationalUnitService.getCurrentOU();
    // Si tengo mas de 20 items permito busqueda
    // this.showSearchBar = this.roleUsers.length > 20;

    // Obtengo los tipods documentacion
    this.loadDocTypes();
  }

  filteredSearch() {
    this.loadDocTypes();
  }

  toggleDisabled(docType: DocumentationType) {
    if (!docType.enabled) {
      if (!docType.documentTypeId) {
        this.msgService.showError('NoDocType');
        return;
      }
    }
    docType.enabled = !docType.enabled;

    this.docTypeSvc.setEnabled(docType.id, docType.enabled).toPromise()
      .then()
      .catch(error => {
        this.msgService.showError(error);
        docType.enabled = !docType.enabled;
      });
  }

  createEditForm(docType: DocumentationType) {
    this.loading = true;
    if (!docType.enabled) {
      if (!docType.documentTypeId) {
        this.msgService.showError('NoDocType');
        return;
      }
    }

    const theme = this.organizationalUnitService.getOUTheme();

    this.formsService.getFormToken(docType, theme).toPromise()
      .then(integrationToken => {

        window.location.href = `${AppConfig.settings.custom.cifUrl}?integrationToken=${integrationToken.token}`
      })
      .catch(error => {
        this.msgService.showError(error);
        this.loading = false;
      });
  }

  goToSearch() {
    this.router.navigate(['employer/file-document-search']);
  }

  myTabFocusChange(changeEvent: MatTabChangeEvent) {
    this.showDetail = false;
 }

 private loadDocTypes() {
  this.loading = true;
  this.docTypeSvc.get(this.selectedOrganizationalUnit.id, false, false, true, true).toPromise()
  .then(data => {
    this.documentationTypes = data;
    this.noContainerType = this.documentationTypes.length < 1;
    this.formioDocumentationTypes = this.documentationTypes.filter(d => d.hasExternalForm);
    this.archiveDocumentationTypes = this.documentationTypes.filter(d => !d.hasExternalForm);
  })
  .catch(err => this.msgService.showError(err))
  .then(() => this.loading = false);
 }
}
