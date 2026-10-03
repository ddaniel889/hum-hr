import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EmployerProcessService } from '../../shared/services/employer-process.service';
import { DeferedProcess, ProcessType } from '../../shared/models/defered-process.model';
import { MessageService } from '../../shared/errorHandler/message.service';
import { DeferedProcessLog } from '../../shared/models/defered-process-log.model';
import { DeferedProcessLogFind } from '../../shared/models/defered-process-log-find.model';
import { FileService } from '../../shared/services/file.service';
import { TranslateService } from '../../shared/services/translate.service';
import { MessageAtributtes, MessageType } from '../../shared/models/message-types.model';
import { GenericBottomSheetComponent } from '../../shared/generic-bottom-sheet/generic-bottom-sheet.component';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { FileDocumentService } from '../../shared/services/file-document.service';
import { ITEMSPERPAGE } from '../../shared/models/paged.model.';
import { AuthService } from "src/app/modules/shared/auth/auth.service";
@Component({
  selector: 'app-process-detail',
  templateUrl: './process-detail.component.html',
  styleUrls: []
})
export class ProcessDetailComponent implements OnInit {
  loading = true;
  deferedProcess: DeferedProcess = new DeferedProcess();
  processFileWithError: any;
  processFileOK: any;
  processLogs: DeferedProcessLog[];
  filters: DeferedProcessLogFind;
  itemsCount: number;
  contentType: string;
  showDelete = false;
  isDeleted = false;
  isPurged: Boolean = false;
  showPurged = false;
  constructor(
    private route: ActivatedRoute,
    private employeeProcessService: EmployerProcessService,
    private fileService: FileService,
    private messageService: MessageService,
    private translateService: TranslateService,
    private _bottomSheet: MatBottomSheet,
    private fileDocumentService: FileDocumentService,
    private authService: AuthService
  ) {
  }

  ngOnInit() {
    this.showPurged = false;
    this.route.params.subscribe(params => {
      this.processFileWithError = null;
      this.filters = {
        processId: params["id"],
        itemsPerPage: ITEMSPERPAGE,
        page: 1,
        orderBy: 'cd',
        sortOrder: 1
      };

      this.loading = true;
      this.employeeProcessService
        .getProcessDetail(this.filters.processId)
        .subscribe(
          res => {
            this.deferedProcess = res;
            if (res.stateId === '009') {
               res.processTypeName = "Pendiente de Eliminación"

            }
            if(res.data.parameters?.[0]?.[0]) {
              this.deferedProcess.organizationalUnitIdDestination = res.data.parameters[0][0].organizationalUnitId;
            }
            this.contentType = res.processTypeId == ProcessType.ALTA_EMPLEADO ? 'application/vnd.ms-excel' : 'application/pdf';
            this.showDelete = res.processTypeId == ProcessType.ALTA_DOCUMENTACION;
            this.isDeleted = res.stateId === '007' || res.stateId === '009';
            this.isPurged = res.isPurged;
            if (this.deferedProcess.files) {
              this.processFileWithError = this.deferedProcess.files.filter(f => f.isDownloadable == true);
              this.processFileOK = this.deferedProcess.files.filter(f => f.isDownloadable == false);
            }
            this.loading = false;
          },
          err => { this.messageService.showError(err); this.loading = false; }
        );
      this.employeeProcessService
        .getProcessLogs(this.filters)
        .subscribe(
          res => {
            this.processLogs = res.values;
            this.itemsCount = res.total;
            this.loading = false;
          },
          err => { this.messageService.showError(err); this.loading = false; }
        );
    });
  }

  selectedPageChanged(changed) {
    this.employeeProcessService
      .getProcessLogs(this.filters)
      .subscribe(
        res => {
          this.processLogs = res.values;
          this.itemsCount = res.total;
        },
        err => this.messageService.showError(err)
      );
  }

  downloadFile(processFile: any) {
    const file = processFile[0];
    this.employeeProcessService.getFile(file.id)
      .subscribe((response) => {
        this.fileService.download(response, file.name, this.contentType);
      });
  }

  translateStateName(state: string) {
    return this.translateService.translateStateName(state);
  }

  openBottomSheetDelete(): void {
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

  delete(): void {
    this.loading = true;
    this.fileDocumentService.deleteBatch(this.filters.processId, this.deferedProcess.organizationalUnitIdDestination)
      .toPromise().then(
        res => {
          this.ngOnInit();
          this.employeeProcessService.onDeleteButtonClick();
          if (res !== 0) {
            this.messageService.showInfo("Los documentos serán eliminados en breve.");
          } else {
            this.messageService.showInfo("No hay documentos pendientes para eliminar.");
          }
        },
        err => { this.messageService.showError(err); this.loading = false; }
      );
  }

  purgedChapaClick() {
    this.showPurged = true;
  }

  isGestorDocumental() {
    return this.authService.isGestorDocumental();
  }

  isRRHH() {
    return this.authService.isRRHH();
  }
}
