import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppConfig } from 'src/app/app.config';
import { AuthService } from '../auth/auth.service';
import { User } from '../models';
import { WelcomeParametersDTO } from '../models/email.model';
import { PendingWelcomeUsers } from '../models/pending-welcome-users.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  url = AppConfig.settings.apiUrls.auth;
  urlBase = location.origin;
  urlCpp = AppConfig.settings.apiUrls.cpp;
  constructor(private http: HttpClient, private auth: AuthService) {
  }

  get(parameters: any): Observable<User[]> {
    if (parameters == null) {
      throw new Error('Parametros no puede ser null');
    }

    return this.http
      .get<any>(`${this.url}/AdminUsers`, { params: parameters })
      .pipe(
        map(res => {
          const users: User[] = [];

          if (res.value && res.value.length > 0) {
            for (let index = 0; index < res.value.length; index++) {
              let functions = res.value[index].functions as Array<string>;
              if (parameters.functions && functions && functions.length > 0) {
                functions = functions.filter(function (f) {
                  return this.indexOf(f) < 0;
                }, parameters.functions);
              }
              const user = new User();
              user.id = res.value[index].id;
              user.creationDate = new Date(res.value[index].creationDate);
              user.loginId = res.value[index].loginId;
              user.enabled = res.value[index].enabled;
              user.locked = res.value[index].enabled;
              user.organizationalUnitId = res.value[index].organizationalUnitId;
              user.organizationalUnitName = res.value[index].organizationalUnitName;
              user.certificateProviderName = res.value[index].certificateProviderName;
              user.certificateExpirationDate = res.value[index].certificateExpirationDate;
              user.functions = functions;
              user.roles = res.value[index].roles;
              user.nickName = res.value[index].nickName;
              user.firstName = res.value[index].firstName;
              user.lastName = res.value[index].lastName;
              user.fullName = res.value[index].lastName + ', ' + res.value[index].firstName;
              user.mail = res.value[index].mail;
              user.cuil = res.value[index].cuil;
              user.lastLoginDate = res.value[index].lastLoginDate;
              user.welcomeSent = res.value[index].welcomeSent;
              user.delegatedSystemId = res.value[index].delegatedSystemId;
              users.push(user);
            }
          }

          return users;
        }));
  }

  getByFiscalId(fiscalId: string) {
    if (fiscalId == null) {
      throw new Error('cuil no puede ser null');
    }

    const parameters = {
      FiscalId: fiscalId
    };

    return this.http.get<any[]>(`${this.url}/logins`, { params: parameters });
  }

  getById(id: any): Observable<any> {
    if (id == null) {
      throw new Error('User Id no puede ser null');
    }

    return this.http.get(`${this.url}/AdminUsers/${id}`).pipe(
      map(res => {
        if (res['lastLoginDate'].toString() == '0001-01-01T00:00:00') {
          res['lastLoginDate'] = null;
        }

        if (res['lastFailedLoginDate'].toString() == '0001-01-01T00:00:00') {
          res['lastFailedLoginDate'] = null;
        }
        return res;
      }));
  }

  create(user: User): Observable<User> {
    if (user == null) {
      throw new Error('user no puede ser null');
    }

    return this.http.post<User>(`${this.url}/AdminUsers/`, user);
  }

  createCpp(user: User): Observable<User> {
    if (user == null) {
      throw new Error('user no puede ser null');
    }
    return this.http.post<User>(`${this.urlCpp}/Employer/`, user);
  }


  update(user: any) {
    if (user == null) {
      throw new Error('user no puede ser null');
    }
    return this.http.put(`${this.url}/AdminUsers/`, user);
  }

  updateLock(user: any) {
    if (user == null) {
      throw new Error('user no puede ser null');
    }
    let metod = 'lock';
    user.Url = null;
    user.appId = AppConfig.settings.application.id;

    if (user['locked'] == false) {
      user.Url = `${this.urlBase}/#/pwd-reset/{0}`;
      metod = 'Unlock';
    }
    return this.http.put(`${this.url}/AdminUsers/${metod}`, user);
  }

  delete(id: number) {
    return this.http.delete(`${this.url}/AdminUsers/${id}`);
  }

  addRol(userId: number, ids: number[]) {
    const params = {
      userId: userId,
      roleIds: ids
    };
    return this.http.put(`${this.urlCpp}/Employer/AddRoles`, params);

  }

  removeRol(userId: any, ids: any[]) {
    const params = {
      userId: userId,
      roleIds: ids
    };
    return this.http.put(`${this.urlCpp}/Employer/RemoveRoles`, params);
  }

  updateSaml(params: any, changeStatusTo: boolean) {
    params.urlCallback = `${location.origin}/#/pwd-first-time/{0}`;
    if (changeStatusTo) {
      return this.http.put(`${this.url}/AdminUsers/ActiveSaml`, params);
    } else {
      return this.http.put(`${this.url}/AdminUsers/InactiveSaml`, params);
    }
  }

  pendingWelcome(params: WelcomeParametersDTO) {
    return this.http.post(`${this.urlCpp}/Employees/pendingWelcome`, params);
  }

  getPendingWelcome(parameters: any): Observable<PendingWelcomeUsers> {
    if (parameters == null) {
      throw new Error('Parametros no puede ser null');
    }

    return this.http.get<PendingWelcomeUsers>(`${this.url}/AdminUsers/GetPendingWelcome`, { params: parameters });
  }
}
