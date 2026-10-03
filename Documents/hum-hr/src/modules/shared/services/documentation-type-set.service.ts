import { Injectable } from "@angular/core";
import { AppConfig } from "../../../app.config";
import { HttpClient, HttpParams } from "@angular/common/http";
import {
  DocumentationTypeSet,
  DocumentationTypeSetFind,
  DocumentationTypeSetItem,
  DocumentationSetDetailFind
} from "../models/documentationTypeSet.model";
import { Observable } from "rxjs";
import { DocumentationTypeSelectItem } from "../models/documentation-type-select-item.model";
import { DocumentationType } from "../models/documentation-type.model";
import { MetadataService } from "./metadatas.service";
import { DocTypeMetadatasCategory } from "../models/DocTypeMetadatas.model";
import { AnalyticsDocumentSet } from "../models/analytics-document-set.model";
import { map } from "rxjs/operators";
import { AnalyticsDocumentSetPerson } from "../models/analytics-document-set-person.model";
import { IPagedModel } from '../models/paged.model.';

@Injectable({
  providedIn: "root",
})
export class DocumentationTypeSetService {
  url = AppConfig.settings.apiUrls.cpp;

  constructor(
    private http: HttpClient,
    private metadataService: MetadataService
  ) {}

  create(docTypeSet: DocumentationTypeSet): Observable<DocumentationTypeSet> {
    return this.http.post<DocumentationTypeSet>(
      `${this.url}/DocumentTypes/CreateSet`,
      docTypeSet
    );
  }

  mapResponse(res: any): AnalyticsDocumentSet {
    var resp = new AnalyticsDocumentSet();

    resp.affectedPeople = res.candidateCount;
    resp.complete = res.candidateCompleteDocumentsCount;
    resp.incomplete = res.candidateInCompleteDocumentsCount;
    resp.affectedPeople = resp.complete + resp.incomplete;    
    return resp;
  }  

  mapResponseDetail(res: any):  IPagedModel<AnalyticsDocumentSetPerson> {   
    const people: AnalyticsDocumentSetPerson[] = [];
    res.values.forEach((doc) => {
      people.push(this.mapSingleResponse(doc));
    });

    const allpeople: AnalyticsDocumentSetPerson[] = [];
    res.totalValues.forEach((doc) => {
      allpeople.push(this.mapSingleResponse(doc));
    });
    
    const response= {
      values: people,
      totalvalues: allpeople,
      itemPerPage: res.itemPerPage,
      page: res.page,
      total: res.total
    };
    return response;
  }

  mapSingleResponse(res: any): AnalyticsDocumentSetPerson {
    const response: AnalyticsDocumentSetPerson =
      new AnalyticsDocumentSetPerson();
    if (!res) {
      return response;
    }
    console.log(res);

    response.finishedDocuments = res.finishedDocuments;
    response.percentage = res.percentage;
    response.totalDocuments = res.totalDocuments;
    response.userId = res.userId;
    response.cuil = res.cuil;
    response.lastName = res.apellido;
    response.firstName = res.name;
    response.documents = res.documents;
    
    return response;
  }
  getSetbyId(
    set: DocumentationTypeSet
  ): Observable<DocumentationTypeSet> {
    return this.http
      .get<DocumentationTypeSet>(
        `${this.url}/DocumentTypes/GetSetById/${set.id}`
      );
  }

  getSetbyIdFiscal(
    idFiscal: string,
    ouId: number
  ): Observable<any> {
    return this.http
      .get<any>(
        `${this.url}/DocumentTypes/GetByIdFiscal/${idFiscal}/${ouId}`
      );
  }

  getDocumentSetInfo(
    set: DocumentationTypeSet
  ): Observable<AnalyticsDocumentSet> {
    return this.http
      .get<any>(
        `${this.url}/DocumentTypes/GetDocumentSetInfo/${set.id}/${set.organizationalUnitId}`
      )
      .pipe(map((res) => this.mapResponse(res)));
  }
  
  getMetricSet(
    set: DocumentationTypeSet
  ): Observable<AnalyticsDocumentSet> {
    return this.http
      .get<any>(
        `${this.url}/DocumentTypes/GetDocumentSetInfo/${set.id}/${set.organizationalUnitId}`
      )
      .pipe(map((res) => res));
  }

  getDocumentSetDetailInfo(findParameters: DocumentationSetDetailFind
  ): Observable<IPagedModel<AnalyticsDocumentSetPerson>> {
    return this.http.put<string>(
      `${this.url}/DocumentTypes/GetMetricDetail`,
      findParameters
    )
    .pipe(map((res) =>
    this.mapResponseDetail(res)));
  }
  

  get(
    findParameters: DocumentationTypeSetFind
  ): Observable<DocumentationTypeSet[]> {
    return this.http.put<DocumentationTypeSet[]>(
      `${this.url}/DocumentTypes/GetSetByOuId`,
      findParameters
    );
  }

  getHeaderMetrics(
    findParameters: DocumentationTypeSetFind
  ): Observable<DocumentationTypeSet[]> {
    return this.http.put<DocumentationTypeSet[]>(
      `${this.url}/DocumentTypes/GetMetricSetByOuId`,
      findParameters
    );
  }

  modify(docTypeSet: DocumentationTypeSet): Observable<DocumentationTypeSet> {
    return this.http.post<DocumentationTypeSet>(
      `${this.url}/DocumentTypes/ModifySet`,
      docTypeSet
    );
  }

  changeEnabled(
    docTypeSet: DocumentationTypeSet
  ): Observable<DocumentationTypeSet> {
    return this.http.post<DocumentationTypeSet>(
      `${this.url}/DocumentTypes/ChangeEnabledSet`,
      docTypeSet
    );
  }

  setFile(files?: File[]) {
    const formData = this.formDataFile(files);
    return this.http.post<string>(
      `${this.url}/DocTypeSetItem/setFile`,
      formData
    );
  }

  getFile(id: string) {
    return this.http.get<any>(`${this.url}/DocTypeSetItem/getFile/${id}`);
  }

  deleteFile(id: string) {
    return this.http.delete(`${this.url}/DocTypeSetItem/deleteFile/${id}`);
  }

  async mapDocumentationTypesToSetItems(
    documentationTypes: DocumentationType[]
  ): Promise<DocumentationTypeSetItem[]> {
    const itemList: DocumentationTypeSetItem[] = [];
    await documentationTypes.forEach(async (d) => {
      let hasSubtype = false;
      if (d.docTypesMetadatas && d.docTypesMetadatas.length > 0) {
        const subType = d.docTypesMetadatas.find(
          (s) => s.categoryId === DocTypeMetadatasCategory.Subtipo
        );
        if (subType) {
          hasSubtype = true;
          // Buscar los option values para esos subtipos u ponerlos ne la lista.
          const opt = JSON.parse(subType.optionValues);
          opt.forEach((element) => {
            const item: DocumentationTypeSetItem = {
              id: 0,
              documentationTypeId: d.id,
              metadataValue: element.value,
              metadataSystemName: subType.systemName,
              metadataId: subType?.metadataId.toString(),
              order: 0,
              usesCount: 0,
              description: d.description + " - " + element.description,
              required: false,
            };

            itemList.push(item);
          });
        }
      }

      if (!hasSubtype) {
        const item: DocumentationTypeSetItem = {
          description: d.name,
          documentationTypeId: d.id,
          order: 0,
          usesCount: 0,
          required: false,
        };

        itemList.push(item);
      }
    });

    return itemList;
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
}
