import { Component, OnInit, ViewChild, Output, EventEmitter, AfterViewInit, Input, ViewChildren, QueryList } from "@angular/core";
import { UntypedFormGroup, UntypedFormBuilder, Validators } from "@angular/forms";
import { Employee, EmployeeFind, ContainerType, OrganizationalUnit } from "../../shared/models";
import { MessageService } from "../../shared/errorHandler/message.service";
import { EmployeeService } from "../../shared/services/employee.service";
import { ContainerTypeService } from "../../shared/services/container-type.service.";
import { OrganizationalUnitService } from "../../shared/services/organizational-unit.service";
import { MatBottomSheet } from "@angular/material/bottom-sheet";
import { MatStepper } from "@angular/material/stepper";
import { DocumentationTypesService } from "../../shared/services/documentation-types.service";
import { FileDocument } from "../../shared/models/file-document.model";
import { DocumentationType, maxFiles, ACEPTED_EXTENSION, DocumentationLoadContent, DocumentationOrigin } from '../../shared/models/documentation-type.model';
import { UploadFormComponent } from "../../shared/file-dnd/file-dnd.component";
import { DocumentationService } from "../../shared/services/documentation.service";
import { AppConfig } from "src/app/app.config";
import { FILESIZE, FileService } from "../../shared/services/file.service";
import { AdvancedEmployeeFilters } from "../../shared/models/Employee/advanced-employee-filters";
import { AuthService } from '../../shared/auth/auth.service';
import { FormioCardinalComponent } from "../../formioCs/formio-cardinal.component";
import { Person } from "../../shared/models/Employee/person.model";
import { GenericBottomSheetComponent } from "../../shared/generic-bottom-sheet/generic-bottom-sheet.component";
import { MessageAtributtes, MessageType } from "../../shared/models/message-types.model";
import { FileDocumentSendToAll } from '../../shared/models/file-document-send-to-all.model';
import { ChangeDetectorRef } from "@angular/core";
import { MetadataService } from "../../shared/services/metadatas.service";

@Component({
  selector: 'app-add-documentation',
  templateUrl: './add-documentation.component.html',
  styles: []
})
export class AddDocumentationComponent implements OnInit, AfterViewInit {

  @ViewChild(UploadFormComponent) uploadFiles: UploadFormComponent;
  @ViewChild('stepper', { static: true }) stepper: MatStepper;
  @ViewChildren(FormioCardinalComponent) formioCardinal: QueryList<FormioCardinalComponent>;
  @Output() cancelAddDocumentation = new EventEmitter<boolean>();
  @Output() backAddDocumentation = new EventEmitter<boolean>();
  @Output() finishAddDocumentation = new EventEmitter<boolean>();
  @Input() showBack = true;
  @Input() selectedPerson: Person;
  @Input() isCandidate = false;
  organizationalUnits: OrganizationalUnit[];
  documentationTypes: DocumentationType[];
  selectedDocumentationTypes: DocumentationType[];
  sequences: any;
  sequence: any;
  documentationTypeForm: UntypedFormGroup;
  sequencesForm: UntypedFormGroup;
  documentation = new FileDocument();
  documentationList: FileDocument[] = [];
  adittionalsMetadatas: any[];
  adittionalsMetadatasValues: any[];
  stepsDocumentation = {
    OU: 0,
    EMPLOYEE: 1,
    SECUENCE: 2
  };
  maxDate = new Date();
  employee = new Employee();
  employees: Employee[];
  orderBy: string;
  orderAsc: boolean;
  allSelected = false;
  filterName: string;
  loading = false;
  pageIndex: number;
  itemsCount: number;
  itemPerPage: number;
  searchOpened: boolean;
  selectedEmployee: Employee;
  empId = 0;
  addmore = false;
  files: File[] = [];
  fileBase64: string;
  maxFile: string;
  inProcess = false;
  formReady = false;
  selectedEmployees: any[];
  disableSendToAll = false;
  containerType: ContainerType;
  maxFiles = maxFiles.SIMPLE;
  MAX_SIXE_FILE = 5 * FILESIZE.MB;
  viewPdf = true;
  hasPeriod = false;
  isFiltering = false;
  usingFormio = false;
  isExternalFormOnly = false;
  fileBlob: Blob;
  scanning = false;
  hasWebScanning = false;
  rrhhUploadFile = false;
  formName: string;
  actualStepper: MatStepper;
  fileImage: any;
  isZip = false;
  sendToAll = false;
  sendToAllFilter: EmployeeFind;
  showOptionalFormComplete = false;
  employeeNotify = true;
  // Advanced employee filters
  employeeFilters: AdvancedEmployeeFilters = {
    selectedEmployeeFind: [],
    segmentSearch: true,
    nroLegSearch: undefined,
    cuilSearch: undefined,
    inactiveSearch: false,
    activeSearch: true
  };

  aceptedExtensions = ACEPTED_EXTENSION.MANUAL;
  constructor(
    private _formBuilder: UntypedFormBuilder,
    private msjService: MessageService,
    private employeeService: EmployeeService,
    private containerTypeService: ContainerTypeService,
    private organizationalUnitService: OrganizationalUnitService,
    private documentationTypesService: DocumentationTypesService,
    private documentationService: DocumentationService,
    private authService: AuthService,
    private fileService: FileService,
    private _bottomSheet: MatBottomSheet,
    private ref: ChangeDetectorRef,
    private metadataService: MetadataService,
    private cd: ChangeDetectorRef
  ) { }

  accion: Function;
  public ngAfterViewInit(): void {
    this.formioCardinal.changes.subscribe((comps: QueryList<FormioCardinalComponent>) => {
      if (comps.first) {
        this.accion = function () {
          this.inProcess = true;
          comps.first.submitForm();
        };
      }
    });
  }

  submit(stepper: MatStepper) {
    if (this.usingFormio && this.rrhhUploadFile && !((this.files != null && this.files.length) || this.fileBlob != null)) {
      this.actualStepper = stepper;
      if (this.sequencesForm.valid) {
        this.accion();
      } else {
        this.msjService.showError("VerifyFormData");
      }
    } else {
      this.next(stepper);
    }
  }

  ngOnInit() {
    this.hasWebScanning = this.authService.isInRole('WEB SCANNING');
    this.load();
    this.initFormDocumentation();
    this.initFormSecuence();
    this.InitializeWithSelectedPerson();
  }

  load() {
    this.fileBase64 = null;
    this.fileImage = null;
    this.files = [];
    this.rrhhUploadFile = false;
    this.sequences = null;
    this.hasPeriod = false;
    this.documentationTypes = [];
    this.selectedDocumentationTypes = [];
    this.adittionalsMetadatas = [];
    this.adittionalsMetadatasValues = [];
    this.maxFile = AppConfig.settings.application.maxFileDocumentAttachment;

    this.organizationalUnitService.getTreeInMemory()
      .then(ous => {
        this.organizationalUnits = ous.filter(o => o.isRoot == false);
        this.refreshDocumentationType();

      },
        err => this.msjService.showError(err)
      );
  }

  selectDocumentationType(ev: any, isLastStep: boolean = false) {
    this.initFormSecuence();
    this.fileBase64 = null;
    this.fileImage = null;
    this.files = [];
    this.selectedDocumentationTypes = [this.documentationTypes.find(dt => dt.name == ev)];
    this.usingFormio = this.selectedDocumentationTypes[0].exteralForm != null && this.selectedDocumentationTypes[0].exteralForm.length > 0;
    this.formName = this.selectedDocumentationTypes[0].exteralForm;
    this.isExternalFormOnly = this.selectedDocumentationTypes[0].isExternalFormOnly;
    this.showOptionalFormComplete = this.selectedDocumentationTypes[0].hasExternalForm && this.selectedDocumentationTypes[0].documentationLoadContentId === DocumentationLoadContent.AMBOS;
    if (isLastStep) {
      this.loading = true;
      this.populateDocumentationForm();
      this.getContainer().then(() => {
        if (this.containerType) {
          this.loadAdditionalMetadatas(this.selectedDocumentationTypes[0].documentTypeId);
        }
        this.loading = false;
      });
      this.loadSecuence(this.selectedDocumentationTypes[0]);
      if (!this.showOptionalFormComplete) {
        this.rrhhUploadFile = this.documentation.documentationTypeSelected.documentationLoadContentName == 'RRHH' || this.documentation.documentationTypeSelected.documentationLoadContentName == 'AMBOS';
      } else {
        this.rrhhUploadFile = false;
      }
    }
  }

  maskSplited(mask: string) {
    let masksplited = mask.split("||")
    if (masksplited.length > 1) {
      //Las mascaras de Id Fiscales cuando son mas de una por pais, al ser de distintas longitudes y estar ordenadas de menor a mayor longitud, 
      //siempre elijo la mayor que queda en la ultima posicion del arreglo
      let i = masksplited.length - 1;
      return masksplited[i];
    }
    return mask;
  }

  itemRemoved(ev: any) {
    this.usingFormio = false;
    if (this.selectedDocumentationTypes != null && this.selectedDocumentationTypes.length > 0) {
      this.usingFormio = this.selectedDocumentationTypes[0].exteralForm != null && this.selectedDocumentationTypes[0].exteralForm.length > 0;
      this.isExternalFormOnly = this.selectedDocumentationTypes[0].isExternalFormOnly;
    }
    this.initFormSecuence();
    this.load();
  }

  next(stepper: MatStepper) {   
    switch (stepper.selectedIndex) {
      case this.stepsDocumentation.OU:
        this.documentationTypeForm.get('documentationType').setValue(this.selectedDocumentationTypes[0]);
        if (this.documentationTypeForm.valid == true) {
          this.populateDocumentationForm();
          this.loading = true;
          this.getContainer().then(() => {
            if (this.containerType) {
              this.loadAdditionalMetadatas(this.documentation.documentationTypeSelected.documentTypeId);
            }
          });

          this.loadSecuence(this.documentationTypeForm.value.documentationType);
          if (this.documentation.documentationTypeSelected.identificationTypeManual) {
            this.aceptedExtensions = ACEPTED_EXTENSION.MANUAL;
            this.loadEmployees();
            stepper.next();
            this.maxFiles = maxFiles.SIMPLE;
          } else {
            this.aceptedExtensions = ACEPTED_EXTENSION.AUTOMATICO;
            stepper.selectedIndex = this.stepsDocumentation.SECUENCE;
            this.maxFiles = maxFiles.MULTIPLE;
          }
        } else {
          this.msjService.showError("VerifyFormData");
        }
        this.rrhhUploadFile = this.documentation.documentationTypeSelected.documentationLoadContentName == 'RRHH' || this.documentation.documentationTypeSelected.documentationLoadContentName == 'AMBOS';
        if (this.documentation.documentationTypeSelected.hasExternalForm && this.documentation.documentationTypeSelected.documentationLoadContentId === DocumentationLoadContent.AMBOS) {
          this.rrhhUploadFile = false;
        }
        break;

      case this.stepsDocumentation.EMPLOYEE:
        this.selectedEmployees = this.employees.filter(emp => emp.selected).map(emp => emp);
        if (this.validateEmployee(this.selectedEmployees) == true) {
          this.loadAdditionalMetadatas(this.documentation.documentationTypeSelected.documentTypeId);
          this.loadSecuence(this.documentationTypeForm.value.documentationType);
          this.setMetadataFolder();
          stepper.next();
        } else {
          this.msjService.showError("VerifyFormData");
        }
        break;

      case this.stepsDocumentation.SECUENCE:
        const ou = this.organizationalUnits.find(x => x.id == this.documentationTypeForm.value.organizationalUnit);
        this.organizationalUnitService.setCurrentOU(ou);       
        this.setNotify();
        if (this.isSequencesStepValid()) {
          this.populateDocumentationForm();
          this.documentationList = [];
          if (this.selectedEmployees && this.selectedEmployees.length > 0) {
            this.selectedEmployees.forEach(function (employee) {
              this.setMetadatasDocumentation(employee);
              this.populateSecuenceForm();
              this.documentationList.push(JSON.parse(JSON.stringify(this.documentation)));
            }, this);
          } else {
            this.populateSecuenceForm();
            this.documentation.containerTypeId = this.containerType.id;
            this.documentationList.push(JSON.parse(JSON.stringify(this.documentation)));
          }
          this.inProcess = true;
          if (!this.sendToAll) {
            this.documentationService.create(this.documentationList, this.files).toPromise().then(
              (data) => {
                this.finishCreateDocument(stepper);
              },
              err => {
                this._bottomSheet.dismiss();
                this.inProcess = false;
                this.msjService.showError(err);
              }
            );
          } else {
            const dto: FileDocumentSendToAll = {
              employeeFilter: this.sendToAllFilter,
              document: this.documentationList[0]
            };

            this.documentationService.createDocumentsEmployees(dto, this.files).toPromise().then(
              (data) => {
                this.finishCreateDocument(stepper);
              },
              err => {
                this._bottomSheet.dismiss();
                this.inProcess = false;
                this.msjService.showError(err);
              }
            );
          }

        } else {
          this.msjService.showError("VerifyFormData");
        }
        break;

    }
  }
  private finishCreateDocument(stepper: MatStepper) {
    this._bottomSheet.dismiss();
    // Defino el mensaje dependiendo si es proceso automatico o manual
    let savedMsg = 'La Documentación se ha agregado con éxito';
    let extend = false;
    let showconfirm = false;
    if (!this.selectedEmployees || this.selectedEmployees.length !== 1) {
      savedMsg = 'Los archivos fueron recibidos correctamente. Serán procesados a la brevedad. En la opción "Procesos Diferidos" puedes consultar el avance.';
      extend = true;
      showconfirm = true;
    }

    this.inProcess = false;
    this.resetWizard(stepper);
    this.cd.detectChanges();
    this.msjService.showInfo(savedMsg, extend, showconfirm);

    if (this.addmore === false) this.finishAddDocumentation.emit();

  }

  cancel() {
    if (this.inProcess) {
      this.showBottomSheet();
    } else {
      this.cancelAddDocumentation.emit(false);
    }
  }

  back(stepper: MatStepper) {

    switch (stepper.selectedIndex) {
      case this.stepsDocumentation.OU:
        this.sequencesForm.reset();
        this.selectedDocumentationTypes = [];
        this.backAddDocumentation.emit(false);
        break;
      case this.stepsDocumentation.EMPLOYEE:
        this.resetEmployees();
        stepper.previous();
        break;
      case this.stepsDocumentation.SECUENCE:
        if (this.documentation.documentationTypeSelected.identificationTypeManual) {
          this.sendToAll = false;
          stepper.selectedIndex = this.stepsDocumentation.EMPLOYEE;
        } else {
          stepper.selectedIndex = this.stepsDocumentation.OU;
        }
        this.loadEmployees();
        break;
    }
  }

  private initFormDocumentation() {
    this.documentationTypeForm = this._formBuilder.group({
      organizationalUnit: [this.organizationalUnitService.getCurrentOrChildOU().id, Validators.required],
      documentationType: [, Validators.required]
    });
  }

  private initFormSecuence() {
    this.sequencesForm = this._formBuilder.group({
      sequence: [, Validators.required],
      documentationDate: []
    });
  }

  private validateEmployee(employees: Employee[]) {
    if (employees.length > 0 || this.sendToAll) {
      return true;
    } else {
      return false;
    }

  }

  loadEmployee() {
    if (this.empId > 0) {
      this.employeeService.getContainer(this.empId.toString()).toPromise().then(
        data => {
          this.selectedEmployee = data;
        },
        err => {
          this.msjService.showError(err);
        }
      );
    }
  }

  filteredSearch(event) {
    if (event == "Enter") {
      this.pageIndex = 0;
      this.disableSendToAll = false;
      this.search();
    } else {
      this.disableSendToAll = true;
    }

  }

  search() {
    this.loading = true;
    this.allSelected = false;
    const orderBy = [];
    orderBy.push(this.orderBy);

    const param: EmployeeFind = {
      containerTypeId: this.containerType.id,
      orderBy: orderBy,
      orderAscendent: this.orderAsc,
      index: this.pageIndex,
      page: this.pageIndex,
      itemPerPage: 100,
      isPaged: true,
      organizationUnitIds: [this.documentationTypeForm.value.organizationalUnit],
      active: true,
      name: this.filterName,
      metadataParameters: this.employeeFilters.selectedEmployeeFind,
      isSearchAdd: true
    };

    if (!this.employeeFilters.segmentSearch) {
      param.cuil = this.employeeFilters.cuilSearch;
      param.nroLegajo = this.employeeFilters.nroLegSearch;
    }

    this.employeeService
      .getContainers(param)
      .toPromise()
      .then(
        data => {
          this.employees = data.values;
          this.itemsCount = data.total;
          this.itemPerPage = data.itemPerPage;
          this.loading = false;
        },
        err => {
          this.msjService.showError(err);
          this.loading = false;
        }
      );
  }

  sendToAllPages() {
    this.loading = true;
    this.sendToAll = true;

    this.sendToAllFilter = {
      containerTypeId: this.containerType.id,
      orderAscendent: this.orderAsc,
      isPaged: false,
      organizationUnitIds: [this.documentationTypeForm.value.organizationalUnit],
      active: true,
      name: this.filterName,
      metadataParameters: this.employeeFilters.selectedEmployeeFind,
      isSearchAdd: true
    };

    if (!this.employeeFilters.segmentSearch) {
      this.sendToAllFilter.cuil = this.employeeFilters.cuilSearch;
      this.sendToAllFilter.nroLegajo = this.employeeFilters.nroLegSearch;
    }

    this.next(this.stepper);
  }

  sortColumn(header: string) {
    this.orderBy = header;
    this.orderAsc = !this.orderAsc;

    this.search();
  }

  selectAllToogle() {
    if (this.employees) {
      this.employees.forEach(element => {
        element.selected = this.allSelected;
        this.selectEmployee(element);
      });
    }
  }

  checkEmployee(emp) {
    emp.selected = !emp.selected;
    this.selectedChange();
  }

  selectedChange() {

    const allTheSame = this.employees.every((val, i, arr) => val.selected === arr[0].selected);
    if (allTheSame) {
      this.allSelected = this.employees[0].selected;
    } else {
      this.allSelected = false;
    }
  }

  selectedPageChanged(a) {
    this.search();
  }


  selectEmployee(emp) {
    emp.containerTypeId = this.containerType.id;
    this.selectedEmployee = emp;
  }

  loadEmployees() {
    this.loading = true;
    this.orderBy = "DocumentContainerName";

    this.containerTypeService
      .GetAddContainerType(this.documentationTypeForm.value.organizationalUnit.toString())
      .toPromise()
      .then(containerType => {
        this.containerType = containerType;
        this.search();
      },
        err => {
          this.msjService.showError(err);
          this.loading = false;
        }
      );
  }

  getContainer() {
    this.orderBy = "DocumentContainerName";

    return this.containerTypeService
      .GetAddContainerType(this.documentationTypeForm.value.organizationalUnit.toString(), this.isCandidate)
      .toPromise()
      .then(containerType => {
        this.containerType = containerType;
      },
        err => {
          this.msjService.showError(err);
          this.loading = false;
        }
      );
  }

  onFilesChanged(changedReturn: any) {
    let files: File[] = changedReturn.files;
    if (!files || files.length < 1 && changedReturn.isAdding) {
      return;
    }

    this.isZip = false;
    this.setMaxFiles();
    if (files.length > 0) {
      if (files.length > this.maxFiles) {
        files = files.slice(0, this.maxFiles);
      }
      const lastSelected = files[files.length - 1];
      this.files = files;
      if (this.fileService.isZIP(lastSelected)) {
        this.isZip = true;
        this.files = [lastSelected];
        this.maxFiles = 1;
        return;
      }

      if (this.fileService.isPDF(lastSelected)) {
        this.onSelectedFile(lastSelected, false);

      } else {
        const myReader: FileReader = new FileReader();
        myReader.onloadend = (e) => {
          this.fileImage = 'data:image/jpeg;base64,' + myReader.result.toString().split(',')[1];
        };
        myReader.readAsDataURL(lastSelected);
      }
    } else {
      this.fileBase64 = null;
      this.fileImage = null;
    }
  }

  onFilesNotAlloewdAdded(notAllowed: any) {
    if (notAllowed.allNotAllowed) {
      if (notAllowed.countNotAllowed > 1) {
        this.msjService.showInfo("El formato de los archivos seleccionados es inválido");
      } else {
        this.msjService.showInfo("El formato del archivo seleccionado es inválido");
      }
    } else {
      if (notAllowed.countNotAllowed > 1) {
        this.msjService.showInfo("El formato de varios archivos seleccionados es inválido");
      } else {
        this.msjService.showInfo("El formato de alguno de los archivos seleccionados es inválido");
      }
    }
  }

  onSelectedFile(file: File, showFile: boolean) {
    const myReader: FileReader = new FileReader();
    myReader.onloadend = (e) => {
      this.viewPdf = (file.size >= this.MAX_SIXE_FILE && !this.documentation.documentationTypeSelected.identificationTypeManual && !showFile) ? false : true;
      this.fileBase64 = myReader.result.toString().split(',')[1];
    };
    myReader.readAsDataURL(file);
  }

  private populateDocumentationForm() {
    this.documentation.organizationalUnitId = this.documentationTypeForm.value.organizationalUnit;
    if (this.documentationTypeForm.value.documentationType) {
      this.documentation.documentationTypeId = this.documentationTypeForm.value.documentationType.id;
      this.documentation.documentationTypeName = this.documentationTypeForm.value.documentationType.name;
      this.documentation.documentationTypeSelected = this.documentationTypeForm.value.documentationType;
    } else {
      this.documentation.documentationTypeId = this.selectedDocumentationTypes[0].id.toString();
      this.documentation.documentationTypeName = this.selectedDocumentationTypes[0].name;
      this.documentation.documentationTypeSelected = this.selectedDocumentationTypes[0];
    }
  }

  private populateSecuenceForm() {     
    this.documentation.sequence = this.sequencesForm.value.sequence;    
    this.documentation.documentDate = this.sequencesForm.value.documentationDate;
    this.adittionalsMetadatasValues.forEach(element => {
      this.documentation.setMetadataFull(element, element['metadataValue']);
    });
  }


  setMetadatasDocumentation(listEmp: any) {
    if (!this.isCandidate) {
      this.documentation.nroLegajo = listEmp.nroLeg;
    }
    this.documentation.employeeLegalId = listEmp.cuil;
    this.documentation.employeeLastName = listEmp.lastName;
    this.documentation.employeeFirstName = listEmp.name;
    this.documentation.containerTypeId = this.containerType.id;
    this.documentation.userId = listEmp.userId.toString();
    this.documentation.documentContainerId = Number(listEmp.id);
  }

  updateAditionalMetadata(event: any) {
    if (!event.systemName) {
      event.systemName = event.metadataSystemName;
    }

    event.metadataSystemName = event.systemName;

    const index = this.adittionalsMetadatasValues.findIndex((e) => e.metadataSystemName === event.metadataSystemName);
    if (index === -1) {
      this.adittionalsMetadatasValues.push(event);
    } else {
      this.adittionalsMetadatasValues[index] = event;
    }
    this.sequencesForm.controls[event.metadataSystemName].setValue(event.metadataValue);
  }

  loadSecuence(doc: DocumentationType) {    
    this.sequences = doc.documentationTypeSequence.filter(x => x.documentationSequence.workflowId !== "12");    
    if (doc.documentationTypeSequence.length == 1)
    {
        this.sequence = doc.documentationTypeSequence[0].documentationSequence;
    }
    this.sequencesForm.get('sequence').setValue(this.setValueByDefault('sequence'));
  }

  private setValueByDefault(element: string) {
    switch (element) {
      case 'organizationalUnit':
        return this.organizationalUnits.length == 1 ? this.organizationalUnits[0] : null;

      case 'documentationType':
        return this.documentationTypes.length == 1 ? this.documentationTypes[0] : null;

      case 'sequence':
        return this.sequences.length == 1 ? this.sequences[0].documentationSequence : null;
    }
  }

  resetWizard(stepper: MatStepper) {
    this.documentation = new FileDocument();

    if (this.uploadFiles) {
      this.uploadFiles.files = [];
    }

    this.files = [];
    this.fileBase64 = null;
    this.fileBlob = null;
    this.fileImage = null;
    this.adittionalsMetadatas = [];
    this.adittionalsMetadatasValues = [];
    this.sequencesForm.reset();
    this.initFormSecuence();
    stepper.reset();
    this.InitializeWithSelectedPerson();
    this.isZip = false;
    this.usingFormio = false;
    this.rrhhUploadFile = false;
    if (this.addmore === false) {
      this.documentationTypeForm.reset();
      this.resetEmployees();
      stepper.reset();
    }
  }

  chageAddMore() {
    this.addmore = !this.addmore
  }

  getAddMore() {
    return this.addmore;
  }

  resetEmployees() {
    if (this.employees != null) {
      this.employees.forEach(emp => {
        emp.selected = false;
      });
    }
    this.selectedEmployees = [];
  }

  private loadAdditionalMetadatas(documentTypeId: number) {
    this.formReady = false;
    this.documentationTypesService.getDocumentType(documentTypeId).toPromise().then(
      data => {
        this.adittionalsMetadatas = data['metadata'].filter(z =>
          z.metadataSystemName != FileDocument.nroLegSystemName &&
          z.metadataSystemName != FileDocument.nameSystemName &&
          z.metadataSystemName != FileDocument.lastNameSystemName &&
          z.metadataSystemName != FileDocument.cuilSystemName &&
          z.metadataSystemName != FileDocument.dateSystemName &&
          z.metadataSystemName != FileDocument.idDocumentacionSystemName &&
          z.metadataSystemName != FileDocument.nomDocumentacionSystemName &&
          z.metadataSystemName != FileDocument.userIdSystemName &&
          z.metadataId != this.documentation.documentationTypeSelected.nonConformityReasonId &&
          (this.containerType.metadata.findIndex(mc => mc.metadataSystemName == z.metadataSystemName) < 0)
        );

        if (!this.sequencesForm) {
          this.initFormSecuence();
        }

        this.hasPeriod = (this.adittionalsMetadatas.findIndex(m => m.metadataSystemName == FileDocument.periodSystemName) >= 0);
        if (this.hasPeriod) {
          this.sequencesForm.get('documentationDate').setValue(new Date());
        }

        if (this.documentation.documentationTypeSelected.metadataId != null) {
          const metaAux = this.adittionalsMetadatas.find(z => z['metadataId'] == this.documentation.documentationTypeSelected.metadataId);
          if (metaAux != null) {
            this.documentation.setMetadata(metaAux['metadataSystemName'], this.documentation.documentationTypeSelected.metadataKey);
            this.adittionalsMetadatas.splice(this.adittionalsMetadatas.findIndex(e => e['metadataId'] === this.documentation.documentationTypeSelected.metadataId), 1);
          }
        }
        this.adittionalsMetadatas.forEach(element => {
          if (element.isRequired) {
            this.sequencesForm.addControl(element.metadataSystemName, this._formBuilder.control('', Validators.required));
          } else {
            this.sequencesForm.addControl(element.metadataSystemName, this._formBuilder.control(''));
          }
        });
        this.formReady = true;
      })
      .catch(err => this.msjService.showError(err))
      .then(() => this.formReady = true);
  }

  isSequencesStepValid(): boolean {
    let hasFiles = false;
    if (this.documentation.formioFormAlias && this.documentation.formioSubmissionId) {
      hasFiles = this.documentation.formioFormAlias.length > 0 && this.documentation.formioSubmissionId.length > 0;
    } else {
      hasFiles = (this.files != null && this.files.length > 0) || this.documentation.documentationTypeSelected.documentationLoadContentName != 'RRHH';
    }

    return (this.sequencesForm.valid && hasFiles);
  }

  headerTitle(): string {
    if (this.documentation && this.documentationTypeForm.value.documentationType) {
      return " - " + this.documentationTypeForm.value.documentationType.name;
    }
  }

  refreshDocumentationType() {
    this.documentationTypeForm.get('documentationType').reset();
    this.selectedDocumentationTypes = [];
    if (this.documentationTypeForm.value.organizationalUnit) {
      this.documentationTypesService.GetForAdd(this.documentationTypeForm.value.organizationalUnit).toPromise().then(
        data => {
          this.documentationTypes = data;
          this.documentationTypeForm.get('documentationType').setValue(this.setValueByDefault('documentationType'));
        },
        err => this.msjService.showError(err)
      );
    }
  }

  onSubmitFormio(submission) {
    if (submission) {
      this.documentation.formioFormAlias = this.selectedDocumentationTypes[0].exteralForm;
      this.documentation.formioSubmissionId = submission._id;
      this.next(this.actualStepper);
    }
    else {
      this.inProcess = false;
      // Fuerzo la deteccion de cambios para que se oculte mientras estoy reconstruyendo el modelo
      this.ref.detectChanges();
    }
  }

  urlToFile(data, filename, mimeType) {
    return (fetch(data)
      .then(function (res) { return res.arrayBuffer(); })
      .then(function (buf) { return new File([buf], filename, { type: mimeType }); })
    );
  }

  toggleScan() {
    this.scanning = !this.scanning;
  }

  showScan(blob: Blob) {
    this.fileBlob = blob;
  }

  addScan(blob: Blob) {
    if (!this.files) {
      this.files = [];
    }
    this.showScan(blob);
    const file: any = blob;
    file.lastModifiedDate = new Date();
    file.name = "scan_" + file.lastModifiedDate.getTime() + ".pdf";
    this.files.push(file);
  }

  fileValidPreview() {
    const extension = this.files[0].name.split('.').pop();
    return (extension !== 'tif' && extension !== 'tiff' && extension !== 'zip');
  }

  private InitializeWithSelectedPerson() {
    if (this.selectedPerson) {
      if (!this.selectedEmployees) {
        this.selectedEmployees = [this.selectedPerson];
        this.setMetadataFolder();
      }
      this.stepper.selectedIndex = this.stepsDocumentation.SECUENCE;
      this.refreshDocumentationType();
    }
  }

  private setMaxFiles() {
    this.maxFiles = this.documentation.documentationTypeSelected.identificationTypeManual ? maxFiles.SIMPLE : maxFiles.MULTIPLE;
  }

  showBottomSheet() {
    const parameters = {
      bodyText: 'Estamos cargando sus documentos',
      infoText: 'No podemos cerrar aún, por favor espere.',
      type: MessageType.Info
    } as MessageAtributtes;

    const t = this._bottomSheet.open(GenericBottomSheetComponent, { data: parameters, disableClose: true });
    t.instance.close.subscribe(() => {
    });
  }

  toogleCompleteFormio() {
    this.rrhhUploadFile = !this.rrhhUploadFile;
  }

  private setMetadataFolder() {
    if (this.selectedEmployees.length == 1) {
      this.documentation.metadatasCarpeta = this.metadataService.map(this.selectedEmployees[0].metadatas);
    }
  }

  changeNotify(event: any)
  {    
    this.employeeNotify = !this.employeeNotify;    
    this.documentation.employeeNotifiy  = this.employeeNotify ;
  }  
  setNotify()
  {
    if (this.sequence && this.sequence.id != 1){
      this.documentation.employeeNotifiy = this.employeeNotify;
      }
      else{
        this.documentation.employeeNotifiy=false;
      }
  }
}
