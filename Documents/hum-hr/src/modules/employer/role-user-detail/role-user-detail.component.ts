import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { MessageService } from '../../shared/errorHandler/message.service';
import { RoleUserDetail } from '../../shared/models/role-user-detail.model';
import { DocumentationFind } from '../../shared/models/documentation-find.model';
import { UserService } from '../../shared/services/user.service';
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
import { WelcomeParametersDTO } from '../../shared/models/email.model';
import { AuthService } from '../../shared/auth/auth.service';
import { AppConfig } from 'src/app/app.config';
import { OrganizationalUnitService } from '../../shared/services/organizational-unit.service';
import { OrganizationalUnit } from '../../shared/models';

@Component({
  selector: 'app-role-user-detail',
  templateUrl: './role-user-detail.component.html',
  styles: []
})
export class RoleUserDetailComponent implements OnInit, OnChanges {
  @Input() roleUser: RoleUserDetail;
  @Input() selectedOu: OrganizationalUnit;
  @Output() closeDetail = new EventEmitter<boolean>();
  @Output() saved = new EventEmitter<RoleUserDetail>();

  welcomeSent = false;
  saving = false;
  editForm: UntypedFormGroup;
  edittedRoleUser: RoleUserDetail;
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
  hasSAML = false;
  isEnabled = true;
  isFirmante = false;
  useSaml = false;
  seeDocumentFilter = true;

  constructor(
    private msjService: MessageService,
    private userService: UserService,
    private _formBuilder: UntypedFormBuilder,
    private roleUserService: RoleUserService,
    private containerTypeService: ContainerTypeService,
    private documentationTypesService: DocumentationTypesService,
    private authService: AuthService,
    private organizationalUnitService: OrganizationalUnitService,
  ) {
  }

  ngOnInit() {
    this.editForm = this._formBuilder.group({});
  }

  ngOnChanges() {
    const ouId = this.roleUser.organizationalUnitId;
    const roleUserOu = this.organizationalUnitService.getTreeOu().find(t => t.id === ouId);
    this.useSaml = roleUserOu.useSaml;
    this.welcomeSent = false;
    this.clearFormEdition();
    if (this.roleUser) {
      this.isFirmante = this.roleUser.functions.some(f => f.name == 'FIRMANTE');
      this.seeDocumentFilter = !this.roleUser.functions.some(f => f.name === 'CANDIDATEADMIN' || f.name === 'ADMIN_CANDIDATE_BASIC');
      this.getSAML();
      this.isEnabled = this.roleUser.enabled;
    }
  }

  close() {
    this.closeDetail.emit(false);
  }

  sendWelcomeMail() {
    const dto = new WelcomeParametersDTO();
    dto.userId = this.roleUser.userId;
    this.userService.pendingWelcome(dto).toPromise()
      .then(() => {
        this.welcomeSent = true;
        this.msjService.showInfo("El correo electrónico de bienvenida será enviado al usuario");
      })
      .catch(err => this.msjService.showError(err));
  }

  enableUser() {
    const roleUserIds = [this.roleUser.id];
    this.roleUserService
      .enableUser(roleUserIds)
      .subscribe(
        () => {
          this.closeDetail.emit(true);
        },
        error => {
          this.isEnabled = !this.isEnabled;
          this.msjService.showError(error);
        });
  }


  disableUser() {
    const roleIds = [this.roleUser.roleId];
    this.userService
      .removeRol(this.roleUser.userId, roleIds)
      .subscribe(
        () => {
          this.closeDetail.emit(true);
        },
        error => {
          this.isEnabled = !this.isEnabled;
          this.msjService.showError(error);
        });
  }

  editControl(selectedControl: string) {    
    // Me guardo una copia del role User a editar
    this.edittedRoleUser = { ...this.roleUser };

    if (this.selectedEditingControl) {
      this.clearFormEdition();
    }

    if (selectedControl === 'fullName') {
      this.editForm.addControl('firstName', this.getFormControl('firstName'));
      this.editForm.addControl('lastName', this.getFormControl('lastName'));
    } else {
      this.editForm.addControl(selectedControl, this.getFormControl(selectedControl));
    }

    this.selectedEditingControl = selectedControl;
  }

  clearFormEdition() {
    if (!this.editForm || !this.selectedEditingControl) {
      return;
    }

    if (this.selectedEditingControl == 'fullName') {
      this.editForm.removeControl('firstName');
      this.editForm.removeControl('lastName');
    } else {
      this.editForm.removeControl(this.selectedEditingControl);
    }


    this.saving = false;
    this.selectedEditingControl = null;
  }

  getFormControl(selectedControl: string): UntypedFormControl {
    switch (selectedControl) {
      case 'nickName':
        return new UntypedFormControl(this.edittedRoleUser.delegatedSystemId, Validators.required);
      case 'firstName':
        return new UntypedFormControl(this.edittedRoleUser.firstName, Validators.required);
      case 'lastName':
        return new UntypedFormControl(this.edittedRoleUser.lastName, Validators.required);
      case 'mail':
        return new UntypedFormControl(this.edittedRoleUser.mail, [Validators.required, Validators.email]);
      case 'employeeFolder':
        // Obtengo container type
        this.getFiltersData();
        return new UntypedFormControl('');
      case 'docTypes':
        // Obtengo container type
        this.getDocTypesData();
        return new UntypedFormControl('');
      default:
        return new UntypedFormControl('', Validators.required);
    }
  }

  updateEntityWithEdittedData() {
    this.previousValue = [];
    switch (this.selectedEditingControl) {
      case 'nickName':
        this.previousValue.push(JSON.parse(JSON.stringify(this.roleUser.delegatedSystemId)));
        this.roleUser.delegatedSystemId = this.editForm.controls[this.selectedEditingControl].value;
        return;
      case 'fullName':
        this.previousValue.push(JSON.parse(JSON.stringify(this.roleUser.firstName)));
        this.previousValue.push(JSON.parse(JSON.stringify(this.roleUser.lastName)));
        this.roleUser.firstName = this.editForm.controls['firstName'].value;
        this.roleUser.lastName = this.editForm.controls['lastName'].value;
        return;
      case 'mail':
        this.previousValue.push(JSON.parse(JSON.stringify(this.roleUser.mail)));
        this.roleUser.mail = this.editForm.controls['mail'].value;
        return;
      case 'employeeFolder':
        this.previousValue.push(JSON.parse(JSON.stringify(this.roleUser.filters)));
        // transformo selected a filters
        this.roleUser.adjectiveRolesUser = this.roleUser.adjectiveRolesUser.filter(a => a.documentationTypeId);
        this.selectedFilters.forEach(m => {
          const adjectiveRole = this.createAdjectiveRole(m);
          const foundFilter = this.roleUser.adjectiveRolesUser.findIndex(a => a.metadataId === m.metadataId);
          if (foundFilter > -1) {
            this.roleUser.adjectiveRolesUser.splice(foundFilter, 1);
          }

          this.roleUser.adjectiveRolesUser.push(adjectiveRole);
        });
        return;
      case 'docTypes':
        this.previousValue.push(JSON.parse(JSON.stringify(this.roleUser.documentationTypes)));
        // transformo selected a documentationTypes
        this.roleUser.adjectiveRolesUser = this.roleUser.adjectiveRolesUser.filter(a => !a.documentationTypeId);
        this.selectedDocumentationTypes.forEach(dt => {
          const adjectiveRole = this.createAdjectiveRole(null, dt.id);
          this.roleUser.adjectiveRolesUser.push(adjectiveRole);
        });
        return;
    }
  }

  resetValue() {
    switch (this.selectedEditingControl) {
      case 'nickName':
        this.roleUser.delegatedSystemId = this.previousValue[0];
        return;
      case 'fullName':
        this.roleUser.firstName = this.previousValue[0];
        this.roleUser.lastName = this.previousValue[1];
        return;
      case 'mail':
        this.roleUser.mail = this.previousValue[0];
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

  transformAdjectiveRolesToSelectedMetadatas(adjectiveRole: AdjectiveRolesUser) {
    return;
  }

  getDocTypesData() {
    this.selectedDocumentationTypes = [];
    this.documentationTypesService.get(this.roleUser.organizationalUnitId).toPromise().then(
      data => {
        this.documentationTypes = data;
        this.roleUser.documentationTypes.forEach(d => {
          this.selectDocumentationType(d);
        });
      },
      err => this.msjService.showError(err)
    );
  }

  getFiltersData() {
    this.metadataFilters = [];
    if (this.roleUser.functions.findIndex(f => f.name === 'OVERSEER' || f.name === 'RRHH_DOCUMENTS') > -1) {
      this.containerTypeService.getContainerType(this.roleUser.organizationalUnitId.toString()).toPromise()
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
              const filter = this.roleUser.filters.find(f => f.metadataId === metdataFilter.id);
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
    if (this.roleUser.functions.findIndex(f => f.name === 'CANDIDATEADMIN' || f.name === 'ADMIN_CANDIDATE_BASIC') > -1) {
      // Busco el containerType de Candidato
      this.containerTypeService.getContainerType(this.roleUser.organizationalUnitId.toString(), true).toPromise()
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
              const filter = this.roleUser.filters.find(f => f.metadataId === metdataFilter.id);
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
    if (this.selectedEditingControl === 'employeeFolder' || this.selectedEditingControl === 'docTypes') {
      this.saveAdjectives();
    } else {
      this.roleUserService.update(this.roleUser).toPromise()
        .then(data => {
          this.msjService.showInfo('Dato guardado correctamente');
          this.clearFormEdition();
          this.roleUser.nickName = data.nickName;
          this.saved.emit(this.roleUser);
        },
          err => {
            this.msjService.showError(err);
            this.resetValue();
            this.saving = false;
          });
    }
  }

  saveAdjectives() {
    this.roleUserService.updateAdjectives(this.roleUser, this.roleUser.functions.findIndex(f => f.name === 'CANDIDATEADMIN' || f.name === 'ADMIN_CANDIDATE_BASIC') > -1).toPromise()
      .then(data => {
        // Piso los adjectives y sus properties
        this.roleUser.adjectiveRolesUser = data.adjectiveRolesUser;
        this.roleUser.filters = data.filters;
        this.roleUser.documentationTypes = data.documentationTypes;

        this.msjService.showInfo('Dato guardado correctamente');
        this.clearFormEdition();
        this.saved.emit(this.roleUser);
      },
        err => {
          this.msjService.showError(err);
          this.resetValue();
          this.saving = false;
        });
  }

  cancel() {
    this.clearFormEdition();
  }

  unlock() {
    const user = {
      id: this.roleUser.userId,
      locked: false
    };

    this.userService
      .updateLock(user)
      .subscribe(
        data => {
          this.roleUser.locked = false;
          this.msjService.showInfo('Usuario desbloqueado con éxito.\nEl usuario recibirá un mail con la nueva contraseña');
        },
        err => this.msjService.showError(err)
      );
  }

  getSAML() {
    this.authService.getSAML(this.roleUser.organizationalUnitId).toPromise().then(
      data => {
        this.hasSAML = (data != null) ? data.active : false;
      },
      err => {
        this.hasSAML = false;
      }
    );
  }

  changeSaml() {
    const params = {
      userid: this.roleUser.userId,
      applicationId: AppConfig.settings.application.id
    };
    this.userService.updateSaml(params, this.roleUser.isSamlActive).toPromise().then(
      () => {
        const message = (this.roleUser.isSamlActive) ? 'Se activó la Autenticación Delegada (SAML)' : 'Se Desactivó la Autenticación Delegada (SAML)';
        this.msjService.showInfo(message);
      },
      err => {
        this.roleUser.isSamlActive = !this.roleUser.isSamlActive;
        this.msjService.showError(err);
      }
    );
  }

  changeEnabled() {
    if (this.isEnabled && !this.roleUser.enabled) {
      this.enableUser();
    } else {
      this.disableUser();
    }
  }
}
