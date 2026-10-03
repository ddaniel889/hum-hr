import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { MessageService } from 'src/app/modules/shared/errorHandler/message.service';
import { KeyValuePair } from '../../shared/models/Generics/ikeyValuePair.model';
import { MatStepper } from '@angular/material/stepper';
import { MatDialogRef } from '@angular/material/dialog';
import { LawbookDocument } from '../../shared/models/lawbook-document.model.';
import { FileService, FILESIZE } from '../../shared/services/file.service';
import { maxFiles, ACEPTED_EXTENSION } from '../../shared/models/documentation-type.model';
import { DatePipe } from '@angular/common';
import { LsdStatesService } from '../../shared/services/lsd-states.service';
import { LsdStates } from '../../shared/models/lsd-states.model';
import { DocumentTypeDefinition } from '../../shared/models/document-type-definition.model';
import { LsdService } from '../../shared/services/lsd.service';
import { OrganizationalUnit } from '../../shared/models/organizational-unit.model';
import { OrganizationalUnitService } from '../../shared/services/organizational-unit.service';

@Component({
  selector: 'app-create-lsd',
  templateUrl: './create-lsd.component.html',
  styleUrls: ['./create-lsd.component.css']
})
export class CreateLsdComponent implements OnInit {
  @ViewChild('stepper') stepper: MatStepper;

  loading = true;
  isProcessing = false;
  haveMultipleNominaOptions = false;
  showingFile = false;
  canSelectOu = false;
  selectTypeFormGroup: UntypedFormGroup;
  mainFormGroup: UntypedFormGroup;
  otherFilesFormGroup: UntypedFormGroup;
  docType: DocumentTypeDefinition;
  lsdStates: LsdStates[];
  organizationalUnits: OrganizationalUnit[] = [];

  tNominaOptions: KeyValuePair<string, string>[] = [];

  document: LawbookDocument;
  metadatas: any[] = [];
  metadatasValues: any[] = [];

  files: File[] = [];
  attachedFiles: File[] = [];
  viewPdf = true;
  fileBase64: string;
  MAX_SIXE_FILE = 5 * FILESIZE.MB;
  isZip = false;
  maxFiles = maxFiles.MULTIPLE;
  aceptedExtensions = ACEPTED_EXTENSION.LSD;
  fileImage: any;
  fileName: string;

  constructor(
    private organizationalUnitService: OrganizationalUnitService,
    private dialogRef: MatDialogRef<any>,
    private _formBuilder: UntypedFormBuilder,
    private msgSvc: MessageService,
    private fileService: FileService,
    private lsdSvc: LsdService,
    private lsdStateSvc: LsdStatesService
  ) { }

  ngOnInit(): void {
    this.loading = true;
    this.lsdStateSvc.getStates().toPromise()
      .then(data => this.lsdStates = data);

    this.organizationalUnitService.getTreeInMemory()
      .then(ous => {
        this.organizationalUnits = ous.filter(o => o.isRoot === false);
        this.canSelectOu = this.organizationalUnits.length > 1;

        this.lsdSvc.getDocType().toPromise()
          .then(data => {
            this.docType = data;
            this.document = new LawbookDocument();
            this.document.documentType = this.docType;

            this.mainFormGroup = this._formBuilder.group({
            });

            if (this.canSelectOu) {
              this.mainFormGroup.addControl('organizationalUnitCtrl', this._formBuilder.control('', Validators.required));
            }

            this.metadatas = this.docType.metadata.filter(z => z.metadataSystemName != LawbookDocument.tipoNominaSysName && z.metadataSystemName != LawbookDocument.sateSysName);
            this.metadatas.forEach(element => {
              const datePipe = new DatePipe("en-US");
              const peri2 = datePipe.transform(new Date(), 'yyyyMM');

              const isPeriod = element.metadataSystemName === LawbookDocument.periodSystemName;
              const val = [];
              if (element.isRequired) {
                val.push(Validators.required);
              }

              if (element.metadataType === 'email') {
                const mailRegex = /^[a-zA-Z0-9_\-.]+@[a-zA-Z0-9\-]+\.[a-zA-Z0-9\-.]+$/;
                val.push(Validators.pattern(mailRegex));
              }

              if (element.metadataType === 'period') {
                val.push(Validators.pattern('([12]\\d{3}(0[1-9]|1[0-2]))'));
              }

              this.mainFormGroup.addControl(element.metadataSystemName, this._formBuilder.control(isPeriod ? peri2 : '', val));

              if (isPeriod) {
                element.metadataValue = peri2;
                this.updateMetadata(element);
              }
            });

            const nominas = this.docType.metadata.find(m => m.metadataSystemName === LawbookDocument.tipoNominaSysName);
            this.tNominaOptions = JSON.parse(nominas.optionValues.toString()).map(i => {
              return {
                key: i.value,
                value: i.description
              };
            });

            this.haveMultipleNominaOptions = this.tNominaOptions.length > 1;
            if (this.haveMultipleNominaOptions) {
              this.mainFormGroup.addControl('typeNomina', this._formBuilder.control('', Validators.required));
            }

          })
          .catch(err => this.msgSvc.showError(err))
          .then(() => this.loading = false)
          ;
      },
        err => this.msgSvc.showError(err)
      );



  }

  close() {
    this.dialogRef.close();
  }

  save() {
    if (this.mainFormGroup.invalid) {
      this.msgSvc.showError('CPPAPIV001');
      return;
    }

    this.isProcessing = true;
    // Guardo los metadatos
    this.metadatasValues.forEach(element => {
      this.document.setMetadataFull(element, element['metadataValue']);
    });

    // Guardo el Tipo nomina si esta disponible
    if (this.haveMultipleNominaOptions) {
      this.document.setMetadataFull(this.docType.metadata.find(m => m.metadataSystemName === LawbookDocument.tipoNominaSysName), this.mainFormGroup.value.typeNomina);
    } else {
      this.document.setMetadataFull(this.docType.metadata.find(m => m.metadataSystemName === LawbookDocument.tipoNominaSysName), this.tNominaOptions[0].key);
    }

    // Guardo el estado inicial
    if (this.document.presentacionValue === "02") {
      const initialState = this.lsdStates.find(s => s.key === "InitialMF");
      this.document.setMetadataFull(this.docType.metadata.find(m => m.metadataSystemName === LawbookDocument.sateSysName), initialState.states[0]);
    } else {
      const initialState = this.lsdStates.find(s => s.key === "Initial");
      this.document.setMetadataFull(this.docType.metadata.find(m => m.metadataSystemName === LawbookDocument.sateSysName), initialState.states[0]);
    }

    this.document.signFileNames = [];
    this.files.forEach(file => {
      this.document.signFileNames.push(file.name);
    });


    // Seteo el ou ID al documento
    if (this.canSelectOu) {
      this.document.organizationalUnitId = this.mainFormGroup.value.organizationalUnitCtrl;
    } else {
      this.document.organizationalUnitId = this.organizationalUnits[0].id;
    }

    const sendingFiles = this.files.concat(this.attachedFiles);
    this.lsdSvc.create(this.document, sendingFiles).toPromise()
      .then(data => {
        this.dialogRef.close(true);
      })
      .catch(err => this.msgSvc.showError(err))
      .then(() => this.isProcessing = false);
  }

  updateMetadata(event: any) {
    if (!event.systemName) {
      event.systemName = event.metadataSystemName;
    }

    event.metadataSystemName = event.systemName;

    const index = this.metadatasValues.findIndex((e) => e.metadataSystemName === event.metadataSystemName);
    if (index === -1) {
      this.metadatasValues.push(event);
    } else {
      this.metadatasValues[index] = event;
    }

    this.mainFormGroup.controls[event.metadataSystemName].setValue(event.metadataValue);
  }

  onSelectedFile(file: File, showFile: boolean) {
    this.isZip = false;
    this.fileImage = undefined;
    this.fileName = file.name;

    if (this.fileService.isZIP(file)) {
      this.isZip = true;
      this.showingFile = true;
      return;
    }

    if (this.fileService.isPDF(file)) {
      const myReader: FileReader = new FileReader();
      myReader.onloadend = (e) => {
        this.viewPdf = file.size <= this.MAX_SIXE_FILE;
        this.fileBase64 = myReader.result.toString().split(',')[1];
      };
      myReader.readAsDataURL(file);
    } else {
      const myReader: FileReader = new FileReader();
      myReader.onloadend = (e) => {
        this.fileImage = 'data:image/jpeg;base64,' + myReader.result.toString().split(',')[1];
      };
      myReader.readAsDataURL(file);
    }

    this.showingFile = true;
  }

  onFilesChanged(files: File[], isAttachedFile: boolean = false) {
    this.isZip = false;
    if (files.length > 0) {
      if (files.length > this.maxFiles) {
        files = files.slice(0, this.maxFiles);
      }
      const lastSelected = files[files.length - 1];
      if (isAttachedFile) {
        this.attachedFiles = files;
      } else {
        this.files = files;
        this.document.signFileNames = [];
        this.files.forEach(file => {
          this.document.signFileNames.push(file.name);
        });
      }
      if (this.fileService.isZIP(lastSelected)) {
        this.isZip = true;
        if (isAttachedFile) {
          this.attachedFiles = [lastSelected];
        } else {
          this.files = [lastSelected];
        }
        this.maxFiles = 1;
        return;
      }
    } else {
      this.fileBase64 = null;
      this.fileImage = null;
      this.showingFile = false;
    }
  }

  changeTab() {
    this.fileImage = undefined;
    this.fileBase64 = undefined;
    this.showingFile = false;
  }

  setOu() {

  }
}
