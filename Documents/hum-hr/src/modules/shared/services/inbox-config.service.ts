import { Injectable } from '@angular/core';
import { AppConfig } from 'src/app/app.config';
import { HttpClient } from '@angular/common/http';
import { InboxConfig } from '../models/inbox-config.model';

@Injectable()
export class InboxConfigService {
  url = AppConfig.settings.apiUrls.cpp;
  constructor(private http: HttpClient) { }

  getByOuId(ouId: number) {
    return this.http.get<InboxConfig[]>(`${this.url}/Administration/GetInboxConfigs/${ouId}`);
  }
}
