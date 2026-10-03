import { Component, OnInit, Output, OnDestroy, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators, UntypedFormControl } from '@angular/forms';
import { MessageService } from '../../shared/errorHandler/message.service';
import { OrganizationalUnitService } from '../../shared/services/organizational-unit.service';
import { ContainerTypeService } from '../../shared/services/container-type.service.';
import { AppConfig } from 'src/app/app.config';
import { EmployerProcessService } from '../../shared/services/employer-process.service';
import { CertificateService } from '../../shared/services/certificate.service';
import { AuthService } from '../../shared/auth/auth.service';
import {
  OrganizationalUnit,
  Employee,
  ContainerType,
  CertificateType,
  DeferedProcess
} from '../../shared/models';
import { Subscription } from 'rxjs';
import { MatDialogRef } from '@angular/material/dialog';
import { EmployeeMetadata } from '../../shared/models/employee-metadata.model';
import { FileService } from '../../shared/services/file.service';
import { IMassiveRegisterExample } from '../../shared/models/massive-register-example-model';
import { OuConfigSignatureTypeParametersDTO } from '../../shared/models/signatureType.model';
import { Candidate } from '../../shared/models/Employee/candidate.model';
import { ProcessType } from '../../shared/models/defered-process.model';
import { HelpStepper } from '../../shared/models/helpStepper.model';
import { CandidateService } from '../../shared/services/candidate.service';

@Component({
  selector: 'app-add-menu-dialog',
  templateUrl: './add-menu-dialog.component.html',
  styles: []
})
export class AddMenuDialogComponent implements OnInit, OnDestroy {

  constructor(
    private dialogRef: MatDialogRef<AddMenuDialogComponent>,
    private _formBuilder: UntypedFormBuilder,
    private msjService: MessageService,
    private employerProcessService: EmployerProcessService,
    private candidateProcessService: CandidateService,
    private organizationalUnitService: OrganizationalUnitService,
    private containerTypeService: ContainerTypeService,
    private authService: AuthService,
    private certificateService: CertificateService,
    private fileService: FileService
  ) {
  }

  @Output()
  @ViewChild('stepper') stepper;
  organizationalUnits: OrganizationalUnit[] = [];
  selectedOrganizationalUnitId: number;
  employee = new Employee();
  clickOnce = false;
  containerType: ContainerType;
  menuFormGroup: UntypedFormGroup;
  addEmployeeFormGroup: UntypedFormGroup;
  addMassiveEmployeeFormGroup: UntypedFormGroup;
  addCandidateFormGroup: UntypedFormGroup;
  addMassiveCandidateFormGroup: UntypedFormGroup;
  disableFields: boolean;
  files: File[];
  certificateProviders: any;
  showDate = false;
  selectedMenu: any;
  organizationalUnitSubscription: Subscription;
  maxFile = AppConfig.settings.application.maxFileDocumentAttachment;
  isRRHH_LD: boolean;
  isAdministrator: boolean;
  isCandidateAdmin: boolean;
  isCandidateAdminBasic: boolean;
  isGestorDocumental = false;
  massiveRegisterExampleFile: IMassiveRegisterExample;
  isExiprationDateRequired = false;

  selectedOuMassiveFrmCtrl: UntypedFormControl;
  certificateTypeFrmCtrl: UntypedFormControl;
  expirationDateFrmCtrl: UntypedFormControl;
  sendWelcome = true;
  candidate = new Candidate();
  previousStep: number;
  selectedEmployeeFileType: any;
  selectedCandidateFileType: any;
  stepperEnum: any = {
    Menu: 0,
    EmployeeFileMenu: 1,
    EmployeeSingle: 2,
    EmployeeMassive: 3,
    CandidateFileMenu: 4,
    Candidate: 5,
    CandidateMassive: 6,
    Documentation: 7
  };

  useSaml = false;
  enableHumanageHrEmailChange = false;
  showHelp = false;
  helpModel: HelpStepper;
  isCandidate = false;
  hasAdjetivation: boolean = true;
  hasAdjetivationCandidate: boolean = true;
  hasAdjetivationEmployee: boolean = true;

  ngOnInit() {
    this.disableFields = true; // Deshabilitar el botón al principio
    this.clickOnce = false;
    const currentOu = this.organizationalUnitService.getCurrentOU();
    this.useSaml = currentOu.useSaml;
    this.enableHumanageHrEmailChange = currentOu.enableHumanageHrEmailChange;
    this.isGestorDocumental = this.authService.isGestorDocumental();
    this.isRRHH_LD = this.authService.isRRHH();
    this.isAdministrator = this.authService.isAdministrator();
    this.isCandidateAdmin = this.authService.isCandidateAdmin();
    this.isCandidateAdminBasic = this.authService.isCandidateAdminBasic();
    this.menuFormGroup = this._formBuilder.group({
      selectedMenu: ["", Validators.required]
    });

    this.addEmployeeFormGroup = this._formBuilder.group({
      adminMode: ["", Validators.required]
    });

    this.addCandidateFormGroup = this._formBuilder.group({
      adminMode: ["", Validators.required]
    });

    this.expirationDateFrmCtrl = new UntypedFormControl('');
    this.addMassiveEmployeeFormGroup = this._formBuilder.group({
      files: ["", Validators.required]
    });

    this.addMassiveCandidateFormGroup = this._formBuilder.group({
      files: ["", Validators.required]
    });
    this.selectedOuMassiveFrmCtrl = new UntypedFormControl(this.organizationalUnitService.getCurrentOrChildOU().id, Validators.required);
    this.addMassiveEmployeeFormGroup.addControl('selectedOuMassiveFrmCtrl', this.selectedOuMassiveFrmCtrl);
    this.addMassiveCandidateFormGroup.addControl('selectedOuMassiveFrmCtrl', this.selectedOuMassiveFrmCtrl);
    this.loadOus();

    if (this.isAdministrator || this.isCandidateAdmin || this.isCandidateAdminBasic) {
      const parameters: OuConfigSignatureTypeParametersDTO = {
        organizationalUnitId: Number(this.selectedOuMassiveFrmCtrl.value),
        CertificateTypeId: CertificateType.Employee,
        IsManualDeclaration: true,
        IsAutomaticDeclaration: false
      };
      this.getProviders(parameters);
    }
    this.hasFiltersMetadatos()
  }

  ngOnDestroy(): void {
    this.organizationalUnitSubscription?.unsubscribe();
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


  getMassiveRegisterExampleFile() {
    if (this.addMassiveEmployeeFormGroup.value.selectedOuMassiveFrmCtrl) {
      this.massiveRegisterExampleFile = null;
      const ouId = this.addMassiveEmployeeFormGroup.value.selectedOuMassiveFrmCtrl;
      const selectedOu = this.organizationalUnitService.getTreeOu().find(o => o.id === ouId);
      this.useSaml = selectedOu.useSaml;
      let candidate = false;
      if (this.isCandidate === true) {
        candidate = true;
      }
      this.containerTypeService.getContainerType(ouId, candidate).toPromise()
        .then(containerType => {
          this.containerType = containerType;
          this.containerTypeService.getMassiveRegisterExampleInfo(this.containerType.id).toPromise().then(file => {
            if (file) {
              this.massiveRegisterExampleFile = file;
            }
          });
        })
        .catch(err => {
          // Container Type shell for group without container type
          const cuil = {} as EmployeeMetadata;
          cuil.metadataSystemName = ContainerType.cuilSystemName;
          cuil.metadataLabel = ContainerType.cuilLabel;
          cuil.metadataMask = ContainerType.cuilMask;
          this.massiveRegisterExampleFile = null;
          this.containerType = new ContainerType(-1, this.addMassiveEmployeeFormGroup.value.selectedOuMassiveFrmCtrl, "", [cuil]);
        });
    }
  }

  onFilesChanged(changedReturn: any) {
    let files: File[] = changedReturn.files;
    this.files = files;
    this.disableFields = files.length === 0;
  }

  upload() {
    this.clickOnce = true;

    // Valido que tenga una OU seleccionada
    if (!this.selectedOuMassiveFrmCtrl.valid) {
      this.msjService.showError({ code: 'NoOUSelected', description: 'Debe seleccionar una empresa para inciar el proceso' });
      this.clickOnce = false;
      return;
    }

    const ou = this.organizationalUnits.find(x => x.id == this.selectedOuMassiveFrmCtrl.value);
    this.organizationalUnitService.setCurrentOU(ou);

    const process = new DeferedProcess();
    process.processTypeId = ProcessType.ALTA_EMPLEADO;
    process.personType = "EMPLEADO";
    process.organizationalUnitId = this.authService.getOrganizationId();
    process.organizationalUnitName = this.authService.getOrganizationName();
    process.addParameterData('url', `${location.origin}/#/pwd-first-time/{0}`);
    process.addParameterData('userId', Number(this.authService.getUserId()));
    process.addParameterData('ouId', this.selectedOuMassiveFrmCtrl.value);
    process.addParameterData('sendWelcome', this.sendWelcome);
    this.employerProcessService
      .createProcess(process, this.files)
      .subscribe(
        data => {
          this.clickOnce = false;
          this.msjService.showInfo("Se ha iniciado el proceso, Podrá consultar el estado en Procesos Diferidos.");
          this.closeDialog();
        },
        err => {
          this.msjService.showError(err);
          this.clickOnce = false;
        }
      );
  }

  uploadCandidate() {
    this.clickOnce = true;

    // Valido que tenga una OU seleccionada
    if (!this.selectedOuMassiveFrmCtrl.valid) {
      this.msjService.showError({ code: 'NoOUSelected', description: 'Debe seleccionar una empresa para inciar el proceso' });
      this.clickOnce = false;
      return;
    }

    const ou = this.organizationalUnits.find(x => x.id == this.selectedOuMassiveFrmCtrl.value);
    this.organizationalUnitService.setCurrentOU(ou);

    const process = new DeferedProcess();
    process.processTypeId = ProcessType.ALTA_CANDIDATO;
    process.personType = "CANDIDATO"
    process.organizationalUnitId = this.authService.getOrganizationId();
    process.organizationalUnitName = this.authService.getOrganizationName();
    process.addParameterData('url', `${location.origin}/#/pwd-first-time/{0}`);
    process.addParameterData('userId', Number(this.authService.getUserId()));
    process.addParameterData('ouId', this.selectedOuMassiveFrmCtrl.value);
    process.addParameterData('sendWelcome', this.sendWelcome);
    this.candidateProcessService
      .createProcess(process, this.files)
      .subscribe(
        data => {
          this.clickOnce = false;
          this.msjService.showInfo("Se ha iniciado el proceso, Podrá consultar el estado en Procesos Diferidos.");
          this.closeDialog();
        },
        err => {
          this.msjService.showError(err);
          this.clickOnce = false;
        }
      );
  }

  showCertDate(provider: any) {
    if (provider.id === null) {
      this.showDate = false;
      this.employee.proveedorCertificado = null;
      this.employee.fechaVencimientoCertificado = null;
      this.isExiprationDateRequired = false;
    } else {
      this.employee.proveedorCertificado = provider.name;
      this.employee.certificateProviderId = provider.id;
      this.showDate = ((provider.askExpirationDate == true || provider.askExpirationDate == null) && provider.manageAction == null);
      this.isExiprationDateRequired = provider.askExpirationDate && provider.manageAction == null;

    }
  }


  downloadMassiveRegisterFile() {
    this.containerTypeService.getMassiveRegisterExampleBase64(this.containerType.id).toPromise()
      .then(file => {
        this.fileService.download(file, this.massiveRegisterExampleFile.name, "application/excel");
      })
      .catch(err => this.msjService.showError(err));
  }

  goToNextStep() {
    this.previousStep = this.stepper.selectedIndex;
    this.loadOus();

    switch (this.selectedMenu) {
      case 'AddEmployeeFile':
        this.isCandidate = false;
        this.getMassiveRegisterExampleFile();
        this.stepper.selectedIndex = this.stepperEnum.EmployeeFileMenu;
        break;
      case 'AddCandidate':
        this.isCandidate = true;
        this.getMassiveRegisterExampleFile();
        this.stepper.selectedIndex = this.stepperEnum.CandidateFileMenu;
        break;
      case 'AddDocumentation':
        this.isCandidate = false;
        this.stepper.selectedIndex = this.stepperEnum.Documentation;
        break;
      default:
        this.stepper.selectedIndex = this.stepperEnum.Menu;
        break;
    }
  }

  loadOus() {
    let ousAux = [];
    this.organizationalUnitService.getTreeInMemory()
      .then(ous => {
        ousAux = ous;
        if (this.selectedMenu == 'AddEmployeeFile') {
          ousAux = ousAux.filter(o => o.isRoot === false);
        }
        ousAux = ousAux.filter(o => o.parentOrganizationalUnitId != null);
        this.organizationalUnits = ousAux;
      },
        err => this.msjService.showError(err)
      );
  }

  goToNextEmployeeStep(isSingle: boolean) {
    this.stepper.selectedIndex = isSingle ? this.stepperEnum.EmployeeSingle : this.stepperEnum.EmployeeMassive;
  }

  goToNextCandidateStep(isSingle: boolean) {
    this.stepper.selectedIndex = isSingle ? this.stepperEnum.Candidate : this.stepperEnum.CandidateMassive;
  }

  goToPreviousEmployeeStep() {
    this.stepper.selectedIndex = this.stepperEnum.EmployeeFileMenu;
  }

  goToPreviousCandidateStep() {
    this.stepper.selectedIndex = this.stepperEnum.CandidateFileMenu;
  }

  goToPreviousStep() {
    this.selectedEmployeeFileType = '';
    this.stepper.selectedIndex = this.previousStep;
  }

  closeDialog() {
    this.dialogRef.close();
  }

  closeDialogAddDocumentation() {
    this.dialogRef.close();
  }

  resetStepper() {
    this.stepper.selectedIndex = 0;
  }

  postPersonAdded() {
    this.closeDialog();
  }

  openHelp() {
    let itemFileDownload: any;
    if (this.massiveRegisterExampleFile) {
      itemFileDownload = {
        description: "Tenés disponible el archivo modelo, podés",
        actionDescription: "Descargarlo Acá",
        execute: () => {
          this.downloadMassiveRegisterFile();
        }
      };
    }
    else {
      itemFileDownload =
      {
        description: "No tenés disponible el archivo modelo, consultá con tu administrador o utiliza uno propio con los datos que sean necesarios para dar de alta tus legajos",
      };
    }


    let tipoArchivoMsg: any;

    tipoArchivoMsg = {
      title: 'Archivo Tipo',
      description: 'Debe ser en formato .xls o bien separado por "comas"',
      itemList: [
        itemFileDownload
      ],
      image: '',
      children: []
    };

    let ouNotSaml: any;
    if (this.useSaml == false && this.selectedMenu != 'AddCandidate') {
      ouNotSaml = [{
        title: 'Campos necesarios para el alta',
        description: 'Novedades:<br>',
        itemListDescription: [
          'El campo "usuario" dejará de usarse como forma de ingreso a humanage, si aún lo tenés en tu archivo de origen te recomendamos eliminar la columna',
          'Si el dato existe y no lo eliminaste de tu archivo de origen, no te procupes, no lo tendremos en cuenta así evitamos futuros inconvenientes',
        ],
        image: '',
        children: []
      },
        tipoArchivoMsg]
    }
    else {
      ouNotSaml = [tipoArchivoMsg]
    }

    if (!this.enableHumanageHrEmailChange) {
      let enableHumanageHrEmailChangeMsg;
      enableHumanageHrEmailChangeMsg = {
        title: 'Cambio de Mail',
        description: 'Este campo tiene la edición deshabilitada para reforzar la seguridad de la firma electrónica. Cualquier duda comunícate con Mesa de Ayuda.',
        itemList: [],
        image: '',
        children: []
      };
      ouNotSaml.push(enableHumanageHrEmailChangeMsg);
    }

    this.helpModel = {
      title: 'Ayuda Rápida',
      description: 'Crear Legajos en forma Masiva',
      children: ouNotSaml
    };

    this.showHelp = true;
  }

  hasFiltersMetadatos() {
    this.hasAdjetivation = JSON.parse(localStorage.getItem("hasFiltersMetadatos")) as boolean ?? true;
    let hasFiltersMetadataEmployee = JSON.parse(localStorage.getItem("hasFiltersMetadataEmployee")) as boolean ?? true;
    let hasFiltersDocumentsEmployee = JSON.parse(localStorage.getItem("hasFiltersDocumentsEmployee")) as boolean ?? true;
    let hasFiltersMetadataCandidate = JSON.parse(localStorage.getItem("hasFiltersMetadataCandidate")) as boolean ?? true;
    let hasFiltersDocumentsCandidate = JSON.parse(localStorage.getItem("hasFiltersDocumentsCandidate")) as boolean ?? true;

    this.hasAdjetivationEmployee = hasFiltersMetadataEmployee || hasFiltersDocumentsEmployee
    this.hasAdjetivationCandidate = hasFiltersMetadataCandidate || hasFiltersDocumentsCandidate
  }
}
