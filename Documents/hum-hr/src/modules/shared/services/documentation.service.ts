import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { AppConfig } from "../../../app.config";
import { FileDocument } from "../models/file-document.model";
import { Observable } from "rxjs";
import { FileDocumentSendToAll } from '../models/file-document-send-to-all.model';


@Injectable()
export class DocumentationService {
  urlCPP = AppConfig.settings.apiUrls.cpp;  
  constructor(private http: HttpClient) { }

  get(ouId: any): Observable<any> {
    return this.http.get(`${this.urlCPP}/Documentation/${ouId}`, ouId);
  }

  create(dto: FileDocument[], files?: File[]): Observable<FileDocument> {
    const formData = this.formDataFile(files);
    formData.append('data', JSON.stringify(dto));
    return this.http.post<FileDocument>(
      `${this.urlCPP}/FileDocuments/AltaMasivaDoc`,
      formData
    );
  }

  createDocumentsEmployees(dto: FileDocumentSendToAll, files?: File[]): Observable<FileDocument> {
    const formData = this.formDataFile(files);
    formData.append('data', JSON.stringify(dto));
    return this.http.post<FileDocument>(
      `${this.urlCPP}/FileDocuments/DocumentsEmployees`,
      formData
    );
  }

  employeeUpload(dto: FileDocument, files: File[]) {
    const formData = this.formDataFile(files);
    formData.append('data', JSON.stringify(dto));

    return this.http.post<FileDocument>(
      `${this.urlCPP}/EmployeeDocuments/`,
      formData
    );
  }

  createEmployeeDocument(dto: FileDocument, files: File[]) {
    const formData = this.formDataFile(files);
    formData.append('data', JSON.stringify(dto));

    return this.http.post<FileDocument>(
      `${this.urlCPP}/Person/AddDocument`,
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

}
