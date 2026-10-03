export class NotificationRequest {
  id: string;
  runFrom?: Date;
  creationDate?: Date;
  organizationalUnitId: number;
  roleIdTo?: number;
  userIdTo?: number;
  mailTo: string;
  userId: number;
  userName: string;
  templateId: string;
  notificationRequestData: any[];
  urlCallback: string;
  notUserIds: number[];
  appId: number;
  forAppId: number;
  files: any[];
  forceRepeat?: boolean;
  priority?: boolean;
  force?: boolean;
  isMassive?: boolean;
}