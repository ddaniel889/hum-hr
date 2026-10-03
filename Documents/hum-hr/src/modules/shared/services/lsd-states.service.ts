import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConfig } from 'src/app/app.config';
import { Observable, of } from 'rxjs';
import { LsdStates } from '../models/lsd-states.model';
import { map } from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class LsdStatesService {
  urlCPP = AppConfig.settings.apiUrls.cpp;

  constructor(private http: HttpClient) { }

  getStates(): Observable<LsdStates[]> {
    const states: LsdStates[] = JSON.parse(localStorage.getItem(`lsdStates`));
    if (states) {
      return of(states);
    }

    return this.http.get<any[]>(`${this.urlCPP}/LsdState`)
    .pipe(
      map(result => {
          const retorno = result.map(item => {
            return { key: item.key, states: JSON.parse(item.states.replaceAll("'", '"'))};
          });

          localStorage.setItem(`lsdStates`, JSON.stringify(retorno));

          return retorno;
        })
    );
  }

}
