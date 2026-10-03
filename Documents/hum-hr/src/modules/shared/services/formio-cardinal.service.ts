import { Injectable } from '@angular/core';
import { AppConfig } from 'src/app/app.config';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class FormioCardinalService {
  url = AppConfig.settings.apiUrls.cpp;
  constructor(private http: HttpClient) { }


  getPdf(formAlias: string, sumbissionId: string) {
    return this.http.get(`${this.url}/formio/GetPdf/${formAlias}/${sumbissionId}`);
  }
}
