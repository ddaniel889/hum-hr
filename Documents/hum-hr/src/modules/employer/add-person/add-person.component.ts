import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, Validators, UntypedFormBuilder } from '@angular/forms';
import { OrganizationalUnit, ContainerType, CertificateType, Employee } from '../../shared/models';
import { OrganizationalUnitService } from '../../shared/services/organizational-unit.service';
import { MessageService } from '../../shared/errorHandler/message.service';
import { ContainerTypeService } from '../../shared/services/container-type.service.';
import { EmployeeMetadata } from '../../shared/models/employee-metadata.model';
import { Person } from '../../shared/models/Employee/person.model';
import { CertificateService } from '../../shared/services/certificate.service';
import { OuConfigSignatureTypeParametersDTO } from '../../shared/models/signatureType.model';
import { MaskApplierService } from 'ngx-mask';
import { EmployeeService } from '../../shared/services/employee.service';
import { CandidateService } from '../../shared/services/candidate.service';
import { Candidate } from '../../shared/models/Employee/candidate.model';
import { PersonService } from '../../shared/services/person.service';
import { AuthService } from '../../shared/auth/auth.service';
import { AddMetadataItem, MetadataClass } from '../../shared/models/metadata.model';
import { MetadataService } from '../../shared/services/metadatas.service';
import { DocumentationTypeSetService } from '../../shared/services/documentation-type-set.service';
import { DocumentationTypeSet, DocumentationTypeSetFind } from '../../shared/models/documentationTypeSet.model';
import { MatDialog } from '@angular/material/dialog';
import { DocumentationTypeSetConfigurationDialogComponent } from '../documentation-type-set-configuration-dialog/documentation-type-set-configuration-dialog.component';
import { CandidateSet } from '../../shared/models/Employee/candidate-set.model';

@Component({
  selector: 'app-add-person',
  templateUrl: './add-person.component.html',
  styles: []
})
export class AddPersonComponent implements OnInit {

  @Input() toolbartitle = 'Administrar persona';
  @Input() isCandidate: boolean;
  @Input() person: Person;
  @Input() newPerson = false;
  @Input() showOuSelection = true;
  @Output() cancelAddPerson = new EventEmitter<boolean>();
  @Output() backAddPerson = new EventEmitter<boolean>();
  @Output() actionFinished = new EventEmitter<Person>();
  @Input() isShared = false;

  clickOnce = false;
  disableFields = true;
  addPersonForm: UntypedFormGroup;
  organizationalUnits: OrganizationalUnit[] = [];
  selectedOuId: number;
  containerType: ContainerType;
  adittionalsMetadatas: EmployeeMetadata[] = [];
  fixedMetadatas: EmployeeMetadata[] = [];
  nickNameFrmCtrl: UntypedFormControl;
  certificateProviderIdFrmCtrl: UntypedFormControl;
  expirationDateFrmCtrl: UntypedFormControl;
  isExiprationDateRequired = false;
  certificateProviders: any;
  showDate = false;
  initialFormGroupValues: any;
  documentationSets: DocumentationTypeSet[] = [];
  selectedSet: DocumentationTypeSet;
  isSetSelected = false;
  isCandidateAdmin = false;
  isCandidateAdminBasic = false;
  isAdministrator = false;
  employeeManagement = false;
  sendWelcome = true;
  sharedMetadatas: EmployeeMetadata[];
  ouName: string;
  useSaml = false;

  constructor(private organizationalUnitService: OrganizationalUnitService,
    private msjService: MessageService,
    private containerTypeService: ContainerTypeService,
    // TODO: Unificar en PersonService
    private employeeService: EmployeeService,
    private candidateService: CandidateService,
    private _formBuilder: UntypedFormBuilder,
    private certificateService: CertificateService,
    private maskApplierService: MaskApplierService,
    private personService: PersonService,
    private authService: AuthService,
    private metadataService: MetadataService,
    private documentationTypeSetService: DocumentationTypeSetService,
    private dialog: MatDialog,
  ) { }


  ngOnInit() {
    // Define formGroup
    this.addPersonForm = this._formBuilder.group({});
    this.expirationDateFrmCtrl = new UntypedFormControl('');
    this.certificateProviderIdFrmCtrl = new UntypedFormControl('');
    this.nickNameFrmCtrl = new UntypedFormControl({ value: null, disabled: this.disableFields });
    this.addPersonForm.addControl('nickNameFrmCtrl', this.nickNameFrmCtrl);
    this.addPersonForm.addControl('expirationDateFrmCtrl', this.expirationDateFrmCtrl);
    this.addPersonForm.addControl('certificateProviderIdFrmCtrl', this.certificateProviderIdFrmCtrl);
    this.initialFormGroupValues = this.addPersonForm.value;
    this.isCandidateAdmin = this.authService.isCandidateAdmin();
    this.isCandidateAdminBasic = this.authService.isCandidateAdminBasic();
    this.isAdministrator = this.authService.isAdministrator();
    this.employeeManagement = this.authService.employeeManagement();

    // Cargo las OUs
    this.organizationalUnitService.getTreeInMemory()
      .then(ous => {
        this.organizationalUnits = ous.filter(o => o.isRoot === false);
        if(this.isCandidate === true){
          this.setOu();
        }else if (this.isCandidateAdmin === true) {
          this.setOu();
        }else if(this.isCandidateAdminBasic === true) {
          this.setOu();
        }else if(this.isAdministrator === true)
        {
          this.setOu();
        }
        else if(this.employeeManagement === true)
        {
          this.setOu();
        }
        else {
          return;
        }
      },
        err => this.msjService.showError(err)
      );
  }

  cancel() {
    this.cancelAddPerson.emit(false);
  }

  back() {
    if (this.isCandidate) {
      this.adittionalsMetadatas = [];
      this.fixedMetadatas = [];
      this.addPersonForm.reset(this.initialFormGroupValues);
      this.setOu();
      this.isSetSelected = false;
    } else {
      this.close();
    }
  }

  save() {
    if (this.addPersonForm.invalid) {
      this.msjService.showError('CPPAPIV001');
      this.clickOnce = false;
      return;
    }
    let msg = '';
    this.clickOnce = true;
    this.person.delegatedSystemId = this.nickNameFrmCtrl.value;
    this.person.certificateExpirationDate = this.addPersonForm.value.expirationDateFrmCtrl;
    this.person.certificateProviderId = this.addPersonForm.value.certificateProviderIdFrmCtrl;
    this.person.delegatedSystemId = this.addPersonForm.value.nickNameFrmCtrl;
    const ou = this.organizationalUnits.find(x => x.id == this.person.organizationalUnitId);
    this.organizationalUnitService.setCurrentOU(ou);
    let addPromise: Promise<Person>;
    if (this.isCandidate) {
      msg = 'Candidato creado correctamente';
      addPromise = this.saveCandidate();
    } else {
      msg = 'Legajo creado correctamente';
      addPromise = this.saveEmployee();
    }
    addPromise.then(
      data => {
        this.msjService.showInfo(msg);
        this.actionFinished.emit();
      },
      err => {
        this.msjService.showError(err);
        this.clickOnce = false;
      });
  }

  setOu() {
    this.clickOnce = true;
    if (this.selectedOuId == null) {
      if (this.isShared) {
        this.selectedOuId = this.person.organizationalUnitId;
        this.ouName = this.organizationalUnits.find(ou => ou.id == this.selectedOuId).name;
      } else {
        this.selectedOuId = this.organizationalUnitService.getCurrentOrChildOU().id;
      }

    } else {
      this.organizationalUnitService.setCurrentOU(this.organizationalUnits.find(ou => ou.id == this.selectedOuId));
    }

    this.addPersonForm.disable();
    this.person.organizationalUnitId = +this.selectedOuId;
    const currentOu = this.organizationalUnitService.getCurrentOU();
    this.useSaml = currentOu.useSaml;
    this.containerTypeService.getContainerType(this.selectedOuId.toString(), this.isCandidate).toPromise()
      .then(containerType => {
        if (this.isShared) {
          this.sharedMetadatas = [...this.person.metadatas];
          this.nickNameFrmCtrl.setValue(this.person.delegatedSystemId);
          this.disableFields = false;
        }

        this.clickOnce = false;
        this.removeAdditionalMetadatas();
        this.addPersonForm.enable();
        this.containerType = containerType;
        this.person.setContainerType(this.containerType);
        this.fixedMetadatas = this.getMetadatas(MetadataClass.FIXED);
        this.adittionalsMetadatas = this.getMetadatas(MetadataClass.ADDITIONAL);
      })
      .catch(err => {
        this.person.cleanContainerType();
        this.fixedMetadatas = [];
        this.adittionalsMetadatas = [];
        this.msjService.showError(err);
        this.clickOnce = false;
        this.disableFields = true;
      });

    const parameters: OuConfigSignatureTypeParametersDTO = {
      organizationalUnitId: Number(this.selectedOuId),
      CertificateTypeId: CertificateType.Employee,
      IsManualDeclaration: true,
      IsAutomaticDeclaration: false
    };

    this.getProviders(parameters);

    if (this.isCandidateAdmin || this.isCandidateAdminBasic) {
      this.loadSets();
    }
  }

  getProviders(parameters: any) {
    this.certificateProviders = [];
    this.certificateService.getSignatureTypes(parameters).toPromise().then(
      certificateProviders => {
        this.certificateProviders = certificateProviders;
        this.certificateProviders.push({
          id: null,
          name: 'No asociar Forma de Firma',
          description: 'No asociar Forma de Firma'
        });
        this.certificateProviders.sort((a, b) => a.id > b.id ? 1 : -1);
      },
      err => this.msjService.showError(err)
    );
  }

  loadSets() {
    this.selectedSet = null;

    const findParameters: DocumentationTypeSetFind = {
      organizationalUnitId: this.organizationalUnitService.getCurrentOrChildOU().id,
      enabled: true
    };

    this.documentationTypeSetService.get(findParameters).toPromise()
      .then(sets => {
        this.documentationSets = sets;

        if (this.documentationSets.length === 1) {
          this.selectedSet = sets[0];
        }
      },
        err => this.msjService.showError(err)
      );
  }

  createSet() {
    const dialogRef = this.dialog.open(DocumentationTypeSetConfigurationDialogComponent, {
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      this.loadSets();
    });
  }

  setDocumentationSet() {
    this.isSetSelected = true;
  }

  close() {
    this.selectedSet = null;
    this.backAddPerson.emit(false);
  }

  showCertificateProviderDate(provider: any) {
    if (provider.id === null) {
      this.showDate = false;
      this.person.certificateProviderId = null;
      this.person.certificateExpirationDate = null;
      this.isExiprationDateRequired = false;
    } else {
      this.person.certificateProviderId = provider.id;
      this.showDate = ((provider.askExpirationDate == true || provider.askExpirationDate == null) && provider.manageAction == null);
      this.isExiprationDateRequired = provider.askExpirationDate && provider.manageAction == null;
    }
  }

  removeAdditionalMetadatas() {
    const metas = this.person.customMetadatas();
    metas.forEach(meta => this.addPersonForm.removeControl(meta.metadataSystemName));
  }


  getMetadatas(type = MetadataClass.FIXED): EmployeeMetadata[] {
    const metas = type == MetadataClass.FIXED ? this.person.fixedAddMetadatas() : this.person.customMetadatas();
    metas.forEach(meta => {
      // Creo el FormControl
      const val = [];
      if (meta.isRequired) {
        val.push(Validators.required);
      }

      if (meta.metadataType === 'email') {
        const mailRegex = /^[a-zA-Z0-9_\-.]+@[a-zA-Z0-9\-]+\.[a-zA-Z0-9\-.]+$/;
        val.push(Validators.pattern(mailRegex));
      }

      if (meta.metadataType === 'period') {
        val.push(Validators.pattern(meta.periodPattern));
      }

      let defaultValue = '';
      if (this.isShared) {
        const item = this.sharedMetadatas.find(m => m.metadataSystemName == meta.metadataSystemName);
        if (item) {
          meta.metadataValue = item.metadataValue;
          defaultValue = meta.metadataValue;
        }
      }
      this.addPersonForm.addControl(meta.metadataSystemName, this._formBuilder.control(defaultValue, val));
    });
    return metas;
  }

  setMetadatasValuesCustomContro(ev: any) {
    this.person.setMetadataValue(ev.metadataSystemName, ev.metadataValue);
    this.addPersonForm.controls[ev.metadataSystemName].setValue(ev.metadataValue);
    if (ev.metadataSystemName === Person.cuilSystemName) {
      const maskedValue = this.maskApplierService.applyMask(ev.metadataValue, ev.metadataMask);
      let maskSplited = ev.metadataMask.split('||')[0];
      if (maskSplited.length <= maskedValue.length) {

        this.personService.validatePerson(ev.metadataValue, this.selectedOuId).toPromise().then(
          person => {
            this.disableFields = false;
            this.setUserMetadata(person);
          },
          error => {
            this.disableFields = true;
            this.msjService.showError(error);
          });
      } else {
        this.disableFields = true;
      }
    }
  }

  isDisabled(meta: EmployeeMetadata): boolean {
    if (meta.metadataSystemName === Person.cuilSystemName) {
      return false;
    } else {
      if (this.disableFields) {
        this.nickNameFrmCtrl.disable();
        this.certificateProviderIdFrmCtrl.disable();
        return true;
      } else {
        this.nickNameFrmCtrl.enable();
        this.certificateProviderIdFrmCtrl.enable();
        return false;
      }
    }
  }

  private setUserMetadata(user: any) {
    if (!this.isShared) {
      this.person.setMetadataValue(Person.lastNameSystemName, user.userLastName);
      this.addPersonForm.controls[Person.lastNameSystemName].setValue(user.userLastName);
      this.person.setMetadataValue(Person.nameSystemName, user.userName);
      this.addPersonForm.controls[Person.nameSystemName].setValue(user.userName);
      this.person.setMetadataValue(Person.mailSystemName, user.mail);
      this.addPersonForm.controls[Person.mailSystemName].setValue(user.mail);
      this.person.setMetadataValue(Person.userIdSystemName, user.userId);
      this.nickNameFrmCtrl.setValue(user.delegatedSystemId);
    }
  }

  private saveCandidate(): Promise<Person> {
    const can = <Candidate>this.person;

    const candidateSet = new CandidateSet();
    candidateSet.setId = this.selectedSet.id;
    can.candidateSet = candidateSet;

    return this.candidateService.create(can, false).toPromise();
  }

  updateOptionValues(item: AddMetadataItem, lista: EmployeeMetadata[], isUpdate = false) {
    this.metadataService.updateOptionValues(item, lista, isUpdate);
    this.containerTypeService.cleanStorageContainer(this.selectedOuId.toString());
  }

  private saveEmployee(): Promise<Person> {
    const employee = <Employee>this.person;
    return this.employeeService.createEmployee(employee, this.sendWelcome).toPromise();
  }

}
