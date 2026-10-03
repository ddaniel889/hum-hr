import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { AppConfig } from "../../../app.config";
import { Observable, BehaviorSubject, of } from "rxjs";
import { Candidate } from '../models/Employee/candidate.model';
import { map } from "rxjs/operators";
import { IPagedModel } from "../models/paged.model.";
import { CandidateFind } from "../models/Employee/candidate-find.model.";
import {  DocumentStatistic } from "./file-document.service";
import { PromoteCandidate } from '../models/Employee/promote-candidate.model';
import { Person } from '../models/Employee/person.model';
import { CandidateSet } from '../models/Employee/candidate-set.model';
import { DeferedProcess } from "../models";


@Injectable()
export class CandidateService {
  url = AppConfig.settings.apiUrls.cpp;

  candidateList = new BehaviorSubject<Candidate[]>([]);

  constructor(private http: HttpClient) { }

  mapResponse(res: IPagedModel<Candidate>): IPagedModel<Candidate> {
    const candidates: Candidate[] = [];

    res.values.forEach(process => {
      candidates.push(this.mapSingleResponse(process));
    });

    const response: IPagedModel<Candidate> = {
      values: candidates,
      itemPerPage: res.itemPerPage,
      page: res.page,
      total: res.total
    };

    this.candidateList.next(candidates);
    return response;
  }

  private mapSingleResponse(res: Candidate): Candidate {
    const response: Candidate = new Candidate();
    if (!res) {
      return response;
    }

    response.id = res.id;
    response.organizationalUnitId = res.organizationalUnitId;
    response.organizationalUnitName = res.organizationalUnitName;
    response.metadatas = res.metadatas;
    response.containerTypeId = res.containerTypeId;
    response.nickName = res.nickName;
    response.hasActiveCertificate = res.hasActiveCertificate;
    response.preview = res.preview;
    response.candidateSet = res.candidateSet;

    const date = response.metadatas.find(m => "m." + m.metadataSystemName == response.startDateSystemName);

    if (date) {
      const dateParts = date.metadataValue.split("/");
      date.metadataValue = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);
    }

    return response;
  }

  create(candidate: Candidate, sendWelcome: boolean = false): Observable<Candidate> {
    let params = new HttpParams();
    params = params.append('sendWelcome', sendWelcome.toString());

    return this.http.post<Candidate>(
      `${this.url}/candidate`,
      candidate, { params: params }
    );
  }

  updateCandidateSet(candidate: CandidateSet) {
    return this.http.put<Person>(
      `${this.url}/candidate/patchCandidateSet`,
      candidate
    );
  }

  modify(candidate: Person): Observable<Person> {
    return this.http.put<Person>(
      `${this.url}/candidate`,
      candidate
    );
  }
  promoteCandidate(candidate: PromoteCandidate): Observable<boolean> {
    return this.http.put<boolean>(`${this.url}/candidate/promoteCandidate`, candidate);
  }

  getCandidates(candidate: CandidateFind): Observable<IPagedModel<Candidate>> {
    return this.http.put<IPagedModel<Candidate>>(`${this.url}/candidate/find`, candidate)
      .pipe(map(res => this.mapResponse(res)));
  }

  getDocumentStatistics(candidate: CandidateFind): Observable<DocumentStatistic> {
    const key = 'DocumentStatistics_' + candidate.id;
    if (localStorage.getItem(key) != null) {
      const result: DocumentStatistic = JSON.parse(localStorage.getItem(key));
      return of(result);
    }
    return this.http.put<DocumentStatistic>(`${this.url}/candidate/getDocumentStatistics`, candidate)
      .pipe(map(res => {
        localStorage.setItem(key, JSON.stringify(res));
        return res;
      }));

  }

  getCPPDocumentStatistics(userIds: number[]): Observable<DocumentStatistic[]> {
   
    return this.http.put<DocumentStatistic[]>(`${this.url}/candidate/getStatistics`, userIds)
      .pipe(map(res => {return res; }));

  }

  cancel(id: number) {
    return this.http.delete<Candidate>(`${this.url}/candidate/${id}`);
  }
  
  // Hace lo mismo que el cancel, pero una vez cancelado el usuario, actualiza el set.
  inactive(candidate: Candidate): Observable<CandidateSet> {
    return this.http.post<CandidateSet>(`${this.url}/candidate/inactive`, candidate.candidateSet);
  }

  cleanStatistics(candidateId: number | string) {
    localStorage.removeItem('DocumentStatistics_' + candidateId);
  }

  cleanAllStatistics() {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i).toString();
      if (key.startsWith('DocumentStatistics_')) {
        localStorage.removeItem(key);
      }
    }
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
        `${this.url}/person/Import`,
        formData
      );
    }

    return this.http.post<DeferedProcess>(
      `${this.url}/person/Import`,
      process
    );
  }  

}
