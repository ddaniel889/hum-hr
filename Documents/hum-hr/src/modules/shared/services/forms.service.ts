import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { AppConfig } from "../../../app.config";
import { Observable, of } from "rxjs";
import { DocumentationType } from "../models/documentation-type.model";
import { FormIntegrationTokenRequest } from '../models/form-integration-token-request.model';


@Injectable({
  providedIn: 'root'
})
export class FormsService {
  urlCPP = AppConfig.settings.apiUrls.cpp;

  constructor(private http: HttpClient) { }


  getFormToken(docType: DocumentationType, theme: string): Observable<any> {
    let request: FormIntegrationTokenRequest;
    request = new FormIntegrationTokenRequest();
    request.TryCreateEntity = true;
    request.UiType = "full";
    request.UIReturnCallBack = `${location.origin}/#/employer/document-configuration`;
    request.DocumentationTypeId = docType.id;
    request.UiTheme = theme;

    if (docType.exteralForm != null) {
      request.Action = "FormEdit";
      request.FormAlias = docType.exteralForm;
    } else {
      request.Action = "FormCreate";
      request.FormType = "PDF";
    }

    return this.http.post(`${this.urlCPP}/Forms/GetFormToken`, request);
  }
}
