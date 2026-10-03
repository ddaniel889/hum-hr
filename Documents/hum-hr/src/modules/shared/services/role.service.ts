import { Injectable } from '@angular/core';
import { AppConfig } from 'src/app/app.config';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import { Role } from '../models/role.model';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  url = AppConfig.settings.apiUrls.auth;
  urlCpp = AppConfig.settings.apiUrls.cpp;
  constructor(private http: HttpClient, private auth: AuthService) {
  }

  get(organizationalUnitId: any, id: any, applicationId: any, page: any, itemsPerPage: any): Observable<Role[]> {
    const params = {
      OrganizationalUnitId: organizationalUnitId
      , Id: id
      , applicationId: applicationId
      , Page: page
      , ItemPerPage: itemsPerPage
    };
    return this.http.get<any>(`${this.url}/adminRoles`, {
      params: params
    }).pipe(map(res => res.value));
  }

  getById(id: any) {
    return this.http.get<any[]>(`${this.url}/adminRoles/${id}`);
  }

  getEmployerRoles(organizationalUnitId: number) {
    return this.http.get<any[]>(`${this.urlCpp}/Employer/roles/${organizationalUnitId}`);
  }

  getEmployeeRoles(organizationalUnitId: number) {
    return this.http.get<any[]>(`${this.urlCpp}/Employees/getRole/${organizationalUnitId}`);
  }

  getRolesFromConfig(isRRHH: boolean, organizationalUnitId?: number): Promise<any> {
    return new Promise(async (resolve, reject) => {
      if (isRRHH) {
        this.getEmployerRoles(organizationalUnitId).toPromise().then(
          data => {
            return resolve(data);
          },
          err => {
            return reject(err);
          }
        );
      } else {
        this.getEmployeeRoles(organizationalUnitId).toPromise().then(
          data => {
            return resolve(data);
          },
          err => {
            return reject(err);
          }
        );
      }

    });
  }

  getEmployerRolesByFunctions(organizationalUnitId: number){
    const functions = ['RRHH_CONTENT', 'FIRMANTE', 'RRHH_ACCESS', 'OVERSEER', 'CANDIDATEADMIN', 'RRHH_DOCUMENTS', 'CANDIDATE_PROMOTE_INCOMPLETE', 'MANAGE_EMPLOYEES','CANDIDATE_PROMOTE','ADMIN_CANDIDATE_BASIC','LEAVECONFIG','LEAVEAPROV'];
    return this.getByFunctions(functions, organizationalUnitId);
  }


  getByFunctions(functions: string[], organizationalUnitId?: any) {
    const params = {
      ApplicationId: AppConfig.settings.application.id,
      Functions: functions,
      organizationalUnitId: organizationalUnitId,
      findInRoot: 'true' // Los roles estan siempre en el padre
    };
    return this.http.get<any[]>(`${this.urlCpp}/RoleUsers/GetRole/`, { params: params });
  }
}
