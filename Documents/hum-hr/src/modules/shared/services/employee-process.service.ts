import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { AppConfig } from "../../../app.config";
import { EmployeeProcess } from "../models/employee-process.model";
import { map, catchError } from "rxjs/operators";
import { Observable, throwError, BehaviorSubject } from "rxjs";
import { IPagedModel } from "../models/paged.model.";
import { GroupPeriod } from "../models/GroupPeriod.models";

@Injectable()
export class EmployeeProcessService {
  url = AppConfig.settings.apiUrls.wf;
  processList = new BehaviorSubject<EmployeeProcess[]>([]);
  selectedPeriod: GroupPeriod = GroupPeriod.Actual;

  constructor(private http: HttpClient) { }

  mapResponse(res: IPagedModel<EmployeeProcess>): EmployeeProcess[] {
    const response: EmployeeProcess[] = [];
    if (!res.values) {
      return response;
    }

    res.values.forEach(process => {
      response.push(this.mapSingleResponse(process));
    });

    this.processList.next(response);
    return response;
  }

  mapSingleResponse(res: EmployeeProcess): EmployeeProcess {
    let response: EmployeeProcess;
    if (!res) {
      return response;
    }

    response = new EmployeeProcess(
      res.id,
      res.name,
      res.organizationalUnitId,
      res.organizationalUnitName,
      res.processTypeId,
      res.processTypeName,
      res.stateId,
      res.stateName,
      res.stateAlias,
      res.stateDate,
      res.stateOwnerEdit,
      res.metadataValues,
      res.files,
      res.viewedDate
    );

    return response;
  }

  subscribeToProcessList() {
    return this.processList.asObservable();
  }

  refreshOneProcess(process: EmployeeProcess): void {
    const response: EmployeeProcess[] = [];

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

  refreshMyProcess(): Observable<EmployeeProcess[]> {
    const periodFilter = {
      metadataSystemName: "_peri",
      metadataValueFrom: undefined,
      metadataValueTo: undefined,
      metadataSearchTypeFrom: undefined,
      metadataSearchTypeTo: undefined
    };

    switch (this.selectedPeriod) {
      case GroupPeriod.Actual:
        periodFilter.metadataValueFrom = new Date().getFullYear() + "01";
        periodFilter.metadataSearchTypeFrom = "GreaterThanOrEqual";
        break;
      case GroupPeriod.Pasado:
        periodFilter.metadataValueFrom = new Date().getFullYear() - 1 + "01";
        periodFilter.metadataValueTo = new Date().getFullYear() - 1 + "12";
        periodFilter.metadataSearchTypeFrom = "GreaterThanOrEqual";
        periodFilter.metadataSearchTypeTo = "LessThanOrEqual";
        break;
      case GroupPeriod.Anterior:
        periodFilter.metadataValueTo = new Date().getFullYear() - 2 + "12";
        periodFilter.metadataSearchTypeTo = "LessThanOrEqual";
        break;
    }

    const param = {
      processStatesIds: [
        "109",
        "114",
        "112",
        "116",
        "117",
        "118",
        "101",
        "110"
      ],
      processTypeId: "3",
      sortByField: "mvs.fv._peri",
      metadatas: [periodFilter]
    };

    return this.http
      .put<IPagedModel<EmployeeProcess>>(
        `${this.url}/ProcessesCustomer/Find`,
        param
      )
      .pipe(map(res => this.mapResponse(res)));
  }

  getProcessDetail(id: string): Observable<EmployeeProcess> {
    return this.http
      .get<EmployeeProcess>(`${this.url}/ProcessesCustomer/` + id)
      .pipe(map(res => this.mapSingleResponse(res)));
  }

  getPendingProcessTotal(): Observable<number> {
    const param = {
      processStatesIds: [
        "109",
        "114",
        "112",
        "116",
        "117",
        "118",
        "101",
        "110"
      ],
      processTypeId: "3"
    };

    return this.http
      .put<number>(`${this.url}/ProcessesCustomer/GetPending`, param);
  }

  sign(process: EmployeeProcess): Promise<EmployeeProcess> {
    return new Promise<EmployeeProcess>((res, rej) => {
      this.checkOut(process.id)
        .toPromise()
        .then(
          () => {
            this.modifyAndSend(process)
              .toPromise()
              .then(
                doc => {
                  res(doc);
                  return;
                },
                err => {
                  rej(err);
                  return;
                }
              );
          },
          err => {
            rej(err);
            return;
          }
        );
    });
  }

  signNacion = function SignDocument(
    process: EmployeeProcess,
    urlCallback: string
  ): Observable<any> {
    const params = {
      urlRedirect: urlCallback,
      certificateId: process.certificateId,
      agreement: process.signedState,
      motive: process.motiveDisagreement
    };
    return this.http.get(`${this.url}/filesGob/SignNacion/${process.id}`, {
      params: params
    });
  };

  modifyAndSend(process: EmployeeProcess): Observable<EmployeeProcess> {
    return this.http.put<EmployeeProcess>(
      `${this.url}/ProcessesCustomer/ModifyAndSend`,
      process
    );
  }

  checkOut(processId: string): Observable<EmployeeProcess> {
    return this.http.put<EmployeeProcess>(
      `${this.url}/ProcessesCustomer/Checkout/` + processId,
      processId
    );
  }

  setSelectedPeriod(period: GroupPeriod) {
    this.selectedPeriod = period;
  }

  execute(processId: string): Observable<EmployeeProcess> {
    return this.http.put<EmployeeProcess>(
      `${this.url}/Processes/execute/` + processId,
      processId)
      .pipe(map(res => this.mapSingleResponse(res)));
  }
}
