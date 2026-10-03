import { Injectable } from '@angular/core';
import { AppConfig } from 'src/app/app.config';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Analytics } from '../models/analytics.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  url = AppConfig.settings.apiUrls.cpp;
  constructor(private http: HttpClient) { }

  find(dto: any): Observable<Analytics> {
    return this.http.put<any[]>(`${this.url}/analytics/find`, dto)
      .pipe(map(res => this.mapResponseToAnalytics(res)));
  }

  mapResponseToAnalytics(res: any[]): Analytics {
    const listAn: Analytics[] = [];
    let previosId = '';
    const analytics = new Analytics();
    analytics.isAllSigned = true;
    analytics.chartType = "bar";
    analytics.chartData.push({
      data: [],
      label: ' % Firmados',
      stack: 'a',
      backgroundColor: '#009688',
      borderColor: '#009688',
      borderWidth: 0,
      hoverBackgroundColor: '#4DB6AC',
      hoverBorderColor: '#4DB6AC',
      barThickness: "flex",
      maxBarThickness: 32,
    });

    analytics.chartData.push({
      data: [],
      label: ' % No Firmados',
      stack: 'a',
      backgroundColor: '#E91E63',
      borderColor: '#E91E63',
      borderWidth: 0,
      hoverBackgroundColor: '#F06292',
      hoverBorderColor: '#F06292',
      barThickness: "flex",
      maxBarThickness: 32,
    });

    res.forEach(item => {
      if (previosId != item.groupId) {
        previosId = item.groupId;
        // Busco los totales del grupo
        const signedData = res.find(i => i.groupId === item.groupId && i.signedByUser);
        const notSignedData = res.find(i => i.groupId === item.groupId && !i.signedByUser);
        const signedCount = signedData ? signedData.totalDocuments : 0;
        const notSignedCount = notSignedData ? notSignedData.totalDocuments : 0;
        const total = signedCount + notSignedCount;

        if (notSignedCount > 0) {
          analytics.isAllSigned = false;
        }

        analytics.total = total;

        // Guardo el label nuevo
        const docsEmitted = [];
        docsEmitted.push(item.groupName);
        if (total > 1) {
          docsEmitted.push(' ' + total + ' Documentos');
        }

        if (total == 1) {
          docsEmitted.push(' ' + total + ' Documentos');
        }
        analytics.labels.push(docsEmitted);

        // Guardo los porcentajes
        const position = analytics.labels.length - 1;
        const signedPer = Math.round((signedCount * 100) / total);
        analytics.chartData[0].data[position] = signedPer;
        let notSignedPer = Math.round((notSignedCount * 100) / total);
        if ((signedPer + notSignedPer) != 100) {
          notSignedPer = 100 - signedPer;
        }
        analytics.chartData[1].data[position] = notSignedPer;
      }
    });
    listAn.push(analytics);
    return listAn[0];
  }
}
