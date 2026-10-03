import { Component, OnDestroy, OnInit, inject } from "@angular/core";
import { DeferredProcessesService } from "../../services/deferred-processes.service";
import { FileDocumentService } from '../../../../shared/services/file-document.service';
import { MessageService } from "../../../../shared/errorHandler/message.service";
import { ActivatedRoute } from "@angular/router";
import { map, switchMap, distinctUntilChanged } from "rxjs/operators";
import { ProcessOrchestratorMetadataDto } from "../../models/deferred-processes.model";
import { Observable,Subscription, interval, EMPTY } from "rxjs";
import { UntypedFormGroup } from "@angular/forms";
import { processDetailsStateChoices } from "../../data/process-details-state.data";
import { MessageAtributtes, MessageType } from "src/app/modules/shared/models/message-types.model";
import { GenericBottomSheetComponent } from "src/app/modules/shared/generic-bottom-sheet/generic-bottom-sheet.component";
import { MatBottomSheet } from "@angular/material/bottom-sheet";



@Component({
  selector: "app-process-details",
  templateUrl: "./process-details.page.html",
  styleUrls: ["./process-details.page.scss"],
})
export class ProcessDetailsPage implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly deferredProcessesService = inject(DeferredProcessesService);
  private readonly _bottomSheet = inject(MatBottomSheet);

  isLoading$ = this.deferredProcessesService.isLoading$;
  process$ = this.deferredProcessesService.process$;
  processDetail$ = this.deferredProcessesService.processDetail$;
  processDetailPagination =
    this.deferredProcessesService.processDetailPagination$;

  stateChoices = processDetailsStateChoices;
  id = this.route.snapshot.paramMap.get("id");
  infoExtra$ = this.buildInfoExtra$();
  paramsForm: UntypedFormGroup;
  isDeletable = false;
  isDownloadle = false;
  filename = '';
  isDeleteInProgress = false;
  loading = false;
  isPending = false;
  isReprocessable = false;
  autoRefreshSub: Subscription


  constructor(
      private readonly fileDocumentService: FileDocumentService,
      private readonly msjService: MessageService
  ) {}

  ngOnInit(): void {
    this.deferredProcessesService.resetProcessDetailParamsForm();
    this.paramsForm = this.deferredProcessesService.processDetailParamsForm;
    if (this.id) {
      this.refreshAll();
    }
    this.autoRefresh();
  }

  ngOnDestroy(): void {
    this.deferredProcessesService.cancelRequestFor('process');
    this.deferredProcessesService.cancelRequestFor('processDetail');
    this.deferredProcessesService.cancelRequestFor('relatedProcess');
    if (this.autoRefreshSub) {
      this.autoRefreshSub.unsubscribe();
    }
  }

  autoRefresh() {
    this.autoRefreshSub = this.process$.pipe(
      map( (process :any) => process?.stateName === "InProgress"),
      distinctUntilChanged(),
      switchMap(isInProgress => {
        if (isInProgress) {
          return interval(30000);
        } else {
          return EMPTY;
        }
      })
    ).subscribe(() => {
      this.refreshAll();
    });
  }

  refreshAll() {
    this.deferredProcessesService.loadProcess(this.id, true);
    this.deferredProcessesService.loadProcessDetail(this.id, true);
    this.isDeletable = false;
    this.deferredProcessesService
      .isDeletable(this.id)
      .subscribe((isDeletable) => (this.isDeletable = isDeletable));
    this.canDownloadDocument(this.id);
    this.isPendingActions(this.id);
    this.isReprocess(this.id);
  }

  refreshTable() {
    this.paramsForm.get("pageNumber").setValue(1);
    this.deferredProcessesService.loadProcessDetail(this.id, false);
  }

  onDeleteDocuments() {
    this.isDeleteInProgress = true;
    const parameters: MessageAtributtes = {
      bodyText: "¡Estás por eliminar documentación!",
      infoText:
        "Si continúas con este proceso, se eliminarán todos los documentos que fueron procesados exitosamente en el lote." +
        "<br/><br/>Una vez realizada esta operación, no podrás volver atrás." +
        "<br/><br/>Podrás subir los documentos en un nuevo lote. Ingresando el siguiente código de verificación confirmarás la operación:",
      type: MessageType.CaptchaNumbers,
    };
    const t = this._bottomSheet.open(GenericBottomSheetComponent, {
      data: parameters,
      disableClose: true,
    });
    t.instance.close.subscribe((response: boolean) => {
      if (response) {
        this.deferredProcessesService
          .onDeleteDocuments(this.id)
          .subscribe((success) => {
            this.isDeleteInProgress = false;
            if (success) {
              this.refreshAll();
            }
          });
      } else {
        this.isDeleteInProgress = false;
      }
    });
  }

  private buildInfoExtra$(): Observable<
    {
      label: string;
      value: any;
      isMonth?: boolean;
      isDay?: boolean;
    }[]
  > {
    return this.process$.pipe(
      map((p) => {
        if (!p) return [];

        const metadataInfo =
          p.metadata
            ?.filter((m) => this.shouldIncludeMetadata(m, p.metadata))
            .map((m) => ({
              label: m.label,
              value:
                m.key === "_peri"
                  ? this.formatPeriDate(String(m.value))
                  : m.value,
              isMonth: m.key === "_peri",
              isDay: m.key === "_fecDoc",
            })) || [];

        return [
          { label: "ID", value: p.id },
          { label: "Empresa", value: p.customer?.customerName },
          ...metadataInfo,
        ];
      })
    );
  }

  private shouldIncludeMetadata(
    m: ProcessOrchestratorMetadataDto,
    metadata: ProcessOrchestratorMetadataDto[]
  ): boolean {
    return (
      m.label &&
      m.value &&
      !["_nomDocumentacion", "_idDocumentacion"].includes(m.key) &&
      !(m.key === "_fecDoc" && metadata?.some((m) => m.key === "_peri"))
    );
  }

  private formatPeriDate(yyyymm: string): Date {
    const year = +yyyymm.slice(0, 4);
    const month = +yyyymm.slice(4) - 1; // Los meses van de 0 a 11
    return new Date(year, month);
  }

  canDownloadDocument(id:string) {
        this.fileDocumentService.canDownload(id).subscribe(
          res => {
          this.isDownloadle = res.canDownload;
          this.filename = res.files[0].filename;
        },
        err => this.msjService.showError(err)
        );
   }

   downloadDocuments(type:string) {
        this.fileDocumentService.downloadFiles(this.id,type).then(
        () => {
        this.loading = false;
        this.msjService.showInfo("Se ha iniciado el download de los archivos.");
      }
    )
      .catch(err => {
        this.msjService.showError(err);
        this.loading = false;
      });
    }


     isPendingActions(id:string) {
        this.fileDocumentService.pendingActions(id).subscribe(
          res => {
          this.isPending = res.canDownload;
        },
        err => this.msjService.showError(err)
        );
     }

    isReprocess(id:string) {
        this.fileDocumentService.reprocessable(id).subscribe(
          res => {  
          this.isReprocessable = res.reprocessable;
         },
          err => {
          this.isReprocessable = false;
          this.msjService.showError(err);
         }
        );
     }

    reprocessDocumentsByProcess() {
        this.fileDocumentService.reprocessDocuments(this.id).subscribe(
          res => {  
          if(res.count){
             this.msjService.showInfo("Reproceso iniciado");
             setTimeout(() => {
             this.refreshAll();
             }, 3000);
          }
          
        },
        err => this.msjService.showError(err)
        );
     }




   
}
