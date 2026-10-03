import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { DocumentationType, DocumentationOrigin } from '../../shared/models/documentation-type.model';
import { DocumentationTypesService } from '../../shared/services/documentation-types.service';
import { MessageService } from '../../shared/errorHandler/message.service';
import { FileDocument } from '../../shared/models/file-document.model';
import { DocTypeMetadatasCategory } from '../../shared/models/DocTypeMetadatas.model';
import { MetadataService } from '../../shared/services/metadatas.service';
import { DocumentationTypeSelectItem } from '../../shared/models/documentation-type-select-item.model';
import { PersonService } from '../../shared/services/person.service';

@Component({
  selector: 'app-add-documentation',
  templateUrl: './add-documentation.component.html',
  styles: []
})
export class AddDocumentationComponent implements OnInit {
  isOpen = false;
  loaded = false;
  hideFileDocumentView = false;
  documentationTypes: DocumentationType[];
  archiveDocumentationTypes: DocumentationTypeSelectItem[] = [];
  formioDocumentationTypes: DocumentationTypeSelectItem[] = [];
  organizationalUnitId: number;
  newDoc: FileDocument;
  selectedDocumentationType: DocumentationTypeSelectItem;
  formName: string;

  constructor(
    private documentationTypesService: DocumentationTypesService,
    private msjService: MessageService,
    private metadataService: MetadataService,
    private ref: ChangeDetectorRef,
    private personService: PersonService
  ) { }

  ngOnInit() {
    this.loaded = true;
    this.setIsOpen(false);
    this.organizationalUnitId = +localStorage.getItem('organizationId');

    this.documentationTypesService.get(this.organizationalUnitId, true).toPromise().then(
      data => {
        this.documentationTypes = data.filter(d => d.documentationStarterId >= DocumentationOrigin.AMBOS);
        this.formioDocumentationTypes = this.setDocumentationTypeList(this.documentationTypes.filter(d => d.exteralForm && d.exteralForm.length > 0));
        this.archiveDocumentationTypes = this.setDocumentationTypeList(this.documentationTypes.filter(d => !d.exteralForm || d.exteralForm.length < 1));
      },
      err => this.msjService.showError(err)
    );
  }

  selectDocumentationType(dt: DocumentationTypeSelectItem) {
    // Oculto el fileDocument View para recargarlo
    this.hideFileDocumentView = true;
    // Fuerzo la deteccion de cambios para que se oculte mientras estoy reconstruyendo el modelo
    this.ref.detectChanges();

    this.newDoc = new FileDocument();
    this.newDoc.hasFiles = false;
    this.newDoc.organizationalUnitId = this.organizationalUnitId;
    this.selectedDocumentationType = dt;
    this.formName = this.selectedDocumentationType.documentationType.exteralForm;
    this.newDoc.documentationTypeSelected = this.selectedDocumentationType.documentationType;
    this.newDoc.documentationTypeId = this.selectedDocumentationType.documentationType.id.toString();
    this.newDoc.documentationTypeName = this.selectedDocumentationType.documentationType.name;
    if (dt.documentationType.exteralForm != null && dt.documentationType.documentationStarterId == DocumentationOrigin.AMBOS) {
      this.personService.getMyContainer().toPromise().then(
        myContainerResult => {
          if (myContainerResult) {
            this.newDoc.metadatasCarpeta = this.metadataService.map(myContainerResult.metadatas);
          }

          // Si tiene un metadata value lo preseteo
          if (this.selectedDocumentationType.metadataValue && this.selectedDocumentationType.metadataValue.length > 0) {
            this.newDoc.setMetadata(this.selectedDocumentationType.metadataSystemName, this.selectedDocumentationType.metadataValue);
          }
          // Si tiene metadato predefinido lo seteo
          if (this.newDoc.documentationTypeSelected.metadataId) {
            this.documentationTypesService.getDocumentType(this.newDoc.documentationTypeSelected.documentTypeId).toPromise().then(
              data => {
                const metaAux = data.metadata.find(z => z['metadataId'] == this.newDoc.documentationTypeSelected.metadataId);
                this.newDoc.setMetadata(metaAux.metadataSystemName, this.newDoc.documentationTypeSelected.metadataKey);
              });
          }

          this.hideFileDocumentView = false;
          this.setIsOpen(true);
        }
      );
    } else {
      // Si tiene un metadata value lo preseteo
      if (this.selectedDocumentationType.metadataValue && this.selectedDocumentationType.metadataValue.length > 0) {
        this.newDoc.setMetadata(this.selectedDocumentationType.metadataSystemName, this.selectedDocumentationType.metadataValue);
      }

      this.hideFileDocumentView = false;
      this.setIsOpen(true);
    }

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

  documentCreated(event: any) {
    // Oculto el fileDocument View para recargarlo
    this.hideFileDocumentView = true;
    // Fuerzo la deteccion de cambios para que se oculte mientras estoy reconstruyendo el modelo
    this.ref.detectChanges();
    this.newDoc = undefined;
    this.msjService.showInfo('Se subió el documento');
    this.hideFileDocumentView = false;
    this.setIsOpen(false);
    this.ref.detectChanges();
  }

  private setDocumentationTypeList(doctypes: DocumentationType[]): DocumentationTypeSelectItem[] {
    const itemList = [];
    doctypes.forEach(d => {
      let hasSubtype = false;
      if (d.docTypesMetadatas && d.docTypesMetadatas.length > 0) {
        const subType = d.docTypesMetadatas.find(s => s.categoryId === DocTypeMetadatasCategory.Subtipo);
        if (subType) {
          hasSubtype = true;
          // Buscar los option values para esos subtipos u ponerlos ne la lista.
          this.metadataService.getMetadataById(subType.metadataId).toPromise()
            .then(metadata => {
              const opt = JSON.parse(metadata.attributes.find(a => a.type === "optionsValues").value);
              opt.forEach(element => {
                const item: DocumentationTypeSelectItem = {
                  description: d.description + " - " + element.description,
                  documentationType: d,
                  metadataSystemName: subType.systemName,
                  metadataValue: element.value
                };

                itemList.push(item);
              });
            })
            .catch(error => this.msjService.showError(error));
        }
      }

      if (!hasSubtype) {
        const item: DocumentationTypeSelectItem = {
          description: d.name,
          documentationType: d,
          metadataSystemName: '',
          metadataValue: ''
        };

        itemList.push(item);
      }
    });

    return itemList;
  }
}
