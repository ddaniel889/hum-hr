import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AppConfig } from "src/app/app.config";
import { OrganizationalUnitAccessConfig } from "../models/ou-access-config.model";

@Injectable({
    providedIn: 'root'
  })

export class OrganizationalUnitAccessConfigService {
    urlCpp = AppConfig.settings.apiUrls.cpp;
    constructor(private http: HttpClient) { }

    getByOuId(ouId: any, isCandidate?: boolean) {
        const parameters: any = {
            OrganizationalUnitId: ouId
        };
        if (isCandidate != null) {
            parameters.IsCandidate = isCandidate;
        }
        return this.http.get<OrganizationalUnitAccessConfig[]>(`${this.urlCpp}/AccessConfigs`, { params: parameters });
    }

    create(entities: OrganizationalUnitAccessConfig[]) {
        return this.http.post<OrganizationalUnitAccessConfig[]>(`${this.urlCpp}/AccessConfigs`, entities);
    }
}
