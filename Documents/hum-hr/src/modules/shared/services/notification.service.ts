import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppConfig } from 'src/app/app.config';
import { Notification } from '../models/notification.model';
import { NotificationRequest } from '../models/notificationRequest.model';
import { NotificationSearchDto } from '../models/NotificationSearchDto.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  url = AppConfig.settings.apiUrls.notif;
  urlCpp = AppConfig.settings.apiUrls.cpp;

  constructor(private http: HttpClient) { }

  get(type: string, userId: string, organizationalUnitId: string, statePending: boolean): Observable<Notification> {
    const params = {
      type: type,
      userId: userId,
      organizationalUnitId: organizationalUnitId,
      statePending: statePending.toString(),
      forAppId: AppConfig.settings.application.id.toString()
    };
    return this.http.get<Notification>(`${this.url}/Notifications`, { params: params }).pipe(map(res => this.mapResponse(res)));

  }


  mapResponse(res): Notification {
    if (!res || res.length == 0) {
      return null;
    }
    const notif = new Notification();
    notif.id = res[0].id;
    notif.body = res[0].body;
    notif.title = res[0].title;
    notif.askCredentialsForApproval = res[0].askCredentialsForApproval;
    notif.sendMail = res[0].sendMail;
    if (res[0].files) {
      notif.fileBase64 = res[0].files[0].fileBase64;
      notif.showFile = true;
    } else {
      notif.showFile = false;
    }
    return notif;
  }

  approve(notif: Notification): Observable<any> {
    const params = {
      id: notif.id,
      nickName: notif.nickName,
      password: notif.password
    };

    return this.http.put(`${this.url}/Notifications/approve`, params);
  }

  hasPendingAction(id: number) {
    return this.http.get(`${this.urlCpp}/FileDocuments/pending/${id}`);
  }

  notifPendingAction(params: NotificationSearchDto) {
    return this.http.post(`${this.urlCpp}/Employees/pendingAction`, params);
  }
  notifPendingMassiveAction(UserIds: number[]) {    
    return this.http.post(`${this.urlCpp}/Employees/notifyMassive`, UserIds);
  }
  getLastNotifyRequest(ouId: number) {
    return this.http
      .get<NotificationRequest>(`${this.url}/NotificationsRequests/GetLastNotifyRequest?OuId=${ouId}`)
      .pipe(
        map(res => {
          return this.mapNotificationRequest(res);
        })
      );
  }
  notifPendingMassive(ouId: number) {
    return this.http.post(`${this.urlCpp}/Employees/NotifyMassiveAsync/${ouId}`, null);
  }
  
  mapNotificationRequest(res): NotificationRequest {
    if (!res) {
      return null;
    }
    const notifRequest = new NotificationRequest();
    notifRequest.id = res.id;
    notifRequest.runFrom = new Date(res.runFrom);
    notifRequest.creationDate = new Date(res.creationDate);
    notifRequest.organizationalUnitId = res.organizationalUnitId;
    notifRequest.roleIdTo = res.roleIdTo;
    notifRequest.userIdTo = res.userIdTo;
    notifRequest.mailTo = res.mailTo;
    notifRequest.userId = res.userId;
    notifRequest.userName = res.userName;
    notifRequest.templateId = res.templateId;
    notifRequest.urlCallback = res.urlCallback;
    notifRequest.notUserIds = res.notUserIds;
    notifRequest.appId = res.appId;
    notifRequest.forAppId = res.forAppId;
    notifRequest.forceRepeat = res.forceRepeat;
    notifRequest.priority = res.priority;
    notifRequest.force = res.force;
    notifRequest.isMassive = res.isMassive;
    notifRequest.files = res.files;
    notifRequest.notificationRequestData = res.notificationRequestData;

    return notifRequest;
  }
}
