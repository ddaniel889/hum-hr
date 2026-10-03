import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { maxFiles, DocumentationType } from '../models/documentation-type.model';
import { FileDocument } from "../models/file-document.model";
import { DocumentationService } from '../services/documentation.service';
import { MessageService } from '../errorHandler/message.service';
import { DocumentationTypesService } from '../services/documentation-types.service';
import { FileType } from "../models/file-type.model";
import { FileService } from "../services/file.service";
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';

@Component({
  selector: "app-file-document-upload",
  templateUrl: "./file-document-upload.component.html",
  styles: []
})
export class FileDocumentUploadComponent implements OnInit {
  @Input() filePdf = "";
  @Input() doc: FileDocument;
  @Input() documentationType: DocumentationType;
  @Input() isNewDocument = false;
  @Input() allowMultipleFiles = true;
  @Output() OnFileSelected = new EventEmitter<FileType>();
  @Output() OnSeeFileDefaultSelected = new EventEmitter<FileType>();
  @Output() OnUpload = new EventEmitter<boolean>();
  @Output() cleanFile = new EventEmitter<boolean>();
  loading = false;
  maxFiles = this.allowMultipleFiles ? maxFiles.MULTIPLE : maxFiles.SIMPLE;
  files: File[];
  fileImage: any;
  fileTypeDTO: FileType;
  metadatas:  any[];
  metadatasValues: any[];
  metadataForm: UntypedFormGroup;
  isCropping = false;


  constructor(
    private _documentationService: DocumentationService,
    private _messageService: MessageService,
    private _documentationTypeService: DocumentationTypesService,
    private _fileService: FileService,
    private documentationTypesService: DocumentationTypesService,
    private _formBuilder: UntypedFormBuilder
  ) {
    this.fileTypeDTO = {} as FileType;
  }

  ngOnInit() {
    this.maxFiles = this.allowMultipleFiles ? maxFiles.MULTIPLE : maxFiles.SIMPLE;
    if (this.doc) {
      this.loading = true;
      if (!this.documentationType) {
        this._documentationTypeService.getById(this.doc.documentationTypeId).toPromise()
          .then(dt => {
            this.loading = true;
            if (dt != null) {
              this.doc.documentationTypeSelected = dt;
              this.documentationType = dt;
            }
          })
          .catch(err => this._messageService.showError(err))
          .then(() => this.loading = false);
      } else {
        if (this.doc.documentationTypeSelected !== this.documentationType) {
          this.doc.documentationTypeSelected = this.documentationType;
        }
      }

      if (this.isNewDocument) {
        // Cargo los metadatos que necesito
        this.metadatas = [];
        this.metadatasValues = [];
        this.metadataForm = this._formBuilder.group({});
        this.loadMetadatas();
      }

      this.loading = false;
    }
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

    this.metadataForm.controls[event.metadataSystemName].setValue(event.metadataValue);
  }

  upload() {
    if (this.files && this.files.length > 0) {
      this.loading = true;
      if (this.isNewDocument) {
        if (this.metadataForm.invalid) {
          this._messageService.showError('CPPAPIV001');
          this.loading = false;
          return;
        }

        // Si es alta primero me guardo los metadatos
        this.metadatasValues.forEach(element => {
          this.doc.setMetadataFull(element, element['metadataValue']);
        });

        // Creo el documento
        this._documentationService.createEmployeeDocument(this.doc, this.files).toPromise()
          .then(res => this.OnUpload.emit(true))
          .catch(err => this._messageService.showError(err))
          .then(() => this.loading = false);
      } else {
        // Si no es alta subo el archivo del documento
        this._documentationService.employeeUpload(this.doc, this.files).toPromise()
          .then(res => this.OnUpload.emit(true))
          .catch(err => this._messageService.showError(err))
          .then(() => this.loading = false);
      }
    }
  }

  onFilesChanged(changedReturn: any) {
    let files: File[] = changedReturn.files;
    if (!files || files.length < 1 && changedReturn.isAdding){
      return;
    }

    if (files && files.length > 0) {
      const lastSelected = files[files.length - 1];
      this.files = files;
      this.onSelectedFile(lastSelected, false, changedReturn.isAdding);
    } else {
      this.cleanFile.emit(true);
      this.cleanFiles();
    }
  }

  onFilesNotAlloewdAdded(notAllowed: any) {
    if (notAllowed.allNotAllowed) {
      if (notAllowed.countNotAllowed > 1) {
        this._messageService.showInfo("El formato de los archivos seleccionados es inválido");
      } else {
        this._messageService.showInfo("El formato del archivo seleccionado es inválido");
      }
    } else {
      if (notAllowed.countNotAllowed > 1) {
        this._messageService.showInfo("El formato de varios archivos seleccionados es inválido");
      } else {
        this._messageService.showInfo("El formato de alguno de los archivos seleccionados es inválido");
      }
    }
  }

  onSelectedFile(file: File, isSeeFileDefault: boolean = false, isAdding: boolean = false) {
    const myReader: FileReader = new FileReader();
    myReader.onloadend = (e) => {
      const fileBase64 = myReader.result.toString().split(',')[1];
      if (this._fileService.isPDF(file)) {
        this.filePdf = fileBase64;
        this.fileTypeDTO.base64 = this.filePdf;
        this.fileTypeDTO.isPdf = true;
        this.fileTypeDTO.isValidPreview = true;
        this.fileImage = null;
      } else {
        this.fileImage = 'data:image/jpeg;base64,' + fileBase64;
        this.filePdf = null;
        this.fileTypeDTO.base64 = this.fileImage;
        this.fileTypeDTO.isPdf = false;
        this.fileTypeDTO.isValidPreview = this.fileValidPreview(file);
        this.cleanFile.emit(true);
        this.isCropping = isAdding;
      }
      this.fileTypeDTO.fileName = file.name;

      if (isSeeFileDefault) {
        this.OnSeeFileDefaultSelected.emit(this.fileTypeDTO);
      } else {
        if (!this.isCropping) {
          this.OnFileSelected.emit(this.fileTypeDTO);
        }
      }
    };
    myReader.readAsDataURL(file);
  }

  fileValidPreview(file: File) {
    if (!file) {
      return false;
    }

    const extension = file.name.split('.').pop();
    return (extension !== 'tif' && extension !== 'tiff');
  }

  uploadCropper(file: string) {
    // Obtengo el index del file
    const indexToReplace = this.files.findIndex(f => f.name === this.fileTypeDTO.fileName);
    
    // Piso el base 64 con el cropped
    this.fileTypeDTO.base64 = file;

    // Modifico el nombre y obtengo el file
    let filename = this.fileTypeDTO.fileName.substring(0, this.fileTypeDTO.fileName.indexOf('.'));
    this.fileTypeDTO.fileName = `${filename}.png`;
    const newFile = this.getFileFromfileType('image/png');
    
    this.files[indexToReplace] = newFile;
    this.OnFileSelected.emit(this.fileTypeDTO);
    this.isCropping = false;
  }

  private cleanFiles() {
    this.filePdf = null;
    this.fileTypeDTO = {} as FileType;
    this.fileImage = null;
    this.isCropping = false;
  }

  private getFileFromfileType(fileType: string): File {
    const base64 = this.fileTypeDTO.base64.substring(22);
    const imageBlob = this._fileService.convertBase64ToBlob(base64);
    return new File([imageBlob], this.fileTypeDTO.fileName, { type: fileType });
  }

  private loadMetadatas() {
    this.documentationTypesService.getDocumentType(this.documentationType.documentTypeId).toPromise().then(
      data => {
        this.metadatas = data['metadata'].filter(z =>
          z.metadataSystemName != FileDocument.nroLegSystemName &&
          z.metadataSystemName != FileDocument.nameSystemName &&
          z.metadataSystemName != FileDocument.lastNameSystemName &&
          z.metadataSystemName != FileDocument.cuilSystemName &&
          z.metadataSystemName != FileDocument.dateSystemName &&
          z.metadataSystemName != FileDocument.idDocumentacionSystemName &&
          z.metadataSystemName != FileDocument.nomDocumentacionSystemName &&
          z.metadataSystemName != FileDocument.userIdSystemName &&
          z.metadataId != this.doc.documentationTypeSelected.nonConformityReasonId &&
          z.metadataId != this.doc.documentationTypeSelected.metadataId &&
          this.doc.metadatas.findIndex(m => m.systemName === z.metadataSystemName) < 0);

          // Si tiene metadato predefinido lo seteo
          if (this.doc.documentationTypeSelected.metadataId) {
            const metaAux = data['metadata'].find(z => z['metadataId'] == this.doc.documentationTypeSelected.metadataId);
            this.doc.setMetadata(metaAux.metadataSystemName, this.doc.documentationTypeSelected.metadataKey);
          }

          this.metadatas.forEach(meta => {
            // Creo el FormControl
            const val = [];
            if (meta.isRequired) {
              val.push(Validators.required);
            }

            if (meta.metadataType === 'email') {
              val.push(Validators.email);
            }

            if (meta.metadataType === 'period') {
              val.push(Validators.pattern(meta.periodPattern));
            }

            this.metadataForm.addControl(meta.metadataSystemName, this._formBuilder.control('', val));
          });
      },
      err => this._messageService.showError(err)
    );
  }
}
