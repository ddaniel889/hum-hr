import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { DocumentationTypeSet, DocumentationTypeSetItem, DocumentationTypeSetItemFile } from '../../shared/models/documentationTypeSet.model';
import { DocumentationType } from '../../shared/models/documentation-type.model';
import { DocumentationTypeSetService } from '../../shared/services/documentation-type-set.service';
import { DocumentationTypesService } from '../../shared/services/documentation-types.service';
import { MessageService } from '../../shared/errorHandler/message.service';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { FileDocument } from '../../shared/models/file-document.model';

@Component({
  selector: 'app-documentation-type-set-edit',
  templateUrl: './documentation-type-set-edit.component.html',
  styles: [
  ]
})
export class DocumentationTypeSetEditComponent implements OnInit {
  @Output() closeEdition = new EventEmitter<boolean>();

  @Input() documentationTypeSet: DocumentationTypeSet;
  @Input() SelectedSetITemList: DocumentationTypeSetItem[] = [];

  closing = false;
  isAdding = false;
  isEdittingName = false;
  isLoading = true;
  addDefaultFileOpen = false;
  documentationTypes: DocumentationType[];
  setDocumentationTypes: DocumentationTypeSetItem[] = [];
  availableDocumentationTypes: DocumentationTypeSetItem[];
  addingItems: DocumentationTypeSetItem[];
  editNameFormGroup: UntypedFormGroup;
  selectedDocumentationTypeSetItem: DocumentationTypeSetItem;

  //#region file uploader
  fileBase64: string;
  files: File[] = [];
  aceptedExtensions = '.pdf';
  viewDetail = false;
  documentation = new FileDocument();
  newFileIds: string[];
  //#endregion

  constructor(
    private documentationTypesService: DocumentationTypesService,
    private docTypeSetSvc: DocumentationTypeSetService,
    private msjService: MessageService,
    private _formBuilder: UntypedFormBuilder,
  ) { }

  ngOnInit(): void {    
    this.documentationTypesService.getToCandidates(this.documentationTypeSet.organizationalUnitId, false, true, true).toPromise().then(
      data => {        
        this.documentationTypes = data;
        try {
          this.setDocumentationTypes = [...this.documentationTypeSet.documentationTypeSetItem];
          this.setDocumentationTypes.forEach(i => {
            const docType = this.documentationTypes.find(d => d.id === i.documentationTypeId);
            i.canAddDefaultFile = !docType.exteralForm && docType.documentationLoadContentName === "RRHH";
          });
        } catch (error) {
          this.msjService.showError(error);
        }
      })
      .catch(err => this.msjService.showError(err))
      .then(() => this.isLoading = false);
  }

  closeEdit(cancel = true) {
    // Si tengo arlgun archivo creado y estoy cancelando lo mando a eliminar
    if (cancel && this.newFileIds) {
      this.newFileIds.forEach(id => {
        this.docTypeSetSvc.deleteFile(id).toPromise();
      });
    }

    this.closing = true;
    this.closeEdition.emit();
  }

  openAddItems() {
    this.getAvailableSetItems();
    this.addingItems = [];
    this.isAdding = true;
    this.isEdittingName = false;
  }

  openNameEdition() {
    this.isAdding = false;
    this.isEdittingName = true;
    this.editNameFormGroup = this._formBuilder.group({
      nameFrmCtrl: [this.documentationTypeSet.name, Validators.required],
      descriptionFrmCtrl: [this.documentationTypeSet.description]
    });
  }

  save() {
    this.isLoading = true;
    const editted = { ... this.documentationTypeSet };
    editted.documentationTypeSetItem = this.setDocumentationTypes;
    this.docTypeSetSvc.modify(editted).toPromise()
      .then(data => {

        this.documentationTypeSet.documentationTypeSetItem = this.setDocumentationTypes;
        this.closeEdit(false);
      })
      .catch(err => this.msjService.showError(err))
      .then(() => this.isLoading = false);
  }

  addToSet(dt: DocumentationTypeSetItem) {
    const index = this.addingItems.findIndex(d => d === dt);
    if (index >= 0) {
      this.addingItems = this.addingItems.filter(d => d !== dt);
    } else {
      this.addingItems.push(dt);
    }
  }

  addItems() {
    // Seteo si pueden o no agregar archivo default
    this.addingItems.forEach(i => {
      const docType = this.documentationTypes.find(d => d.id === i.documentationTypeId);
      i.canAddDefaultFile = !docType.exteralForm && docType.documentationLoadContentName === "RRHH";
    });

    // Meto los items seleccionados en el set
    this.setDocumentationTypes = this.setDocumentationTypes.concat(this.addingItems);
    this.isAdding = false;
  }

  saveName() {

    if (this.editNameFormGroup.invalid) {
      // this.msjService.showError('CPPAPIV001');
      return;
    }

    this.documentationTypeSet.name = this.editNameFormGroup.value.nameFrmCtrl;
    this.documentationTypeSet.description = this.editNameFormGroup.value.descriptionFrmCtrl;
    this.isEdittingName = false;
  }

  cancelAdd() {
    this.addingItems = [];
    this.isAdding = false;
  }

  removeItem(dt: DocumentationTypeSetItem) {
    if (!this.canRemove(dt)) {
      return;
    }

    this.setDocumentationTypes = this.setDocumentationTypes.filter(obj => obj !== dt);
  }

  canRemove(item: DocumentationTypeSetItem): boolean {
    return !this.SelectedSetITemList.find(i => i.id === item.id);
  }

  favouriteToogle(item: DocumentationTypeSetItem) {
    item.order = item.order > 0 ? 0 : 1;
    this.setDocumentationTypes.sort((a, b) => {
      if (a.order === b.order) {
        return a.usesCount > b.usesCount ? -1 : 1;
      } else {
        return a.order > b.order ? -1 : 1;
      }
    });
  }

  private getAvailableSetItems() {
    this.isLoading = true;
    this.docTypeSetSvc.mapDocumentationTypesToSetItems(this.documentationTypes)
      .then(items => {
        this.availableDocumentationTypes = items.filter(i => {
          return !this.setDocumentationTypes.find(s => {
            return s.metadataId ? i.metadataSystemName === s.metadataSystemName && i.metadataValue === s.metadataValue && s.documentationTypeId === i.documentationTypeId : s.documentationTypeId === i.documentationTypeId;
          });
        });
      })
      .catch(error => this.msjService.showError(error))
      .then(() => this.isLoading = false);
  }

  //#region File uploader
  addDefaultFile(dt: DocumentationTypeSetItem) {
    this.addDefaultFileOpen = true;
    this.selectedDocumentationTypeSetItem = dt;
    if (this.selectedDocumentationTypeSetItem.documentationTypeSetItemFiles && this.selectedDocumentationTypeSetItem.documentationTypeSetItemFiles.length > 0) {
      // Obtengo el file de CPP
      this.isLoading = true;
      this.docTypeSetSvc.getFile(this.selectedDocumentationTypeSetItem.documentationTypeSetItemFiles[0].fileId).toPromise()
        .then(file64 => {
          this.viewDetail = true;
          this.fileBase64 = file64.value;
        })
        .catch(err => this.msjService.showError(err))
        .then(() => this.isLoading = false);
    }
  }

  onSelectedFile(file: File, showFile: boolean) {
    const myReader: FileReader = new FileReader();
    myReader.onloadend = (e) => {
      const b64 = myReader.result.toString().split(',')[1];
      if (b64 != this.fileBase64) {
        this.fileBase64 = b64;
      } else {
        this.fileBase64 = '';
        this.viewDetail = false;
      }
    };
    myReader.readAsDataURL(file);
    this.viewDetail = true;
  }

  onFilesChanged(changedReturn: any) {
    let files: File[] = changedReturn.files;
    this.selectedDocumentationTypeSetItem.documentationTypeSetItemFiles = [];

    if (!files || files.length < 1) {
      this.viewDetail = false;
      return;
    }

    this.onSelectedFile(files[0], true);
  }

  required(dt: DocumentationTypeSetItem) {
    if (dt.required) {
      dt.required = false;
    }
    else dt.required = true;
  }

  removeFile(dt) {
    // Elimino archivo
    this.isLoading = true;

    // Si estoy eliminando uno que di de alta lo saco del array
    if (this.newFileIds) {
      const index = this.newFileIds.indexOf(dt.documentationTypeSetItemFiles[0].fileId, 0);
      if (index > -1) {
        this.newFileIds.splice(index, 1);
      }
    }

    this.docTypeSetSvc.deleteFile(dt.documentationTypeSetItemFiles[0].fileId).toPromise()
      .then(file64 => {
        this.fileBase64 = undefined;
        this.viewDetail = false;
        dt.documentationTypeSetItemFiles = [];
      })
      .catch(err => this.msjService.showError(err))
      .then(() => this.isLoading = false);

  }

  closeDefaultFile() {
    this.viewDetail = false;
    this.addDefaultFileOpen = false;
    this.selectedDocumentationTypeSetItem = undefined;
    this.files = [];
  }

  saveFile() {
    this.isLoading = true;
    const docItemFile: DocumentationTypeSetItemFile = {
      documentationTypeSetItemId: this.selectedDocumentationTypeSetItem.id,
      fileId: '0',
      name: this.files[0].name,
      id: 0
    };
    this.selectedDocumentationTypeSetItem.documentationTypeSetItemFiles.push(docItemFile);
    // Grabar file
    this.docTypeSetSvc.setFile(this.files).toPromise()
      .then(data => {
        this.selectedDocumentationTypeSetItem.documentationTypeSetItemFiles[0].fileId = data;

        // Me guardo los ids de los files nuevos
        if (!this.newFileIds) {
          this.newFileIds = [];
        }
        this.newFileIds.push(data);

        this.closeDefaultFile();
      })
      .catch(err => this.msjService.showError(err))
      .then(() => this.isLoading = false);
  }
  //#endregion
}
