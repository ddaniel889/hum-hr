import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { AppConfig } from "../../../app.config";
import { Observable, of } from "rxjs";
import { map } from "rxjs/operators";
import { DocumentationType } from "../models/documentation-type.model";
import { Dictionary } from "../models/Generics/dictionary.model";


@Injectable({
  providedIn: 'root'
})
export class DocumentationTypesService {
  urlCPP = AppConfig.settings.apiUrls.cpp;
  urlEDR = AppConfig.settings.apiUrls.edr;
  constructor(private http: HttpClient) { }

  Clear() {
    localStorage.removeItem(`DocumentationTypes`);
  }

  get(ouId: any, showToEmployee?: any, getOptionValues: boolean = false, forceSearch: boolean = false, showDisable: boolean = false): Observable<any> {
    const documentationTypes: Dictionary<number, DocumentationType[]> = new Dictionary(JSON.parse(localStorage.getItem(`DocumentationTypes`)));

    if (documentationTypes.exist(+ouId) && !forceSearch) {
      return of(documentationTypes.get(+ouId));
    }

    const params = {
      OuId: ouId,
      getOptionValues: getOptionValues.toString(),
      ShowDisabled: showDisable.toString(),
      ShowToEmployee: showToEmployee,
    };

    return this.http.get(`${this.urlCPP}/Documentation/`, { params: params })
      .pipe(
        map((res: DocumentationType[]) => {
          if (res) {
            localStorage.setItem('DTbyOU', ouId);
            documentationTypes.Add(+ouId, res);
          }
          localStorage.setItem('DocumentationTypes', JSON.stringify(documentationTypes));
          return res;
        })
      );
  }
  getToCandidates(ouId: any, showToEmployee?: any, getOptionValues: boolean = false, forceSearch: boolean = false, showDisable: boolean = false): Observable<any> {
    const documentationTypes: Dictionary<number, DocumentationType[]> = new Dictionary(JSON.parse(localStorage.getItem(`DocumentationTypes`)));

    if (documentationTypes.exist(+ouId) && !forceSearch) {
      return of(documentationTypes.get(+ouId));
    }

    const params = {
      OuId: ouId,
      getOptionValues: getOptionValues.toString(),
      ShowDisabled: showDisable.toString(),
      ShowToEmployee: showToEmployee,
    };

    return this.http.get(`${this.urlCPP}/Documentation/GetToDocTypesWithOutAdje/`, { params: params })
      .pipe(
        map((res: DocumentationType[]) => {
          if (res) {
            localStorage.setItem('DTbyOU', ouId);
            documentationTypes.Add(+ouId, res);
          }
          localStorage.setItem('DocumentationTypes', JSON.stringify(documentationTypes));
          return res;
        })
      );
  }
  GetForAdd(ouId: any, showToEmployee?: any, getOptionValues: boolean = false, forceSearch: boolean = false): Observable<any> {
    const documentationTypes: Dictionary<number, DocumentationType[]> = new Dictionary(JSON.parse(localStorage.getItem(`DocumentationTypesAdd`)));

    if (documentationTypes.exist(+ouId) && !forceSearch) {
      return of(documentationTypes.get(+ouId));
    }

    const params = {
      OuId: ouId,
      getOptionValues: getOptionValues.toString(),
      ShowToEmployee: showToEmployee,
    };

    return this.http.get(`${this.urlCPP}/Documentation/GetForAdd`, { params: params })
      .pipe(
        map((res: DocumentationType[]) => {
          if (res) {
            localStorage.setItem('DTbyOU', ouId);
            documentationTypes.Add(+ouId, res);
          }
          localStorage.setItem('DocumentationTypesAdd', JSON.stringify(documentationTypes));
          return res;
        })
      );
  }

  getById(id: any): Observable<any> {
    return this.http.get(`${this.urlCPP}/Documentation/getById/${id}`, id);
  }

  getDocumentType(documentTypeId: any): Observable<any> {
    const documentType: DocumentType = JSON.parse(localStorage.getItem(`documentType_${documentTypeId}`));
    if (documentType) {
      return of(documentType);
    }

    return this.http.get(`${this.urlCPP}/DocumentTypes/getById/${documentTypeId}`, documentTypeId)
      .pipe(map(res => {
        localStorage.setItem(`documentType_${documentTypeId}`, JSON.stringify(res));
        return res;
      }));
  }

  setEnabled(id: number, enabled: boolean) {
    return this.http.patch(`${this.urlCPP}/Documentation/enable/${id}/${enabled}`, enabled);
  }

  updateSetById(setId: number): Observable<any> {
    return this.http.put<any>(`${this.urlCPP}/DocumentTypes/GetAndUpdateSetById`,setId);
  }
}
