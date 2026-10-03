import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AppConfig } from "src/app/app.config";
import { FileDocument } from "../models/file-document.model";
import { DocumentationExport } from "../models/documentation-export.model";


@Injectable({
  providedIn: "root",
})
export class NoveltyService {


  cppUrl = AppConfig.settings.apiUrls.cpp;
  edrUrl = AppConfig.settings.apiUrls.edr;
  

  constructor(
    private http: HttpClient
  ) { }

  
  find(param: any) {
    return this.http.put<string>(
      `${AppConfig.settings.apiUrls.cpp}/Novelties/find`,
      param
    );
    
  }

  getNovelties(param: any)
  {
    return this.http.put<string>(
      `${AppConfig.settings.apiUrls.cpp}/Novelties/ExportExcel`,
      param
    );
  }
}


