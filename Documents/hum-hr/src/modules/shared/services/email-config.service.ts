import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AppConfig } from "src/app/app.config";
import { OUEmailConfigDTO } from "../models/email.model";

@Injectable({
    providedIn: 'root'
})

export class OrganizationalUnitEmailConfigService {
    urlCpp = AppConfig.settings.apiUrls.cpp;
    controllerName = 'EmailConfigs';
    constructor(private http: HttpClient) { }

    getByOuId(ouId: number): Observable<OUEmailConfigDTO> {
        return this.http.get<OUEmailConfigDTO>(`${this.urlCpp}/${this.controllerName}/${ouId}`);
    }

    create(entity: OUEmailConfigDTO) {
        return this.http.post<OUEmailConfigDTO>(`${this.urlCpp}/${this.controllerName}`, entity);
    }
}
