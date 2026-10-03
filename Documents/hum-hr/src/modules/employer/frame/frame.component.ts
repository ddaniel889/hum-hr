import { Component, OnInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { AppConfig } from "src/app/app.config";
import { AuthService } from "src/app/modules/shared/auth/auth.service";
import { MessageService } from "src/app/modules/shared/errorHandler/message.service";
import { environment } from "src/environments/environment";
import { OrganizationalUnitService } from "../../shared/services/organizational-unit.service";
import { AuthGuardService } from './../../shared/services/auth-guard.service';
import { NotificationService } from "../../shared/services/notification.service";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { AddMenuDialogComponent } from "../add-menu-dialog/add-menu-dialog.component";
import { RRHHNotification } from '../../shared/models/ui-notifications.model';
import { UiNotificationsService } from "../../shared/services/ui-notifications.service";
import { FileDocumentViewModalComponent } from "../../shared/file-document-view-modal/file-document-view-modal.component";
import { FileDocumentService } from "../../shared/services/file-document.service";
import { ReleaseNotesDialogComponent } from "../../shared/release-notes-dialog/release-notes-dialog.component";
import { DocumentationTypesService } from "../../shared/services/documentation-types.service";
import { ProcesResultTotals } from '../../shared/models/process-result-totals.model';
import { SharePersonResponseDialogComponent } from "../share-person-response-dialog/share-person-response-dialog.component";
import { EmployeeService } from "../../shared/services/employee.service";
import { CustomConfigService } from "../../shared/services/custom-config.service";
import { Employee } from "../../shared/models";
import { EmployeeFileDocumentDialogData } from "../../shared/models/employee-file-document-dialog-data.model";

@Component({
  selector: "app-frame",
  templateUrl: "./frame.component.html", //frame
  styles: []
})
export class FrameComponent implements OnInit {
  version = environment.version;
  initials: string;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly msjService: MessageService,
    private readonly ouService: OrganizationalUnitService,
    private readonly authGuardService: AuthGuardService,
    private readonly notifService: NotificationService,
    public dialog: MatDialog,
    private readonly uiNotificationsService: UiNotificationsService,
    private readonly fileDocumentService: FileDocumentService,
    private readonly documentationTypesService: DocumentationTypesService,
    private readonly employeeService: EmployeeService,
    private readonly ouHelpLinkConfigService: CustomConfigService
  ) {
  }

  @ViewChild("sidenav") sidenav: any;
  opened: any = false;
  editMode = false;
  isOpen = false;
  loading = false;
  userFirstname: string;
  userlastname: string;
  userFullName: string;
  organizationalUnitName: string;
  showAppsMenu: boolean;
  urlIcon: string;
  menuFocus = false;
  organizationalUnitId: string;
  isExpanded = false;
  element: HTMLElement;
  appLinks: any[];
  isSamlActive = false;
  samlReturnUrl: string;
  releaseName = AppConfig.settings.releaseName;
  notifications: RRHHNotification[] = [];
  processToNotif: ProcesResultTotals[] = [];
  totalNotifications = 0;
  loadNotifications = false;
  userId: string;
  isCertificateDeclarationOpen = false;
  certificateAddPersonId: number[];
  entity: any;
  showSettings = false;
  isLeaveConfig = false;
  isLeaveApprov = false;
  minAccessValue = AppConfig.settings.application.minAccessValue;
  gestionBasic: boolean = false;
  gestionAdmin: boolean = false;
  hasAdjetivation: boolean = true;
  allAdjetivationEmployee:boolean = false;
  canUseProcessWithMicroservices: boolean = false;
  useDashboard: boolean = false;
  useConnect: boolean = false;

  ngOnInit() {
    // Al entrar al frame verifico si tiene los parametros de router alterados
    if (this.router.onSameUrlNavigation !== 'ignore') {
      // Si fueron cambiados para hacer el reload inicial lo vuelvo al original porque ya cumplio el objetivo
      this.router.onSameUrlNavigation = 'ignore';
      this.router.routeReuseStrategy.shouldReuseRoute = (future, curr) => {
        return future.routeConfig === curr.routeConfig;
      };
    }

    document.body.hidden = false;
    this.userId = this.authService.getUserId();
    this.organizationalUnitName = this.authService.getOrganizationName();
    this.organizationalUnitId = this.authService.getOrganizationId();
    this.userFirstname = this.authService.getUserFirstName();
    this.userlastname = this.authService.getUserLastName();
    this.userFullName = this.userlastname + ', ' + this.userFirstname;
    this.initials = this.userlastname + ' ' + this.userFirstname;
    this.isSamlActive = this.authService.isSamlActive();
    this.samlReturnUrl = this.authService.getSamlReturnUrl();
    this.showSettings = this.authService.RRHHManagment();
    this.isLeaveConfig = this.authService.isLeaveConfig();
    this.isLeaveApprov =  this.authService.isLeaveApprov();
    const metaFilters = [];
    metaFilters.push(this.authService.hasFiltersMetadatos().toPromise());
    metaFilters.push(this.authService.hasFilterAdjetivation(0).toPromise());
    Promise.all(metaFilters).then(meta =>{
      this.SetMetadataFilters(meta[0]);
      this.SetAdjetivationFilters(meta[1]);
      this.hasAdjetivation = JSON.parse(localStorage.getItem("hasFiltersMetadata")) as boolean ?? false;
      this.allAdjetivationEmployee = JSON.parse(localStorage.getItem("allAdjetivationEmployee")) as boolean ?? false;
    });
    this.uiNotificationsService.subscribeToNotificationProcess()
      .subscribe({
        next: (data: any) => {
          this.notifications = data.notifications;
          this.processToNotif = data.process;
          this.totalNotifications = data.totalNotificationCount;
          this.loadNotifications = false;
        },
        error: (err: any) => console.log(err)
      });

    this.refreshNavigationBar();
    window.scroll(0, 0);
    this.refreshNotificacion();
    this.ouService.setTheme();
    localStorage.setItem("isEmployee","false");
  }

  editingMode() {
    this.editMode = !this.editMode;
  }

  isFirmante(): boolean {
    return this.authGuardService.userHasFunction(['FIRMANTE']);
  }

  isRRHH(): boolean {
    return this.authGuardService.userHasFunction(['RRHH_CONTENT']);
  }

  goAnalytics() {
    if (this.CanViewAnalitics()) {
      this.router.navigate(["employer/analytics"]);
    } else if (this.isCandidateAdmin() || this.isCandidateAdminBasic()) {
      this.router.navigate(["employer/analytics-document-set"]);
    }
    return;
  }
  isAdministrator(): boolean {
    return this.authGuardService.userHasFunction(['RRHH_ACCESS']);
  }

  isLeaveManage(): boolean {
    return  this.authService.isLeaveManager();
  }

  isLeaveAprov(): boolean {
    return  this.authService.isLeaveApprov();
  }
  isLDSAdministrator(): boolean {
    return this.authGuardService.userHasFunction(['LSD_HUMANAGE']);
  }

  isOverseer(): boolean {
    return this.authService.isOverseer();
  }

  CanViewAnalitics()
  {
    return (this.isRRHH());
  }

  isAdminDashBoard() {
    return (this.authGuardService.userHasFunction(['DASHBOARDADMIN']));
  }
  isCandidateAdmin() {
    return this.authGuardService.userHasFunction(['CANDIDATEADMIN']);
  }

  isRRHHManagment() {
    return this.authGuardService.userHasFunction(['RRHH_ADMIN']);
  }

  isGestorDocumental() {
    return this.authService.isGestorDocumental();
  }

  isCandidateAdminBasic() {
    return this.authGuardService.userHasFunction(['ADMIN_CANDIDATE_BASIC']);
  }

  setIsOpen(value) {
    this.isOpen = value.isOpen;
  }

  goToAudit() {
    const ouId = localStorage.getItem('organizationId');
    const userId = this.userId;
    const appLink = {
      link: `${AppConfig.settings.custom.cpp2016}/#/?t=`,
      organizationalUnitId: ouId,
      userId: userId
    };

    this.switchTo(appLink);
  }

  refreshNavigationBar() {

    this.urlIcon = undefined;
    // tslint:disable-next-line: radix
    this.ouService.getImagesByOuId(parseInt(localStorage.getItem('organizationId'))).toPromise().then(
      images => {
        const logo = images.filter(image => image.isLogo)[0];

        if (logo && logo.base64File) {
          this.urlIcon = logo.getLogoData();
        }

      });

    this.organizationalUnitName = localStorage.getItem('organizationName');
    this.appLinks = [];
    this.authService.getAccess().toPromise().then(
      usersOus => {
        this.appLinks = this.authService.getAppLinks(usersOus, true, false);
        if (usersOus.length > 0) {
          for (let index = 0; index < usersOus.length; index++) {
            const userOu = usersOus[index];
            this.authService.getIdProviderConfig(userOu.organizationalUnit.id).toPromise().then(
              providerInfo => {
                if (providerInfo != null && providerInfo.active) {
                  this.appLinks.push({
                    link: providerInfo.key,
                    description: 'Ir a ' + providerInfo.accessPoint,
                    roleName: 'Ir a ' + providerInfo.accessPoint,
                    ouName: 'Salir de Humanage',
                    organizationalUnitId: userOu.organizationalUnit.id,
                    userId: localStorage.getItem('userId'),
                    humanageTheme: '',
                    isSaml: true
                  });
                }

              }
            );
          }
        }
      }
    );

    this.ouService.getTreeInMemory(true).then((ous) => {
      this.canUseProcessWithMicroservices = ous?.some(
        (ou) => ou.enabled && ou.useProcessWithMicroservices,
      );
      this.useDashboard = ous?.some((ou) => ou.enabled && ou.useDashboard);
      this.useConnect = ous?.some((ou) => ou.enabled && ou.useConnect);
    });


  }

  logOut() {
    this.authService.logout(true);
  }

  switchTo(application: any) {
    this.loading = true;
    if (application.link) {
      if (application.isSaml) {
        window.location.href = application.link;
      } else {

        this.authService.getTokenChangeApp()
          .then(
            token => {
              this.authService.setUser(String(application.userId))
                .then(
                  () => {
                    window.location.href = application.link + token;
                  },
                  err => this.msjService.showError(err)
                );
            },
            err => this.msjService.showError(err)
          );
      }
    } else if (application.module && application.organizationalUnitId) {
      this.documentationTypesService.Clear();

      this.authService.setUserOu(String(application.organizationalUnitId))
        .then(
          () => {
            this.notifService.get('popup', this.authService.getUserId(), application.organizationalUnitId, true).toPromise().then(notif => {
              if (notif) {
                this.logOut();
              } else {
                this.refreshNavigationBar();
                const theme = application.humanageTheme != '' ? application.humanageTheme : 'default';
                document.body.classList.value = '';
                document.body.classList.add(theme);
                this.router.routeReuseStrategy.shouldReuseRoute = () => false;
                this.router.onSameUrlNavigation = 'reload';
                if (application.module === 'signer') {
                  this.router.navigate(['employer/documentation-signer']);
                } else if (application.module === 'overseer' || application.module === 'jefe') {
                  this.router.navigate(['employer/file-document-search']);
                } else if (application.module === 'employee' && application.isLd) {
                  this.router.navigate(['employee/pendings']);
                } else if (application.module === 'employer') {
                  this.router.navigate(['employer/employee-find']);
                } else if (application.module === 'candidateadmin') {
                  this.router.navigate(['employer/candidate-find']);
                } else if (application.module === 'leaveaprov') {
                  if(localStorage.getItem("hasFiltersMetadata") != undefined && localStorage.getItem("allAdjetivationEmployee") != undefined)
                  {
                    this.hasAdjetivation = JSON.parse(localStorage.getItem("hasFiltersMetadata")) as boolean ?? false;
                    this.allAdjetivationEmployee = JSON.parse(localStorage.getItem("allAdjetivationEmployee")) as boolean ?? false;
                    this.isLeaveApprov =  this.authService.isLeaveApprov();

                    if(this.isLeaveApprov && !this.hasAdjetivation  && !this.allAdjetivationEmployee){
                      this.router.navigate(['employer/leave-find']);
                    }else {
                      this.router.navigate(['employer/employee-find']);
                    }
                }
                } else {
                  this.router.navigate([application.module]);
                }
                this.loading = false;
              }
            },
              err => this.msjService.showError(err)
            );
          },
          err => this.msjService.showError(err)
        );
    }

  }

  openAddMenuDialog() {
    const dialogRef = this.dialog.open(AddMenuDialogComponent, { disableClose: true });
    dialogRef.afterClosed().subscribe({
      next: (result: any) => { }
    });
  }

  help() {
    this.ouHelpLinkConfigService.getByOuId(+this.organizationalUnitId).toPromise().then(

      helpLink => {
        window.open(helpLink.helpLink);
      }
    ).catch(() => window.open(AppConfig.settings.custom.employerHelpUrl));
  }
  support() {
    window.open(AppConfig.settings.custom.customerCareUrl);
  }

  notifAction(notif: RRHHNotification) {
    if (!notif.action) {
      return;
    }

    if (this[notif.action]) {
      this[notif.action](notif);
    }
  }

  declareCertificate(notif: RRHHNotification) {
    // Obtengo el Id de legajo desde la notificacion
    this.entity = JSON.parse(notif.notif.entity);
    this.certificateAddPersonId = [];
    this.certificateAddPersonId.push(+this.entity.personId);
    this.entity.ouId = +this.entity.ouIdPerson;
    this.isCertificateDeclarationOpen = true;
    this.deleteNotification(notif.id);
  }


  closeAddCertificate() {
    this.isCertificateDeclarationOpen = false;
  }

  deleteNotifButton(id: string) {
    event.stopPropagation();
    this.deleteNotification(id);
  }

  deleteAllNotif() {
    this.loadNotifications = true;
    this.notifications.forEach((notif, index, array) => {
      this.deleteNotification(notif.id, (index === (array.length - 1)));
    });
  }

  private viewUploadedDoc(notificacion: RRHHNotification) {
    const entity = JSON.parse(notificacion.notif.entity);
    
    this.fileDocumentService.getDocumentDetail(entity.documentId).toPromise()
      .then(res => {
        const dialogData = new EmployeeFileDocumentDialogData();
        dialogData.doc = res;
        dialogData.isModoPDF = true;
        dialogData.showDocumentState = false;
        dialogData.doc.hasFiles = true;
        dialogData.employee = new Employee();
        dialogData.employee.id = "0";
        const dialogRef = this.dialog.open(FileDocumentViewModalComponent, {
          data: dialogData,
          disableClose: true
        });
       this.deleteNotificationAfterClose(dialogRef, notificacion.id);
      })
      .catch(err => {
        if (err.code == 'CPPAPIC009') {
          this.deleteNotification(notificacion.id);
        }
        this.msjService.showError(err);
      });
  }

  private releaseNotes(notificacion: RRHHNotification) {
    const dialogRef = this.dialog.open(ReleaseNotesDialogComponent, {
      disableClose: true
    });
    this.deleteNotificationAfterClose(dialogRef, notificacion.id);
  }

  private deleteNotificationAfterClose(dialogRef: MatDialogRef<any>, id: string) {
    dialogRef.afterClosed().subscribe({
      next: () => {
        this.deleteNotification(id);
      }
    });
  }

  private hideNotification(notificacion: RRHHNotification) {
    this.deleteNotification(notificacion.id);
  }

  private deleteNotification(id: string, shouldRefresh: boolean = true) {
    this.uiNotificationsService.delete(id).toPromise()
      .then(() => {
        const index = this.notifications.map(x => x.id).indexOf(id);
        this.notifications.splice(index, 1);
        if (shouldRefresh) {
          this.refreshNotificacion();
        }
      },
        err => this.msjService.showError(err)
      );
  }

  refreshNotificacion(): void {
    this.loadNotifications = true;
    // Solo verifico proceso de firma si es firmante
    this.uiNotificationsService.refreshNotifiationProcess(this.isFirmante());
  }

  private addPerson(notificacion: RRHHNotification) {
    this.employeeService.getShareEmployeeNotif(notificacion.id).toPromise()
    .then(resultEmployee => {
      const dto = JSON.parse(notificacion.notif.entity);

      resultEmployee.organizationalUnitId = dto.ouIdTo;
      const dialogRef = this.dialog.open(SharePersonResponseDialogComponent, {
          data: resultEmployee,
          disableClose: true
        });
        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            this.deleteNotification(notificacion.id);
          }
        });
      })
      .catch(err => {
        if (err.code == 'CPPAPIC009') {
          this.deleteNotification(notificacion.id);
        }
        this.msjService.showError(err);
      });
  }

  private CanSupportsAnalytics()
  {
    if(this.isRRHH() && this.isCandidateAdmin() && this.isGestorDocumental())
      return false;
    return true;
  }

  gotoLeaveRequest(notificacion: RRHHNotification) {
    var entity = JSON.parse(notificacion.notif.entity);
    if(this.isLeaveFindComponent(window.location.hash) != "leave-find")
    {
      this.router.navigate(['employer/leave-find', entity.leaveRequestId]);
    }
    else{
      this.uiNotificationsService.renderLeave(entity.leaveRequestId);
    }
    this.deleteNotification(notificacion.id);
  }

  isLeaveFindComponent(url: string)
  {
    return url.split('/')[2];
  }

  SetMetadataFilters(res: any[]){
    res.length > 0 ? localStorage.setItem("hasAdjetivation", "true") : localStorage.setItem("hasAdjetivation", "false");
    res.filter(x => x.personType == "EMPLEADO" && x.documentTypeId == null).length>0 ? localStorage.setItem("hasFiltersMetadataEmployee", "true") : localStorage.setItem("hasFiltersMetadataEmployee", "false");
    res.filter(x => x.personType == "CANDIDATO" && x.documentTypeId == null).length>0 ? localStorage.setItem("hasFiltersMetadataCandidate", "true") : localStorage.setItem("hasFiltersMetadataCandidate", "false");
    res.filter(x => x.personType == "EMPLEADO" && x.documentTypeId != null).length>0 ? localStorage.setItem("hasFiltersDocumentsEmployee", "true") : localStorage.setItem("hasFiltersDocumentsEmployee", "false");
    res.filter(x => x.personType == "CANDIDATO" && x.documentTypeId != null).length>0 ? localStorage.setItem("hasFiltersDocumentsCandidate", "true") : localStorage.setItem("hasFiltersDocumentsCandidate", "false");
    res.filter(x=>x.documentTypeId == null).length>0 ? localStorage.setItem("hasFiltersMetadata","true") : localStorage.setItem("hasFiltersMetadata","false");
    res.filter(x=>x.documentTypeId != null && x.metadataId == null).length>0 ? localStorage.setItem("hasFiltersDocuments","true") : localStorage.setItem("hasFiltersDocuments","false");
    localStorage.setItem("allAdjetivation", JSON.stringify(res));
  }
  SetAdjetivationFilters(res: any[])
  {
    if(res.length > 0)
      {
        localStorage.setItem("allAdjetivationEmployee", JSON.stringify(true));
      }
      else
      {
        localStorage.setItem("allAdjetivationEmployee", JSON.stringify(false));
      }
  }
}

