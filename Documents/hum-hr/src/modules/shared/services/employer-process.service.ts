import { ResultItem } from './../models/process-result-item.model';
import { ResultTotals } from './../models/result-totals.model';
import { Injectable, EventEmitter } from '@angular/core';
import { AppConfig } from 'src/app/app.config';
import { DeferedProcess, ProcessType } from '../models/defered-process.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { IPagedModel } from '../models/paged.model.';
import { map } from 'rxjs/operators';
import { GroupState } from '../models/GroupState.models';
import { DeferedProcessLog } from '../models/defered-process-log.model';
import { DeferedProcessLogFind } from '../models/defered-process-log-find.model';
import { ProcessResultItemFind } from './../../shared/models/process-resultItem-find.model';
import { OrganizationalUnitService } from './organizational-unit.service';
import { Subscription } from 'rxjs/internal/Subscription';

@Injectable({
  providedIn: 'root'
})
export class EmployerProcessService {
  cppUrl = AppConfig.settings.apiUrls.cpp;
  processList = new BehaviorSubject<DeferedProcess[]>([]);
  selectedState: GroupState = GroupState.EnProceso;
  params: IPagedModel<GroupState>;
  currentPage = 1;
  invokeInboxDeleteProcess = new EventEmitter();
  subsVar: Subscription;
  roles: string;
  constructor(private http: HttpClient,
    private ouService: OrganizationalUnitService) {
    this.params = {} as IPagedModel<GroupState>;
  }

  mapResponse(res: IPagedModel<DeferedProcess>): DeferedProcess[] {
    const response: DeferedProcess[] = [];
    if (!res.values) {
      return response;
    }
    res.values.forEach(process => {
      response.push(this.mapSingleResponse(process));
    });

    this.processList.next(response);
    return response;
  }

  setSelectedState(state: GroupState) {
    this.selectedState = state;
  }

  mapSingleResponse(res: DeferedProcess): DeferedProcess {
    let response: DeferedProcess;
    if (!res) {
      return response;
    }
    const allOus = this.ouService.getTreeOu();
    response = new DeferedProcess();
    response.id = res.id;
    response.creationDate = res.creationDate;
    response.createdByUserName = res.createdByUserName;
    response.stateId = res.stateId;
    response.stateName = res.stateName;
    response.processTypeId = res.processTypeId;
    response.processTypeName = res.processTypeName;
    response.priority = res.priority;
    response.organizationalUnitId = res.organizationalUnitId;
    response.organizationalUnitName = res.organizationalUnitName;
    response.total = res.total;
    response.history = res.history;
    response.files = res.files;
    response.zipBase64 = res.zipBase64;
    response.data = res.data;
    response.isPurged = res.isPurged;
    response.purgedDate = res.purgedDate;    
    if (res.data != null) {
      if (res.processTypeId == ProcessType.ALTA_DOCUMENTACION
        || res.processTypeId == ProcessType.ALTA_DOCUMENTACION_IDENTIFICACION_AUTOMATICA
        || res.processTypeId == ProcessType.ALTA_RECIBOS_FIRMADOS_HUSIGNERPRO
        || res.processTypeId === ProcessType.FIRMA_DOCUMENTOS_HUSIGNERPRO) {
        response.organizationalUnitIdDestination = res.data.organizationalUnitId;

        if (res.data.organizationalUnitId) {
          response.OUNameDestination = allOus?.find(z => z.id === res.data.organizationalUnitId)?.name || '';
        } else {
          const organizationalUnitId = res.data.parameters[0][0]?.organizationalUnitId;
          response.OUNameDestination = allOus?.find(z => z.id === organizationalUnitId)?.name || '';
        }
        response.documentationType = res.data.documentationTypeSelected;
      }
      if (res.processTypeId == ProcessType.ALTA_EMPLEADO || res.processTypeId == ProcessType.ALTA_CANDIDATO) {
        if (res.data.parameters != null ) {
          //en la posición 2 del array parameters se encuentre el ouID de la empresa hija
            response.OUNameDestination = (allOus != null && allOus.find(z => z.id == res.data.parameters[2].ouId) != null) ? allOus.find(z => z.id == res.data.parameters[2].ouId).name : '';
        }
      }
    }
    const files = res.files.filter(f => f.isDownloadable);
    response.hasErrors = (files.length > 0) || res.hasErrors;

    return response;
  }

  subscribeToProcessList() {
    return this.processList.asObservable();
  }

  refreshOneProcess(process: DeferedProcess): void {
    const response: DeferedProcess[] = [];

    this.processList.getValue().forEach(p => {
      if (p.id === process.id) {
        response.push(process);
      } else {
        response.push(p);
      }
    });

    this.processList.next(response);
    return;
  }

  refreshMyProcessWithCurrentStage(itemsPerPage?: number, isPaged = false): Observable<DeferedProcess[]> {
    if (isPaged) {
      this.params.itemPerPage = itemsPerPage;
      this.params.page = this.currentPage;
    }
    this.params.values = this.selectedState == GroupState.Terminado ? [this.selectedState, GroupState.Eliminado, GroupState.Limbo, GroupState.InDeleted] : [this.selectedState, GroupState.Ingresado, GroupState.Agendado, GroupState.Pausado, GroupState.PorPausar];
    return this.refreshMyProcess(this.params);
  }

  private refreshMyProcess(model: IPagedModel<GroupState>): Observable<DeferedProcess[]> {

    const param = {
      processStatesIds: model.values,
      processTypeId: this.buildProcessTypeIds(),
      itemPerPage: model.itemPerPage,
      page: model.page
    };

    return this.http
      .put<IPagedModel<DeferedProcess>>(
        `${this.cppUrl}/Processes/Find`,
        param
      )
      .pipe(map(res => this.mapResponse(res)));
  }

  getProcessDetail(id: string): Observable<DeferedProcess> {
    return this.http
      .get<DeferedProcess>(`${this.cppUrl}/Processes/` + id)
      .pipe(map(res => this.mapSingleResponse(res)));
  }

  getProcessLogs(filters: DeferedProcessLogFind): Observable<IPagedModel<DeferedProcessLog>> {
    return this.http
      .get<any>(
        `${this.cppUrl}/ProcessLogs/ByProcess?itemsPerPage=${filters.itemsPerPage}&orderBy=${filters.orderBy}&page=${filters.page}&processId=${filters.processId}&sortOrder=${filters.sortOrder}`
      )
      .pipe(map(res => {
        return {
          values: res.value.values,
          page: res.value.page,
          itemPerPage: res.value.itemPerPage,
          total: res.value.count
        };
      }));
  }

  getProcessResultsTotals(processId: string): Observable<ResultTotals> {
    return this.http
      .get<any>(
        `${this.cppUrl}/ProcessLogs/${processId}`
      )
      .pipe(map(res => {
        return res;
      }));
  }

  getProcessResultsItems(filters: ProcessResultItemFind): Observable<IPagedModel<ResultItem>> {
    return this.http
      .get<any>(
        `${this.cppUrl}/ProcessLogs/items?itemsPerPage=${filters.itemsPerPage}&orderBy=${filters.orderBy}&page=${filters.page}&processId=${filters.processId}&sortOrder=${filters.sortOrder}&searchValue=${filters.searchValue}&onlyErrors=${filters.onlyErrors}`
      )
      .pipe(map(res => {
        return {
          values: res.values,
          page: res.page,
          itemPerPage: res.itemPerPage,
          total: res.count
        };
      }));
  }

  createProcess(process: DeferedProcess, files?: File[]): Observable<DeferedProcess> {
    if (files && files.length > 0) {
      const formData: FormData = new FormData();
      formData.append('process', JSON.stringify(process));

      for (let index = 0; index < files.length; index++) {
        const file = files[index];
        formData.append(file.name, file, file.name);
      }

      return this.http.post<DeferedProcess>(
        `${this.cppUrl}/person/Import`,
        formData
      );
    }

    return this.http.post<DeferedProcess>(
      `${this.cppUrl}/person/Import`,
      process
    );
  }

  reprocessProcess(processId: string): Observable<DeferedProcess> {
    return this.http.put<DeferedProcess>(
      `${this.cppUrl}/Processes/reProcess/` + processId,
      processId
    );
  }

  getFile(fileId: string): Observable<any> {
    return this.http.get(`${this.cppUrl}/Processes/Download/${fileId}`);
  }

  getMoreResults(itemsPerPage: number): Observable<DeferedProcess[]> {
    this.currentPage++;
    return this.refreshMyProcessWithCurrentStage(itemsPerPage, true);
  }

  freshRefresh(itemsPerPage: number) {

    this.currentPage = 1;
    return this.refreshMyProcessWithCurrentStage(itemsPerPage, true);
  }

  setCurrentPage(currentPage: number) {
    this.currentPage = currentPage;
  }

  exportErrorsProcess(id: string) {
    return this.http.get(`${this.cppUrl}/ProcessLogs/Export/${id}`);
  }
  getFileZip(fileId: string): Observable<any> {
    return this.http.get(`${this.cppUrl}/Processes/DownloadProcess/${fileId}`);
  }

  onDeleteButtonClick() {
    this.invokeInboxDeleteProcess.emit();
  }

  getPendingProcessMetricSet(ouid : number): Observable<DeferedProcess[]> {
    const param = {
      organizationalUnitId: ouid,
      processStatesIds: [
        "001",
        "002",
      ],
      processTypeId: [
        "011"
      ],
      itemPerPage: 15,
      page: 1
    };
    return this.http
      .put<IPagedModel<DeferedProcess>>(
        `${this.cppUrl}/Processes/Find`,
        param
      )
      .pipe(map(res => this.mapResponse(res)));
  }

  getPendingSignProcess(ouid : number, itemPerPage: number): Observable<DeferedProcess[]> {
    const param = {
      aboutMassiveSignatures:true,
      organizationalUnitId: ouid,
      processStatesIds: [
        "002",
      ],
      processTypeId: [
        "008"
      ],
      itemPerPage: itemPerPage,
      page: 1
    };
    return this.http
      .put<IPagedModel<DeferedProcess>>(
        `${this.cppUrl}/Processes/Find`,
        param
      )
      .pipe(map(res => this.mapResponse(res)));
  }

buildProcessTypeIds()
{
  let processTypeIds: ProcessType[] = [];
  let arr = this.roles.split(",");
  arr.forEach(a =>{
    switch (a)
    {
      case "RRHH_ACCESS":
      processTypeIds.push(ProcessType.ALTA_EMPLEADO);
        break;
        case "RRHH_CONTENT":
        processTypeIds.push(ProcessType.ALTA_DOCUMENTACION);
        processTypeIds.push(ProcessType.ALTA_DOCUMENTACION_IDENTIFICACION_AUTOMATICA);
        processTypeIds.push(ProcessType.ALTA_RECIBOS_FIRMADOS_HUSIGNERPRO);
        processTypeIds.push(ProcessType.FIRMA_DOCUMENTOS_HUSIGNERPRO);
        break;
        case "RRHH_DOCUMENTS":
        processTypeIds.push(ProcessType.ALTA_DOCUMENTACION);
        processTypeIds.push(ProcessType.ALTA_DOCUMENTACION_IDENTIFICACION_AUTOMATICA);
        processTypeIds.push(ProcessType.ALTA_RECIBOS_FIRMADOS_HUSIGNERPRO);
        processTypeIds.push(ProcessType.FIRMA_DOCUMENTOS_HUSIGNERPRO);
        break;
        case "ADMIN_CANDIDATE_BASIC":
        processTypeIds.push(ProcessType.ALTA_CANDIDATO);
        break;
        case "CANDIDATEADMIN":
        processTypeIds.push(ProcessType.ALTA_CANDIDATO);
        break;
      }
  });

  return processTypeIds;
}
}
