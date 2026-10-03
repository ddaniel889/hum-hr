import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { MessageService } from '../../shared/errorHandler/message.service';
import { RoleUserDetail } from '../../shared/models/role-user-detail.model';
import { DocumentationFind } from '../../shared/models/documentation-find.model';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { RoleUserService } from '../../shared/services/role-user.service';
import { ContainerTypeService } from '../../shared/services/container-type.service.';
import { ContainerType } from '../../shared/models/container-type.model';
import { SegmentEmployeeFind } from '../../shared/models/segment-employee-find.model';
import { EmployeeFind } from '../../shared/models/employee-find.model';
import { EmployeeMetadata } from '../../shared/models/employee-metadata.model';
import { AdjectiveRolesUser } from '../../shared/models/adjective-roles-user.model';
import { DocumentationType } from '../../shared/models/documentation-type.model';
import { DocumentationTypesService } from '../../shared/services/documentation-types.service';
import { OrganizationalUnit } from '../../shared/models';
import { ActorDetail } from '../../shared/models/actor-detail.model';

@Component({
  selector: 'app-role-adjetivation-detail',
  templateUrl: './role-adjetivation-detail.component.html',
  styles: []
})
export class RoleAdjetivationDetailComponent implements OnInit, OnChanges {
  @Input() actor: ActorDetail;
  @Input() rol: RoleUserDetail;
  @Input() selectedOu: OrganizationalUnit;
  @Input() organizationalUnits: OrganizationalUnit[];
  @Input() isAdjetiveSigner: boolean

  saving = false;
  editForm: UntypedFormGroup;
  selectedEditingControl: string;
  previousValue: any[];
  containerType: ContainerType;
  // Variables para la edicion de filtros
  allFilters: boolean;
  metadataFilters: any[];
  placeHolderDescription: string;
  selectedFilters: EmployeeMetadata[] = [];
  // Variables para la edicion de filtros de documentaciones
  allDocumentations: boolean;
  selectedDocumentationTypes: DocumentationFind[] = [];
  documentationTypes: DocumentationType[];
  seeDocumentFilter = true;
  documentsTypeIds=[];
  constructor(
    private msjService: MessageService,
    private _formBuilder: UntypedFormBuilder,
    private roleUserService: RoleUserService,
    private containerTypeService: ContainerTypeService,
    private documentationTypesService: DocumentationTypesService,
  ) {
  }

  ngOnInit() {
    this.editForm = this._formBuilder.group({});
  }

  ngOnChanges() {
    this.clearFormEdition();
    if (this.rol) this.seeDocumentFilter = !this.rol.functions.some(f => f.name === 'CANDIDATEADMIN' || f.name === 'ADMIN_CANDIDATE_BASIC');
  }

  editControl(selectedControl: string) {
    // Me guardo una copia del role User a editar
    if (this.selectedEditingControl) {
      this.clearFormEdition();
    }
    this.editForm.addControl(selectedControl, this.getFormControl(selectedControl));
    this.selectedEditingControl = selectedControl;
  }

  clearFormEdition() {
    if (!this.editForm || !this.selectedEditingControl) {
      return;
    }
    this.editForm.removeControl(this.selectedEditingControl);
    this.saving = false;
    this.selectedEditingControl = null;
  }

  getFormControl(selectedControl: string): UntypedFormControl {
    switch (selectedControl) {
      case 'employeeFolder':
        // Obtengo container type
        this.getFiltersData();
        return new UntypedFormControl('');
      case 'docTypes':
      //   // Obtengo container type
        this.getDocTypesData();
        return new UntypedFormControl('');
      default:
        return new UntypedFormControl('', Validators.required);
    }
  }

  updateEntityWithEdittedData() {
    this.previousValue = [];
    switch (this.selectedEditingControl) {
      case 'employeeFolder':
        this.previousValue.push(JSON.parse(JSON.stringify(this.rol.filters)));
        // transformo selected a filters
        this.rol.adjectiveRolesUser = this.rol.adjectiveRolesUser.filter(a => a.documentationTypeId);
        this.selectedFilters.forEach(m => {
          const adjectiveRole = this.createAdjectiveRole(m);
          const foundFilter = this.rol.adjectiveRolesUser.findIndex(a => a.metadataId === m.metadataId);
          if (foundFilter > -1) {
            this.rol.adjectiveRolesUser.splice(foundFilter, 1);
          }
          this.rol.adjectiveRolesUser.push(adjectiveRole);
        });
        return;
      case 'docTypes':
        this.previousValue.push(JSON.parse(JSON.stringify(this.rol.documentationTypes)));
        // transformo selected a documentationTypes
        this.rol.adjectiveRolesUser = this.rol.adjectiveRolesUser.filter(a => !a.documentationTypeId);
        this.selectedDocumentationTypes.forEach(dt => {
          const adjectiveRole = this.createAdjectiveRole(null, dt.id);
          this.rol.adjectiveRolesUser.push(adjectiveRole);
        });
        return;
    }
  }

  toggleAllFilters() {
    this.allFilters = !this.allFilters;

    if (this.allFilters) {
      this.selectedFilters = [];
    }
  }

  toggleAllDocumentations() {
    this.allDocumentations = !this.allDocumentations;

    if (this.allDocumentations) {
      this.selectedDocumentationTypes = [];
    }
  }

  createAdjectiveRole(filter?: EmployeeMetadata, documentationTypeId?: number) {
    const adjectiveRole = new AdjectiveRolesUser();
    adjectiveRole.metadataSystemName = filter ? filter.metadataSystemName : null;
    adjectiveRole.metadataId = filter ? filter.metadataId : null;
    adjectiveRole.metadataValue = filter ? filter.metadataValue.join('||') : null;
    adjectiveRole.documentationTypeId = documentationTypeId;

    return adjectiveRole;
  }

  getDocTypesData() {
    this.selectedDocumentationTypes = [];
    this.documentationTypesService.get(this.rol.organizationalUnitId).toPromise().then(
      data => {        
        this.documentationTypes = data;
        if(this.rol.roleName == 'FIRMANTE')
        {
          this.documentsTypeIds = [];
          this.extractDocumentsTypeIds();                    
          this.documentationTypes = this.documentationTypes.filter(x =>x.documentationTypeSequence.find(s => s.documentationSequence.id > 3));
          if(this.documentsTypeIds.length > 0){
          this.documentationTypes = this.documentationTypes.filter(x => this.documentsTypeIds.includes(x.id))
          }
        }
        this.rol.documentationTypes.forEach(d => {
          this.selectDocumentationType(d);
        });
      },
      err => this.msjService.showError(err)
    );
  }

  getFiltersData() {
    this.metadataFilters = [];
    if (this.rol.functions.findIndex(f => f.name === 'OVERSEER' || f.name === 'RRHH_DOCUMENTS' || f.name === 'FIRMANTE') > -1) {
      this.containerTypeService.getContainerType(this.rol.organizationalUnitId.toString()).toPromise()
        .then(containerType => {
          this.containerType = containerType;
          this.placeHolderDescription = "";
          this.selectedFilters = [];
          const metas = this.containerType.metadata.filter(m => m.isSearchCriteria);
          metas.forEach(meta => {
            const segmentList: SegmentEmployeeFind[] = [];
            if (meta.optionValues) {
              const options: any[] = JSON.parse(meta.optionValues.toString());
              this.placeHolderDescription = 'Selecciona ' + meta.metadataLabel;

              options.forEach(opt => {
                const desc = opt.description ? opt.description : opt.value;
                const segmentEmployeeFind = new SegmentEmployeeFind(opt.value, desc, meta.metadataSystemName);
                segmentList.push(segmentEmployeeFind);
              });

              const metdataFilter = { id: meta.metadataId, name: meta.metadataLabel, filters: segmentList, placeHolderDescription: this.placeHolderDescription, selectedMetadatas: [] };
              this.metadataFilters.push(metdataFilter);
              const filter = this.rol.filters.find(f => f.metadataId === metdataFilter.id);
              if (filter) {
                // Si existe el filtro en la entidad cargo los valores
                filter.values.forEach(val => {
                  this.selectMetadata(val, metdataFilter);
                });
              }
            }
          });
        },
          err => this.msjService.showError(err)
        );
    }
    if (this.rol.functions.findIndex(f => f.name === 'CANDIDATEADMIN' || f.name === 'ADMIN_CANDIDATE_BASIC') > -1) {
      // Busco el containerType de Candidato
      this.containerTypeService.getContainerType(this.rol.organizationalUnitId.toString(), true).toPromise()
        .then(candidateContainerType => {
          this.containerType = candidateContainerType;
          this.placeHolderDescription = "";
          this.selectedFilters = [];
          const metas = this.containerType.metadata.filter(m => m.isSearchCriteria);
          metas.forEach(meta => {
            const segmentList: SegmentEmployeeFind[] = [];
            if (meta.optionValues) {
              const options: any[] = JSON.parse(meta.optionValues.toString());
              this.placeHolderDescription = 'Selecciona ' + meta.metadataLabel;

              options.forEach(opt => {
                const desc = opt.description ? opt.description : opt.value;
                const segmentEmployeeFind = new SegmentEmployeeFind(opt.value, desc, meta.metadataSystemName);
                segmentList.push(segmentEmployeeFind);
              });

              const metdataFilter = { id: meta.metadataId, name: meta.metadataLabel, filters: segmentList, placeHolderDescription: this.placeHolderDescription, selectedMetadatas: [] };
              this.metadataFilters.push(metdataFilter);
              const filter = this.rol.filters.find(f => f.metadataId === metdataFilter.id);
              if (filter) {
                // Si existe el filtro en la entidad cargo los valores
                filter.values.forEach(val => {
                  this.selectMetadata(val, metdataFilter);
                });
              }
            }
          });
        },
          err => this.msjService.showError(err)
        );
    }
  }

  selectMetadata(metadataName, metadata: any) {
    const foundMetadata = metadata.filters.find(dt => dt.name == metadataName);
    if (foundMetadata) {
      const employeeFind = new EmployeeFind(foundMetadata.id, foundMetadata.name, null);
      metadata.selectedMetadatas.push(employeeFind);

      const foundFilter = this.selectedFilters.find(sf => sf.metadataId == metadata.id);
      if (!foundFilter) {
        const meta = new EmployeeMetadata();
        meta.metadataValue = [];
        meta.metadataSystemName = foundMetadata.systemName;
        meta.metadataId = metadata.id;
        meta.metadataValue.push(foundMetadata.id);
        meta.descriptionValue = foundMetadata.name;

        this.selectedFilters.push(meta);
      } else {
        foundFilter.metadataValue.push(foundMetadata.id);
      }
      this.allFilters = false;
    }
  }

  removeMetadata(event: any, metadata: any) {
    const foundFilter = this.selectedFilters.find(sf => sf.metadataId == metadata.id);
    if (foundFilter) {
      if (foundFilter.metadataValue.length === 1) {
        this.selectedFilters = this.selectedFilters.filter(sf => sf.metadataId != metadata.id);
        this.allFilters = this.selectedFilters.length === 0;
      } else {
        foundFilter.metadataValue = foundFilter.metadataValue.filter(m => m != event.id);
      }
    }
  }

  selectDocumentationType(dtName: string) {
    const foundDt = this.documentationTypes.filter(dt => dt.name == dtName);
    if (foundDt.length) {
      const sequenceList = [];
      foundDt[0].documentationTypeSequence.forEach(dts => {
        sequenceList.push(dts.documentationSequence);
      });

      const dtFind = new DocumentationFind(foundDt[0].documentTypeId, foundDt[0].id, foundDt[0].name, sequenceList);
      this.selectedDocumentationTypes.push(dtFind);
      this.allDocumentations = false;
    }
  }

  removeDocumentation() {
    this.allDocumentations = this.selectedDocumentationTypes.length === 0;
  }

  save() {
    this.saving = true;
    this.updateEntityWithEdittedData();
    if (this.selectedEditingControl === 'employeeFolder' || this.selectedEditingControl === 'docTypes') this.saveAdjectives();
  }

  saveAdjectives() { 
    this.selectedOu = this.selectedOu.isRoot ? this.organizationalUnits.find(x => x.id == this.rol.organizationalUnitId) : this.selectedOu;   
    this.roleUserService.updateAdjectives(this.rol, this.rol.functions.findIndex(f => f.name === 'CANDIDATEADMIN' || f.name === 'ADMIN_CANDIDATE_BASIC') > -1,this.selectedOu.useAdjetivationRolSignatory,this.rol.functions.findIndex(f => f.name === 'FIRMANTE') > -1).toPromise()
      .then(data => {
        // Piso los adjectives y sus properties
        this.rol.adjectiveRolesUser = data.adjectiveRolesUser;
        this.rol.filters = data.filters;
        this.rol.documentationTypes = data.documentationTypes;

        this.msjService.showInfo('Dato guardado correctamente');
        this.clearFormEdition();
      },
        err => {
          this.msjService.showError(err);
          this.saving = false;
        });
  }
  
  cancel() {
    this.clearFormEdition();
  }
  extractDocumentsTypeIds()
  {
    if(this.actor)
   {    
     let docTypes = this.actor.roles.filter(r => r.enabled && r.roleName != 'FIRMANTE').map(x =>  x.adjectiveRolesUser.filter(f => f.documentationTypeId != null).map(s => s.documentationTypeId));
     docTypes.forEach(arr => {
        arr.forEach(id => {
            this.documentsTypeIds.push(id);        
         });
      });      
   }
}
}
