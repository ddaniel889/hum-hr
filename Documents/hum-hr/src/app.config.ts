import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { IAppConfig } from './modules/shared/models/app-config.model';
import { HttpClient, HttpBackend } from '@angular/common/http';

@Injectable()
export class AppConfig {

  static settings: IAppConfig;
  static FormioAppConfig: any;
  private httpClient: HttpClient;


    constructor(private handler: HttpBackend) {
      this.httpClient = new HttpClient(handler);
    }

    load() {
        const jsonFile = `assets/config/config.${environment.name}.json`;

        AppConfig.FormioAppConfig = {
            appUrl: 'ujthdjjhctfrgsg.form.io',
            apiUrl: 'https://api.form.io'
          };
        return new Promise<void>((resolve, reject) => {
          this.httpClient.get<any>(jsonFile).toPromise()
          .then(response => {
               AppConfig.settings = <IAppConfig>response;
               resolve();
            }).catch((response: any) => {
               reject(`Could not load file '${jsonFile}': ${JSON.stringify(response)}`);
            });
        });
    }
}
