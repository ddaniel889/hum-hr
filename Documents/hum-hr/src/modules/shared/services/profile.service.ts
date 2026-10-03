import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppConfig } from 'src/app/app.config';
import { AuthService } from '../auth/auth.service';
import { Certificate, IProfile, CertificateType } from '../models';
import { Dictionary } from '../models/Generics/dictionary.model';
import { formatDate } from '@angular/common';
import { HolographicSign } from '../models/holographicSign';
import { OrganizationalUnitAccessConfigService } from './organizational-unit-access-configs.service';
import { OrganizationalUnitAccessConfig } from '../models/ou-access-config.model';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  authUrl = AppConfig.settings.apiUrls.auth;
  cppUrl = AppConfig.settings.apiUrls.cpp;
  myProfile: Observable<IProfile> = null;
  myCertificates: Dictionary<number, Certificate[]>;
  myCertificatesForOu = new BehaviorSubject<Certificate[]>([]);
  myCertificatesExpired = new BehaviorSubject<Certificate[]>([]);

  constructor(private http: HttpClient,
    private auth: AuthService,
    private ouAccessConfigService: OrganizationalUnitAccessConfigService
  ) {
    this.myCertificates = new Dictionary<number, Certificate[]>();
    this.myCertificatesForOu = new BehaviorSubject<Certificate[]>([]);
    auth.onIdentityChanged(() => {
      // Cuando cambia el usu logueado vacio lo que tengo.
      this.myCertificates = new Dictionary<number, Certificate[]>();
      this.myCertificatesForOu = new BehaviorSubject<Certificate[]>([]);
    });
  }

  getMyProfile(): Observable<IProfile> {
    this.myProfile = this.http.get<IProfile>(`${this.authUrl}/Logins/logged`);
    return this.myProfile;
  }

  mapResponse(res: Certificate[]): Certificate[] {
    this.myCertificatesForOu.next(res);
    return res;
  }
  mapResponseExpired(res: Certificate[]): Certificate[] {
    this.myCertificatesExpired.next(res);
    return res;
  }

  subscribeToMyCertificateForOu() {
    return this.myCertificatesForOu.asObservable();
  }

  refreshMyActiveCertificatesForOu(organizationalUnitId: string, certificateType?: string, signType?: string): Observable<Certificate[]> {
    return this.getMyActiveCertificates(organizationalUnitId, certificateType, signType);
  }

  getMyActiveCertificates(organizationalUnitId: string, certificateType?: string, signType?: string): Observable<Certificate[]> {
    //certificateType = (this.auth.isInRole('FIRMANTE') || this.auth.isInRole('LAWBOOK SIGN')) ? CertificateType.Employer.toString() : CertificateType.Employee.toString();
    const params = new HttpParams()
      .set('organizationalUnitId', organizationalUnitId)
      .set('enabled', 'true')
      .set('active', 'true')
      .set('type', certificateType)
      .set('signType', signType);
    return this.http.get<Certificate[]>(`${this.authUrl}/ProfileCertificate`, {
      params: params
    }).pipe(map(res => this.mapResponse(res)));
  }

  getMyExpiredCertificates(organizationalUnitId: string, certificateType?: number, signType?: string): Observable<Certificate[]> {
    //certificateType = (this.auth.isInRole('FIRMANTE') || this.auth.isInRole('LAWBOOK SIGN')) ? CertificateType.Employer.toString() : CertificateType.Employee.toString();
    const params = new HttpParams()
        .set('organizationalUnitId', organizationalUnitId)
        .set('enabled', 'true')
        .set('active', 'true')
        .set('CertificateTypeId', certificateType)
        .set('signType', signType);
      return this.http.get<Certificate[]>(`${this.authUrl}/ProfileCertificate/GetMyExpiredCertificates`, {
        params: params
      }).pipe(map(res => this.mapResponseExpired(res)));
    }

  uploadProfile(profile: IProfile): Observable<any> {
    return this.http.put(`${this.cppUrl}/profile/`, profile);
  }

  manageCertificateCardinal(urlBase: String, certificate: Certificate) {
    let params = new HttpParams();
    params = params.append("urlBase", urlBase.toString());
    params = params.append("certificateProviderId", certificate.providerId.toString());
    params = params.append("certificateId", certificate.id.toString());
    params = params.append("certificateTypeId", certificate.typeId.toString());
    const date = (certificate.expirationDate != null) ? formatDate(certificate.expirationDate, 'yyyy-MM-dd', 'en-US') : null;
    params = params.append("ExpirationDate", date);

    if (certificate.typeId == CertificateType.Employee) {
      return this.http.get(`${this.cppUrl}/EmployeeFileCertificates/manageCertificate`, { params: params });
    } else {
      return this.http.get(`${this.cppUrl}/Employer/manageCertificate`, { params: params });
    }
  }

  async getMySignCertificates(organizationalUnitId: number, forceSearch = false): Promise<Certificate[]> {
    if (!this.myCertificates.exist(organizationalUnitId) || forceSearch) {
      await this.getMyActiveCertificates(
        organizationalUnitId.toString(), undefined).toPromise()
        .then(c => {
          if (this.myCertificates.exist(organizationalUnitId)) {
            this.myCertificates.removeItem(organizationalUnitId);
          }
          this.myCertificates.Add(organizationalUnitId, c);
        }
        );
    }
    const certs = this.myCertificates.get(organizationalUnitId);

    if (!certs) {
      return [];
    }

    return certs.filter(f => f.enabled);
  }

  setHolographicSign(holoSign: HolographicSign): Observable<HolographicSign> {
    return this.http.put<HolographicSign>(`${this.cppUrl}/profile/SetHolographicSign`, holoSign);
  }

  getHolographicSign(userId: string): Observable<HolographicSign> {
    return this.http.get<HolographicSign>(`${this.cppUrl}/profile/getHolographicSign/${userId}`);
  }

  DeleteOlographicSign(userId: string): Observable<HolographicSign> {
    return this.http.delete<HolographicSign>(`${this.cppUrl}/profile/DeleteOlographicSign/${userId}`);
  }

  getAccessConfigByOu(ouId: number): Observable<OrganizationalUnitAccessConfig> {
    const isCandidate = this.auth.isCandidate();
    const key = `accessConfig_${ouId}_${isCandidate}`;
    let ouAccessConfig: OrganizationalUnitAccessConfig = JSON.parse(localStorage.getItem(key));
    if (ouAccessConfig) {
      return of(ouAccessConfig);
    }
    return this.ouAccessConfigService.getByOuId(ouId, isCandidate)
      .pipe(
        map((res: OrganizationalUnitAccessConfig[]) => {
          if (res && res.some(item => item.isCandidate == isCandidate)) {
            ouAccessConfig = res.find(item => item.isCandidate == isCandidate);
          } else {
            ouAccessConfig = new OrganizationalUnitAccessConfig();
          }
          localStorage.setItem(key, JSON.stringify(ouAccessConfig));
          return ouAccessConfig;

        })
      );;
  }

  haveExpiredCertificates(ouId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.authUrl}/ProfileCertificate/HaveExpiredCertificates/${ouId}`);
  }

}
