import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
} from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { ProcessOrchestratorResultDetailDto } from "../../models/deferred-processes.model";
import { DeferredProcessesService } from "../../services/deferred-processes.service";
import { PageEvent } from "@angular/material/paginator";
import { FileDocumentService } from "src/app/modules/shared/services/file-document.service";
import { EmployeeFileDocumentDialogData } from "src/app/modules/shared/models/employee-file-document-dialog-data.model";
import { Employee } from "src/app/modules/shared/models";
import { FileDocumentViewModalComponent } from "src/app/modules/shared/file-document-view-modal/file-document-view-modal.component";
import { MatDialog } from "@angular/material/dialog";
import { forkJoin, Subject } from "rxjs";
import { finalize, takeUntil } from "rxjs/operators";
import { FileDocumentCollaborationData } from "src/app/modules/shared/models/file-document-sign-data.model";
import { MessageService } from "src/app/modules/shared/errorHandler/message.service";

@Component({
  selector: "app-process-employee-details-table",
  templateUrl: "./process-employee-details-table.component.html",
  styleUrls: ["./process-employee-details-table.component.scss"],
})
export class ProcessEmployeeDetailsTableComponent
  implements OnChanges, OnDestroy
{
  @Input() data: ProcessOrchestratorResultDetailDto[] = [];
  @Input() processId: string;

  displayedColumns: string[] = [
    "page",
    "identifier",
    "nroLegajo",
    "name",
    "state",
    "actions",
  ];
  dataSource = new MatTableDataSource<ProcessOrchestratorResultDetailDto>(null);
  paginationInfo$ = this.deferredProcessesService.processDetailPagination$;
  isLoading$ = this.deferredProcessesService.isLoading$;
  processDetailParamsForm =
    this.deferredProcessesService.processDetailParamsForm;
  loadingDocumentId: number = null;

  private readonly cancelRequest = new Subject<void>();

  constructor(
    private readonly deferredProcessesService: DeferredProcessesService,
    private readonly fileDocumentService: FileDocumentService,
    private readonly dialog: MatDialog,
    private readonly messageService: MessageService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["data"]) {
      this.dataSource =
        new MatTableDataSource<ProcessOrchestratorResultDetailDto>(this.data);
    }
  }

  ngOnDestroy(): void {
    this.cancelRequest.next();
    this.cancelRequest.complete();
  }

  handlePageEvent(e: PageEvent) {
    this.processDetailParamsForm.controls["pageNumber"].setValue(
      e.pageIndex + 1
    );
    this.processDetailParamsForm.controls["pageSize"].setValue(e.pageSize);
    this.deferredProcessesService.loadProcessDetail(this.processId, false);
  }

  getStatusMessage(element: any): string {
  if (!element.hasWarning) {
    return '';
  }

  if (element.employeeInactiveFound) {
    return 'ACCIONES PENDIENTES : EMPLEADO INACTIVO';
  }

  if (element.employeeFound) {
    return 'ACCIONES PENDIENTES : VOLVER A PROCESAR';
  }
  
  return 'ACCIONES PENDIENTES : EMPLEADO NO ENCONTRADO';
}

  viewDocument(id: number) {
    if (this.loadingDocumentId !== null) {
      this.cancelRequest.next();
    }
    this.loadingDocumentId = id;

    const currentOu = parseInt(localStorage.getItem("organizationId"));

    forkJoin([
      this.fileDocumentService.getCollaboration(id, currentOu),
      this.fileDocumentService.getDocumentDetail(id),
    ])
      .pipe(
        takeUntil(this.cancelRequest),
        finalize(() => (this.loadingDocumentId = null))
      )
      .subscribe({
        next: (results) => {
          const collaborationData = results[0];
          const doc = results[1];
          const dialogData = new EmployeeFileDocumentDialogData();
          dialogData.doc = doc;
          console.log('DATOS dialogData.doc',doc);

      collaborationData.forEach((collab: any) => {

       const isEmployee = collab.userId !== null; 

      if (isEmployee) {
       dialogData.doc.employeeCollaborationData = this.loadCollaborationData(
       collab, 
       null, 
       true, 
       dialogData.doc.employeeCollaborationData
      );
      } else {

      dialogData.doc.lawyerCollaborationData = this.loadCollaborationData(
        collab, 
        null, 
        false, 
        dialogData.doc.lawyerCollaborationData
      );

      const emptyCollab = new FileDocumentCollaborationData();
    
      emptyCollab.enabled = false;
      emptyCollab.requiredSignature = false;
      emptyCollab.uploaded = true; 
    
      dialogData.doc.employeeCollaborationData = emptyCollab;
      }
    });

          dialogData.doc.lawyerCollaborationData = doc.lawyerCollaborationData;
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
          console.log('DATOS ENVIADOS AL MODAL',dialogData);
          this.dialog.open(FileDocumentViewModalComponent, {
            data: dialogData,
          });
        },
        error: (err) => {
          this.messageService.showError(err);
        },
      });
  }

  loadCollaborationData(
    collaboration: any,
    documentFileSignature: any,
    employeeSignature: boolean,
    previousData?: FileDocumentCollaborationData
  ): FileDocumentCollaborationData {
    const data = previousData || new FileDocumentCollaborationData();
    data.enabled = collaboration.action?.enabled ?? false;

    if (collaboration.fechaPrimeraColaboracion !== null) {
      const date = new Date(collaboration.fechaPrimeraColaboracion);
      data.viewDate =
        data.viewDate && data.viewDate > date ? data.viewDate : date;
    }

    if (collaboration.action === null) {
      data.requiredSignature = false;
    }

    if (collaboration.action.action !== "UPLOAD") {
      this.handleNonUploadAction(
        collaboration,
        documentFileSignature,
        employeeSignature,
        data
      );
    } else {
      this.handleUploadAction(collaboration, data);
    }

    return data;
  }

  private handleNonUploadAction(
    collaboration: any,
    documentFileSignature: any,
    employeeSignature: boolean,
    data: FileDocumentCollaborationData
  ): void {
    if (data.enabled) {
      data.requiredSignature = true;
    }

    if (collaboration.action?.fechaPrimerUso !== null) {
      data.signatureDate = new Date(collaboration.action.fechaPrimerUso);
      data.signatureState = "firmado";
      if (employeeSignature) {
        this.updateSignatureState(
          documentFileSignature,
          collaboration.userid,
          data
        );
      }
    } else {
      if (collaboration.action?.requiredSignature) {
        data.error = collaboration.action.requiredSignature;
      }
      data.signatureState = "no-firmado";
    }
  }

  private handleUploadAction(
    colaboracion: any,
    data: FileDocumentCollaborationData
  ): void {
    data.uploaded = colaboracion.action?.fechaPrimerUso !== null;
    if (colaboracion.action.fechaPrimerUso !== null) {
      data.uploadDate = new Date(colaboracion.action?.fechaPrimerUso);
    }
  }

  private updateSignatureState(
    documentFileSignature: any,
    userId: string,
    data: FileDocumentCollaborationData
  ): void {
    if (documentFileSignature !== null) {
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

  updateStateForUserSignature(
    dfs: any,
    data: FileDocumentCollaborationData
  ): void {
    if (dfs.signatureResult === "C" || dfs.signatureResult === "c") {
      data.signatureState = "firmado-conforme";
    } else {
      data.signatureState = "firmado-no-conforme";
    }
  }

  updateStateForExternalSignature(
    dfs: any,
    data: FileDocumentCollaborationData
  ): void {
    if (dfs.signatureResult === "C" || dfs.signatureResult === "c") {
      data.signatureState = "firmado-conforme";
    } else if (dfs.signatureResult === "NC" || dfs.signatureResult === "nc") {
      data.signatureState = "firmado-no-conforme";
    }
  }
}
