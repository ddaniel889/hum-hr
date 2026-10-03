import { inject, Injectable } from "@angular/core";
import { BehaviorSubject, Observable, of, Subject, timer } from "rxjs";
import {
  catchError,
  filter,
  finalize,
  map,
  switchMap,
  takeUntil,
} from "rxjs/operators";
import {
  HistoryProcessOrchestrationDto,
  OngoingProcessOrchestrationDto,
  PaginationInfo,
  PaginatedParams,
  PaginatedResponse,
  ProcessDetailParams,
  ProcessOrchestratorDto,
  ProcessOrchestratorResultDetailDto,
  ProcessSearchParams,
  OngoingParams,
} from "../models/deferred-processes.model";
import { HttpClient, HttpParams } from "@angular/common/http";
import { AppConfig } from "src/app/app.config";
import { OrganizationalUnitService } from "src/app/modules/shared/services/organizational-unit.service";
import { UntypedFormBuilder, UntypedFormGroup } from "@angular/forms";
import { MessageService } from "src/app/modules/shared/errorHandler/message.service";
import { NavigationStart, Router } from "@angular/router";

type RequestType =
  | "ongoing"
  | "history"
  | "process"
  | "processDetail"
  | "relatedProcess";

@Injectable()
export class DeferredProcessesService {
  private readonly isLoading = new BehaviorSubject<number>(0);
  private readonly inCourse = new BehaviorSubject<
    OngoingProcessOrchestrationDto[]
  >(null);
  private readonly history = new BehaviorSubject<
    HistoryProcessOrchestrationDto[]
  >(null);
  private readonly historyPagination = new BehaviorSubject<PaginationInfo>(
    null
  );
  private readonly process = new BehaviorSubject<ProcessOrchestratorDto>(null);
  private readonly processDetail = new BehaviorSubject<
    ProcessOrchestratorResultDetailDto[]
  >(null);
  private readonly processDetailPagination =
    new BehaviorSubject<PaginationInfo>(null);
  private readonly relatedProcess =
    new BehaviorSubject<ProcessOrchestratorResultDetailDto>(null);

  isLoading$ = this.isLoading.asObservable();
  inCourse$ = this.inCourse.asObservable();
  history$ = this.history.asObservable();
  historyPagination$ = this.historyPagination.asObservable();
  process$ = this.process.asObservable();
  processDetail$ = this.processDetail.asObservable();
  processDetailPagination$ = this.processDetailPagination.asObservable();
  relatedProcess$ = this.relatedProcess.asObservable();

  historyParamsForm: UntypedFormGroup;
  processDetailParamsForm: UntypedFormGroup;

  private readonly http = inject(HttpClient);
  private readonly _formBuilder = inject(UntypedFormBuilder);
  private readonly organizationalUnitService = inject(
    OrganizationalUnitService
  );
  private readonly messageService = inject(MessageService);
  private readonly stopPolling = new Subject();
  private readonly cancelRequest = new Subject<RequestType>();
  private readonly DEFAULT_POLLING_TIME = 30000;
  private readonly url = AppConfig.settings.apiUrls.cpp;

  constructor(private readonly router: Router) {
    this.historyParamsForm = this.createHistoryParamForm();
    this.processDetailParamsForm = this.createProcessDetailParamsForm();

    this.router.events.subscribe((val) => {
      if (val instanceof NavigationStart) {
        if (!val.url.includes("/employer/deferred-processes")) {
          this.clearData();
        }
      }
    });
  }

  clearData() {
    this.history.next(null);
    this.historyPagination.next(null);
    this.process.next(null);
    this.processDetail.next(null);
    this.processDetailPagination.next(null);
    this.resetHistoryParamForm();
    this.resetProcessDetailParamsForm();
  }

  loadAllProcesses() {
    this.startPollingOngoingProcesses();
    this.startPollingHistoryProcesses();
  }

  refreshAllProcesses() {
    this.inCourse.next(null);
    this.historyPagination.next(null);
    this.history.next(null);
    this.loadHistoryProcesses();
    this.ongoingProcesses$().subscribe((res) => this.inCourse.next(res));
  }

  startPollingOngoingProcesses(pollingTime = this.DEFAULT_POLLING_TIME): void {
    timer(0, pollingTime)
      .pipe(
        takeUntil(this.stopPolling),
        switchMap(() => this.ongoingProcesses$())
      )
      .subscribe((res) => this.inCourse.next(res));
  }

  startPollingHistoryProcesses(pollingTime = this.DEFAULT_POLLING_TIME): void {
    timer(0, pollingTime)
      .pipe(
        takeUntil(this.stopPolling),
        switchMap(() => this.historyProcesses$())
      )
      .subscribe((res) => this.history.next(res));
  }

  stopPollingProcessesData(): void {
    this.stopPolling.next();
  }

  loadHistoryProcesses(reset: boolean = false) {
    this.cancelRequest.next("history");
    if (reset) {
      this.history.next(null);
      this.historyPagination.next(null);
    }
    this.historyProcesses$().subscribe((history) => this.history.next(history));
  }

  private createHistoryParamForm() {
    return this._formBuilder.group({
      groupedState: [],
      type: [],
      createdFrom: [],
      createdTo: [],
      pageNumber: [1],
      pageSize: [10],
    });
  }

  resetHistoryParamForm() {
    this.historyParamsForm.reset({
      pageNumber: 1,
      pageSize: 10,
    });
  }

  cancelRequestFor(type: RequestType): void {
    this.cancelRequest.next(type);
  }

  private createProcessDetailParamsForm() {
    return (this.processDetailParamsForm = this._formBuilder.group({
      onlyError: [false],
      queryFilter: [null],
      pageNumber: [1],
      pageSize: [10],
      state: [],
    }));
  }

  resetProcessDetailParamsForm() {
    this.processDetailParamsForm.reset({
      onlyError: false,
      queryFilter: null,
      pageNumber: 1,
      pageSize: 10,
    });
  }

  loadProcess(id: string, reset: boolean): void {
    if (reset) {
      this.process.next(null);
    }

    this.incrementLoading();
    this.cancelRequest.next("process");
    this.get(id)
      .pipe(
        map((p) => this.singleProcessMapResponse(p)),
        takeUntil(this.cancelRequest.pipe(filter((v) => v === "process"))),
        finalize(() => this.decrementLoading()),
        catchError((error) => {
          this.messageService.showError(error);
          return of(null);
        })
      )
      .subscribe((p) => this.process.next(p));
  }

  loadProcessDetail(id: string, reset: boolean): void {
    this.cancelRequest.next("processDetail");
    if (reset) {
      this.processDetail.next(null);
      this.processDetailPagination.next(null);
    }

    this.processDetails$(id).subscribe((p) => this.processDetail.next(p));
  }

  loadRelatedProcess(id: string) {
    this.relatedProcess.next(null);
    this.cancelRequest.next("relatedProcess");

    this.incrementLoading();
    this.get(id)
      .pipe(
        map((p) => this.singleProcessMapResponse(p)),
        takeUntil(
          this.cancelRequest.pipe(filter((v) => v === "relatedProcess"))
        ),
        finalize(() => this.decrementLoading()),
        catchError((error) => {
          this.messageService.showError(error);
          return of(null);
        })
      )
      .subscribe((p) => this.relatedProcess.next(p));
  }

  onDeleteDocuments(id: string): Observable<boolean> {
    this.incrementLoading();
    return this.deleteDocuments(id).pipe(
      catchError((error) => {
        this.messageService.showError(error);
        return of(false);
      }),
      map((res) => {
        if (res) {
          this.messageService.showInfo(
            "Se ha iniciado el proceso de borrado de documentos"
          );
          return true;
        }
      }),
      finalize(() => this.decrementLoading())
    );
  }

  ongoingMapResponse(
    processes: PaginatedResponse<OngoingProcessOrchestrationDto>
  ): OngoingProcessOrchestrationDto[] {
    return processes.data.map((p: any) => {
      const process: OngoingProcessOrchestrationDto = {
        ...p,
      };

      return process;
    });
  }

  historyMapResponse(
    response: PaginatedResponse<HistoryProcessOrchestrationDto>
  ): HistoryProcessOrchestrationDto[] {
    this.historyPagination.next({
      currentPage: response.currentPage,
      pageSize: response.pageSize,
      totalCount: response.totalCount,
      totalPages: response.totalPages,
      hasPrevious: response.hasPrevious,
      hasNext: response.hasNext,
    });

    return response.data.map((p: any) => {
      const process: HistoryProcessOrchestrationDto = {
        ...p,
      };

      return process;
    });
  }

  detailMapResponse(
    response: PaginatedResponse<ProcessOrchestratorResultDetailDto>
  ): ProcessOrchestratorResultDetailDto[] {
    this.processDetailPagination.next({
      currentPage: response.currentPage,
      pageSize: response.pageSize,
      totalCount: response.totalCount,
      totalPages: response.totalPages,
      hasPrevious: response.hasPrevious,
      hasNext: response.hasNext,
    });

    return response.data.map((p: any) => {
      const datail: ProcessOrchestratorResultDetailDto = {
        ...p,
      };

      return datail;
    });
  }

  singleProcessMapResponse(p: any): ProcessOrchestratorDto {
    const process: ProcessOrchestratorDto = {
      ...p,
    };

    return process;
  }

  private ongoingProcesses$(
    params?: ProcessSearchParams
  ): Observable<OngoingProcessOrchestrationDto[]> {
    this.incrementLoading();
    this.cancelRequest.next("ongoing");
    const OngoingProcesses$ = this.getOngoing(params).pipe(
      map((res) => this.ongoingMapResponse(res)),
      takeUntil(this.cancelRequest.pipe(filter((v) => v === "ongoing"))),
      finalize(() => this.decrementLoading()),
      catchError((error) => {
        this.messageService.showError(error);
        return of(null);
      })
    );
    return OngoingProcesses$;
  }

  private processDetails$(
    id: string
  ): Observable<ProcessOrchestratorResultDetailDto[]> {
    const value = this.processDetailParamsForm?.value;
    if (!value) return of(null);

    let params: ProcessDetailParams = { ...value };

    if (params.state && Array.isArray(params.state)) {
      params.state = params.state.join(",");
    }

    for (const key in params) {
      if (params[key] === null || params[key] === undefined) {
        delete params[key];
      }
    }

    this.incrementLoading();
    this.cancelRequest.next("processDetail");
    return this.getProcessDetail(id, params).pipe(
      finalize(() => this.decrementLoading()),
      takeUntil(this.cancelRequest.pipe(filter((v) => v === "processDetail"))),
      map((p) => this.detailMapResponse(p)),
      catchError((error) => {
        this.messageService.showError(error);
        return of(null);
      })
    );
  }

  private historyProcesses$(): Observable<HistoryProcessOrchestrationDto[]> {
    this.incrementLoading();

    const type = this.historyParamsForm?.value.type;
    const groupedState = this.historyParamsForm?.value.groupedState;
    let params: ProcessSearchParams = {
      ...this.historyParamsForm?.value,
      groupedState: Array.isArray(groupedState)
        ? groupedState.join(",")
        : groupedState,
      type: Array.isArray(type) ? type.join(",") : type,
      createdFrom: this.historyParamsForm?.value?.createdFrom?.toISOString(),
      createdTo: this.historyParamsForm?.value?.createdTo?.toISOString(),
    };
    for (const key in params) {
      if (params[key] === null || params[key] === undefined) {
        delete params[key];
      }
    }

    const historyProcesses$ = this.getHistory(params).pipe(
      takeUntil(this.cancelRequest.pipe(filter((v) => v === "history"))),
      map((res) => this.historyMapResponse(res)),
      finalize(() => this.decrementLoading()),
      catchError((error) => {
        this.messageService.showError(error);
        return of(null);
      })
    );

    return historyProcesses$;
  }

  private getHistory(
    params: ProcessSearchParams
  ): Observable<PaginatedResponse<HistoryProcessOrchestrationDto>> {
    const DEFAULT_PARAMS: ProcessSearchParams = {
      pageNumber: 1,
      pageSize: 10,
      customergroupcode: this.customerGroupCode,
    };

    const p = new HttpParams({ fromObject: { ...DEFAULT_PARAMS, ...params } });

    return this.http.get<PaginatedResponse<HistoryProcessOrchestrationDto>>(
      `${this.url}/Processes/History`,
      { params: p }
    );
  }

  private getOngoing(
    params: PaginatedParams
  ): Observable<PaginatedResponse<OngoingProcessOrchestrationDto>> {
    const DEFAULT_PARAMS: OngoingParams = {
      pageNumber: 1,
      pageSize: 100,
      customergroupcode: this.customerGroupCode,
    };

    const p = new HttpParams({ fromObject: { ...DEFAULT_PARAMS, ...params } });
    return this.http.get<PaginatedResponse<OngoingProcessOrchestrationDto>>(
      `${this.url}/Processes/Ongoing/`,
      { params: p }
    );
  }

  private get(id: string): Observable<ProcessOrchestratorDto> {
    return this.http.get<ProcessOrchestratorDto>(
      `${this.url}/Processes/ProcessOrchestration/${id}`
    );
  }

  private getProcessDetail(
    id: string,
    params: ProcessDetailParams = { onlyError: false }
  ): Observable<PaginatedResponse<ProcessOrchestratorResultDetailDto>> {
    const DEFAULT_PARAMS: PaginatedParams = {
      pageNumber: 1,
      pageSize: 10,
    };

    const p = new HttpParams({ fromObject: { ...DEFAULT_PARAMS, ...params } });

    return this.http.get<PaginatedResponse<ProcessOrchestratorResultDetailDto>>(
      `${this.url}/Processes/${id}/detail`,
      { params: p }
    );
  }

  isDeletable(id: string): Observable<boolean> {
    const body = {
      processId: id,
      forceDeleteDocuments: false,
    };
    return this.http
      .post<any>(
        `${this.url}/Processes/DeleteDocumentsByProcessId/Deletable`,
        body
      )
      .pipe(
        catchError(() => of(false)),
        map((res) => res?.deletable || false)
      );
  }

  private deleteDocuments(id: string): Observable<any> {
    const body = {
      processId: id,
      forceDeleteDocuments: false,
    };
    return this.http.post<any>(
      `${this.url}/Processes/DeleteDocumentsByProcessId`,
      body
    );
  }

  private incrementLoading() {
    this.isLoading.next(this.isLoading.value + 1);
  }

  private decrementLoading() {
    if (this.isLoading.value > 0) {
      this.isLoading.next(this.isLoading.value - 1);
    }
  }

  private get customerGroupCode() {
    const currentOu = this.organizationalUnitService.getCurrentOU();

    return (
      currentOu?.parentOrganizationalUnitId ||
      parseInt(localStorage.getItem("organizationId"))
    );
  }
}
