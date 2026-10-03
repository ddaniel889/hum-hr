import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { reject } from 'q';
import { Observable, of } from 'rxjs';
import { map } from "rxjs/operators";
import { AppConfig } from 'src/app/app.config';
import { AuthService } from '../auth/auth.service';
import { MessageService } from '../errorHandler/message.service';
import { OrganizationalUnit } from '../models';
import { OrganizationalUnitConfig } from '../models/organizational-unit-config.model';
import { OrganizationalUnitImages } from '../models/organizational-unit-images.model';
import { TokenCertificateParameters } from '../models/tokenCertificateParameters.model';
import { HotjarService } from './hotjar.service';

@Injectable({
  providedIn: 'root'
})
export class OrganizationalUnitService {
  url = AppConfig.settings.apiUrls.auth;
  urlCpp = AppConfig.settings.apiUrls.cpp;
  ousConfigs: OrganizationalUnitConfig[];
  reponse: OrganizationalUnit[];

  constructor(private http: HttpClient,
    private auth: AuthService,
    private msjService: MessageService,
    private hotjarService: HotjarService) {
    this.ousConfigs = [];

    auth.onIdentityChanged(() => {
      // Cuando cambia el usu logueado vacio lo que tengo.
      this.ousConfigs = [];
    });
  }

  getCurrentOrChildOU(): OrganizationalUnit {
    if (localStorage.getItem("currentOU") != null) {
      // Si es una OU grupo devuelvo la primer hija que tenga disponible
      const currentOu: OrganizationalUnit = JSON.parse(localStorage.getItem("currentOU"));
      if (!currentOu.isRoot) {
        return currentOu;
      } else {
        return currentOu.childs[0];
      }
    }
  }

  getCurrentOU(): OrganizationalUnit {
    if (localStorage.getItem("currentOU") != null) {
      return JSON.parse(localStorage.getItem("currentOU"));
    }
  }

  setCurrentOU(ou: OrganizationalUnit) {
    localStorage.setItem('currentOU', JSON.stringify(ou));
    this.hotjarService.injectHotjar(this.getCurrentOrChildOU());
  }

  getTreeInMemory(forceRefresh = false): Promise<OrganizationalUnit[]> {
    return new Promise(async (resolve, error) => {
      if (localStorage.getItem("treeOu") != null && !forceRefresh) {
        return resolve(JSON.parse(localStorage.getItem("treeOu")));
      }

      this.getTree("").toPromise()
        .then(
          data => {
            if (data != null) {
              localStorage.setItem('treeOu', JSON.stringify(data));
              const useDocComments = data.find(d => d.entityId === localStorage.getItem("organizationId").toString()).useDocComments;
              localStorage.setItem("useDocComments", JSON.stringify(useDocComments));
            }
            return resolve(data);
          },
          err => {
            return error(err);
          }
        );
    });
  }

  getTree(name: string): Observable<OrganizationalUnit[]> {
    const params = {
      name: name,
      levelOfDetail: '4', // Complete detail
      onlyEnabled : true.toString()
    };

    return this.http
      .get<Array<OrganizationalUnit>>(`${this.url}/organizationalUnits`, { params });
  }

  getUserTree(userId: number): Observable<OrganizationalUnit[]> {
    return this.http
      .get<Array<OrganizationalUnit>>(`${this.url}/Users/${userId}/OrganizationalUnits`);
  }

  getConfigs(organizationalUnitId: number): Observable<OrganizationalUnitConfig[]> {
    return this.http
      .get<Array<any>>(`${this.url}/AdminOrganizationalUnits/Configs/` + organizationalUnitId)
      .pipe(
        map(res => this.mapResponse(res))
      );
  }

  getLawerRolId(organizationalUnitId): Observable<string> {
    return this.http
      .get<string>(`${this.urlCpp}/LawyerDocuments/Roles/` + organizationalUnitId);
  }


  getTokenParametrosCertificados(): TokenCertificateParameters {

    if (localStorage.getItem("tokenCertificateParameters") != null) {
      const resp = new TokenCertificateParameters();
      const respJson = JSON.parse(localStorage.getItem("tokenCertificateParameters"));
      resp.httpFrom = respJson.httpFrom;
      resp.httpTo = respJson.httpTo;
      resp.httpsFrom = respJson.httpsFrom;
      resp.httpsTo = respJson.httpsTo;


      return resp;
    } else {
      this.getOuConfig(['#OuConfigCertificateProviders'], Number(localStorage.getItem("organizationId"))).then(
        data => {
          const resp = new TokenCertificateParameters();
          const resultHttpFrom = data['metadataValues'].find(x => x.systemName === '#LakautEmployeeCertificateProviderHttpPortFrom');
          const resultHttpTo = data['metadataValues'].find(x => x.systemName === '#LakautEmployeeCertificateProviderHttpPortTo');
          const resultHttpsFrom = data['metadataValues'].find(x => x.systemName === '#LakautEmployeeCertificateProviderHttpsPortFrom');
          const resultHttpsTo = data['metadataValues'].find(x => x.systemName === '#LakautEmployeeCertificateProviderHttpsPortTo');

          if (resultHttpFrom != null && resultHttpFrom.value != null) {
            resp.httpFrom = Number(resultHttpFrom.value);
          }
          if (resultHttpTo != null && resultHttpTo.value != null) {
            resp.httpTo = Number(resultHttpTo.value);
          }
          if (resultHttpsFrom != null && resultHttpsFrom.value != null) {
            resp.httpsFrom = Number(resultHttpsFrom.value);
          }
          if (resultHttpsTo != null && resultHttpsTo.value != null) {
            resp.httpsTo = Number(resultHttpsTo.value);
          }
          localStorage.setItem("tokenCertificateParameters", JSON.stringify(resp));


          return resp;
        }
      );
    }

    return new TokenCertificateParameters();
  }

  saveLogo(id: number, logo: File) {
    const formData: FormData = new FormData();
    formData.append(logo.name, logo, 'logo_' + logo.name);

      return this.http.patch(
      `${this.urlCpp}/OrganizationalUnits/ChangeLogo/` + id, formData);
  }

  saveTheme(ou: OrganizationalUnit) {
    return this.http.patch(
      `${this.urlCpp}/OrganizationalUnits/ChangeTheme/`, ou);
  }

  saveImages(ou: OrganizationalUnit,image: File[], subdomain){
    const formData = this.formDataFile(image);
    formData.append('ou', JSON.stringify(ou));
    formData.append("subDomain", JSON.stringify(subdomain));
      return this.http.post(
      `${this.url}/AdminOrganizationalUnits/Images/`, formData);
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


  getImagesByOuId(id: number): Observable<OrganizationalUnitImages[]> {
    return this.http.put<OrganizationalUnitImages[]>(
      `${this.url}/adminOrganizationalUnits/getImages/` + id, id)
      .pipe(
        map(res => this.mapImagesResponse(res))
      );
  }

  getImagesBySubDomain(subdomain: string): Observable<OrganizationalUnitImages[]> {
    return this.http.put<OrganizationalUnitImages[]>(
      `${this.url}/adminOrganizationalUnits/GetImagesBySubdomain/${subdomain}`, subdomain)
      .pipe(
        map(res => this.mapImagesResponse(res))
      );
  }

  deleteImage(fileId: string) {
    return this.http
      .put<any>(`${this.url}/AdminOrganizationalUnits/DeleteImage/${fileId}`, fileId);
  }

  mapResponse(response: Array<any>): OrganizationalUnitConfig[] {
    const result = [];
    if (!response || response.length === 0) {
      return result;
    }

    response.forEach(ouc => {
      result.push(new OrganizationalUnitConfig(ouc.id, ouc.name, ouc.configName, ouc.isRoot, ouc.metatadataValues));
    });

    return result;
  }

  mapImagesResponse(response: Array<any>): OrganizationalUnitImages[] {
    const result = [];
    if (!response || response.length === 0) {
      return result;
    }

    response.forEach(ouc => {
      result.push(new OrganizationalUnitImages(ouc.id, ouc.isLogo, ouc.base64File, ouc.theme, ouc.organizationalUnitId));
    });

    return result;
  }

  /*
   * Devuelve la configuracion segun la key pasada
   * En orden de prioridad, si existe la primer key, la primera, sino la segunda.
   * Para la ou por parametro
   */
  async getOuConfig(keys: string[], ou: number): Promise<OrganizationalUnitConfig> {
    if (this.ousConfigs.length === 0) {
      await this.getConfigs(ou).toPromise()
        .then(
          c => this.ousConfigs = c,
          error => {
            return reject(error);
          }
        );
    }

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      let configs = this.ousConfigs.filter(c => c.configName === key && c.organizationalUnitId == ou);

      if (configs.length > 0) {
        return configs[0];
      }

      configs = this.ousConfigs.filter(c => c.configName === key && c.isRoot);

      if (configs.length > 0) {
        return configs[0];
      }
    }

    return null;
  }

  getTreeOu() {
    return JSON.parse(localStorage.getItem("treeOu"));
  }

  setTheme(forceRefresh = false) {
    const ouId = +localStorage.getItem("organizationId");
    this.getTreeInMemory(forceRefresh).then(
      ous => {
        const myOu = ous.find(ou => ou.id == ouId);
        if (myOu.humanageTheme && myOu.humanageTheme.length > 0) {
          document.body.classList.add(myOu.humanageTheme);
        }
        if (myOu.darkMode) {
          document.body.classList.add('dark');
        }
        localStorage.setItem(`humanageTheme_${ouId}`, myOu.humanageTheme);
      }
    );
  }

  getOUTheme() {
    const ouId = +localStorage.getItem("organizationId");
    return localStorage.getItem(`humanageTheme_${ouId}`);
  }

  getOuRootTree(forceRefresh = false) {
    if (!forceRefresh) {
      const ous: OrganizationalUnit[] = JSON.parse(localStorage.getItem(`rootTree`));
      if (ous) {
        return of(ous);
      }
    }

    const params = {
      enabled: true.toString()
    };

    return this.http.get<OrganizationalUnit[]>(`${this.urlCpp}/OrganizationalUnits/rootTree`, { params }).pipe(map(res => {
      localStorage.setItem(`rootTree`, JSON.stringify(res));
      return res;
    }));
  }


}
