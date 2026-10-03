import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppConfig } from "src/app/app.config";
import { HelpLinkConfig } from '../models/help-link.model';
import { OuDescriptionConfig } from '../models/ou-description.model';


@Injectable({
  providedIn: 'root'
})
export class CustomConfigService {

  urlCpp = AppConfig.settings.apiUrls.cpp;
  controllerName = 'CustomConfigs';
  constructor(private http: HttpClient) { }

  getByOuId(ouId: number): Observable<HelpLinkConfig> {
    return this.http.get<HelpLinkConfig>(`${this.urlCpp}/${this.controllerName}/${ouId}`);
  }

  create(entity: HelpLinkConfig) {
    return this.http.post<HelpLinkConfig>(`${this.urlCpp}/${this.controllerName}`, entity);
  }

  saveDescription(entity: OuDescriptionConfig) {
    return this.http.patch<OuDescriptionConfig>(`${this.urlCpp}/${this.controllerName}/description`, entity);
  } 
}

