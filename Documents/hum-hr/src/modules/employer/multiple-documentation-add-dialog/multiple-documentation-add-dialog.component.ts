import { Component, OnInit, Inject, ViewChild, ChangeDetectorRef, ViewChildren, QueryList, Output, EventEmitter } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MessageService } from '../../shared/errorHandler/message.service';
import { DocumentationTypesService } from '../../shared/services/documentation-types.service';
import { ACEPTED_EXTENSION, DocumentationLoadContent, DocumentationType, maxFiles } from '../../shared/models/documentation-type.model';
import { Person } from '../../shared/models/Employee/person.model';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { FileDocument } from '../../shared/models/file-document.model';
import { ContainerTypeService } from '../../shared/services/container-type.service.';
import { ContainerType } from '../../shared/models';
import { FileService } from '../../shared/services/file.service';
import { FormioCardinalComponent } from '../../formioCs/formio-cardinal.component';
import { MessageAtributtes, MessageType } from '../../shared/models/message-types.model';
import { GenericBottomSheetComponent } from '../../shared/generic-bottom-sheet/generic-bottom-sheet.component';
import { MatBottomSheet } from "@angular/material/bottom-sheet";
import { DocumentationService } from '../../shared/services/documentation.service';
import { UploadFormComponent } from '../../shared/file-dnd/file-dnd.component';
import { DocumentationTypeSet, DocumentationTypeSetFind, DocumentationTypeSetItem } from '../../shared/models/documentationTypeSet.model';
import { DocumentationTypeSetService } from '../../shared/services/documentation-type-set.service';
import { Candidate } from '../../shared/models/Employee/candidate.model';
import { CandidateService } from '../../shared/services/candidate.service';
import { CandidateSet } from '../../shared/models/Employee/candidate-set.model';
import { MetadataService } from '../../shared/services/metadatas.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-multiple-documentation-add-dialog',
  templateUrl: './multiple-documentation-add-dialog.component.html',
  styles: []
})
export class MultipleDocumentationAddDialogComponent implements OnInit {
  @ViewChild(UploadFormComponent) uploadFiles: UploadFormComponent;
  @ViewChildren(FormioCardinalComponent) formioCardinal: QueryList<FormioCardinalComponent>;

  @Output() finishAddDocumentation = new EventEmitter<boolean>();
  @Output() finishCloseDialog = new EventEmitter<boolean>();

  // Generic
  documentationTypes: DocumentationType[] = [];
  containerType: ContainerType;
  documentationTypeSet: DocumentationTypeSet;
  loading = true;
  documentForm: UntypedFormGroup;
  maxDate = new Date();
  maxFiles = maxFiles.SIMPLE;
  isEdittingSet = false;
  inProcess = false;

  //Enviroment
  featureFlag = environment.featureFlag;

  // Stepperlist variables
  selectedSetItems: DocumentationTypeSetItem[] = [];
  currentIndex = 0;

  // Specific for the new fileDocument
  sequences: any[] = [];
  sequence: any;
  currentDocumentationType: DocumentationType;
  hasPeriod = false;
  documentation = new FileDocument();
  rrhhUploadFile = false;
  aceptedExtensions = ACEPTED_EXTENSION.MANUAL;
  files: File[] = [];
  isZip = false;
  adittionalsMetadatas: any[] = [];
  adittionalsMetadatasValues: any[] = [];
  usingFormio = false;
  isExternalFormOnly = false;
  fileBase64: string;
  formName: string;
  fileBlob: Blob;
  fileImage: any;
  showFileUploader = true;
  loadingDefaultFile = false;
  loadingMetadatas = false;
  showOptionalFormComplete = false;
  showMessageCompleted = false;
  pressButton = false;
  employeeNotify = true;

  constructor(@Inject(MAT_DIALOG_DATA) public person: Person,
    private dialogRef: MatDialogRef<MultipleDocumentationAddDialogComponent>,
    private messageService: MessageService,
    private containerTypeService: ContainerTypeService,
    private documentationTypesService: DocumentationTypesService,
    private _formBuilder: UntypedFormBuilder,
    private documentationService: DocumentationService,
    private _bottomSheet: MatBottomSheet,
    private documentationTypeSetSvc: DocumentationTypeSetService,
    private candidateSvc: CandidateService,
    private fileService: FileService,
    private ref: ChangeDetectorRef,
    private metadataService: MetadataService) { }

  ngOnInit() {
    const loadings = [];
    this.loading = true;

    loadings.push(this.documentationTypesService.getToCandidates(this.person.organizationalUnitId, false, true, true).toPromise());
    loadings.push(this.containerTypeService.getCandidateContainerType(this.person.organizationalUnitId.toString()).toPromise());

    const findParameters: DocumentationTypeSetFind = {
      organizationalUnitId: this.person.organizationalUnitId,
      enabled: null
    };
    loadings.push(this.documentationTypeSetSvc.get(findParameters).toPromise());

    Promise.all(loadings)
      .then(res => {
        this.documentationTypes = res[0];
        this.containerType = res[1];

        if (res[2].length > 0) {
          this.documentationTypeSet = res[2].find(r => r.id === this.person.candidateSet?.setId);

          if (!this.documentationTypeSet) {
            // Si el candidato no tiene set le asigno uno y lo mando a guardar.
            this.documentationTypeSet = res[2][0];

            // Guardo la relación
            this.person.candidateSet = new CandidateSet();
            this.person.candidateSet.setId = this.documentationTypeSet.id;
            this.person.candidateSet.candidateId = +this.person.id;
            this.person.candidateSet.enabled = true;

            this.candidateSvc.updateCandidateSet(this.person.candidateSet).toPromise()
              .then(data => console.log(data))
              .catch(err => console.log(err));
          }

        } else {
          // Si no tenemos sets creo uno para uqe sea el default.
          this.documentationTypeSet = {
            id: 0,
            name: `Set ${this.person.organizationalUnitName}`,
            description: '',
            documentationTypeSetItem: [],
            organizationalUnitId: this.person.organizationalUnitId,
            enabled: true,
            disabledDateTime: null,
            metricsSet: null
          };
        }
      })
      .catch(err => this.messageService.showError(err))
      .then(() => this.loading = false);
  }
  hasActiveFilters() {
    return localStorage.getItem("hasFiltersMetadataCandidate") === "true" || localStorage.getItem("hasFiltersMetadataEmployee") === "true";
  }
  addDocumentationType(item: DocumentationTypeSetItem) {
    const selectedITem = { ...item, index: this.selectedSetItems.length };
    this.selectedSetItems.push(selectedITem);
    if (this.selectedSetItems.length === 1) {
      // Si es el primero o unico que tengo cargo el formulario
      this.prepareFileDocumentAdd(selectedITem);
    }
  }

  removeDocumentationType(item: DocumentationTypeSetItem) {
    // Me fijo si el item ya esta en la lista
    // const foundItem = this.selectedSetItems.find(i => i.id === item.id);
    const foundItem = this.selectedSetItems.find(i => i.index === item.index);

    if (foundItem && !foundItem.isFinished) {
      // Si existe y no esta termiando lo elimino
      const removingCurrent = this.selectedSetItems.findIndex(i => i.index === item.index) === this.currentIndex;
      this.selectedSetItems = this.selectedSetItems.filter(sdt => sdt.index !== item.index);

      if (removingCurrent) {
        // Si borro el actual muevo al currentindex
        this.resetStep();
        if (this.selectedSetItems.length > 0) {
          const unfinished = this.selectedSetItems.find(s => !s.isFinished);
          if (!unfinished) {
            // Si tengo al menos uno temrinado y no quedan pendientes cierro
            this.closeDialog();
          } else {
            this.prepareFileDocumentAdd(this.selectedSetItems[this.currentIndex]);
          }
        }
      }
    }
  }

  requiredDocument() {
    if (this.selectedSetItems[this.currentIndex].required) {
      this.selectedSetItems[this.currentIndex].required = false;

    }
    else this.selectedSetItems[this.currentIndex].required = true;

  }

  prepareFileDocumentAdd(item: DocumentationTypeSetItem) {
    this.loadingDefaultFile = true;
    this.loadingMetadatas = true;
    this.showFileUploader = true;
    this.currentDocumentationType = this.documentationTypes.find(dt => dt.id === item.documentationTypeId);
    this.initForm();
    this.documentation = new FileDocument();
    this.documentation.documentationTypeSelected = this.currentDocumentationType;
    this.documentation.documentationTypeId = this.currentDocumentationType.id.toString();
    this.documentation.documentationTypeName = this.currentDocumentationType.name;
    this.documentation.organizationalUnitId = this.person.organizationalUnitId;
    this.documentation.metadatasCarpeta = this.metadataService.map(this.person.metadatas);
    this.setDocumentationMetadataFromPerson();
    this.showOptionalFormComplete = this.currentDocumentationType.hasExternalForm && this.currentDocumentationType.documentationLoadContentId === DocumentationLoadContent.AMBOS;
    if (!this.showOptionalFormComplete) {
      this.rrhhUploadFile = this.currentDocumentationType.documentationLoadContentName == 'RRHH' || this.currentDocumentationType.documentationLoadContentName == 'AMBOS';
    } else {
      this.rrhhUploadFile = false;
    }

    if (this.currentDocumentationType.exteralForm != null && this.currentDocumentationType.exteralForm.length > 0) {
      this.ref.detectChanges();
    }
    this.usingFormio = this.currentDocumentationType.exteralForm != null && this.currentDocumentationType.exteralForm.length > 0;
    this.isExternalFormOnly = this.currentDocumentationType.isExternalFormOnly;
    this.formName = this.currentDocumentationType.exteralForm;

    this.loadAdditionalMetadatas(this.currentDocumentationType);
    if (this.documentation.documentationTypeSelected.identificationTypeManual) {
      this.aceptedExtensions = ACEPTED_EXTENSION.MANUAL;
      this.maxFiles = maxFiles.SIMPLE;
    } else {
      this.aceptedExtensions = ACEPTED_EXTENSION.AUTOMATICO;
      this.maxFiles = maxFiles.MULTIPLE;
    }
    this.sequences = this.currentDocumentationType.documentationTypeSequence.filter(x => x.documentationSequence.workflowId !== "12");
    if (this.sequences.length === 1) {
      // Si hay una sola lo preselecciono.
      this.sequence = this.sequences[0].documentationSequence
      this.documentForm.controls['sequence'].setValue(this.sequences[0].documentationSequence);
    }

    // Si tengo archivo se lo precargo
    if (item.documentationTypeSetItemFiles && item.documentationTypeSetItemFiles.length > 0) {
      this.showFileUploader = false;
      this.documentationTypeSetSvc.getFile(item.documentationTypeSetItemFiles[0].fileId).toPromise()
        .then(file64 => {
          this.fileBase64 = file64.value;
          const blob = this.fileService.convertBase64ToBlob(this.fileBase64);
          const file = new File([blob], item.documentationTypeSetItemFiles[0].name);
          this.files.push(file);
        })
        .catch(err => this.messageService.showError(err))
        .then(() => this.loadingDefaultFile = false);
    } else {
      this.loadingDefaultFile = false;
    }
  }


  closeDialog() {
    if (this.inProcess) {
      this.showBottomSheet();
    } else {
      this.dialogRef.close();
    }
  }

  openEditSet() {
    this.isEdittingSet = true;
  }

  closeEditSet() {
    this.isEdittingSet = false;
  }

  next() {
    this.inProcess = true;
    // Si es formio ejecuto el submit de formio primero
    const isFormioUpload = this.rrhhUploadFile && this.usingFormio && !((this.files != null && this.files.length) || this.fileBlob != null);
    if (isFormioUpload && !this.documentation.formioSubmissionId) {
      this.formioCardinal.first.submitForm();
      return;
    }

    // Grabo y despues me muevo al siguiente
    if (!this.isFormValid()) {
      this.messageService.showError("VerifyFormData");
      this.inProcess = false;
      return;
    }

    this.documentation.documentationTypeSetItemId = this.selectedSetItems[this.currentIndex].id;
    this.documentation.documentationSetId = this.documentationTypeSet.id;
    this.populateDocumentationFromForm();
    const list = [];
    list.push(JSON.parse(JSON.stringify(this.documentation)));
    this.documentationService.create(list, this.files).toPromise().then(
      (data) => {
        this.inProcess = false;
        if (this.currentIndex + 1 === this.selectedSetItems.length) {
          if(this.pressButton == true){
            // Si es el ultimo cierro todo
            this.closeDialog();
            this.ref.detectChanges();
            this.finishCloseDialog.emit(true);
            this.showMessageCompleted = true;
          }
          this.pressButton = false;
        } else {
          this.moveNextItem();
          this.messageService.showInfo('La Documentación se ha agregado con éxito');
          this.pressButton = false;
        }
      })
      .catch(err => this.messageService.showError(err))
      .then(() => {
        this._bottomSheet.dismiss();
        this.inProcess = false;
      });

  }

  isFormValid(): boolean {
    let hasFiles = false;
    if (this.documentation.formioFormAlias && this.documentation.formioSubmissionId) {
      hasFiles = this.documentation.formioFormAlias.length > 0 && this.documentation.formioSubmissionId.length > 0;
    } else {
      hasFiles = (this.files != null && this.files.length > 0) || this.documentation.documentationTypeSelected.documentationLoadContentName != 'RRHH';
    }

    return (this.documentForm.valid && hasFiles);
  }

  onSelectedFile(file: File, showFile: boolean) {
    const myReader: FileReader = new FileReader();
    myReader.onloadend = (e) => {
      this.fileBase64 = myReader.result.toString().split(',')[1];
    };
    myReader.readAsDataURL(file);
  }

  onFilesChanged(changedReturn: any) {
    let files: File[] = changedReturn.files;
    if (!files || files.length < 1 && changedReturn.isAdding) {
      this.messageService.showInfo("El Formato del archivo es inválido");
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
        this.messageService.showInfo("El formato de los archivos seleccionados es inválido");
      } else {
        this.messageService.showInfo("El formato del archivo seleccionado es inválido");
      }
    } else {
      if (notAllowed.countNotAllowed > 1) {
        this.messageService.showInfo("El formato de varios archivos seleccionados es inválido");
      } else {
        this.messageService.showInfo("El formato de alguno de los archivos seleccionados es inválido");
      }
    }
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

    this.documentForm.controls[event.metadataSystemName].setValue(event.metadataValue);
  }

  onSubmitFormio(submission) {
    if (!submission) {
      this.inProcess = false;
      this.ref.detectChanges();
      return;
    }
    this.documentation.formioFormAlias = this.currentDocumentationType.exteralForm;
    this.documentation.formioSubmissionId = submission._id;
    this.next();
    this.ref.markForCheck();
  }
 
  enviar(){
    this.pressButton = true;
    this.next();
  }
  ngOnDestroy (){
    if(this.showMessageCompleted === true){
      this.messageService.showInfo('La Documentación se ha agregado con éxito');
    }
    this.showMessageCompleted = false;
  }
  fileValidPreview() {
    const extension = this.files[0].name.split('.').pop();
    return (extension !== 'tif' && extension !== 'tiff' && extension !== 'zip');
  }

  addAll() {
    this.documentationTypeSet.documentationTypeSetItem.forEach(i => this.addDocumentationType(i));
  }

  toogleCompleteFormio() {
    this.rrhhUploadFile = !this.rrhhUploadFile;
  }

  private setDocumentationMetadataFromPerson() {
    const cand: Candidate = <Candidate>this.person;
    this.documentation.employeeLegalId = cand.cuil;
    this.documentation.employeeLastName = cand.lastName;
    this.documentation.employeeFirstName = cand.name;
    this.documentation.containerTypeId = this.containerType.id;
    this.documentation.userId = cand.userId.toString();
    this.documentation.documentContainerId = Number(cand.id);
  }

  private populateDocumentationFromForm() {
    this.documentation.sequence = this.documentForm.value.sequence;
    this.documentation.documentDate = this.documentForm.value.documentationDate;
    if (this.selectedSetItems[this.currentIndex].metadataValue) {
      // Si tiene un subtipo definido lo asigno
      this.documentation.setMetadata(this.selectedSetItems[this.currentIndex].metadataSystemName, this.selectedSetItems[this.currentIndex].metadataValue);
    }
    this.adittionalsMetadatasValues.forEach(element => {
      this.documentation.setMetadataFull(element, element['metadataValue']);
    });
    this.setNotify();
  }

  private moveNextItem() {
    this.selectedSetItems[this.currentIndex].isFinished = true;
    this.currentIndex = this.currentIndex + 1;
    this.resetStep();
    this.prepareFileDocumentAdd(this.selectedSetItems[this.currentIndex]);
  }

  private setMaxFiles() {
    this.maxFiles = this.documentation.documentationTypeSelected.identificationTypeManual ? maxFiles.SIMPLE : maxFiles.MULTIPLE;
  }

  private resetStep() {
    this.documentation = new FileDocument();
    this.currentDocumentationType = undefined;
    if (this.uploadFiles) {
      this.uploadFiles.files = [];
    }
    this.files = [];
    this.fileBase64 = null;
    this.fileBlob = null;
    this.fileImage = null;
    this.adittionalsMetadatas = [];
    this.adittionalsMetadatasValues = [];
    this.documentForm.reset();
    this.isZip = false;
    this.usingFormio = false;
    this.rrhhUploadFile = false;
  }

  private loadAdditionalMetadatas(dt: DocumentationType) {
    this.documentationTypesService.getDocumentType(dt.documentTypeId).toPromise().then(
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

        if (!this.documentForm) {
          this.initForm();
        }

        this.hasPeriod = (this.adittionalsMetadatas.findIndex(m => m.metadataSystemName == FileDocument.periodSystemName) >= 0);
        if (this.hasPeriod) {
          this.documentForm.get('documentationDate').setValue(new Date());
        }

        if (this.documentation.documentationTypeSelected.metadataId != null) {
          const metaAux = this.adittionalsMetadatas.find(z => z['metadataId'] == this.documentation.documentationTypeSelected.metadataId);
          if (metaAux != null) {
            this.documentation.setMetadata(metaAux['metadataSystemName'], this.documentation.documentationTypeSelected.metadataKey);
            this.adittionalsMetadatas.splice(this.adittionalsMetadatas.findIndex(e => e['metadataId'] === this.documentation.documentationTypeSelected.metadataId), 1);
          }
        }

        if (this.selectedSetItems[this.currentIndex].metadataValue) {
          // Si tengo un tipo seleccionado lo elimino de la seleccion
          this.adittionalsMetadatas = this.adittionalsMetadatas.filter(a => a.metadataSystemName != this.selectedSetItems[this.currentIndex].metadataSystemName);
        }

        this.adittionalsMetadatas.forEach(element => {
          if (element.isRequired) {
            this.documentForm.addControl(element.metadataSystemName, this._formBuilder.control('', Validators.required));
          } else {
            this.documentForm.addControl(element.metadataSystemName, this._formBuilder.control(''));
          }
        });
      })
      .catch(err => this.messageService.showError(err))
      .then(() => {
        this.loadingMetadatas = false;
      });
  }

  private initForm() {
    this.documentForm = this._formBuilder.group({
      sequence: [, Validators.required],
      documentationDate: []
    });
  }

  private showBottomSheet() {
    const parameters = {
      bodyText: 'Estamos cargando sus documentos',
      infoText: 'No podemos cerrar aún, por favor espere.',
      type: MessageType.Info
    } as MessageAtributtes;

    const t = this._bottomSheet.open(GenericBottomSheetComponent, { data: parameters, disableClose: true });
    t.instance.close.subscribe(() => {
    });
  }
  changeNotify()
  {
    this.employeeNotify = !this.employeeNotify;
    this.documentation.employeeNotifiy = this.employeeNotify;
  }
  selectionSquence(event: any){     
    this.sequence = event.value;
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
