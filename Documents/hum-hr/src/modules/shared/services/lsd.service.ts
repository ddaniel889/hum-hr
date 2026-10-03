import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConfig } from 'src/app/app.config';
import { Observable } from 'rxjs';
import { DocumentTypeDefinition } from '../models/document-type-definition.model';
import { map } from 'rxjs/operators';
import { LawbookDocument } from '../models/lawbook-document.model.';
import { SignBatchDocument } from '../models/Employee/sign-batch-document.model';
import { SignBatch } from '../models/Employee/sign-batch.model';
import { LawbookFindParameters } from '../models/lawbook-find-parameters.model';
import { OrganizationalUnitService } from './organizational-unit.service';

@Injectable({
  providedIn: 'root'
})
export class LsdService {
  urlCPP = AppConfig.settings.apiUrls.cpp;
  urlEDR = AppConfig.settings.apiUrls.edr;

  constructor(private http: HttpClient,
    private organizationalUnitService: OrganizationalUnitService,
    ) { }

  getDocType(): Observable<DocumentTypeDefinition> {
    return this.http.get<DocumentTypeDefinition>(`${this.urlCPP}/Lawbook/GetTypes`);
  }

  getDocument(id: number): Observable<any> {
    return this.http.get<any>(`${this.urlEDR}/Documents/${id}`);
  }

  getSignData(id: number): Observable<any> {
    return this.http.get<any>(`${this.urlEDR}/files/GetSignatures/${id}`);
  }

  getFiles(documentId: number, versionId: number, fileId: number): Observable<any> {
    return this.http.get<any>(`${this.urlCPP}/Lawbook/GetFile/${documentId}/${versionId}/${fileId}`);
  }

  find(param: LawbookFindParameters, docType: DocumentTypeDefinition): Observable<any> {
    return this.http.put<any>(`${this.urlCPP}/Lawbook/find`, param)
      .pipe(
        map( res => {
          const documents = [];
          if (res) {
            const items = JSON.parse(res.value);
            for (let index = 0; index < items.length; index++) {
              const element = items[index];
              documents.push(this.mapSingleResponse(element, docType));
            }
          }

          return {
            values: documents,
            page: 1,
            itemPerPage: 15,
            total: res ? res.totalCount : 0
          };
        })
      );
  }


  create(dto: LawbookDocument, files: File[]): Observable<LawbookDocument> {
    const formData = this.formDataFile(files);

    formData.append('data', JSON.stringify(dto.toDocumentVersionDTO()));
    return this.http.post<LawbookDocument>(
      `${this.urlCPP}/Lawbook`,
      formData
    );
  }

  createSignBatch(docs: LawbookDocument[], ouId: number, description: string): Observable<SignBatch> {
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
      .post<SignBatch>(`${this.urlCPP}/Lawbook/CreateBatch`, batch);
  }

  GetFileOriginal(fileId: number): Observable<any> {
    return this.http.get<any>(`${this.urlCPP}/Lawbook/Download/${fileId}`);
  }

  modify(dto: LawbookDocument, files: File[] = []): Observable<LawbookDocument> {
    const formData = this.formDataFile(files);

    formData.append('data', JSON.stringify(dto.toDocumentVersionDTO()));
    return this.http.put<LawbookDocument>(
      `${this.urlCPP}/Lawbook`,
      formData
    );
  }

  private formDataFile(files: File[]) {
    const formData: FormData = new FormData();

    if (files && files.length > 0) {
      for (let index = 0; index < files.length; index++) {
        const file = files[index];
        formData.append(file.name, file, file.name);
      }
    }
    return formData;
  }

  private mapSingleResponse(res, docType: DocumentTypeDefinition): LawbookDocument {
    const response: LawbookDocument = new LawbookDocument();
    if (!res) {
      return response;
    }
    response.id = res.did;
    response.name = res.na;
    response.organizationalUnitId = res.ou;
    response.metadatas = [];
    this.setMetadatas(response, res.m);
    const now = new Date();
    response.documentDate = res.m._fecDoc ? new Date(+res.m._fecDoc.$date + now.getTimezoneOffset() * 60 * 1000) : undefined;
    response.documentTypeSystemName = res.tsn;
    response.hasFiles = res.hf;
    response.statusId = res.dsi;
    this.organizationalUnitService.getTreeInMemory()
      .then(ous => {
        response.organizationalUnitName = ous.find(o => o.id === response.organizationalUnitId).name;
      })
      .catch(()=> response.organizationalUnitName = '');

    // Agrego las descriptions de los valores de compos
    const metadatasToReplace = docType.metadata.filter(m => m.metadataType === "comboKV");
    metadatasToReplace.forEach(metadata => {
      const metaValueFromDoc = response.metadatas.find(mv => mv.systemName === metadata.metadataSystemName);
      const options = JSON.parse(JSON.stringify(metadata.optionValues));
      let jOpt;
      try {
        jOpt = JSON.parse(options);
      } catch (error) {
        jOpt = options;
      }

      const selectedOption = jOpt.find(o => o.value === metaValueFromDoc.metadataValue);
      metaValueFromDoc.metadataValueDescription = selectedOption.description;
    });

    return response;
  }

  private setMetadatas(response: LawbookDocument, metadatas: any) {
    for (const property in metadatas) {
      if (metadatas.hasOwnProperty(property)) {
        response.setMetadata(property, metadatas[property]);
      }
    }
  }
}
