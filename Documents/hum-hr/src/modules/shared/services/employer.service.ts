import { Injectable } from '@angular/core';
import { AppConfig } from 'src/app/app.config';
import { HttpClient } from '@angular/common/http';
import { User } from '../models';
import { Observable } from 'rxjs';
import { AddMetadataItem } from '../models/metadata.model';

@Injectable({
  providedIn: 'root'
})
export class EmployerService {
  url = AppConfig.settings.apiUrls.cpp;
  constructor(private http: HttpClient) { }

  enable(id: number) {
    return this.http.get(`${this.url}/Employer/enable/${id}`);
  }

  disable(id: number) {
    return this.http.get(`${this.url}/Employer/disable/${id}`);
  }

  addMetadataValue(item: AddMetadataItem): Observable<AddMetadataItem> {
    return this.http.put<AddMetadataItem>(
      `${this.url}/Administration/addMetadataValue`,
      item
    );
  }

  editMetadataValue(item: AddMetadataItem): Observable<AddMetadataItem> {
    return this.http.put<AddMetadataItem>(
      `${this.url}/Administration/editMetadataValue`,
      item
    );
  }

  createAdjectivedUser(user: User,useAdjetivationRolSignatory: boolean = false,isFirmante: boolean = false): Observable<User> {
    if(isFirmante && useAdjetivationRolSignatory)
    {
      return this.http.post<User>(
        `${this.url}/Employer/CreateAdjSignerRole`,
        user
      );
    }
    else if (!isFirmante && useAdjetivationRolSignatory)
    {
      return this.http.post<User>(
        `${this.url}/Employer/CreateNonAdjSigRole`,
        user
      );
    }
    else
    {
      return this.http.post<User>(
        `${this.url}/Employer/CreateAdjectivedUser`,
        user
      );
    }
  }
}
