import { Component, OnInit, OnChanges } from "@angular/core";
import { AnalyticsService } from "../../shared/services/analytics.service";
import { MessageService } from "../../shared/errorHandler/message.service";
import { Analytics } from "../../shared/models/analytics.model";
import { OrganizationalUnit, ContainerType, Employee } from "../../shared/models";
import { OrganizationalUnitService } from "../../shared/services/organizational-unit.service";
import { NotificationService } from "../../shared/services/notification.service";
import { NotificationSearchDto } from "../../shared/models/NotificationSearchDto.model";
import { SegmentEmployeeFind } from "../../shared/models/segment-employee-find.model";
import { ContainerTypeService } from "../../shared/services/container-type.service.";
import { MetadataFind } from "../../shared/models/metadata.model";
import { EmployeeFind } from "../../shared/models/employee-find.model";
import { DocumentationSetDetailFind } from "../../shared/models/documentationTypeSet.model";
import { MessageAtributtes,  MessageType } from "../../shared/models/message-types.model";
import { GenericBottomSheetComponent } from "../../shared/generic-bottom-sheet/generic-bottom-sheet.component";
import { MatBottomSheet } from "@angular/material/bottom-sheet";
import { KeyValuePair } from "../../shared/models/Generics/ikeyValuePair.model";
import { AuthService } from "../../shared/auth/auth.service";
import { Router, ActivatedRoute } from "@angular/router";
import { DocumentationTypeSetService } from "../../shared/services/documentation-type-set.service";
import { DocumentationTypeSet,  DocumentationTypeSetFind } from "../../shared/models/documentationTypeSet.model";
import { AnalyticsDocumentSet } from "../../shared/models/analytics-document-set.model";
import { AnalyticsDocumentSetPerson } from "../../shared/models/analytics-document-set-person.model";
import { FileDocumentService } from "../../shared/services/file-document.service";
import { EmployeeFileDocumentDialogData } from "../../shared/models/employee-file-document-dialog-data.model";
import { FileDocumentViewModalComponent } from "../../shared/file-document-view-modal/file-document-view-modal.component";
import { MatDialog } from "@angular/material/dialog";
import { FileDocument } from "../../shared/models/file-document.model";
import { FileDocumentCollaborationData } from "../../shared/models/file-document-sign-data.model";
import { stringToKeyValue } from "@angular/flex-layout/extended/style/style-transforms";
import { CompletionListener } from "concurrently/dist/src/completion-listener";
import { EmployerProcessService } from "../../shared/services/employer-process.service";

@Component({
  selector: "app-analytics-document-set",
  templateUrl: "./analytics-document-set.component.html",
  styleUrls: [],
})
export class AnalyticsDocumentSetComponent implements OnInit, OnChanges {
  organizationalUnitId: number;
  searchField: string;
  searchPersonField: string;
  selectedOrganizationalUnit: OrganizationalUnit;
  organizationalUnits: OrganizationalUnit[] =  [];
  loading = true;
  placeHolderDescription = "";
  containerType: ContainerType;
  selectedEmployeeFind: EmployeeFind[];
  clickOnce = false;
  showSetDetail: boolean = false;
  innerLoader: boolean = false;
  peopleLoader: boolean = false;
  showPeopleList: boolean = false;
  views: KeyValuePair<string, string>[] = [
    { key: "Sets", value: "employer/analytics-document-set" },
  ];
  selectedView: KeyValuePair<string, string>;
  documentationTypeSets: DocumentationTypeSet[];
  documentationTypeSetSelected: DocumentationTypeSet;
  showDisabled = false;
  analyticsDocumentSet: AnalyticsDocumentSet = new AnalyticsDocumentSet();
  candidate:AnalyticsDocumentSetPerson = new AnalyticsDocumentSetPerson();
  peoplePanelOpenState = false;
  dto: NotificationSearchDto;
  UserIds: any[];
  ouid: number;
  completeDocuments: Array<any> = new Array();
  IncompleteDocuments:Array<any> = new Array();
  //para el mock borrar de ser necesario
  showSets = true;
  showDetail = false;
  showDocumentsSet=false;
  // filtros de búsqueda 
  inactiveSet: boolean;
  activeSet: boolean = true;
  completeDoc:boolean = true;
  incompleteDoc:boolean = true;
  withOut:boolean = true;
  requiredDocumentation:boolean = true;
  norequiredDocumentation:boolean = true;
  active = false
  pageIndex: number;
  itemsCount: number;
  Completepercentage:number;
  InCompletepercentage:number;
  WithOutpercentage:number;
  allSelected:boolean;
  selectedSet:any;
  empFiscalIdMask:string;
  collaboration: FileDocumentCollaborationData[];
  loadingDocument:Boolean;
  disableButton: boolean = false;
  enabledFilter:boolean = true;
  disabledFilter:boolean = true;
  filterLabel:string;
  disabledNotifAll:boolean = false;

  constructor(
    private msjService: MessageService,
    private organizationalUnitService: OrganizationalUnitService,
    private notificationService: NotificationService,
    private containerTypeService: ContainerTypeService,
    private _bottomSheet: MatBottomSheet,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private documentationTypeSetSvc: DocumentationTypeSetService,
    private fileDocumentService: FileDocumentService,
    private employerProcessService: EmployerProcessService,
    private dialog: MatDialog,
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.ouid = +params['id'];
    });

    this.dto = {} as NotificationSearchDto;
    this.views = this.authService.viewsAnalitycsAvailables();
    this.selectedView = this.views.find((v) => v.key === "Sets");

    this.organizationalUnitService.getTreeInMemory().then(
      (ous) => {
        this.organizationalUnits = ous.filter((o) => o.isRoot === false);
        if (
          this.organizationalUnitService.getCurrentOrChildOU() == null ||
          this.organizationalUnitService.getCurrentOrChildOU().isRoot
        ) {
          this.selectedOrganizationalUnit = this.organizationalUnits[0];
          this.organizationalUnitService.setCurrentOU(
            this.selectedOrganizationalUnit
          );

        } else {
          if (isNaN(this.ouid) || this.ouid === undefined) {
            this.selectedOrganizationalUnit = this.organizationalUnitService.getCurrentOrChildOU();
          }
          else {
            this.selectedOrganizationalUnit = this.organizationalUnits.find((o) => { return o.id === this.ouid });
          }
        }
        this.loading = true;
        // Busco si existen procesos pendientes, que actualicen la coleccion de metricas de set.
        this.employerProcessService.getPendingProcessMetricSet(this.selectedOrganizationalUnit.id).toPromise()
        .then(
          (data : any) => {
            if(data.length > 0){
              const parameters = {
                bodyText: 'Datos de analíticas desactualizados',
                infoText: 'Los datos mostrados no están actualizados ya que existen procesos pendientes, podés actualizar para ver los cambios o continuar sin las últimas novedades.',
                type: MessageType.Info
              } as MessageAtributtes;
              
              const t = this._bottomSheet.open(GenericBottomSheetComponent, { data: parameters, disableClose: true });
              t.instance.close.subscribe((response: boolean) => {
              });
            }
          },
          (err) => {
            this.msjService.showError(err);
          });

        this.getContainer();
      },
      (err) => this.msjService.showError(err)
    );
  }

  maskSplited(mask: string) {
    let masksplited = mask.split("||")
    if (masksplited.length > 1) {
      //Las mascaras de Id Fiscales cuando son mas de una por pais, al ser de distintas longitudes y estar ordenadas de menor a mayor longitud, 
      //siempre elijo la mayor que queda en la ultima posicion del arreglo
      let i = masksplited.length - 1;
      return masksplited[i];
    }
    return mask;
  }

  filteredSearch() {
    this.getContainer();
  }

  onClickSelectSet(set: DocumentationTypeSet) {
    this.pageIndex = 1;
    this.selectedSet = set
    this.loadPeopleAffected(set,false)
  }

  searchByPersonField(a) {
    this.pageIndex = 1
    this.selectedPageChanged(a)
  }

  selectedPageChanged(a) {
    
    this.loadPeopleAffected(this.selectedSet)
    this.showDetail = false;
    this.active = false;
    this.showDocumentsSet=false;
  }

  loadPeopleAffected(set: DocumentationTypeSet, hasActive : boolean = true) {
    
    this.empFiscalIdMask = this.organizationalUnits.find(x => x.id === set.organizationalUnitId).country.fiscalIdMask;    
    let findParameters: DocumentationSetDetailFind;
    let index = 1;
    // calculo index
    if(this.pageIndex != undefined && this.pageIndex != null && this.pageIndex != 1)
      index = ((this.pageIndex-1) * 15) + 1;
    // seteo parametros find
    findParameters = {
      active: hasActive ? this.hasActive() : null,
      index: index,
      page: this.pageIndex ?? 1,
      itemPerPage: 15,
      isPaged: true,
      setId:set.id,
      organizationalUnitId:set.organizationalUnitId,
      completeDocumentation:this.completeDoc,
      inCompleteDocumentation:this.incompleteDoc,
      withOutDocumentation:this.withOut,
      requiredDocumentation:this.requiredDocumentation,
      norequiredDocumentation:this.norequiredDocumentation,
      searchField: this.searchPersonField?.replace(/-/g,'').toLowerCase() ?? ''
    };

    this.peopleLoader = true;
    this.documentationTypeSetSelected = set;
    var resp = this.documentationTypeSetSvc
      .getDocumentSetDetailInfo(findParameters)
      .toPromise()
      .then(

        (data : any) => {
          this.analyticsDocumentSet = new AnalyticsDocumentSet();
          this.analyticsDocumentSet.people = data.values;
          this.analyticsDocumentSet.allpeople = data.totalvalues;
          this.itemsCount = data.total;
          this.peopleLoader = false;
          this.showPeopleList = !this.showPeopleList;
          this.showPeople();
          this.disabledNotifAll = (this.validateNotifAll(this.analyticsDocumentSet.people) && (this.enabledFilter && this.disabledFilter ||   !this.disabledFilter));   
        },
        (err) => {
          this.msjService.showError(err);
          this.peopleLoader = false;
          this.showPeopleList = !this.showPeopleList;
        });
  }

  selectDocumentSet(set: DocumentationTypeSet) {    
    this.documentationTypeSetSelected = set;
    this.innerLoader = true;
    this.showPeopleList = false;    
    var resp = this.documentationTypeSetSvc
      .getDocumentSetInfo(set)
      .toPromise()
      .then(
        (res) => {
          this.analyticsDocumentSet = res;
          this.showSetDetail = true;
          this.innerLoader = false;
          this.loadPeopleAffected(set);          
        },
        (err) => {
          this.msjService.showError(err);
          this.showSetDetail = false;
          this.innerLoader = false;
        }
      );
  }

  ngOnChanges(changes) { }

  changeView(view: KeyValuePair<string, string>) {
    this.router.navigate([view.value, this.selectedOrganizationalUnit.id]);
  }

  getContainer() {
    this.organizationalUnitService.setCurrentOU(
      this.selectedOrganizationalUnit
    );
    this.loading = true;
    return this.containerTypeService
      .getContainerType(this.selectedOrganizationalUnit.id.toString())
      .toPromise()
      .then((containerType) => {
        this.containerType = containerType;
        this.search();
      })
      .catch((err) => {
        this.loading = false;
        this.msjService.showError(err);
      });
  }

  changeOu() {

    const previousOu = this.organizationalUnitService.getCurrentOrChildOU();
    if (
      this.selectedOrganizationalUnit &&
      this.selectedOrganizationalUnit.id != null
    ) {
      this.organizationalUnitService.setCurrentOU(
        this.selectedOrganizationalUnit
      );
      if (previousOu && previousOu.id !== this.selectedOrganizationalUnit.id) {
        this.getContainer();
      }
    }
  }

  hasActive(): boolean | null {
    if (this.enabledFilter && !this.disabledFilter) {
      return true;
    }

    if (!this.enabledFilter && this.disabledFilter) {
      return false;
    }

    return null;
  }

  search() {    
    var enableFilter = null
    if(this.activeSet && !this.inactiveSet) enableFilter = true
    if(!this.activeSet && this.inactiveSet) enableFilter = false
    this.loading = true;
    this.documentationTypeSetSelected = null;
    const findParameters = {
      organizationalUnitId:
        this.organizationalUnitService.getCurrentOrChildOU().id,
      searchField: this.searchField,
      completeDocumentation:this.completeDoc,
      inCompleteDocumentation:this.incompleteDoc,
      withOutDocumentation:this.withOut,
      requiredDocumentation:this.requiredDocumentation,
      norequiredDocumentation:this.norequiredDocumentation
    };
    
    this.documentationTypeSetSvc
      .getHeaderMetrics(findParameters)
      .toPromise()
      .then((data) => {
        this.documentationTypeSets = data.filter(x => x.metricsSet?.candidateCount > 0).map(m=>m); 
        this.analyticsDocumentSet = null;
        this.loading = false;
      })
      .catch((err) => this.msjService.showError(err))
      .then(() => (this.loading = false));
  }

  notifToCandidate(person: AnalyticsDocumentSetPerson) {

    this.dto.userId = person.userId.toString();
    this.notificationService.notifPendingAction(this.dto).toPromise().then(
      () => {
        this.msjService.showInfo('Se ha notificado al candidato exitosamente');

      },

      error => { this.msjService.showError(error); }

    );
  }

  notifToAllCandidates() {
    this.UserIds = this.analyticsDocumentSet.people.filter(f=>f.selected).map(m=>m.userId);
    if(this.UserIds.length==0)
    {
      this.UserIds = this.analyticsDocumentSet.allpeople
        .filter(r => r.percentage < 100 && r.totalDocuments > 0)
        .map(x => x.userId);
      if(this.UserIds.length==0)
      {
        this.msjService.showError("No posee Candidatos para notificar")
      }

      this.notificationService.notifPendingMassiveAction(this.UserIds).toPromise().then(
        () => {
          this.msjService.showInfo('Se ha notificado a todos los candidatos exitosamente');
        },
        error => this.msjService.showError(error)
      );
    }
    else
    {
      this.notificationService.notifPendingMassiveAction(this.UserIds).toPromise().then(
        () => {
          this.msjService.showInfo('Se ha notificado exitosamente a los candidatos seleccionados ');
          this.disabledChecked();
        },
        error => this.msjService.showError(error));
    }
  }
    //para el mock borrar de ser necesario
    closeDetail() {
      this.showDetail = false;
      this.active = false;
      this.showDocumentsSet=false;
    }

    showDocuments(person: AnalyticsDocumentSetPerson) {            
      if(person.totalDocuments > 0) {
        this.loadingDocument = true;
        this.IncompleteDocuments=[];
        this.completeDocuments=[];
        this.candidate = person;
        this.completeDocuments = person.documents.filter(f=>f.isFinished).map(x=>x);
        this.documentationTypeSetSvc.getSetbyId(this.documentationTypeSetSelected)
        .toPromise().then(set => {   
        this.loadingDocument = false;        
          this.completeDocuments.forEach(element => {
            var r = set.documentationTypeSetItem
            .find(x=>x.documentationTypeId==element.idDocumentacion);
            if(r != undefined){
            element.required = r.required;
            }
        });
    
          this.IncompleteDocuments = person.documents.filter(f=>!f.isFinished).map(x=>x);
          this.IncompleteDocuments.forEach(element => {
            var r = set.documentationTypeSetItem                     
            .find(x=>x.documentationTypeId==element.idDocumentacion);
            if(r != undefined){
              element.required = r.required;
              }
          });
        });

        this.showDetail = true;
        this.active = true;
        this.showDocumentsSet = true;
      }else{
          this.IncompleteDocuments=[];
          this.completeDocuments=[];
          this.candidate = person;
          this.showDetail = false;
        //  this.refreshProgressBarSet();
      }
    }

    goBackSets() {
      this.showSets = true;
      this.active = false;
      this.showDetail = false;
    }

    errorStatus() {
      return !this.activeSet && !this.inactiveSet;
    }

    errorFilterDocu() {
      return !this.completeDoc && !this.incompleteDoc && !this.withOut;
    }
    errorFilterRiquired(){
      return !this.requiredDocumentation && !this.norequiredDocumentation;
    }
    errorValidate() {
      return (this.errorStatus() || this.errorFilterDocu() || this.errorFilterRiquired());
    } 

    showPeople() {
      this.showSets = false;
      this.showDetail = false;
    }

    getpercentageInComplete(set:DocumentationTypeSet)
    {
      if(set.metricsSet?.candidateInCompleteDocumentsCount == null)
      {
        return "0 %";
      }

      var per = ((set.metricsSet.candidateInCompleteDocumentsCount/set.metricsSet.candidateCount)*100).toString()
      var result = `${per}%`
     return result;
    }

    getpercentageComplete(set:DocumentationTypeSet)
    {
      if(set.metricsSet?.candidateCompleteDocumentsCount == null)
      {
        return "0 %";
      }
      var per = ((set.metricsSet.candidateCompleteDocumentsCount/set.metricsSet.candidateCount)*100).toString()
      var result = `${per}%`
     return result;
    }

    getpercentageWithOut(set:DocumentationTypeSet)
    {
      if(set.metricsSet?.candidateWithOutDocumentsCount == null)
      {
        return "0 %";
      }

      var per = ((set.metricsSet.candidateWithOutDocumentsCount/set.metricsSet.candidateCount)*100).toString()
      var result = `${per}%`
     return result;
    }

    selectAllToogle() {
      if (this.analyticsDocumentSet.people) {
        this.analyticsDocumentSet.people.forEach(person => {
          if(person.totalDocuments > 0 && person.percentage < 100){
          person.selected = this.allSelected;
          }
        });
      }
    }

    viewDocument(documentId: number) {
      
      const results = [];
      this.disableButton = true;
      results.push(this.fileDocumentService.getCollaboration(documentId,this.selectedOrganizationalUnit.id).toPromise());
      results.push(this.fileDocumentService.getSignatures(documentId).toPromise());

      Promise.all(results).then(promises =>{
      this.fileDocumentService.getDocumentDetail(documentId).toPromise()
        .then(res => {
          const dialogData = new EmployeeFileDocumentDialogData();
          dialogData.doc = res;
          promises[0].forEach((colaboracion) => {
            if (colaboracion.userId != null) {
               dialogData.doc.employeeCollaborationData = this.LoadColaboracion(
                colaboracion,
                promises[1],
                true,
                dialogData.doc.employeeCollaborationData);
            }
            else
            {
              dialogData.doc.lawyerCollaborationData = this.LoadColaboracion(
                colaboracion,
                promises[1],
                false,
                dialogData.doc.employeeCollaborationData);
            }
        });
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
              // height: '800px',
              // width: '1024px',
              data: dialogData
            });

            dialogRef.afterClosed().subscribe(result => {
              this.clickOnce = false;
              this.disableButton = false;
              if (result) {
                //Pregunto si se elimino o rechazo un documento para recargar la grilla
                if (result.documentEliminated || result.documentRejected) {
                  this.rechargeAfterCloseDialog();
                }
              }
            });
          })
          .catch(error => {
            this.clickOnce = false;
          });
        });   
    }

    private LoadColaboracion(
      colaboracion: any,
      documentFileSignature: any,
      employeeSignature: boolean,
      previousData?: FileDocumentCollaborationData
    ): FileDocumentCollaborationData {
      const data = previousData
        ? previousData
        : new FileDocumentCollaborationData();
      const now = new Date();

      if (colaboracion.action && colaboracion.action.enabled) {
        data.enabled = colaboracion.action.enabled;
      }

      if (colaboracion.fechaPrimeraColaboracion != null) {
        const date = new Date(
          colaboracion.fechaPrimeraColaboracion
        );
        data.viewDate =
          data.viewDate && data.viewDate > date ? data.viewDate : date;
      }
      if (colaboracion.action == null) {
        data.requiredSignature = false;
      } else {
        if (colaboracion.action.action !== "UPLOAD") {
          if (data.enabled != false) {
            data.requiredSignature = true;
          }

          if (colaboracion.action?.fechaPrimerUso != null) {
            data.signatureDate = new Date(
              colaboracion.action?.fechaPrimerUso
            );
            data.signatureState = "firmado"; // por defecto sino esta la info de firma
            // Debo buscar la informacion de la firma
            if (employeeSignature) {
              if (documentFileSignature != null) {
                let breakLoop = false;
                documentFileSignature.forEach((dfs) => {
                  if (!breakLoop) {
                    if (dfs.userid === colaboracion.userid) {
                      if (dfs.signatureResult === "C" || dfs.signatureResult === "c") {
                        data.signatureState = "firmado-conforme";
                      } else {
                        data.signatureState = "firmado-no-conforme";
                        breakLoop = true;
                      }
                    } else if (dfs.isExternal && dfs.signatureResult) {
                      if (dfs.signatureResult === "C" || dfs.signatureResult === "c") {
                        data.signatureState = "firmado-conforme";
                      }

                      if (dfs.signatureResult === "NC" || dfs.signatureResult === "nc") {
                        data.signatureState = "firmado-no-conforme";
                        breakLoop = true;
                      }
                    }
                  }
                });
              }
            }
          } else {
            if (colaboracion.action?.requiredSignature) {
              data.error = colaboracion.action.requiredSignature;
            }
            data.signatureState = "no-firmado";
          }
        } else {
          data.uploaded = colaboracion.action?.fechaPrimerUso != null;
          if (colaboracion.action.fechaPrimerUso != null) {
            data.uploadDate = new Date(
              colaboracion.action?.fechaPrimerUso
            );
          }
        }
      }
      return data;
    }

    private rechargeAfterCloseDialog()
    {
      let findParameters: DocumentationSetDetailFind;
      let index = 1;
      // calculo index
      if(this.pageIndex != undefined && this.pageIndex != null && this.pageIndex != 1)
      index = ((this.pageIndex-1) * 15) + 1;
      // seteo parametros find
      findParameters = {
        index: index,
        page: this.pageIndex ?? 1,
        itemPerPage: 15,
        isPaged: true,
        setId:this.documentationTypeSetSelected.id,
        organizationalUnitId:this.documentationTypeSetSelected.organizationalUnitId,
        completeDocumentation:this.completeDoc,
        inCompleteDocumentation:this.incompleteDoc,
        withOutDocumentation:this.withOut,
        requiredDocumentation:this.requiredDocumentation,
        norequiredDocumentation:this.norequiredDocumentation,
        active: this.hasActive(),
        searchField: this.searchPersonField?.replace(/-/g,'').toLowerCase() ?? ''
      };

      this.peopleLoader = true;
      this.refreshPeopleList(findParameters);
    }


    refreshPeopleList(findParameters: DocumentationSetDetailFind){
        var resp = this.documentationTypeSetSvc
        .getDocumentSetDetailInfo(findParameters)
        .toPromise()
        .then(
          (data : any) => {
            this.analyticsDocumentSet = new AnalyticsDocumentSet();
            this.analyticsDocumentSet.people = data.values;
            this.analyticsDocumentSet.allpeople = data.totalvalues;
            this.itemsCount = data.total;
            this.peopleLoader = false;
            this.showPeopleList = !this.showPeopleList;
            this.showPeople();
            this.refreshDocumentDetail(this.analyticsDocumentSet.allpeople);
          },
          (err) => {
            this.msjService.showError(err);
            this.peopleLoader = false;
            this.showPeopleList = !this.showPeopleList;
          }
        );
    }

    refreshProgressBarSet()
    {
      var resp = this.documentationTypeSetSvc
      .getMetricSet(this.documentationTypeSetSelected)
      .toPromise()
      .then(
        (res) => {
          this.documentationTypeSetSelected.metricsSet=res;
        },
        (err) => {
          this.msjService.showError(err);
        }
      );
    }

    refreshDocumentDetail(people: AnalyticsDocumentSetPerson[])
    {
        var person = people.find(o=> o.userId == this.candidate.userId);

        if(person != undefined && person.totalDocuments > 0)
        {
          this.showDocuments(person);
        }
        else
        {
          if(people.length == 0){
              this.refreshSets();
          }
          else
          {
              this.refreshProgressBarSet();
              this.showDetail=false;
          }
        }
    }

    refreshSets()
    {
      this.goBackSets();
      this.getContainer();
    }

    styleRow(person: AnalyticsDocumentSetPerson): Object {
      if (person.totalDocuments == 0){
          return {'disabled':person.disabled}
      }
      return {'selected':person.selected}
  }
  private disabledAllChecked()
  {
    return this.analyticsDocumentSet.allpeople
    .filter(r => r.percentage < 100 && r.totalDocuments > 0)
    .map(x => x.userId).length == 0;
  }
  disabledChecked()
  {
    this.analyticsDocumentSet.people.forEach(item=>{item.selected = false;})
  }

  personSearch() {    
    this.loadPeopleAffected(this.documentationTypeSetSelected);
  }
  validateNotifAll(people: AnalyticsDocumentSetPerson[]):boolean
  {      
    var person = people.filter(x => x.documents.length > 0 && x.percentage < 100).map(p=>p);
    if(person.length > 0){
 
        return true;
    }
    else
    {
      return false;
    }
  }
}
