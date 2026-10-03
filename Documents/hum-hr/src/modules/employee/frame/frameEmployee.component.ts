import { Component, OnInit } from "@angular/core";
import { AuthService } from "../../shared/auth/auth.service";
import { AppConfig } from "../../../app.config";
import { MessageService } from "../../shared/errorHandler/message.service";
import { Router } from "@angular/router";
import { environment } from "src/environments/environment";
import { NotificationService } from "../../shared/services/notification.service";
import { OrganizationalUnitService } from "../../shared/services/organizational-unit.service";
import { PersonPreview } from "../../shared/models/Employee/person.model";
import { PersonService } from "../../shared/services/person.service";
import { ContainerType } from "../../shared/models";
import { ContainerTypeService } from "../../shared/services/container-type.service.";
import { DomSanitizer } from "@angular/platform-browser";
import { DocumentationTypesService } from '../../shared/services/documentation-types.service';
import { DocumentationOrigin } from '../../shared/models/documentation-type.model';
import { UiNotificationsService } from '../../shared/services/ui-notifications.service';
import { ProcesResultTotals } from "../../shared/models/process-result-totals.model";
import { RRHHNotification } from "../../shared/models/ui-notifications.model";
import { ProfileService } from "../../shared/services/profile.service";
import { OrganizationalUnitAccessConfig } from "../../shared/models/ou-access-config.model";
import { CustomConfigService } from "../../shared/services/custom-config.service";
import { EmployeeLeaveService } from "../../shared/services/employee-leave-requests.service";
import { ConfigLeaveEmployee } from "../../shared/models/Employee/config-leave-employee.model";
import { ConfigLeaveOu } from "../../shared/models/Employee/config-leave-ou.model";
import { EmployeeMetadata } from "../../shared/models/employee-metadata.model";
import { LeaveService } from '../../shared/services/leave.service';
import { LocalStorageService } from '../../shared/services/local-storage.service';

@Component({
  selector: "app-frame",
  templateUrl: "./frameEmployee.component.html",
  styles: []
})
export class FrameEmployeeComponent implements OnInit {
  version = environment.version;

  constructor(
    private authService: AuthService,
    public router: Router,
    private msjService: MessageService,
    private notifService: NotificationService,
    private ouService: OrganizationalUnitService,
    private personService: PersonService,
    private containerTypeService: ContainerTypeService,
    private sanitizer: DomSanitizer,
    private uiNotificationsService: UiNotificationsService,
    private documentationTypesService: DocumentationTypesService,
    private profileService: ProfileService,
    private ouHelpLinkConfigService: CustomConfigService,
    private employeeLeaveService: EmployeeLeaveService,
    private leaveService: LeaveService,
    private localStorage: LocalStorageService
  ) { }

  opened: any = false;
  loading = false;
  editMode = false;
  isOpen = false;
  userFirstname: string;
  userlastname: string;
  organizationalUnitName: string;
  showAppsMenu: boolean;
  urlIcon: string;
  badgeTotal: number;
  badgeLDTotal: number;
  isExpanded = false;
  menuFocus = false;
  element: HTMLElement;
  appLinks: any[];
  initials: string;
  hasLD = false;
  hasLeaveModule = false;
  hasRSD = false;
  hasDocumentationTypesForEmployee = false;
  isSamlActive = false;
  samlReturnUrl: string;
  releaseName = AppConfig.settings.releaseName;
  organizationalUnitId: string;
  preview: any;
  containerType: ContainerType;
  profilePreview: any;
  isValidator: boolean;
  // Notifications
  notifications: RRHHNotification[] = [];
  processToNotif: ProcesResultTotals[] = [];
  totalNotifications = 0;
  loadNotifications = false;
  ouAccessConfig: OrganizationalUnitAccessConfig;
  minAccessValue = AppConfig.settings.application.minAccessValue;
  quickFoodOuId = AppConfig.settings.application.quickFoodOuId;
  quickFoodMetaSysName = AppConfig.settings.application.quickFoodMetaSysName;
  quickFoodMetaValue = AppConfig.settings.application.quickFoodMetaValue;
  hasAdjetivation: boolean = true;
  isCandidate:boolean = true;
  OrganizationalUnitId :number = 0;
  ConfigLeaveEmployee: ConfigLeaveEmployee;
  configLeaveOu:ConfigLeaveOu;
  quickFoodMetadataValue:EmployeeMetadata;
  isApprover = false;
  useWorkflowApprove: boolean;
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
    this.userFirstname = localStorage.getItem('userFirstname');
    this.userlastname = localStorage.getItem('userLastname');
    this.initials = this.userlastname + ' ' + this.userFirstname;
    this.isCandidate =  this.authService.isInRole('CANDIDATE');
    this.hasLD = this.authService.isInRole('EMPLOYEE LD') || this.authService.isInRole('CANDIDATE');
    this.hasLeaveModule = true;
    this.hasRSD = this.authService.isInRole('EMPLOYEE_2016');

    this.isSamlActive = this.authService.isSamlActive();
    this.samlReturnUrl = this.authService.getSamlReturnUrl();

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


    this.organizationalUnitId = this.authService.getOrganizationId();
    this.ouService.setTheme();
    // Obtengo los tipos documentacion para ver si tengo qeu mostrar el botón de alta
    this.documentationTypesService.get(this.organizationalUnitId, true).toPromise().then(
      data => {
        const documentationTypes = data.filter(d => d.documentationStarterId >= DocumentationOrigin.AMBOS);
        this.hasDocumentationTypesForEmployee = documentationTypes && documentationTypes.length > 0;
      },
      err => this.msjService.showError(err)
    );
    this.findConfigLeaveEmployee();
    this.findConfigLeaveOU();
    this.getEmployeeIdsByApprover();
    this.refreshNavigationBar();
    this.getContainerType();
    this.refreshNotificacion();
    this.hasFiltersMetadatos();
    window.scroll(0, 0);
    this.profileService.getAccessConfigByOu(+this.organizationalUnitId).toPromise().then(
      config => {
        this.ouAccessConfig = config;
      }
    );

    localStorage.setItem("isEmployee","true");
    this.hasPermitUseForQuickFood();
    this.isRequestApprover();
  }

  refreshNotificacion(): void {
    this.loadNotifications = true;
    // Solo verifico proceso de firma si es firmante
    this.uiNotificationsService.refreshNotifiationProcess(true, true);
  }


  getContainerType() {
    if (!this.containerType) {
      const isCandidate = this.authService.isCandidate();

      if (this.authService.isInRole('EMPLOYEE LD') || this.authService.isInRole('CANDIDATE')) {
        this.containerTypeService
          .getContainerType(this.organizationalUnitId, isCandidate)
          .toPromise()
          .then(containerType => {
            this.containerType = containerType;
            this.getAvatar();
          },
            err => {
              this.msjService.showError(err);
            }
          );

      }
    }
  }

  getAvatar() {
    const personPreview = new PersonPreview();
    personPreview.containerTypeId = this.containerType.id;
    personPreview.organizationalUnitId = +this.organizationalUnitId;

    this.personService
      .getAvatar(personPreview)
      .toPromise()
      .then(preview => {
        if (preview) {
          this.preview = this.sanitizer.bypassSecurityTrustResourceUrl(preview);
          this.profilePreview = preview;
        }
      },
        err => {
          this.msjService.showError(err);
        }
      );
  }

  editingMode() {
    this.editMode = !this.editMode;
  }

  updatePreview(event: any) {
    this.preview = this.sanitizer.bypassSecurityTrustResourceUrl(event);
    this.profilePreview = event;
  }

  setIsOpen(value) {
    this.isOpen = value.isOpen;
  }

  toggleActive(event: any) {
    event.preventDefault();
    if (this.element !== undefined) {
      // this.element.style.backgroundColor = "white";
    }

    const target = event.currentTarget;
    // target.style.backgroundColor = "#e51282";
    this.element = target;
  }

  refreshNavigationBar() {
    this.urlIcon = undefined;
    // tslint:disable-next-line: radix
    this.ouService.getImagesByOuId(parseInt(this.authService.getOrganizationId())).toPromise().then(
      images => {
        const logo = images.filter(image => image.isLogo)[0];

        if (logo && logo.base64File) {
          this.urlIcon = logo.getLogoData();
        }
      });

    this.organizationalUnitName = this.authService.getOrganizationDescription();
    this.appLinks = [];

    this.authService.getAccess().toPromise().then(
      usersOus => {
        this.appLinks = this.authService.getAppLinks(usersOus, false, true);
        if (usersOus.length > 0)
        {

          for (let index = 0; index < usersOus.length; index++) {
            const userOu = usersOus[index];
            if (this.authService.isInRoleOu(userOu, ["LSD_HUMANAGE"])) {
              this.appLinks.push({
                module: 'lsd',
                description: 'Ir a Libro Ley de ' + userOu.organizationalUnit.name,
                roleName: 'Libro de sueldo Digital',
                ouName: userOu.organizationalUnit.name,
                organizationalUnitId: userOu.organizationalUnit.id,
                userId: userOu.userId,
                humanageTheme: userOu.organizationalUnit.humanageTheme
              });
            }
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
      this.useConnect = ous?.some((ou) => ou.enabled && ou.useConnect);
    });
  }

  logOut() {
    this.authService.logout(true);
  }

  gotoHome() {
    this.router.navigate(['/employee/home']);
    this.menuFocus = false;
  }

  gotoFileDocumentsHome() {
    this.router.navigate(['/employee/home-file-documents']);
    this.menuFocus = false;
  }

  gotoMyLeaves() {
    this.router.navigate(['/employee/leaves']);
    this.menuFocus = false;
  }

  gotoPendings() {
    this.router.navigate(['/employee/pendings']);
    this.menuFocus = false;
  }

  goToAddDocumentation() {
    this.router.navigate(['/employee/add-documentation']);
    this.menuFocus = false;
  }

  goToTeam(){
    this.router.navigate(['/employee/team']);
    this.menuFocus = false;
  }

  switchTo(application: any) {
    this.loading = true;
    if (application.link) {
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
    } else if (application.module && application.organizationalUnitId) {
      this.documentationTypesService.Clear();
      this.authService.setUser(String(application.userId))
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
                  this.router.navigate(['employer/leave-find']);
                } else if (application.roleName === 'Libro de sueldo Digital') {
                  this.router.navigate(['employer/lsd']);
                }
                else {
                  this.router.navigate([application.module]);
                }
                this.loading = false;
              }
            },
              err => this.msjService.showError(err)
            );
          },
          err => {
            this.msjService.showError(err);
            return false;
          });
    }
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

  deleteAllNotif() {
    this.loadNotifications = true;
    this.notifications.forEach((notif, index, array) => {
      this.deleteNotification(notif.id, (index === (array.length - 1)));
    });
  }

  deleteNotifButton(id: string) {
    event.stopPropagation();
    this.deleteNotification(id);
  }

  private hideNotification(notificacion: RRHHNotification) {
    this.deleteNotification(notificacion.id);
  }

  hasFiltersMetadatos() {
    this.hasAdjetivation = JSON.parse(localStorage.getItem("hasFiltersMetadata")) as boolean ?? true;
    return this.hasAdjetivation;
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

  private findConfigLeaveEmployee()
  {
    this.employeeLeaveService.getMyConfigLeaveEmployee().toPromise().then(
      configLeave => {
        this.ConfigLeaveEmployee = configLeave.find(x =>  x.leaveType.id == 1);
        localStorage.setItem('configLeave', JSON.stringify(configLeave));
      }).catch(err => {
        throw err;
      })
  }

  private findConfigLeaveOU()
  {
    this.OrganizationalUnitId = Number.parseInt(localStorage.getItem('organizationId'));
    this.employeeLeaveService.getMyConfigLeaveOU(this.OrganizationalUnitId)
    .toPromise().then(configOu => {
      if (configOu && configOu.length > 0) {
        this.configLeaveOu = configOu[0];
        localStorage.setItem('configOU', JSON.stringify(configOu));
        this.useWorkflowApprove = configOu[0].leaveTypeOu?.workflowApprove.id != null;
      }
      else{
        this.configLeaveOu = null;
        this.useWorkflowApprove = false;
      }
    }).catch(err => {
      throw err;
    })
  }

  getEmployeeIdsByApprover(){
      this.leaveService.getEmployeeIdsByApprove().toPromise().then(
        data => {
          this.isValidator = data.length > 0;
        })
  }

  hasPermitUseForQuickFood()
  {
     if (this.quickFoodOuId == this.organizationalUnitId)
     {
      this.personService.getMyContainer().toPromise()
      .then(container =>
        {
          this.quickFoodMetadataValue = container.metadatas
          .find(x => x.metadataSystemName === this.quickFoodMetaSysName && x.metadataValue === this.quickFoodMetaValue);
        });
     }
  }
  isLeaveComponent(url: string)
  {
    return url.split('/')[2];
  }

  gotoMyLeaveToApprover(notificacion: RRHHNotification) {
    let entity = JSON.parse(notificacion.notif.entity);
    if(this.authService.isInRole("EMPLOYEE LD")){
      if(this.isLeaveComponent(window.location.hash) != "leaves")
        {
          this.router.navigate(['/employee/leaves',entity.leaveRequestId]);
          this.menuFocus = false;
        }
        else{
          this.uiNotificationsService.renderEmployeeLeave(entity.leaveRequestId);
        }
    }
    this.deleteNotification(notificacion.id);
  }

  isRequestApprover() {
    this.leaveService.getApproverByUserId(this.authService.getUserId()).toPromise()
    .then((approver) => {
      this.isApprover = approver !== null;
    });
  }
}
