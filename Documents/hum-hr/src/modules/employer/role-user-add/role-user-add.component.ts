import { Component, OnInit, ViewChild, Input, Output, EventEmitter, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { RoleUser } from '../../shared/models/role-user.model';
import { MessageService } from '../../shared/errorHandler/message.service';
import { OrganizationalUnit, User, ContainerType } from '../../shared/models';
import { OrganizationalUnitService } from '../../shared/services/organizational-unit.service';
import { RoleService } from '../../shared/services/role.service';
import { Role } from '../../shared/models/role.model';
import { UntypedFormControl, Validators, UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { UserService } from '../../shared/services/user.service';
import { AppConfig } from 'src/app/app.config';
import { ContainerTypeService } from '../../shared/services/container-type.service.';
import { SegmentEmployeeFind } from '../../shared/models/segment-employee-find.model';
import { EmployeeFind } from '../../shared/models/employee-find.model';
import { DocumentationType } from '../../shared/models/documentation-type.model';
import { DocumentationFind } from '../../shared/models/documentation-find.model';
import { DocumentationTypesService } from '../../shared/services/documentation-types.service';
import { AdjectiveRolesUser } from '../../shared/models/adjective-roles-user.model';
import { EmployeeMetadata } from '../../shared/models/employee-metadata.model';
import { EmployerService } from '../../shared/services/employer.service';
import { MatStepper } from '@angular/material/stepper';

@Component({
  selector: 'app-role-user-add',
  templateUrl: './role-user-add.component.html',
  styles: []
})
export class RoleUserAddComponent implements OnInit, AfterViewInit {
  @ViewChild('stepper') stepper: MatStepper;
  @Input() selectedOu: OrganizationalUnit;
  @Output() closeCreate = new EventEmitter<boolean>();
  organizationalUnits: OrganizationalUnit[];
  containerType: ContainerType;
  roleUser: RoleUser;
  user: User;
  loading = false;
  roles: Role[] = [];
  role: Role;
  selectedRoleFrmCtrl: UntypedFormControl;
  nameFrmCtrl: UntypedFormControl;
  lastNameFrmCtrl: UntypedFormControl;
  nickNameFrmCtrl: UntypedFormControl;
  emailFrmCtrl: UntypedFormControl;
  metadataFiltersFrmCtrl: UntypedFormControl;
  isOuUserFrmControl: UntypedFormControl;
  addRoleFormGroup: UntypedFormGroup;
  selectOuFormGroup: UntypedFormGroup;
  selectFiltersFormGroup: UntypedFormGroup;
  selectDocumentationFormGroup: UntypedFormGroup;
  mailValidated = false;
  oldMailValue: string;
  allFilters = true;
  allDocumentations = true;
  clickOnce = false;
  appId = AppConfig.settings.application.id;
  metadataFilters: any[];
  placeHolderDescription: string;
  selectedMetadatas: EmployeeFind[] = [];
  selectedFilters: EmployeeMetadata[] = [];
  documentationTypes: DocumentationType[];
  selectedDocumentationTypes: DocumentationFind[] = [];
  initialOuIsRoot: boolean;
  noContainerType = false;
  canHaveFilters = false;
  isSignerAdjetive = false;
  filtersForCandidateAdmin = false;
  isSigner = false
  useSaml = false;
  stepperEnum: any = {
    OuSelection: 0,
    RoleUser: 1,
    Filters: 2,
    Documentation: 3,
    Summary: 4
  };
  documentsTypeIds=[];
  constructor(
    private msjService: MessageService,
    private organizationalUnitService: OrganizationalUnitService,
    private roleService: RoleService,
    private _formBuilder: UntypedFormBuilder,
    private containerTypeService: ContainerTypeService,
    private documentationTypesService: DocumentationTypesService,
    private userService: UserService,
    private employerService: EmployerService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.role = new Role();
    this.user = new User();
    this.roleUser = new RoleUser();
  }

  ngOnInit() {
    this.selectOuFormGroup = this._formBuilder.group({
      selectedOuFormControl: ['', Validators.required],
      isOuUserFrmControl: this.isOuUserFrmControl = new UntypedFormControl('false'),
    });

    this.addRoleFormGroup = this._formBuilder.group({
      selectedRoleFrmCtrl: this.selectedRoleFrmCtrl = new UntypedFormControl('', Validators.required),
      emailFrmCtrl: [{ value: '', disabled: false }, [Validators.required, Validators.email]],
      nameFrmCtrl: [{ value: '', disabled: true }, [Validators.required, Validators.maxLength(50)]],
      lastNameFrmCtrl: [{ value: '', disabled: true }, [Validators.required, Validators.maxLength(50)]],
      nickNameFrmCtrl: [{ value: '', disabled: true }, [Validators.maxLength(50)]]
    });

    this.selectFiltersFormGroup = this._formBuilder.group({
      metadataFiltersFrmCtrl: this.metadataFiltersFrmCtrl = new UntypedFormControl('', Validators.required),
    });

    this.selectDocumentationFormGroup = this._formBuilder.group({});
    if (this.selectedOu.isRoot) {
      this.organizationalUnitService.getTreeInMemory()
        .then(ous => {
          this.organizationalUnits = ous.filter(o => o.isRoot == false);
        },
          err => this.msjService.showError(err)
        );
    } else {
      this.getRoles();
    }
    this.initialOuIsRoot = this.selectedOu.isRoot;
    this.canHaveFilters = !this.selectedOu.isRoot;
    this.useSaml = this.selectedOu.useSaml;
    if (!this.selectedOu.isRoot) {
      this.getContainerType();
    }
  }

  ngAfterViewInit() {
    this.stepper.selectedIndex = this.selectedOu.isRoot ? this.stepperEnum.OuSelection : this.stepperEnum.RoleUser;
    this.changeDetectorRef.detectChanges();
  }

  getContainerType() {
    this.metadataFilters = [];
    this.placeHolderDescription = "";
    this.selectedMetadatas = [];
    this.selectedFilters = [];

    this.containerTypeService
      .getContainerType(this.selectedOu.id.toString())
      .toPromise()
      .then(containerType => {
        this.containerType = containerType;
        this.loading = false;
        this.getFiltersData();
      },
        err => {
          if (err.code === "INTE009") {
            // Si no tiene legajo lo marco como sin legajo pero no tiro error.
            this.noContainerType = true;
          } else {
            this.msjService.showError(err);
          }
        }
      );
  }

  validateSelectOuFormGroup(): boolean {
    if (this.isOuUserFrmControl.value === 'true') {
      // Es empresa hija y hay que verificar el formulario
      return this.selectOuFormGroup.valid;
    }

    return true;
  }

  setOrganizationalUnit() {
    this.noContainerType = false;
    if (this.selectOuFormGroup.invalid && this.isOuUserFrmControl.value === 'true') {
      return;
    }

    if (this.isOuUserFrmControl.value === 'true') {
      this.selectedOu = this.selectOuFormGroup.controls['selectedOuFormControl'].value;
      this.useSaml = this.selectedOu.useSaml;
      this.getContainerType();
      this.getDocumentationTypes(this.selectedOu);
    }

    this.stepper.selectedIndex = this.stepperEnum.RoleUser;
    this.getRoles();
  }

  setUserRole() {
    this.role = this.roles.find(r => r.id === this.addRoleFormGroup.value.selectedRoleFrmCtrl);
    this.canHaveFilters = (this.role.functions.findIndex(f => f.name === 'OVERSEER' || f.name === 'RRHH_DOCUMENTS') > -1) && !this.selectedOu.isRoot;
    this.isSignerAdjetive = (this.role.functions.findIndex(f=> f.name === 'FIRMANTE') > -1) && !this.selectedOu.isRoot && this.selectedOu.useAdjetivationRolSignatory;
    this.isSigner = (this.role.functions.findIndex(f=> f.name === 'FIRMANTE') > -1);
    this.filtersForCandidateAdmin = (this.role.functions.findIndex(f => f.name === 'CANDIDATEADMIN' || f.name === 'ADMIN_CANDIDATE_BASIC') > -1) && !this.selectedOu.isRoot;
    this.getDocumentationTypes(this.selectedOu);
    if (this.role.functions.findIndex(f => f.name === 'CANDIDATEADMIN' || f.name === 'ADMIN_CANDIDATE_BASIC') > -1 && !this.selectedOu.isRoot) {
      this.containerTypeService
        .getContainerType(this.selectedOu.id.toString(), true)
        .toPromise()
        .then(containerType => {
          this.containerType = containerType;
          this.loading = false;
          this.getFiltersData();
        },
          err => {
            if (err.code === "INTE009") {
              // Si no tiene legajo lo marco como sin legajo pero no tiro error.
              this.noContainerType = true;
            } else {
              this.msjService.showError(err);
            }
          }
        );
    }
    if (this.role.functions.findIndex(f => f.name === 'OVERSEER' || f.name === 'RRHH_DOCUMENTS') > -1 && !this.selectedOu.isRoot) {
      this.containerTypeService
        .getContainerType(this.selectedOu.id.toString())
        .toPromise()
        .then(containerType => {
          this.containerType = containerType;
          this.loading = false;
          this.getFiltersData();
        },
          err => {
            if (err.code === "INTE009") {
              // Si no tiene legajo lo marco como sin legajo pero no tiro error.
              this.noContainerType = true;
            } else {
              this.msjService.showError(err);
            }
          }
        );
    }
  }

  getRoles() {
    this.clickOnce = true;
    this.roleService.getEmployerRolesByFunctions(this.selectedOu.id).toPromise()
      .then(res => {
        this.roles = res;
        this.clickOnce = false;
      },
        err => {
          this.clickOnce = false;
          this.msjService.showError(err);
        }
      );
  }

  getDocumentationTypes(organizationalUnit: OrganizationalUnit) {
    this.selectedDocumentationTypes = [];

    this.documentationTypesService.get(organizationalUnit.id).toPromise().then(
      data => {
        this.documentationTypes = data;
      },
      err => this.msjService.showError(err)
    );
  }

  goBackFromUserRolesStep() {
  this.organizationalUnitService.getTreeInMemory()
    .then(ous => {
      this.selectedOu = ous.find(o => o.isRoot == true);
    },
      err => this.msjService.showError(err)
    );

    if (this.initialOuIsRoot) {
      this.stepper.selectedIndex = this.stepperEnum.OuSelection;
    } else {
      this.close();
    }
  }

  goBackToRoleUserStep() {
    this.stepper.selectedIndex = this.stepperEnum.RoleUser;
  }

  goToFilterStep() {    
    if (this.canHaveFilters || this.filtersForCandidateAdmin) {
      this.stepper.selectedIndex = this.stepperEnum.Filters;
      return;
    }
    if(this.isSignerAdjetive){
      this.documentationTypes = this.documentationTypes.filter(x =>x.documentationTypeSequence.find(s => s.documentationSequence.id > 3));
      this.documentsTypeIds=[];
      this.extractDocumentsTypeIds(); 
      if(this.documentsTypeIds.length > 0){     
      this.documentationTypes = this.documentationTypes.filter(x => this.documentsTypeIds.includes(x.id))
      }
      this.stepper.selectedIndex = this.stepperEnum.Documentation;
      return;
    }
    // Si no corresponde aplicar filtros lo mando a resumen 
    return this.goToSummary();
  }

  goToDocOrSummary() {
    if (this.canHaveFilters || this.isSignerAdjetive) {
      return this.goToDocumentationStep();
    }
    else {
      return this.goToSummary();
    }
  }

  goToDocumentationStep() {
    this.stepper.selectedIndex = this.stepperEnum.Documentation;
  }

  goBackToFilterStep() {    
    if(this.isSignerAdjetive){
      this.stepper.selectedIndex = this.stepperEnum.RoleUser;
    }
    else
    {
       this.stepper.selectedIndex = this.stepperEnum.Filters;
    }
  }

  goBackToDocumentationStep() {
    // Si no aplica filtros lo mando directo al inicio
    if (!this.canHaveFilters && !this.isSignerAdjetive) {
      return this.goBackToRoleUserStep();
    }


    this.stepper.selectedIndex = this.stepperEnum.Documentation;
  }

  goToSummary() {
    this.createRoleUserData();
    this.stepper.selectedIndex = this.stepperEnum.Summary;
  }

  createRoleUserData() {
    const mailControl = this.addRoleFormGroup.controls["emailFrmCtrl"];
    const firstNameControl = this.addRoleFormGroup.controls["nameFrmCtrl"];
    const lastNameControl = this.addRoleFormGroup.controls["lastNameFrmCtrl"];
    const nickNameControl = this.addRoleFormGroup.controls["nickNameFrmCtrl"];

    this.user.firstName = firstNameControl.value;
    this.user.lastName = lastNameControl.value;
    this.user.delegatedSystemId = nickNameControl.value;
    this.user.mail = mailControl.value;
    this.user.mailConfirm = mailControl.value;
    this.user.certificateExpirationDate = null;
    this.user.certificateProviderId = null;
    this.user.certificateProviderName = null;
    this.user.organizationalUnitId = this.selectedOu.id;
    this.user.enabled = true;
    this.user.organizationalUnitIds = [this.selectedOu.id];
    this.user.applicationId = +this.appId;
    this.user.roles = [];

    this.roleUser.organizationalUnitId = this.selectedOu.id;
    this.roleUser.roleId = this.role.id;
    this.roleUser.adjectiveRolesUser = [];

    this.selectedFilters.forEach(m => {
      const adjectiveRole = this.createAdjectiveRole(m);
      this.roleUser.adjectiveRolesUser.push(adjectiveRole);
    });

    this.selectedDocumentationTypes.forEach(dt => {
      const adjectiveRole = this.createAdjectiveRole(null, dt.id);
      this.roleUser.adjectiveRolesUser.push(adjectiveRole);
    });

    this.user.roles.push(this.roleUser);
  }

  createAdjectiveRole(filter?: EmployeeMetadata, documentationTypeId?: number) {
    const adjectiveRole = new AdjectiveRolesUser();
    adjectiveRole.metadataSystemName = filter ? filter.metadataSystemName : null;
    adjectiveRole.metadataId = filter ? filter.metadataId : null;
    adjectiveRole.metadataValue = filter ? filter.metadataValue.join('||') : null;
    adjectiveRole.documentationTypeId = documentationTypeId;

    return adjectiveRole;
  }

  save() {
    this.clickOnce = true;    
    this.selectedOu = this.selectedOu.isRoot 
      ? this.organizationalUnits.find(x => x.id === this.user.organizationalUnitId) 
      : this.selectedOu;  
  
    const createUser = (useAdjetivationRolSignatory: boolean) => {
      this.employerService.createAdjectivedUser(this.user, useAdjetivationRolSignatory, this.isSigner).toPromise()
        .then(data => {
          this.clickOnce = false;
          this.msjService.showInfo("Actor creado correctamente");
          this.closeCreate.emit(true);
        })
        .catch(err => {
          this.clickOnce = false;
          this.msjService.showError(err);
        });
    };
  
    try {
      createUser(this.selectedOu.useAdjetivationRolSignatory);
    } catch {
      createUser(false);
    }
  }

  getFiltersData() {
    this.metadataFilters = [];
    this.placeHolderDescription = "";
    this.selectedMetadatas = [];
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

        this.metadataFilters.push({ id: meta.metadataId, name: meta.metadataLabel, filters: segmentList, placeHolderDescription: this.placeHolderDescription, selectedMetadatas: [] });
      }
    });
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

  toggleAllFilters() {
    this.allFilters = !this.allFilters;

    if (this.allFilters) {
      this.selectedFilters = [];
      this.metadataFilters.forEach(mf => {
        mf.selectedMetadatas = [];
      });
    }
  }

  toggleAllDocumentations() {
    this.allDocumentations = !this.allDocumentations;

    if (this.allDocumentations) {
      this.selectedDocumentationTypes = [];
    }
  }

  close() {
    this.closeCreate.emit(false);
  }

  changeMail() {
    this.mailValidated = false;
  }

  checkUserMail() {
    if (this.addRoleFormGroup.value.emailFrmCtrl === this.oldMailValue || this.addRoleFormGroup.value.emailFrmCtrl === this.user.mail) {
      return;
    }
    const mailControl = this.addRoleFormGroup.controls["emailFrmCtrl"];
    const firstNameControl = this.addRoleFormGroup.controls["nameFrmCtrl"];
    const lastNameControl = this.addRoleFormGroup.controls["lastNameFrmCtrl"];
    const nickNameControl = this.addRoleFormGroup.controls["nickNameFrmCtrl"];

    if (!this.addRoleFormGroup.controls.emailFrmCtrl.valid) {
      this.mailValidated = false;
      this.addRoleFormGroup.disable();
      this.addRoleFormGroup.controls["emailFrmCtrl"].enable();
      this.addRoleFormGroup.controls["selectedRoleFrmCtrl"].enable();
      return;
    }

    this.oldMailValue = this.addRoleFormGroup.value.emailFrmCtrl;

    const params = {
      Mail: mailControl.value,
      lod: 'CompleteDetail'
    };

    this.userService.get(params)
      .subscribe(
        users => {
          if (users.length > 0) {
            firstNameControl.setValue(users[0].firstName);
            lastNameControl.setValue(users[0].lastName);
            nickNameControl.setValue(users[0].delegatedSystemId);
            mailControl.setValue(users[0].mail);
            this.user.loginId = users[0].loginId;
            this.user.mail = users[0].mail;
            this.user.delegatedSystemId = users[0].delegatedSystemId;
            this.user.nickName = users[0].nickName;
            this.user = users[0];
            this.changeUserControlEnable(false);
          } else {
            firstNameControl.setValue("");
            lastNameControl.setValue("");
            nickNameControl.setValue("");
            this.user.loginId = null;
            this.user.mail = "";
            this.changeUserControlEnable(true);
          }
          this.mailValidated = true;
        },
        error => {
          this.msjService.showError(error);
        }
      );
  }

  changeUserControlEnable(enabled: boolean) {
    const firstNameControl = this.addRoleFormGroup.controls["nameFrmCtrl"];
    const lastNameControl = this.addRoleFormGroup.controls["lastNameFrmCtrl"];
    const nickNameControl = this.addRoleFormGroup.controls["nickNameFrmCtrl"];
    if (enabled) {
      firstNameControl.enable();
      lastNameControl.enable();
      nickNameControl.enable();
    } else {
      firstNameControl.disable();
      lastNameControl.disable();
      nickNameControl.disable();

    }

  }
  extractDocumentsTypeIds()
  {
    if(this.user)
   {
    
      let docTypes =this.user.roles.filter(r => r.roleName != 'FIRMANTE').map(x =>  x.adjectiveRolesUser.filter(f => f.documentationTypeId != null).map(s => s.documentationTypeId));
      docTypes.forEach(arr => {
        arr.forEach(id => {
            this.documentsTypeIds.push(id);        
         });
      });      
   }
}
}
