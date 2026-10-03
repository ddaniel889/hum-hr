import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppConfig } from 'src/app/app.config';
import { AuthService } from '../auth/auth.service';
import { User } from '../models';

@Injectable({
  providedIn: 'root'
})
export class SamlService {
  url = AppConfig.settings.apiUrls.auth;
  urlBase = location.origin;
  urlCpp = AppConfig.settings.apiUrls.cpp;
  constructor(private http: HttpClient, private auth: AuthService) {
  }

  getSamlUrl(key: string): Observable<string> {
    return this.http.get<string>(`${this.url}/GetSaml/${key}`);
  }

  getSamlIdentityRequest(key: string): Observable<string> {
    return this.http.get<string>(`${this.url}/SamlIdentity/request?SAMLRequest=${key}`);
  }


}
