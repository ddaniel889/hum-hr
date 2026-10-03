import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { AppConfig } from "../../../app.config";
import { map } from "rxjs/operators";
import { BehaviorSubject, Observable } from "rxjs";
import { CertificateProvider } from "../models/certificate-provider.model";
import { CertificatePost } from '../models/certificatePost.model';
import { Certificate, CertificateType } from '../../shared/models';
import { SignatureType } from "../models/signatureType.model";
import { ICertificatePwdRequest } from "../models/certificate-pwd.model";

@Injectable({
  providedIn: "root"
})
export class CertificateService {

  url = AppConfig.settings.apiUrls.auth;
  urlCpp = AppConfig.settings.apiUrls.cpp;
  myCertificatesForOu = new BehaviorSubject<Certificate[]>([]);
  myCertificatesExpired = new BehaviorSubject<Certificate[]>([]);

  constructor(private http: HttpClient) { }
//  TODO: guardar en storage
  getCertificateProviders(type: number, ouId: string): Observable<CertificateProvider> {
    return this.http
      .get<CertificateProvider>(`${this.url}/Certificate/Providers/${type}/${ouId}`)
      .pipe(
        map(res => {
          if (res == null) {
            throw new Error("ErrorLDConfig");
          }
          return res;
        })
      );

  }

  getSignatureTypes(dto: any): Observable<SignatureType[]> {
    if (dto == null) {
      throw new Error('El dto no puede ser null');
    }
    return this.http
      .get<SignatureType[]>(`${this.url}/SignatureTypes`, { params: dto });
  }

  getSignatureTypesByOuId(ouId: number): Observable<SignatureType[]> {
    if (ouId == null) {
      throw new Error('El id no puede ser null');
    }
    return this.http
      .get<SignatureType[]>(`${this.url}/SignatureTypes/${ouId}`);
  }

  getAllCertificates(id: number): Observable<Certificate[]> {
    return this.http
      .get<Certificate[]>(`${this.url}/Certificate/All/${id}`)
      .pipe(
        map(res => {
          if (res == null) {
            throw new Error("Error al intentar obtener la lista de certificados del usuario.");
          }
          return res;
        })
      );
  }

  getCertificates(id: number,type: number): Observable<Certificate[]> {
    return this.http
      .get<Certificate[]>(`${this.url}/Certificate/All/${id}/${type}`)
      .pipe(
        map(res => {
          if (res == null) {
            throw new Error("Error al intentar obtener la lista de certificados del usuario.");
          }
          return res;
        })
      );
  }

  certificateMassiveDeclaration(certificate: CertificatePost) {
    return this.http.post(`${this.url}/ProfileCertificate/MassiveDeclaration`, certificate);
  }

  certificateEmployeeDeclaration(certificate: CertificatePost) {
    return this.http.post(`${this.url}/ProfileCertificate`, certificate);
  }

  certificateEmployerDeclaration(certificate: CertificatePost, files: File[]) {

    const formData: FormData = new FormData();
    if (files && files.length > 0) {

      for (let index = 0; index < files.length; index++) {
        const file = files[index];
        formData.append(file.name, file, file.name);
      }
    }
    formData.append('dto', JSON.stringify(certificate));

    return this.http.post(`${this.urlCpp}/Employer/CertDeclaration`, formData);
  }

  renewExpiredCertificates(urlBase: string,certificate: CertificatePost, files: File[]) {

    const formData: FormData = new FormData();
    if (files && files.length > 0) {
      for (const file of files) {
        formData.append(file.name, file, file.name);
      }
    }
    formData.append('dto', JSON.stringify(certificate));
    formData.append('urlBase',JSON.stringify(urlBase));
    return this.http.post(`${this.urlCpp}/Employees/RenewCertificate`, formData);
  }

  renewCertificatesMassive(urlBase: string, ouid: string) {

    const formData: FormData = new FormData();
    formData.append('ouId', ouid);
    formData.append('urlBase',urlBase);
    return this.http.post(`${this.urlCpp}/Employees/RenewCertMassive`, formData);
  }
  automanage(request: ICertificatePwdRequest) {
    return this.http.put(`${this.url}/Certificate/automanage/finish`, request);
  }

  forgotPassword(certificate: CertificatePost) {
    if (certificate.Type == CertificateType.Employee) {
      return this.http.post(`${this.url}/ProfileCertificate/ForgotPassEmployee`, certificate);
    } else {
      return this.http.post(`${this.url}/ProfileCertificate/ForgotPassEmployer`, certificate);

    }

  }



  getMyExpiredCertificates(organizationalUnitId: string, certificateType?: number, signType?: string): Observable<Certificate[]> {
    //certificateType = (this.auth.isInRole('FIRMANTE') || this.auth.isInRole('LAWBOOK SIGN')) ? CertificateType.Employer.toString() : CertificateType.Employee.toString();
    const params = new HttpParams()
        .set('organizationalUnitId', organizationalUnitId)
        .set('enabled', 'true')
        .set('active', 'true')
        .set('CertificateTypeId', certificateType)
        .set('signType', signType);
      return this.http.get<Certificate[]>(`${this.url}/ProfileCertificate/GetMyExpiredCertificates`, {
        params: params
      }).pipe(map(res => this.mapResponseExpired(res)));
    }

    mapResponse(res: Certificate[]): Certificate[] {
      this.myCertificatesForOu.next(res);
      return res;
    }
    mapResponseExpired(res: Certificate[]): Certificate[] {
      this.myCertificatesExpired.next(res);
      return res;
    }
}
