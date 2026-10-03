import { HttpClient } from "@angular/common/http";
import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { AppConfig } from 'src/app/app.config';
import { FileDocument } from "../models/file-document.model";
import { SignBatch } from "../models/Employee/sign-batch.model";
import { SignBatchDocument } from "../models/Employee/sign-batch-document.model";

@Injectable({
  providedIn: 'root'
})
export class SignBatchService {
  url = AppConfig.settings.apiUrls.cpp;

  constructor(private http: HttpClient
  ) { }

  createSignBatch(docs: FileDocument[], ouId: number, description: string): Observable<SignBatch> {
    const documentsParam = new Array<SignBatchDocument>();
    docs.forEach(element => {
      const doc = {
        id: undefined,
        signBatchId: undefined,
        documentId: +element.id,
        signDate: undefined
      };

      documentsParam.push(doc);
    });

    const batch = {
      documents: documentsParam,
      organizationalUnitId: ouId,
      description: description
    };

    return this.http
      .post<SignBatch>(`${this.url}/SignBatch`, batch);
  }

  mapResponseSign(res): string {
    return res;
  }
}
