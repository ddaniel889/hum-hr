import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AppConfig } from 'src/app/app.config';
import { Person, PersonPreview } from '../models/Employee/person.model';
import { EmployeeExport } from '../models/employee-export.model';
import { CandidateExport } from '../models/Employee/candidate-find.model.';
import { ContainerType, OrganizationalUnit } from '../models';
import { map } from 'rxjs/operators';
import { FileDocument } from '../models/file-document.model';
import { Certificate } from '../models/certificate.model';

@Injectable()

export class PersonService {
  private nroCelSystemname = '_nroCel';

  url = AppConfig.settings.apiUrls.cpp;

  constructor(private http: HttpClient) { }

  getAvatar(parameters: PersonPreview): Observable<any> {
    return this.http
      .put(
        `${this.url}/Person/GetAvatar`, parameters);
  }

  updateLocalStoragePhoneNumber(newPhone: string): boolean {
    this.getMyContainer().toPromise().then(container => {
      const cellPhone = container.metadatas.filter(x => x.metadataSystemName === this.nroCelSystemname);
      if (cellPhone && cellPhone.length > 0) {
        cellPhone[0].metadataValue = newPhone;
      }
      localStorage.setItem('myContainer', JSON.stringify(container));
      return true;
    });
    return false
  }

  uploadAvatar(personPreview: PersonPreview): Observable<any> {
    return this.http
      .post<string>(
        `${this.url}/Person/UploadAvatar`,
        personPreview
      );
  }

  uploadAvatarByUser(personPreview: PersonPreview): Observable<any> {
    return this.http
      .post<string>(
        `${this.url}/Person/UploadAvatarByUser`,
        personPreview
      );
  }

  export(model: CandidateExport | EmployeeExport, withDocuments: boolean = false): Observable<string> {
    const controller = (model as CandidateExport).isCandidate ? 'CANDIDATE' : 'EMPLOYEES';
    return this.http
      .put<string>(
        `${AppConfig.settings.apiUrls.cpp}/${controller}/ExportXls`,
        model
      );
  }

  validateFiscalId(fiscalId: string, ou: OrganizationalUnit): Observable<boolean> {
    if (ou && ou.isProductive) {
      const params = {
        FiscalId: fiscalId,
        CountryId: ou.country.id
      };
      return this.http.get<boolean>(`${AppConfig.settings.apiUrls.cpp}/Person/ValidateFiscalId/`, { params: params });
    } else {
      return of(true);
    }
  }

  getMyContainer() {
    const myContainer: Person = JSON.parse(localStorage.getItem(`myContainer`));
    if (myContainer) {
      return of(myContainer);
    }
    // localStorage.setItem('DocumentationTypes', JSON.stringify(documentationTypes));
    return this.http.get<Person>(`${AppConfig.settings.apiUrls.cpp}/Person/MyContainer`).pipe(
      map((res: Person) => {
        const person = this.mapSingleResponse(res);
        localStorage.setItem('myContainer', JSON.stringify(res));
        return person;
      })
    );
  }

  getMyContainerType() {
    //Si ya esta en el localStorage lo uso
    const MyContainerType: ContainerType = JSON.parse(localStorage.getItem(`myContainerType`));
    if (MyContainerType) {
      return of(MyContainerType);
    }
    return this.http.get<ContainerType>(`${AppConfig.settings.apiUrls.cpp}/Person/MyContainerType`).pipe(
      map((res: ContainerType) => {
        localStorage.setItem('myContainerType', JSON.stringify(res));
        return res;
      })
    );
  }


  multiplesignDocument(docs: FileDocument[], certificate: Certificate, password: string, signatureResult: string): Observable<string> {
    const documentsParam = [];
    docs.forEach(element => {
      documentsParam.push({
        key: element.id,
        value: +element.documentationTypeId
      });
    });

    const CertificateTypePersonID = 0;

    const param = {
      documents: documentsParam,
      certificateId: certificate.id,
      certificateKey: password,
      signatureResult: signatureResult,
      certificateTypeId: CertificateTypePersonID,
      certificateSingleSignatureAction: certificate.singleSignatureAction
    };
    return this.http
      .put(`${AppConfig.settings.apiUrls.cpp}/person/multipleSign`, param).pipe(map(res => res as string));
  }

  validatePerson(fiscalId: string, ouId: any): Observable<Person> {
    const params = {
      FiscalId: fiscalId,
      OuId: ouId
    };
    return this.http.get<Person>(`${AppConfig.settings.apiUrls.cpp}/Person/ValidatePerson/`, { params: params });
  }

  mapSingleResponse(res: Person): Person {
    const response: Person = new Person();
    if (!res) {
      return response;
    }
    response.id = res.id;
    response.organizationalUnitId = res.organizationalUnitId;
    response.organizationalUnitName = res.organizationalUnitName;
    response.metadatas = res.metadatas;
    response.url = res.url;
    response.containerTypeId = res.containerTypeId;
    response.urlBase = res.urlBase;
    response.nickName = res.nickName;
    response.hasActiveCertificate = res.hasActiveCertificate;
    response.preview = res.preview;
    response.certificateProviderId = res.certificateProviderId;
    response.certificateExpirationDate = res.certificateExpirationDate;
    response.candidateSet = res.candidateSet;
    response.excludedMetadatasFromAdd = res.excludedMetadatasFromAdd;
    return response;
  }
}
