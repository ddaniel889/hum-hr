import { Component, OnInit, OnChanges, ViewChild } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MessageService } from '../../shared/errorHandler/message.service';
import { OrganizationalUnit, Employee, ContainerType } from '../../shared/models';
import { Subject, Subscription, Observable } from 'rxjs';
import { IPagedModel } from '../../shared/models/paged.model.';
import { FileDocument, StatusDoc } from '../../shared/models/file-document.model';
import { FileDocumentService } from '../../shared/services/file-document.service';
import { EmployeeDocumentFileSearch } from '../../shared/models/employee-document-file-search';
import { FileService } from '../../shared/services/file.service';
import { EmployeeFileDocumentDialogData } from '../../shared/models/employee-file-document-dialog-data.model';
import { MatDialog } from '@angular/material/dialog';
import { OrganizationalUnitService } from '../../shared/services/organizational-unit.service';
import { DocumentationExport } from '../../shared/models/documentation-export.model';
import { ContainerTypeService } from '../../shared/services/container-type.service.';
import { DocumentationTypesService } from '../../shared/services/documentation-types.service';
import { DocumentationType } from '../../shared/models/documentation-type.model';
import { MetadataDocType } from "../../shared/models/MetadataDocType.model";
import { MetadataFilterDialogComponent } from '../../shared/metadata-filter-dialog/metadata-filter-dialog.component';
import { DocumentationFind } from '../../shared/models/documentation-find.model';
import { AdvancedEmployeeFilters } from '../../shared/models/Employee/advanced-employee-filters';
import { KeyValuePair } from '../../shared/models/Generics/ikeyValuePair.model';
import { ContainerTypeMetadata } from '../../shared/models/container-type.metadata.model';
import { FileDocumentViewModalComponent } from '../../shared/file-document-view-modal/file-document-view-modal.component';
import { AuthService } from '../../shared/auth/auth.service';
import { Router } from '@angular/router';
import { DocumentFilters } from '../../shared/models/document-filters';
import { LocalStorageService } from '../../shared/services/local-storage.service';
import { FileDocumentMetadataComponent } from '../../shared/file-document-metadata/file-document-metadata.component';
import { MessageType } from '../../shared/models/message-types.model';
import { GenericBottomSheetComponent } from '../../shared/generic-bottom-sheet/generic-bottom-sheet.component';
import { NoveltyService } from '../../shared/services/novelty.service';
import { AdjectiveRolesUser } from '../../shared/models/adjective-roles-user.model';


@Component({
  selector: 'app-file-document-search',
  templateUrl: './file-document-search.component.html',
  styles: []
})
export class FileDocumentSearchComponent implements OnInit, OnChanges {
  loading = false;
  ouLoaded = false;
  searched = false;
  documentFilters: DocumentFilters;
  itemClass: string;
  subject: Subject<IPagedModel<FileDocument>>;
  subscription: Subscription;
  filterName: string;
  documentationTypes: DocumentationType[];
  selectedDocumentationTypes: DocumentationFind[] = [];
  documents: FileDocument[] = [];
  selectedOrganizationalUnit: OrganizationalUnit;
  filteredDocumentationTypes: Observable<String[]>;
  orderBy: String;
  orderAsc = true;
  itemsCount: number;
  pageIndex: number;
  allSelected = false;
  organizationalUnits: OrganizationalUnit[];
  organizationalUnitId: string;
  containerType: ContainerType;
  metadataFind: MetadataDocType[];
  exportColumns: KeyValuePair<string, ContainerTypeMetadata>[] = [];
  columns: KeyValuePair<string, ContainerTypeMetadata>[] = [];
  availableColumns: KeyValuePair<any, ContainerTypeMetadata>[] = [];
  columnsClass: string;
  isCanceledFilter = false;
  isNotCanceledFilter = true;
  isFinishedFilter = true;
  isNotFinishedFilter = true;
  clickOnce = false;
  docDateFrom?: Date;
  docDateTo?: Date;
  restrictionFilter?: number;
  hasFiltersMetadataEMPLOYEE = false;
  filtersmetadata: AdjectiveRolesUser[] = [];
  optionsPageSize = [15, 50, 100, 200, 300, 400, 500];
  pageSize = this.optionsPageSize[0];
  // Advanced employee filters
  employeeFilters: AdvancedEmployeeFilters = {
    selectedEmployeeFind: [],
    segmentSearch: true,
    nroLegSearch: undefined,
    cuilSearch: undefined,
    inactiveSearch: false,
    activeSearch: true
  };
  isRRHH: boolean;
  @ViewChild('advancedSearch') advancedSearch: any;
  useDocComments = false;
  hasMessageFilter = false;
  threadClosedFilter = false;

  constructor(
    private msjService: MessageService,
    private authService: AuthService,
    private _bottomSheet: MatBottomSheet,
    private fileDocumentService: FileDocumentService,
    private fileService: FileService,
    private dialog: MatDialog,
    private organizationalUnitService: OrganizationalUnitService,
    private containerTypeService: ContainerTypeService,
    private router: Router,
    private documentationTypesService: DocumentationTypesService,
    private localStorageService: LocalStorageService,
    private noveltiesService: NoveltyService) { }
  ngOnInit() {
    this.filtersMetadataEmployee();
    this.isRRHH = this.authService.isRRHH();
    this.useDocComments = this.localStorageService.get('useDocComments');
    this.loading = true;
    this.subject = this.fileDocumentService.getFileDocuments();
    this.organizationalUnitService.getTreeInMemory()
      .then(ous => {
        this.organizationalUnits = ous.filter(o => o.isRoot === false);
        if (this.organizationalUnitService.getCurrentOrChildOU() == null || this.organizationalUnitService.getCurrentOrChildOU().isRoot) {
          this.selectedOrganizationalUnit = this.organizationalUnits[0];
          this.organizationalUnitService.setCurrentOU(this.selectedOrganizationalUnit);
        } else {
          this.selectedOrganizationalUnit = this.organizationalUnitService.getCurrentOrChildOU();
        }
        this.ouLoaded = true;
        this.getDocumentationTypes(this.selectedOrganizationalUnit);
      },
        err => this.msjService.showError(err)
      );

  }

  getDocumentationTypes(organizationalUnit: OrganizationalUnit) {
    this.organizationalUnitService.setCurrentOU(organizationalUnit);
    this.selectedDocumentationTypes = [];
    this.itemsCount = 0;
    this.documents = [];
    const loadings = [];
    loadings.push(this.containerTypeService
      .getContainerType(this.organizationalUnitService.getCurrentOrChildOU().id.toString()).toPromise());
    loadings.push(this.documentationTypesService.get(organizationalUnit.id).toPromise());

    Promise.all(loadings).then(results => {
      this.containerType = results[0];
      this.availableColumns = [];
      this.setDefaultColumns(true);
      this.documentationTypes = results[1];

      this.documentFilters = this.localStorageService.get("documentsFilter");
      const currentOu = this.organizationalUnitService.getCurrentOrChildOU();
      if (this.documentFilters && currentOu.id == this.documentFilters.previousOuID) {
        this.filterName = this.documentFilters.documentFilters.documentName;
        this.employeeFilters = this.documentFilters.advancedEmployeeFilters;
        this.columns = this.documentFilters.columns;
        this.exportColumns = this.documentFilters.exportColumns;
        this.availableColumns = this.documentFilters.availableColumns;
        this.columnsClass = this.documentFilters.columnsClass;
        this.isCanceledFilter = this.documentFilters.isCanceledFilter;
        this.isNotCanceledFilter = this.documentFilters.isNotCanceledFilter;
        this.isFinishedFilter = this.documentFilters.isFinishedFilter;
        this.isNotFinishedFilter = this.documentFilters.isNotFinishedFilter;
        this.orderBy = this.documentFilters.documentFilters.orderBy[0];
        this.orderAsc = this.documentFilters.documentFilters.orderAscendent;
        this.docDateFrom = this.documentFilters.documentFilters.fechaDocumentacionFrom;
        this.docDateTo = this.documentFilters.documentFilters.fechaDocumentacionTo;
        this.restrictionFilter = this.documentFilters.documentFilters.restrictionFilter;

        const sdts: DocumentationFind[] = [];
        this.documentFilters.documentFilters.documentationFind.forEach(doc => {
          const sdt = new DocumentationFind(doc.documentTypeId, doc.documentationTypeId, doc.documentationTypeName, doc.sequence, doc.metadatas);
          sdts.push(sdt);
        })
        this.selectedDocumentationTypes = sdts;
        if (!this.subscription) {
          this.subscription = this.subject.subscribe(
            data => {
              this.itemsCount = data.total;
              this.documents = data.values;

              this.loading = false;
            },
            err => {
              this.msjService.showError(err);
              this.loading = false;
            }
          );
        }
        this.documentFilters.documentFilters.page = 0;
        this.fileDocumentService.refreshFileDocuments(this.documentFilters.documentFilters);
      } else {
        this.cleanFilters();
      }
    })
      .catch(err => {
        this.msjService.showError(err);

      })
      .then(() => this.loading = false)
  }

  refresh(): void {
    this.loading = true;
  }

  ngOnChanges() {
    this.loading = true;
    this.pageIndex = 1;

    if (this.subject) {
      this.getEmployeeDocuments();
    }
  }


  maskSplited(mask:string){
    let masksplited= mask.split("||")
     if (masksplited.length>1) {
        //Las mascaras de Id Fiscales cuando son mas de una por pais, al ser de distintas longitudes y estar ordenadas de menor a mayor longitud,
       //siempre elijo la mayor que queda en la ultima posicion del arreglo
       let i=masksplited.length-1;
       return masksplited[i];
     }
     return  mask
   }

  selectedPageChanged(a) {
    this.getEmployeeDocuments();
  }

  filteredSearch() {
    if (this.subject) {
      this.pageIndex = 0;
      this.getEmployeeDocuments();
    }
  }

  sortColumn(header: string) {
    this.orderBy = header;
    this.orderAsc = !this.orderAsc;
    this.saveFilters();
    this.getEmployeeDocuments();
  }

  checkDocument(doc: FileDocument) {
    doc.selected = !doc.selected;
    this.selectedChange();
  }

  selectedChange() {
    const allTheSame = this.documents.every((val, i, arr) => val.selected === arr[0].selected);
    if (allTheSame) {
      this.allSelected = this.documents[0].selected;
    } else {
      this.allSelected = false;
    }
  }

  selectAllToogle() {
    if (this.documents) {
      this.documents.forEach(element => {
        element.selected = this.allSelected;
      });
    }
  }

  isDocumentsSelected(): boolean {
    if (!this.documents && this.documents.length == 0) { return false; }
    return this.documents.filter(function (x) { return x.selected; }).length > 0;
  }

  getEmployeeDocuments() {
    this.allSelected = false;
    const orderBy = [];
    this.loading = true;
    this.searched = true;

    if (this.columns.length === 0) {
      this.setDefaultColumns(this.exportColumns.length === 0);
    }
    if (this.orderBy) {
      orderBy.push(this.orderBy);
    }
    const param: EmployeeDocumentFileSearch = {
      orderBy: orderBy,
      orderAscendent: this.orderAsc,
      index: this.pageIndex,
      page: this.pageIndex,
      itemPerPage: this.pageSize,
      isPaged: true,
      organizationalUnitId: this.selectedOrganizationalUnit.id,
      documentName: this.filterName ? this.filterName : "",
      documentationFind: this.selectedDocumentationTypes,
      employeeFind: this.employeeFilters.selectedEmployeeFind,
      containerTypeId: this.containerType.id,
      statusId: this.isCanceledFilter && this.isNotCanceledFilter ? null : this.isCanceledFilter && !this.isNotCanceledFilter ? StatusDoc.Canceled : -1 * StatusDoc.Canceled,
      isFinished: this.isFinishedFilter && this.isNotFinishedFilter ? null : this.isFinishedFilter,
      fechaDocumentacionFrom: this.docDateFrom,
      fechaDocumentacionTo: this.docDateTo,
      restrictionFilter: this.restrictionFilter,
      hasMessage: this.hasMessageFilter ? true : null,
      threadClosed: this.threadClosedFilter ? true : null,
    };

    if (!this.employeeFilters.segmentSearch) {
      param.cuil = this.employeeFilters.cuilSearch;
      param.nroLeg = this.employeeFilters.nroLegSearch;
    }
    this.saveFilters(param);
    if (!this.subscription) {
      this.subscription = this.subject.subscribe(
        data => {
          this.itemsCount = data.total;
          this.documents = data.values;


          this.loading = false;
        },
        err => {
          this.msjService.showError(err);
          this.loading = false;
        }
      );
    }

    this.fileDocumentService.refreshFileDocuments(param);
  }

  donwloadDocument(doc: FileDocument) {
    this.loading = true;
    this.fileDocumentService.saveDocument(doc, doc.documentContainerId.toString(), false).then(
      () => this.loading = false,
      error => this.loading = false
    );
  }

  downloadSelectedDocuments() {
    this.loading = true;
    this.fileDocumentService.saveMultipleDocument(this.documents.filter(function (x) { return x.selected; }), false).then(
      () => {
        this.loading = false;
        this.msjService.showInfo("Documentos descargados correctamente");
      }
    )
      .catch(err => {
        this.msjService.showError(err);
        this.loading = false;
      });
  }

  downloadAllDocuments() {
    this.loading = true;
    const orderBy = [];

    if (this.orderBy) {
      orderBy.push(this.orderBy);
    }

    const param: EmployeeDocumentFileSearch = {
      orderBy: orderBy,
      orderAscendent: this.orderAsc,
      index: undefined,
      page: undefined,
      itemPerPage: 500,
      isPaged: false,
      organizationalUnitId: this.selectedOrganizationalUnit.id,
      documentName: this.filterName ? this.filterName : "",
      documentationFind: this.selectedDocumentationTypes,
      employeeFind: this.employeeFilters.selectedEmployeeFind,
      containerTypeId: this.containerType.id,
      statusId: this.isCanceledFilter && this.isNotCanceledFilter ? null : this.isCanceledFilter && !this.isNotCanceledFilter ? StatusDoc.Canceled : -1 * StatusDoc.Canceled,
      isFinished: this.isFinishedFilter && this.isNotFinishedFilter ? null : this.isFinishedFilter,
      fechaDocumentacionFrom: this.docDateFrom,
      fechaDocumentacionTo: this.docDateTo,
      restrictionFilter: this.restrictionFilter
    };
    if (!this.employeeFilters.segmentSearch) {
      param.cuil = this.employeeFilters.cuilSearch;
      param.nroLeg = this.employeeFilters.nroLegSearch;
    }
    this.fileDocumentService.saveAllDocuments(param).then(
      () => {
        this.loading = false;
        this.msjService.showInfo("Documentos descargados correctamente");
      }
    )
      .catch(err => {
        this.msjService.showError(err);
        this.loading = false;
      });
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

  viewDocument(doc: FileDocument) {
    if (this.clickOnce) {
      return;
    }

    this.clickOnce = true;
    const docTemp = doc;
    this.fileDocumentService.getDocumentDetail(doc.id).toPromise()
      .then(res => {
        const dialogData = new EmployeeFileDocumentDialogData();
        dialogData.doc = res;
        dialogData.doc.employeeCollaborationData = docTemp.employeeCollaborationData;
        dialogData.doc.lawyerCollaborationData = docTemp.lawyerCollaborationData;
        dialogData.employerSign = false;
        dialogData.signEnabled = false;
        dialogData.employee = new Employee();
        dialogData.employee.id = docTemp.documentContainerId.toString();
        dialogData.showDocumentStateBottom = true;
        dialogData.showDocumentState = true;
        dialogData.showDocumentMetadata = true;
        dialogData.isRRHH = true;
        dialogData.isFirmante = false;
        dialogData.isModoPDF = true;
        dialogData.isNotifyDocumentVac = false;
        const dialogRef = this.dialog.open(FileDocumentViewModalComponent, {
          // height: '800px',
          // width: '1024px',
          data: dialogData
        });

        dialogRef.afterClosed().subscribe(result => {
          this.clickOnce = false;
          if (result) {
            //Pregunto si se elimino o rechazo un documento para recargar la grilla
            if (result.documentEliminated || result.documentRejected) {
              this.filteredSearch();
            }
          }
        });
      })
      .catch(error => {
        this.clickOnce = false;
      });
  }

  exportDocumentations(exportAll: boolean) {
    this.loading = true;
    const orderBy = [];
    const ouIds = [];

    if (this.selectedOrganizationalUnit && this.selectedOrganizationalUnit.id != null) {
      ouIds.push(this.selectedOrganizationalUnit.id);
    }

    const param: DocumentationExport = {
      orderBy: orderBy,
      orderAscendent: this.orderAsc,
      index: this.pageIndex,
      isPaged: false,
      organizationalUnitId: this.selectedOrganizationalUnit.id,
      documentationFind: exportAll ? this.selectedDocumentationTypes : [],
      documentName: this.filterName ? this.filterName : "",
      sheetName: "Documentación",
      selectedDocumentations: exportAll ? null : this.documents.filter(function (x) { return x.selected; }),
      headers: this.exportColumns,
      employeeFind: exportAll ? this.employeeFilters.selectedEmployeeFind : [],
      containerType: this.containerType,
      containerTypeId: this.containerType.id,
      statusId: this.isCanceledFilter && this.isNotCanceledFilter ? null : this.isCanceledFilter && !this.isNotCanceledFilter ? StatusDoc.Canceled : -1 * StatusDoc.Canceled,
      isFinished: this.isFinishedFilter && this.isNotFinishedFilter ? null : this.isFinishedFilter,
      fechaDocumentacionFrom: this.docDateFrom,
      fechaDocumentacionTo: this.docDateTo,
      restrictionFilter: this.restrictionFilter
    };

    if (!this.employeeFilters.segmentSearch) {
      param.cuil = this.employeeFilters.cuilSearch;
      param.nroLeg = this.employeeFilters.nroLegSearch;
    }

    this.fileDocumentService
      .exportDocumentation(param)
      .toPromise()
      .then(
        file => {
          const date = new Date().toISOString();
          this.fileService.download(file, "Lista de Documentos " + ` [${date}].xlsx`, "application/excel");
          this.msjService.showInfo("Documentos exportados correctamente");
          this.loading = false;
        },
        err => {
          this.msjService.showError(err);
          this.loading = false;
        }
      );
  }

  openMetadata(dt: DocumentationType) {
    const dialogRef = this.dialog.open(MetadataFilterDialogComponent, {
      // height: '800px',
      // width: '1024px',
      data: {
        documentationFind: dt,
        enableEnhancedSearch: this.selectedOrganizationalUnit.enableEnhancedSearch
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {

    });
  }

  itemRemoved(dtName: DocumentationType) {
    this.removeColumnOptions(dtName);
  }

  selectDocumentationType(dtName: string) {
    const foundDt = this.documentationTypes.filter(dt => dt.name == dtName);
    if (foundDt.length) {

      const sequenceList = [];
      foundDt[0].documentationTypeSequence.forEach(dts => {
        sequenceList.push(dts.documentationSequence);
      });

      const dtFind = new DocumentationFind(foundDt[0].documentTypeId, foundDt[0].id, foundDt[0].name, sequenceList);
      this.selectedDocumentationTypes.push(dtFind);

      // Si hay uno solo elegido voy a buscar el documentType a EDR
      this.getColumnOptions(dtFind);
    }
  }

  private getColumnOptions(dt: DocumentationFind) {
    if (this.selectedDocumentationTypes.length > 0) {
      this.documentationTypesService.getDocumentType(dt.documentTypeId).toPromise().then(
        data => {
          const cols = data.metadata;
          // Elimino los metadatos de ids que son fijos
          cols.splice(cols.findIndex(c => c.metadataSystemName === "_idDocumentacion"), 1);
          cols.splice(cols.findIndex(c => c.metadataSystemName === "_userId"), 1);

          cols.forEach(col => {
            // Agrego la columna
            const i = this.availableColumns.findIndex(c => c.value.metadataSystemName === col.metadataSystemName);
            if (i < 0) {
              // Si no estaba en la lista la creo nueva
              const columnKey = {
                dtNames: dt.name,
                dtIds: [dt.id]
              };

              this.availableColumns.push({
                key: columnKey,
                value: col
              });
            } else {
              // Si ya estaba actualizo la key
              const c = this.availableColumns[i];
              c.key.dtNames = `${c.key.dtNames}, ${dt.name}`;
              c.key.dtIds.push(dt.id);
            }
          });
          this.showPeriodOverDate();
        })
        .catch(error => this.msjService.showError(error));
    } else {
      this.availableColumns = [];
      this.setDefaultColumns(true);
    }
  }

  selectColumn(col: ContainerTypeMetadata) {
    // Si ya estaba la saco
    if (this.isColumnSelected(col)) {
      if (this.columns.length == 1) {
        this.msjService.showInfo('Debes tener al menos un dato para Visualizar');
        return;
      }
      this.columns.splice(this.columns.findIndex(c => c.key === col.metadataSystemName), 1);
      this.saveFilters();
      return;
    }

    // Si no esta en exportar lo agrego
    if (!this.isExportColumnSelected(col)) {
      this.selectExportColumn(col);
    }

    // Si ya tengo 6 no agrego mas
    if (this.columns.length === 6) {
      return;
    }

    this.columns.push({
      key: col.metadataSystemName,
      value: col
    });

    this.saveFilters();

    // Calculo el valor del class
    this.columnsClass = (12 / this.columns.length).toString().replace('.', '');
  }

  selectExportColumn(col: ContainerTypeMetadata) {
    // Si ya estaba la saco
    if (this.isExportColumnSelected(col)) {
      if (this.exportColumns.length == 1) {
        this.msjService.showInfo('Debes tener al menos un dato para Exportar');
        return;
      }
      this.exportColumns.splice(this.exportColumns.findIndex(c => c.key === col.metadataSystemName), 1);
      this.saveFilters();
      return;
    }

    this.exportColumns.push({
      key: col.metadataSystemName,
      value: col
    });

    this.saveFilters();
  }

  isColumnSelected(col: ContainerTypeMetadata): boolean {
    return this.columns.filter(c => c.key === col.metadataSystemName).length > 0;
  }

  isExportColumnSelected(col: ContainerTypeMetadata): boolean {
    return this.exportColumns.filter(c => c.key === col.metadataSystemName).length > 0;
  }

  setDefaultColumns(exportColunns: boolean = false) {
    this.columns = new FileDocument().getDocumentationHeaders(this.containerType);
    // Calculo el valor del class
    this.columnsClass = (12 / this.columns.length).toString().replace('.', '');

    if (exportColunns) {
      this.exportColumns = new FileDocument().getDocumentationHeaders(this.containerType);
    }
  }

  removeColumnOptions(dt: DocumentationType) {
    const colsToRemove = this.availableColumns.filter(c => {
      return c.key.dtIds.findIndex(i => i === dt.id) > -1;    });
    if (this.selectedDocumentationTypes.length > 0) {
      // Si quedan tipos documentales seleccionados, solo remuevo columnas del td a remover
      colsToRemove.forEach(colRemove => {
        if (colRemove.key.dtIds.length === 1) {
          // Si es el unico que la tiene la elimino
          let i = this.columns.findIndex(c => c.key === colRemove.value.metadataSystemName);
          if (i > -1) {
            this.columns.splice(i, 1);
          }
          i = this.availableColumns.findIndex(c => c.key.dtIds[0] === colRemove.key.dtIds[0]);
          if (i > -1) {
            this.availableColumns.splice(i, 1);
          }
        } else {
          // Si tiene mas de un Tipo Documentacion actualizo el key
          let i = colRemove.key.dtIds.findIndex(id => id === dt.id);
          if (i > -1) {
            colRemove.key.dtIds.splice(i, 1);
          }
          i = colRemove.key.dtNames.indexOf(dt.name);
          if (i === 0) {
            // Si es el primero lo saco y saco la coma del final
            colRemove.key.dtNames = colRemove.key.dtNames.slice(dt.name.length + 2);
          } else {
            // Si no es el primero lo saco y saco la coma del principio
            colRemove.key.dtNames = colRemove.key.dtNames.slice(0, i - 2) + colRemove.key.dtNames.slice(i + dt.name.length);
          }
        }
      });
      this.showPeriodOverDate();
    } else {
      // Si no seteo los defaults y limpio lista de columnas disponibles
      this.availableColumns = [];
      this.setDefaultColumns(true);
    }
  }

  errorStatus(): boolean {
    return !this.isCanceledFilter && !this.isNotCanceledFilter;
  }

  errorFinished(): boolean {
    return !this.isFinishedFilter && !this.isNotFinishedFilter;
  }

  showPeriodOverDate() {
    if (this.availableColumns.some(x => x.value.metadataSystemName === "_peri")) {
      // Si está la opción del periodo se preselecciona y se deselecciona fechaDoc
      if (this.columns.some(x => x.key === "_fecDoc")) {
        this.columns.splice(this.columns.findIndex(x => x.key === "_fecDoc"), 1);
      }
      if (this.exportColumns.some(x => x.key === "_fecDoc")) {
        this.exportColumns.splice(this.exportColumns.findIndex(x => x.key === "_fecDoc"), 1);
      }
      if (!this.columns.some(x => x.key == "_peri")) {
        this.selectColumn(this.availableColumns.find(x => x.value.metadataSystemName === "_peri").value);
      }
    } else {
      // Si no está la opcion la deselecciono y selecciono fechaDoc
      if (this.columns.some(x => x.key === "_peri")) {
        this.columns.splice(this.columns.findIndex(x => x.key === "_peri"), 1);
      }
      if (this.exportColumns.some(x => x.key === "_peri")) {
        this.exportColumns.splice(this.exportColumns.findIndex(x => x.key === "_peri"), 1);
      }
      if (!this.columns.some(x => x.key == "_fecDoc")) {
        this.selectColumn(this.availableColumns.find(x => x.value.metadataSystemName === "_fecDoc").value);
      }
    }
  }

  goToConfiguration() {
    this.router.navigate(['employer/document-configuration']);
  }

  private saveFilters(param?: EmployeeDocumentFileSearch) {
    if (!this.documentFilters) {
      this.documentFilters = {
        documentFilters: null,
        columns: null,
        exportColumns: null,
        availableColumns: null,
        columnsClass: null,
        isCanceledFilter: null,
        isNotCanceledFilter: null,
        isFinishedFilter: null,
        isNotFinishedFilter: null,
        previousOuID: null,
        advancedEmployeeFilters: null,
        restrictionFilter: null,
      }
    }
    this.documentFilters.columns = this.columns;
    this.documentFilters.exportColumns = this.exportColumns;
    this.documentFilters.availableColumns = this.availableColumns;
    this.documentFilters.columnsClass = this.columnsClass;
    this.documentFilters.isCanceledFilter = this.isCanceledFilter;
    this.documentFilters.isNotCanceledFilter = this.isNotCanceledFilter;
    this.documentFilters.isFinishedFilter = this.isFinishedFilter;
    this.documentFilters.isNotFinishedFilter = this.isNotFinishedFilter;
    this.documentFilters.advancedEmployeeFilters = this.employeeFilters;
    this.documentFilters.restrictionFilter = this.restrictionFilter;
    if (param) {
      this.documentFilters.documentFilters = param;
    }
    this.documentFilters.previousOuID = this.organizationalUnitService.getCurrentOrChildOU().id;
    this.localStorageService.set("documentsFilter", this.documentFilters);
  }

  public cleanFilters() {
    if (this.selectedDocumentationTypes && this.selectedDocumentationTypes.length > 0) {
      const toRemove = [...this.selectedDocumentationTypes];
      toRemove.forEach(dt => this.itemRemoved(dt as any)); 
    }

    if (this.advancedSearch && typeof this.advancedSearch.clean === 'function') {
      this.advancedSearch.clean();
    }

    this.employeeFilters = {
      selectedEmployeeFind: [],
      segmentSearch: true,
      nroLegSearch: undefined,
      cuilSearch: undefined,
      inactiveSearch: false,
      activeSearch: true
    };
    this.setDefaultColumns(true);
    this.availableColumns = [];
    this.selectedDocumentationTypes = [];
    this.filterName = "";
    this.isCanceledFilter = false;
    this.isNotCanceledFilter = true;
    this.isFinishedFilter = true;
    this.isNotFinishedFilter = true;
    this.docDateFrom = undefined;
    this.docDateTo = undefined;
    this.restrictionFilter = null;
  
    this.selectedDocumentationTypes = [];
    this.hasMessageFilter = false;
    this.threadClosedFilter = false;
  }

  exportFormularios()
  {
      let parameters: any = {};
        parameters.bodyText = 'Exportación de Datos';
        parameters.infoText = "Define los Datos para Exportación"
        parameters.inputLabel = 'selecciones el período';
        parameters.type = MessageType.ExportCancel;
        parameters.actions = this.extractForms();
      const t = this._bottomSheet.open(GenericBottomSheetComponent, { data: parameters, disableClose: false });
      t.instance.close.subscribe((response: any) => {
        if (response) {
          this.loading = true;
          const parameters = {
            CompanyId: this.selectedOrganizationalUnit.id,
            noveltyCreatedDateFrom: this.formatDate(response.startDate),
            noveltyCreatedDateTo: this.formatDate(response.endDate),
            notShowed :false,
            documentTypesIds: response.ids
          };
          this.noveltiesService.getNovelties(parameters).toPromise()
          .then((file) =>
          {
            if (file === "")
            {
              this.msjService.showInfo("No se recuperaron datos para exportar");
              this.loading = false;
            }
            else
            {
              const date = new Date().toISOString();
              this.fileService.download(file, "Formularios" + ` [${date}].xlsx`, "application/excel");
              this.msjService.showInfo("Documentos exportados correctamente");
              this.loading = false;
            }
          }, (err)=>{

            this.msjService.showInfo("Hubo un error al exportar los Datos");
            this.loading = false;
          });
        }
      });
  }
  formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [year, month, day].join('');
}

extractForms(){
  var filter =  this.documentationTypes.filter(x => x.hasExternalForm && x.exteralForm !== null);
  return filter;
}

filtersMetadataEmployee() {
  this.authService.hasFiltersMetadatos().subscribe(metadata => {
    this.filtersmetadata = metadata;
    if (this.filtersmetadata.length > 0) {

      if (this.filtersmetadata.filter(x => x.personType == "EMPLEADO" && x.metadataId != null).length > 0) {
        this.hasFiltersMetadataEMPLOYEE = true;
      }
    }
    else {
      // en el caso que no tiene filtro para un metadato en particular coloco false
      this.hasFiltersMetadataEMPLOYEE = false;
    }
  });
}

setSizePage(page): void {
  this.pageIndex = 1;
  this.getEmployeeDocuments();
}
}
