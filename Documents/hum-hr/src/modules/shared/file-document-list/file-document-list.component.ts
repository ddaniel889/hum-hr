import { FileDocument } from '../models/file-document.model';
import { EmployeeDocumentSignPendingFind } from '../models/employee-document-sign-pending-find';
import { Employee } from '../models/Employee/employee.model';
import { Component, OnInit, Input, OnChanges, OnDestroy, Output, EventEmitter } from '@angular/core';
import { MessageService } from '../errorHandler/message.service';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { EmployeeFileDocumentDialogData } from '../models/employee-file-document-dialog-data.model';
import { FileDocumentSignMassiveDialogData } from '../models/file-document-sign-massive-dialog-data.model';
import { FileDocumentSignMassiveDialogComponent } from '../file-document-sign-massive-dialog/file-document-sign-massive-dialog.component';
import { DocumentationGroupData } from '../models/documentation-group-data.model';
import { FileDocumentService } from '../services/file-document.service';
import { FileDocumentState } from '../models/file-document-state.model';
import { IPagedModel } from '../models/paged.model.';
import { Subject, Subscription } from 'rxjs';
import { OrganizationalUnitService } from '../services/organizational-unit.service';
import { ContainerTypeService } from '../services/container-type.service.';
import { ContainerType } from '../models';
import { FileService } from '../services/file.service';
import { AuthService } from '../auth/auth.service';
import { FileDocumentViewModalComponent } from '../file-document-view-modal/file-document-view-modal.component';
import { FilterPipe } from '../pipes/filter.pipe';
import { MessageAtributtes, MessageType } from '../models/message-types.model';
import { GenericBottomSheetComponent } from '../generic-bottom-sheet/generic-bottom-sheet.component';
import { AdvancedEmployeeFilters } from '../models/Employee/advanced-employee-filters';
import { FileDocumentMetadataComponent } from '../../shared/file-document-metadata/file-document-metadata.component';


@Component({
  selector: 'app-file-document-list',
  templateUrl: './file-document-list.component.html',
  styles: []
})
export class FileDocumentListComponent implements OnInit, OnDestroy, OnChanges {
  @Input() item: DocumentationGroupData;
  @Input() showSign: boolean;
  @Input() showDocumentState: boolean;
  @Input() showDocumentStateBottom: boolean;
  @Input() showDocumentMetadata: boolean;
  @Input() showSearchFilter: false;
  @Input() isNewStyle: false;
  @Input() floatingMode: false;
  @Output() signFinished = new EventEmitter<Boolean>();
  @Output() goBackEvent = new EventEmitter<boolean>();
  @Input() disabledSign:boolean=false;
  subject: Subject<IPagedModel<FileDocument>>;
  subscription: Subscription;
  docOnlyforOrderData = new FileDocument();
  documentStateOnlyForComparison = FileDocumentState;
  loading: boolean;
  allSelected = false;
  orderBy: string;
  orderAsc = true;
  selectedDoc: FileDocument;
  docTitle = "";
  filePdf = "";
  fileName = "";
  documents: FileDocument[] = [];
  pageIndex: number;
  itemsCount: number;
  showSignSelected: boolean;
  optionsPageSize = [15, 50, 100, 200];
  pageSize = this.optionsPageSize[0];
  filterName: string;
  containerType: ContainerType;
  isRRHH: boolean;
  canDelete: boolean;
  headerDateOrPeriod = 'Fecha';
  clickOnce = false;

  // Advanced employee filters
  employeeFilters: AdvancedEmployeeFilters = {
    selectedEmployeeFind: [],
    segmentSearch: true,
    nroLegSearch: undefined,
    cuilSearch: undefined,
    inactiveSearch: false,
    activeSearch: true
  };



  constructor(private authService: AuthService,
    private msjService: MessageService,
    public dialog: MatDialog,
    private employeeDocumentService: FileDocumentService,
    private organizationalUnitService: OrganizationalUnitService,
    private containerTypeService: ContainerTypeService,
    private fileService: FileService,
    private _bottomSheet: MatBottomSheet
  ) { }

  ngOnInit() {
    // this.loading = true;
    this.pageIndex = 1;
    this.pageSize = this.optionsPageSize[0];
    this.showSignSelected = false;

    this.isRRHH = this.authService.isRRHH();
    this.canDelete = this.authService.RRHHManagment() || this.authService.isGestorDocumental();
    if (this.showSign) {
      this.subject = this.employeeDocumentService.getLawyerFileDocumentsGroup();
    } else {
      this.subject = this.employeeDocumentService.getFileDocumentsGroup();
    }
  }
  showMetadatos(doc: FileDocument) {
    this._bottomSheet.open(FileDocumentMetadataComponent, {
      hasBackdrop: true,
      data: {
        doc: doc,
        showOtrosMetadatos: false
      },
    });


  }

  
  maskSplited(mask:string):string{    
    let masksplited= mask.split("||")
     if (masksplited.length>1) {
        //Las mascaras de Id Fiscales cuando son mas de una por pais, al ser de distintas longitudes y estar ordenadas de menor a mayor longitud, 
       //siempre elijo la mayor que queda en la ultima posicion del arreglo
       let i=masksplited.length-1;
       return masksplited[i];
     }
     return mask;
   }

  setSizePage(page): void {
    this.pageIndex = 1;
    this.getEmployeeDocuments();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  ngOnChanges() {
    this.pageIndex = 1;
    this.showSignSelected = false;

    if (this.subject) {
      this.getEmployeeDocuments();
    }
  }

  itemSelected() {
    return this.item != null;
  }

  private docSelected() {
    return this.itemSelected && this.selectedDoc != null;
  }

  sortColumn(header: string) {
    this.orderBy = header;
    this.orderAsc = !this.orderAsc;
    this.refresh();
  }

  selectAllToogle() {
    if (this.documents) {
      this.documents.forEach(element => {
        element.selected = this.allSelected;
      });
    }

    this.showSignSelected = this.documents.filter(function (x) { return x.selected; }).length > 0;
  }

  checkDocument(doc: FileDocument) {
    doc.selected = !doc.selected;
    this.selectedChange();
  }

  selectedPageChanged(a) {
    this.getEmployeeDocuments();
  }

  selectedChange() {
    this.showSignSelected = this.documents.filter(function (x) { return x.selected; }).length > 0;

    const allTheSame = this.documents.every((val, i, arr) => val.selected === arr[0].selected);
    if (allTheSame) {
      this.allSelected = this.documents[0].selected;
    } else {
      this.allSelected = false;
    }
  }

  selectDocument(doc: FileDocument) {
    this.selectedDoc = doc;
  }

  getEmployeeDocuments() {
    this.allSelected = false;
    this.showSignSelected = false;
    const orderBy = [];
    this.loading = true;
    if (this.orderBy) {
      orderBy.push(this.orderBy);
    }

    const param: EmployeeDocumentSignPendingFind = {
      orderBy: orderBy,
      orderAscendent: this.orderAsc,
      index: this.pageIndex,
      page: this.pageIndex,
      itemPerPage: this.pageSize,
      isPaged: true,
      organizationalUnitId: this.item.ou.id,
      documentationTypeId: this.item.documentationId,
      creationDate: this.item.documentationDate,
      documentName: this.filterName ? this.filterName : ""
    };

    if (!this.employeeFilters.segmentSearch) {
      param.cuil = this.employeeFilters.cuilSearch;
      param.nroLeg = this.employeeFilters.nroLegSearch;
    }
    this.containerTypeService
      .getContainerType(this.item.ou.id.toString())
      .toPromise()
      .then(containerType => {
        this.containerType = containerType;
        if (this.showSign) {
          if (!this.subscription) {
            this.subscription = this.subject.subscribe(
              dataSuscribe => {
                if (dataSuscribe) {
                  this.itemsCount = dataSuscribe.total;
                  this.documents = dataSuscribe.values;
                } else {
                  this.item = undefined;
                }
                this.loading = false;
              },
              err => this.msjService.showError(err),
            );
          }
          this.employeeDocumentService.refreshFileDocumentsGroupSignPending(param);
        } else {
          if (!this.subscription) {
            this.subscription = this.subject.subscribe(
              data => {
                this.itemsCount = data.total;
                this.documents = data.values;
                this.loading = false;
              },
              err => this.msjService.showError(err),
            );
          }
          this.employeeDocumentService.refreshFileDocumentsGroupInProgress(param);
        }
      },
        err => {
          this.msjService.showError(err);
        }
      );
  }

  filteredSearch() {
    if (this.subject) {
      this.pageIndex = 0;
      this.refresh();
    }
  }

  signDocuments() {
    const dialogData = new FileDocumentSignMassiveDialogData();
    dialogData.organizationalUnitId = this.item.ou.id;
    dialogData.organizationalUnitName = this.item.ou.name;
    dialogData.documentationId = this.item.documentationId;
    dialogData.documentationName = this.item.documentationName;
    dialogData.documentationDate = this.item.documentationDate;
    dialogData.documents = this.documents.filter(function (x) { return x.selected; });
    this.organizationalUnitService.setCurrentOU(this.item.ou);

    const dialogRef = this.dialog.open(FileDocumentSignMassiveDialogComponent, {
      // height: '800px',
      // width: '1024px',
      data: dialogData,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.signFinished.emit();
        this.employeeDocumentService.cleanLawyerDocumentationTypesGroup();
        this.employeeDocumentService.refreshDocumentationSignPending(this.item.ou).toPromise().then(() => {
        },
          err => this.msjService.showError(err)
        );
        this.getEmployeeDocuments();
      }
    });
  }

  signDocument(doc: FileDocument) {
    const dialogData = new FileDocumentSignMassiveDialogData();
    dialogData.organizationalUnitId = this.item.ou.id;
    dialogData.organizationalUnitName = this.item.ou.name;
    dialogData.documentationId = this.item.documentationId;
    dialogData.documentationName = this.item.documentationName;
    dialogData.documentationDate = this.item.documentationDate;
    this.organizationalUnitService.setCurrentOU(this.item.ou);
    dialogData.documents = [doc];

    const dialogRef = this.dialog.open(FileDocumentSignMassiveDialogComponent, {
      // height: '800px',
      // width: '1024px',
      disableClose: true,
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.employeeDocumentService.cleanLawyerDocumentationTypesGroup();
        this.employeeDocumentService.refreshDocumentationSignPending(this.item.ou).toPromise().then(() => {
        },
          err => this.msjService.showError(err)
        );
        this.getEmployeeDocuments();
        this.signFinished.emit();
      }
    });
  }

  openDocumentDialog(doc: FileDocument) {
    this.clickOnce = true;
    const docTemp = doc;
    let dialogData = new EmployeeFileDocumentDialogData();
    if (this.showSign) {
      this.employeeDocumentService.getFirmanteDocumentDetail(doc.id).toPromise()
        .then(res => {
          dialogData.doc = res;
          dialogData.doc.employeeCollaborationData = docTemp.employeeCollaborationData;
          dialogData.doc.lawyerCollaborationData = docTemp.lawyerCollaborationData;
          dialogData.employerSign = false;
          dialogData.signEnabled = false;
          dialogData.employee = new Employee();
          dialogData.employee.id = "0";
          dialogData.showDocumentStateBottom = this.showDocumentStateBottom;
          dialogData.showDocumentState = this.showDocumentState;
          dialogData.showDocumentMetadata = this.showDocumentMetadata;
          dialogData.isRRHH = false;
          dialogData.isFirmante = true;
          dialogData.isModoPDF = true;
          const dialogRef = this.dialog.open(FileDocumentViewModalComponent, {
            // height: '800px',
            // width: '1024px',
            data: dialogData
          });

          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              if (result.documentEliminated || result.documentRejected) {
                this.refresh();
              }
            }
          });
          this.clickOnce = false;
        }).catch(err => {          
          let error = {description : 'No se puede visualizar el PDF del documento'};
          this.msjService.showError(error);
          this.clickOnce = false;
        });
    } else {
      this.employeeDocumentService.getDocumentDetail(doc.id).toPromise()
        .then(res => {
          dialogData.doc = res;
          dialogData.doc.employeeCollaborationData = docTemp.employeeCollaborationData;
          dialogData.doc.lawyerCollaborationData = docTemp.lawyerCollaborationData;
          dialogData.employerSign = false;
          dialogData.signEnabled = false;
          dialogData.employee = new Employee();
          dialogData.employee.id = "0";
          dialogData.showDocumentStateBottom = this.showDocumentStateBottom;
          dialogData.showDocumentState = this.showDocumentState;
          dialogData.showDocumentMetadata = this.showDocumentMetadata;
          dialogData.isRRHH = true;
          dialogData.isFirmante = false;
          dialogData.isModoPDF = true;
          const dialogRef = this.dialog.open(FileDocumentViewModalComponent, {
            // height: '800px',
            // width: '1024px',
            data: dialogData
          });

          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              if (result.documentEliminated || result.documentRejected) {
                this.refresh();
              }
            }
          });
          this.clickOnce = false;
        }).catch(err => { 
          let error = {description : 'No se puede visualizar el PDF del documento'};
          this.msjService.showError(error);
          this.clickOnce = false;          
        });
    }
  }

  downloadAllDocuments() {
    const orderBy = [];
    this.loading = true;
    if (this.orderBy) {
      orderBy.push(this.orderBy);
    }

    const param: EmployeeDocumentSignPendingFind = {
      orderBy: orderBy,
      orderAscendent: this.orderAsc,
      index: this.pageIndex,
      page: this.pageIndex,
      itemPerPage: this.pageSize,
      isPaged: true,
      organizationalUnitId: this.item.ou.id,
      documentationTypeId: this.item.documentationId,
      creationDate: this.item.documentationDate
    };

    this.employeeDocumentService.downloadFileDocumentsGroupSignPending(param).toPromise().then(file => {
      this.loading = false;
      this.fileService.download(file, "Pendientes de firma " + new Date().toLocaleString(), "application/zip");
    })
      .catch(err => {
        this.loading = false;
        this.msjService.showError(err);
      });
  }

  deleteAll() {
    const orderBy = [];
    this.loading = true;
    if (this.orderBy) {
      orderBy.push(this.orderBy);
    }

    const param: EmployeeDocumentSignPendingFind = {
      orderBy: orderBy,
      orderAscendent: this.orderAsc,
      index: this.pageIndex,
      page: this.pageIndex,
      itemPerPage: this.pageSize,
      isPaged: true,
      organizationalUnitId: this.item.ou.id,
      documentationTypeId: this.item.documentationId,
      creationDate: this.item.documentationDate
    };

    this.employeeDocumentService.deleteFileDocumentsGroupSignPending(param).toPromise().then(file => {
      this.loading = false;
      this.employeeDocumentService.refreshDocumentationSignPending(this.item.ou).toPromise().then(() => {
      },
        err => this.msjService.showError(err)
      );
      this.msjService.showInfo('Documentos eliminados');
      this.refresh();
    })
      .catch(err => {
        this.loading = false;
        this.msjService.showError(err);
      });
  }

  openBottomSheetDelete(): void {
    const parameters: MessageAtributtes = {
      bodyText: '¡Estás por eliminar documentación!',
      infoText: 'Una vez realizada esta operación no podrá deshacerse.',
      type: MessageType.CaptchaNumbers
    };

    const t = this._bottomSheet.open(GenericBottomSheetComponent, { data: parameters, disableClose: true });
    t.instance.close.subscribe(s => {
      if (s) {
        this.deleteAll();
      }
    });
  }

  refresh() {
    this.getEmployeeDocuments();
  }

  periodOverDate(doc: FileDocument) {
    const pipe = new FilterPipe();
    let value = pipe.transform(FileDocument.dateSystemName, doc.documentDate != null ? doc.documentDate.toString() : '');

    const fechaDocIndex = doc.metadatas.findIndex(x => x.systemName === FileDocument.dateSystemName);
    const hasPeriod = doc.metadatas.some(x => x.systemName === FileDocument.periodSystemName);
    if (hasPeriod && fechaDocIndex !== 1) {
      value = doc.documentPeriod;
      if (value.length === 6){
        value =  doc.documentPeriod.substring(4,6) + '/' + doc.documentPeriod.substring(0,4)
      }

      this.headerDateOrPeriod = 'Período';
    } else {
      this.headerDateOrPeriod = 'Fecha';
    }
    return value;
  }

  goBack() {
    this.goBackEvent.emit(true);
  }

  runWorkflow(doc: number) {
    this.fileService.executeDocumentById(doc).toPromise()
    .then( () => {
      this.refresh();
    })
    .catch(err => {
      this.msjService.showError(err);
    });
  }
}
