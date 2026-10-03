import { ProcessResultItemFind } from './../../shared/models/process-resultItem-find.model';
import { ResultItem } from './../../shared/models/process-result-item.model';
import { ResultTotals } from './../../shared/models/result-totals.model';
import { Component, OnInit, Inject, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EmployerProcessService } from '../../shared/services/employer-process.service';
import { DeferedProcess } from '../../shared/models/defered-process.model';
import { MessageService } from '../../shared/errorHandler/message.service';
import { FileService } from '../../shared/services/file.service';
import { FileDocumentService } from '../../shared/services/file-document.service';
import { MatDialog } from '@angular/material/dialog';
import { EmployeeFileDocumentDialogData } from '../../shared/models/employee-file-document-dialog-data.model';
import { Employee } from '../../shared/models/Employee/employee.model';
import { MatBottomSheet, MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { FileDocumentMetadata } from '../../shared/models/file-document-metadata.model';
import { FileDocumentViewModalComponent } from '../../shared/file-document-view-modal/file-document-view-modal.component';
import { MessageAtributtes, MessageType } from '../../shared/models/message-types.model';
import { GenericBottomSheetComponent } from '../../shared/generic-bottom-sheet/generic-bottom-sheet.component';
import { AuthService } from '../../shared/auth/auth.service';
import { TranslateService } from '../../shared/services/translate.service';
import { FileDocumentCollaborationData } from '../../shared/models/file-document-sign-data.model';

@Component({
  selector: 'app-automatic-process-detail',
  templateUrl: './automatic-process-detail.component.html',
  styleUrls: []
})
export class AutomaticProcessDetailComponent implements OnInit {
  processId: string;
  loading = true;
  isReprocessing = false;
  deferedProcess: DeferedProcess = new DeferedProcess();
  processFile: any;
  filters: ProcessResultItemFind;
  itemsCount: number;
  sequenceName: string;
  metadatas: [];
  parameters: any;
  processCreatedBy: string;
  processResultTotals: ResultTotals;
  processResultItems: ResultItem[];
  searchValue: string;
  pageIndex: number;
  canDelete: boolean;
  showMore = false;
  showPurged = false;
  isDeleted = false;
  isPurged: Boolean = false;
  disableButton : Boolean = false;
  currentOu:number = 0;

  constructor(
    private route: ActivatedRoute,
    private employeeProcessService: EmployerProcessService,
    private fileService: FileService,
    private fileDocumentService: FileDocumentService,
    private dialog: MatDialog,
    private messageService: MessageService,
    private _bottomSheet: MatBottomSheet,
    private _authService: AuthService,
    private translateService: TranslateService) {
  }

  openBottomSheet(): void {
    this.parameters.processCreatedBy = this.processCreatedBy;
    this.parameters.processCreationDate = this.deferedProcess.creationDate;
    this.parameters.processId = this.deferedProcess.id;
    this._bottomSheet.open(BottomSheetMetadata, { data: this.parameters, disableClose: true });
  }

  openBottomSheetDelete(): void {
    this.disableButton = true;
    const parameters: MessageAtributtes = {
      bodyText: '¡Estás por eliminar documentación!',
      infoText: 'Si continúas con este proceso, se eliminarán todos los documentos que fueron procesados exitosamente en el lote.' +
        '<br/><br/>Una vez realizada esta operación, no podrás volver atrás.' +
        '<br/><br/>Podrás subir los documentos en un nuevo lote. Ingresando el siguiente código de verificación confirmarás la operación:',
      type: MessageType.CaptchaNumbers
    };

    const t = this._bottomSheet.open(GenericBottomSheetComponent, { data: parameters, disableClose: true });
    t.instance.close.subscribe((response: boolean) => {
      if (response) {
        this.delete();
      }
    });
  }

  ngOnInit() {
    this.showMore = false;
    this.disableButton = false;
    this.showPurged = false;
    this.route.params.subscribe(params => {
      this.isReprocessing = false;
      this.processFile = null;
      this.processId = params["id"];
      this.filters = {
        processId: params["id"],
        itemsPerPage: 15,
        page: 1,
        orderBy: '_id',
        sortOrder: 1,
        searchValue: '',
        onlyErrors: true
      };

      this.loading = true;
      this.canDelete = this._authService.RRHHManagment();
      this.refresh();
    });
    this.currentOu = parseInt(localStorage.getItem("organizationId"));
  }

  filteredSearch(event) {
    if (event == "Enter") {
      this.pageIndex = 0;
      this.findProcessResultItems();
    }
  }

  filteredCheck() {
    this.filters.page = 1;
    this.findProcessResultItems();
  }

  findProcessResultItems() {
    this.loading = true;
    this.employeeProcessService
      .getProcessResultsItems(this.filters)
      .subscribe(
        res => {
          this.processResultItems = res.values;
          this.itemsCount = res.total;
          this.filters.page = res.page;
          this.loading = false;
        },
        err => { this.messageService.showError(err); this.loading = false; }
      );
  }

  selectedPageChanged(changed) {
    this.findProcessResultItems();
  }
  LoadColaborationRes(colaboracion: any, documentFileSignature: any, employeeSignature: boolean, previousData?: FileDocumentCollaborationData): FileDocumentCollaborationData {
    const data = previousData || new FileDocumentCollaborationData();
    this.updateEnabledState(colaboracion, data);
    this.updateViewDate(colaboracion, data);
    this.handleAction(colaboracion, documentFileSignature, employeeSignature, data);
    return data;
  }

  private updateEnabledState(colaboracion: any, data: FileDocumentCollaborationData): void {
    data.enabled = colaboracion.action?.enabled ?? false;
  }

  private updateViewDate(colaboracion: any, data: FileDocumentCollaborationData): void {
    if (colaboracion.fechaPrimeraColaboracion != null) {
      const date = new Date(colaboracion.fechaPrimeraColaboracion);
      data.viewDate = data.viewDate && data.viewDate > date ? data.viewDate : date;
    }
  }

  private handleAction(colaboracion: any, documentFileSignature: any, employeeSignature: boolean, data: FileDocumentCollaborationData): void {
    if (colaboracion.action == null) {
      data.requiredSignature = false;
      return;
    }
  
    if (colaboracion.action.action !== "UPLOAD") {
      this.handleNonUploadAction(colaboracion, documentFileSignature, employeeSignature, data);
    } else {
      this.handleUploadAction(colaboracion, data);
    }
  }

  private handleNonUploadAction(colaboracion: any, documentFileSignature: any, employeeSignature: boolean, data: FileDocumentCollaborationData): void {
    if (data.enabled) {
      data.requiredSignature = true;
    }
  
    if (colaboracion.action?.fechaPrimerUso != null) {
      data.signatureDate = new Date(colaboracion.action.fechaPrimerUso);
      data.signatureState = "firmado";
      if (employeeSignature) {
        this.updateSignatureState(documentFileSignature, colaboracion.userid, data);
      }
    } else {
      if (colaboracion.action?.requiredSignature) {
        data.error = colaboracion.action.requiredSignature;
      }
      data.signatureState = "no-firmado";
    }
  }

  private handleUploadAction(colaboracion: any, data: FileDocumentCollaborationData): void {
    data.uploaded = colaboracion.action?.fechaPrimerUso != null;
    if (colaboracion.action.fechaPrimerUso != null) {
      data.uploadDate = new Date(colaboracion.action?.fechaPrimerUso);
    }
  }

  private updateSignatureState(documentFileSignature: any, userId: string, data: FileDocumentCollaborationData): void {
    if (documentFileSignature != null) {
      for (const dfs of documentFileSignature) {
        if (this.isUserSignature(dfs, userId)) {
          this.updateStateForUserSignature(dfs, data);
          if (data.signatureState === "firmado-no-conforme") {
            break;
          }
        } else if (this.isExternalSignature(dfs)) {
          this.updateStateForExternalSignature(dfs, data);
          if (data.signatureState === "firmado-no-conforme") {
            break;
          }
        }
      }
    }
  }

   isUserSignature(dfs: any, userId: string): boolean {
    return dfs.userid === userId;
  }

   isExternalSignature(dfs: any): boolean {
    return dfs.isExternal && dfs.signatureResult;
  }

 updateStateForUserSignature(dfs: any, data: FileDocumentCollaborationData): void {
    if (dfs.signatureResult === "C" || dfs.signatureResult === "c") {
      data.signatureState = "firmado-conforme";
    } else {
      data.signatureState = "firmado-no-conforme";
    }
  }

   updateStateForExternalSignature(dfs: any, data: FileDocumentCollaborationData): void {
    if (dfs.signatureResult === "C" || dfs.signatureResult === "c") {
      data.signatureState = "firmado-conforme";
    } else if (dfs.signatureResult === "NC" || dfs.signatureResult === "nc") {
      data.signatureState = "firmado-no-conforme";
    }
  }

  viewDocument(doc: number) {
    const results = [];
    results.push(this.fileDocumentService.getCollaboration(doc, this.currentOu).toPromise());
    Promise.all(results).then(promises => {
          this.fileDocumentService.getDocumentDetail(doc).toPromise()
            .then(res => {
              const dialogData = new EmployeeFileDocumentDialogData();
              dialogData.doc = res;
                  promises[0].forEach((colaboracion) => {
                    if (colaboracion.userId != null) {
                      dialogData.doc.employeeCollaborationData = this.LoadColaborationRes(
                        colaboracion,
                        promises[1],
                        true,
                        dialogData.doc.employeeCollaborationData
                      );
                    }
                    else
                    {
                      dialogData.doc.lawyerCollaborationData = this.LoadColaborationRes(
                        colaboracion,
                        promises[1],
                        false,
                        dialogData.doc.employeeCollaborationData);
                    }
                  });
                  dialogData.doc.lawyerCollaborationData = res.lawyerCollaborationData;
                  dialogData.employerSign = false;
                  dialogData.signEnabled = false;
                  dialogData.employee = new Employee();
                  dialogData.employee.id = "0";
                  dialogData.showDocumentStateBottom = true;
                  dialogData.showDocumentState = true;
                  dialogData.showDocumentMetadata = true;
                  dialogData.isRRHH = true;
                  dialogData.isFirmante = false;
                  dialogData.isModoPDF = true;
                  const dialogRef = this.dialog.open(FileDocumentViewModalComponent, {
                    data: dialogData
                  });
  
                  dialogRef.afterClosed().subscribe(result => {
                    // Aquí puedes manejar el resultado del diálogo cerrado si es necesario
                  });
        });
    });
  }

  reprocess(): void {
    this.loading = true;
    this.employeeProcessService.reprocessProcess(this.processId)
      .subscribe(
        res => {
          this.isReprocessing = true;
          this.loading = false;
        },
        err => { this.messageService.showError(err); this.loading = false; }
      );
  }

  delete(): void {
    this.loading = true;
    this.fileDocumentService.deleteBatch(this.processId, +this.deferedProcess.organizationalUnitIdDestination)
      .subscribe(
        res => {
          this.ngOnInit();
          this.employeeProcessService.onDeleteButtonClick();
          if (res !== 0) {
            this.messageService.showInfo("Los documentos serán eliminados en breve.");
            this.disableButton = true;
          } else {
            this.messageService.showInfo("No hay documentos pendientes para eliminar.");
          }
          this.refresh();
        },
        err => { this.messageService.showError(err); this.loading = false; }
      );
  }

  translateStateName(state: string) {
   return this.translateService.translateStateName(state);
  }

  exportErrors() {
    this.employeeProcessService.exportErrorsProcess(this.processId)
      .subscribe((file) => {
        const date = new Date().toISOString();
        this.fileService.download(file['value'], "Lista de identificadores con errores " + date + ".csv", "application/excel");
      });
  }

  async downloadFile() {
    if (this.processFile.length == 1) {
      this.employeeProcessService.getFile(this.processFile[0].id)
        .subscribe((response) => {
          this.fileService.download(response, this.processFile[0].name);
        });
    } else {
      this.employeeProcessService.getFileZip(this.deferedProcess.id).toPromise().then(
        resultZip => {
          this.deferedProcess.zipBase64 = resultZip;
          const date = new Date().toISOString();
          const fileName = "Proceso " + date + ".zip";
          this.fileService.download(this.deferedProcess.zipBase64, fileName, "application/zip");
        },
        err => this.messageService.showError(err)
      );
    }
  }
  refresh() {
    // Agregar logica si statename != in progress => mostrar welcome?
    this.getProcessResultTotals();
    this.getProcessDetail();
  }

  getProcessResultTotals() {
    this.employeeProcessService
      .getProcessResultsTotals(this.filters.processId)
      .subscribe(
        res => {
          this.processResultTotals = res;
          this.filters.onlyErrors = this.processResultTotals != null && this.processResultTotals.errorTotalItems > 0;
          this.findProcessResultItems();
        },
        err => this.messageService.showError(err)
      );
  }

  getProcessDetail() {
    this.employeeProcessService
      .getProcessDetail(this.filters.processId)
      .subscribe(
        res => {          
          this.deferedProcess = res;
          this.sequenceName = res.data.parameters[0][0]?.sequence.name;
          this.metadatas = res.data.parameters[0][0]?.metadatas;
          this.parameters = res.data.parameters[0][0];
          this.processCreatedBy = res.createdByUserName;
          this.isDeleted = res.stateId === '007';
          this.deferedProcess.organizationalUnitIdDestination = res.data.parameters[0][0]?.organizationalUnitId;
          if(res.stateId === '009'){
            this.disableButton = true;
          }
          this.isPurged = res.isPurged;
          if (this.deferedProcess.files) {
            this.processFile = this.deferedProcess.files.filter(f => f.isDownloadable == false);
          }

          this.loading = false;
        },
        err => { this.messageService.showError(err); this.loading = false; }
      );
  }

  pausedChapaClick() {
    this.showMore = true;
  }

  purgedChapaClick() {
    this.showPurged = true;
  }

  reprocessChapaClick() {
    this.isReprocessing = false;
    this.refresh();
  }
}

@Component({
  selector: 'bottom-sheet-metadata',
  templateUrl: 'bottom-sheet-metadata.html',
})

export class BottomSheetMetadata implements OnInit {
  metadataAditional: FileDocumentMetadata[];
  nombreDocumentacion: string;
  fechaDocuementacion: string;

  constructor(@Inject(MAT_BOTTOM_SHEET_DATA) public data: any,
    private bottomSheetRef: MatBottomSheetRef<BottomSheetMetadata>) { }

  cancel() {
    this.bottomSheetRef.dismiss();
  }

  ngOnInit() {
    // this.nombreDocumentacion = this.data.metadatas.Find(x => x.metadata.metadataSystemname == '_nomDocumentacion').metadataValue
  }

  getMetadataAditional(metadatas: FileDocumentMetadata[]): FileDocumentMetadata[] {
    const metadataDocument = [];
    var processCreatedBy = {
      metadataLabel: 'Creado por',
      metadataValue: this.data.processCreatedBy,
      systemName: 'CreatedBy'
    }
    for (let index = 0, len = metadatas.length; index < len; ++index) {
      if (!this.isMetadataDefault(metadatas[index].systemName) && metadatas[index].systemName != null) {
        metadataDocument.push(metadatas[index]);
      }
    }
    metadataDocument.push(processCreatedBy);

    return metadataDocument;
  }

  isMetadataDefault(systemName: string): boolean {
    switch (systemName) {
      case '_idDocumentacion':
      case '_nomDocumentacion':
      case '_fecDoc':
        return true;
      default:
        return false;
    }
  }

  formatMetadata(metadata: FileDocumentMetadata): any {
    switch (metadata.metadataType) {
      case "combo":
      case "comboKV":
        if (metadata.metadataValue) {
          return metadata.metadataValueDescription != null ? metadata.metadataValueDescription : metadata.metadataValue;
        } else {
          return "";
        }
        break;
      case "userControl":
        return "User Id: " + metadata.metadataValue;
        break;
      case "period":
        if (metadata.metadataValue) {
          return new Date(metadata.metadataValue.substring(0, 4), metadata.metadataValue.substring(4, 6), 0, 0, 0, 0, 0);
        } else {
          return "";
        }
        break;
      default:
        return metadata.metadataValue;
    }
  }
}