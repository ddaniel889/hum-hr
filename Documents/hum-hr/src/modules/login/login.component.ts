import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from "@angular/forms";
import { MatStepper } from '@angular/material/stepper';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ActivatedRoute, Router } from "@angular/router";
import { AppConfig } from "src/app/app.config";
import { AuthService } from "../shared/auth/auth.service";
import { MessageService } from "../shared/errorHandler/message.service";
import { OrganizationalUnit } from '../shared/models';
import { Notification } from '../shared/models/notification.model';
import { NotificationService } from '../shared/services/notification.service';
import { OrganizationalUnitService } from '../shared/services/organizational-unit.service';
import { RecaptchaComponent } from "ng-recaptcha";
import { MessageType } from '../shared/models/message-types.model';
import { GenericBottomSheetComponent } from '../shared/generic-bottom-sheet/generic-bottom-sheet.component';

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: []
})
export class LoginComponent implements AfterViewInit, OnInit {
  @ViewChild("stepper") stepper: MatStepper;
  @ViewChild('captchaRef') captchaRef: RecaptchaComponent;
  organizationalUnits: OrganizationalUnit[]=[];
  selectedOrganizationalUnit: OrganizationalUnit;
  username: string;
  password: string;
  isTermAndConditionsAccepted = false;
  userCredentials: string;
  hasTermAndConditions = false;
  termsAndConditions: Notification;
  loginData: any;
  isLoading: boolean;
  guid: string;
  cardClass = "";

  subdomain = "";
  isLinear = false;
  userFormGroup: UntypedFormGroup;
  passwordFormGroup: UntypedFormGroup;
  ouFormGroup: UntypedFormGroup;
  tycFormGroup: UntypedFormGroup;
  OTPFormGroup: UntypedFormGroup;
  isOptional = false;
  showStepper = true;
  datos: any;
  urlBase = location.origin;
  returnUrl: string;
  inProcess = false;
  showHelp = false;
  showOTPStep = false;
  previousStepIndex = 0;
  urlRegisterHelp: string;
  minOuLogins = AppConfig.settings.application.minOuLogins;

  reCaptchaSiteKey = AppConfig.settings.custom.ReCaptchaSiteKey;
  reCaptchaToken = null;
  reCaptchaTokenValidated = null;
  reCaptchaActive = false;

  backgroundSrc = "../../../assets/img/background.jpg";
  logoSrc = "";
  humanageSrc = "../../../assets/img/logo.png";

  constructor(
    private auth: AuthService,
    private msjService: MessageService,
    private route: Router,
    private _formBuilder: UntypedFormBuilder,
    private activatedRoute: ActivatedRoute,
    private notifService: NotificationService,
    private readonly _bottomSheet: MatBottomSheet,
    private ouService: OrganizationalUnitService
  ) {
    this.urlRegisterHelp = AppConfig.settings.custom.registerHelpUrl;
  }

  ngOnInit() {
    this.getSubdomain();
    this.userFormGroup = this._formBuilder.group({
      username: ["", Validators.required]
    });
    if (this.reCaptchaSiteKey){
      this.reCaptchaActive = true;
      this.passwordFormGroup = this._formBuilder.group({
        password: ['', Validators.required],
        captcha: ['', Validators.required]
      });

    }else{
      this.passwordFormGroup = this._formBuilder.group({
        password: ['', Validators.required],
      });

    }


    this.returnUrl = this.activatedRoute.snapshot.queryParams["returnUrl"];
    this.ouFormGroup = this._formBuilder.group({
      organizationalUnit: ['', Validators.required]
    });
    this.OTPFormGroup = this._formBuilder.group({
      otp: ["", Validators.required]
    });
    this.SetTermAndConditionsValidations(true);

  }

  resolved(captchaResponse: string) {
    console.log(captchaResponse);
    //TODO : VALIDATE CAPTCHA in BACKEND
    this.reCaptchaToken = captchaResponse;
    if (this.reCaptchaToken != null){
      this.reCaptchaTokenValidated = true;
    }else{
      this.reCaptchaTokenValidated = false;
    }
}
  private SetTermAndConditionsValidations(askForCredentials: boolean) {
    if (askForCredentials) {
      this.tycFormGroup = this._formBuilder.group({
        isTermAndConditionsAccepted: [false, Validators.requiredTrue],
        userCredentials: ["", Validators.required]
      });
    } else {
      this.tycFormGroup = this._formBuilder.group({
        isTermAndConditionsAccepted: [false, Validators.requiredTrue]
      });
    }
  }

  getSubdomain() {
    const domain = window.location.hostname;
    if (domain.indexOf('.') > 0 && domain.split('.')[0] != 'app' && domain.split('.')[0] != 'cppatest' && domain.split('.')[0] != 'cppa' &&
      domain.split('.')[0] != AppConfig.settings.application.subdomain) {

      this.subdomain = domain.split('.')[0];
      this.ouService.getImagesBySubDomain(this.subdomain).toPromise().then(
        images => {
          const imageTheme = images.filter(image => !image.isLogo)[0];
          if (imageTheme !== undefined) {
            this.backgroundSrc = imageTheme.getImageData();
            if (imageTheme.organizationalUnitId != null) {
              this.ouService.getImagesByOuId(imageTheme.organizationalUnitId).toPromise().then(
                imageLogo => {
                  const logo = imageLogo.filter(image => image.isLogo)[0];
                  if (logo?.base64File) {
                    this.logoSrc = logo.getLogoData();
                  }
                }
              ).catch(err => this.msjService.showError(err))
            }
          }
          document.body.hidden = false;
        });
    } else {
      this.logoSrc = this.humanageSrc;
      document.body.hidden = false;
    }
  }

  ngAfterViewInit() {
    this.setFocus('step0');
    this.activatedRoute.params.subscribe(params => {
      this.guid = params["t"];
    });
    if (this.guid) {
      this.isLoading = true;
      this.showStepper = false;
      this.auth.login(null, this.guid, this.subdomain).subscribe(
        data => this.onLogin(data),
        error => {
          this.msjService.showError(error);
          this.route.navigate(["login"]);
          this.isLoading = false;
          this.showStepper = true;
        }
      );
    }

  }

  login() {
    this.isLoading = true;
    this.inProcess = true;
    this.auth
      .login(
        this.userFormGroup.value.username,
        this.passwordFormGroup.value.password,
        this.subdomain
      )
      .subscribe(
        data => {
          this.onLogin(data);
        },
        error => {
          this.msjService.showError(error);
          this.isLoading = false;
          this.inProcess = false;
        }
      );
  }

  private onLogin(data: any) {
    this.inProcess = false;
    if (data.mustChangePassword == "True") {
      this.route.navigate(["pwd-change"]);
    } else if (data.pendingOtpKey == "True") {
      this.showStepper = true;
      this.showOTPStep = true;
      this.isLoading = false;
      this.previousStepIndex = this.stepper.selectedIndex;
      this.stepper.selectedIndex = 4;

    } else {
      this.getNotificationsPopUp(data);
    }
  }

  private getNotificationsPopUp(data: any) {
    if (data.systemUser && data.systemUser.toLowerCase() == 'true') {
      this.isLoading = false;
      return;
    }
    this.notifService.get('popup', this.auth.getUserId(), this.auth.getOrganizationId(), true).toPromise().then(notif => {
      this.termsAndConditions = notif;
      if (this.termsAndConditions) {
        this.loginData = data;
        this.showStepper = true;
        this.previousStepIndex = this.stepper.selectedIndex;
        this.stepper.selectedIndex = 3;
        this.cardClass = "tyc";
        this.isLoading = false;
        this.SetTermAndConditionsValidations(this.termsAndConditions.askCredentialsForApproval);
        return true;
      } else {
        this.msjService.showInfo("Usuario logueado correctamente");
        if (this.returnUrl) {
          this.route.navigateByUrl(this.returnUrl);
          const theme = data['humanageTheme'] != '' ? data['humanageTheme'] : 'default';
          document.body.classList.add(theme);
        } else {
          this.navigateByRol(data);
        }
      }
    },
      err => {
        this.msjService.showError(err);
        return false;
      });
    this.isLoading = false;
  }

  exitTermAndConditions() {
    this.isTermAndConditionsAccepted = false;
    this.termsAndConditions.password = '';
    this.SetTermAndConditionsValidations(true);
    this.showStepper = true;
    this.previousStepIndex = this.stepper.selectedIndex;
    this.stepper.selectedIndex = 1;
    this.cardClass = "";
    this.isLoading = false;
  }

  acceptTermAndConditions() {
    this.isLoading = true;
    this.inProcess = true;
    this.termsAndConditions.password = this.tycFormGroup.value.userCredentials;
    this.termsAndConditions.nickName = this.userFormGroup.value.username;

    this.notifService.approve(this.termsAndConditions).toPromise().then(notif => {
      this.auth.refreshToken().toPromise().then(data => {
        this.loginData = data;
        this.msjService.showInfo("Usuario logueado correctamente");
        this.navigateByRol(this.loginData);
        this.inProcess = false;
      },
        err => {
          this.msjService.showError(err);
          this.inProcess = false;
        });
    },
      err => {
        this.msjService.showError(err);
        this.inProcess = false;
      });
    this.isLoading = false;
  }

  private isInRole(data: any, role: string) {
    const roleList = data.roles.split(",");
    return roleList.some((x: string) => x === role);
  }

  setFocus(element: string) {
    const target: HTMLElement = document.getElementById(element);
    if (target) {
      setTimeout(function waitTargetElem() {
        target.focus();
      }, 100);
    }
  }

  onChange(event: any) {
    const index = event.selectedIndex;
    this.setFocus(`step${index}`);
  }

  forgotPassword(stepper: MatStepper): any {
    if (this.userFormGroup.value.username) {
      // tslint:disable-next-line:max-line-length
      // acá hacemos esto para corregir error - cuando vuelva leo lo veremos juntos...
     this.useCaptcha(this.reCaptchaActive);
      this.auth
        .forgotPassword(
          this.userFormGroup.value.username,
          `${this.urlBase}/#/pwd-reset/{0}`,
          AppConfig.settings.application.id,
          this.subdomain
        )
        .toPromise()
        .then(
          data => {
            stepper.previous();
            // tslint:disable-next-line:max-line-length
            return this.msjService.showInfo(
              "Operación Exitosa. Se envió a su cuenta de correo un mensaje indicando los pasos a seguir para reestablecer su contraseña."
            );
          },
          err => this.msjService.showError(err)
        );
      stepper.previous();
    }
  }

  async setOrganizationalUnit() {
    this.isLoading = true;
    this.inProcess = true;
    await this.auth.setUserOu(this.selectedOrganizationalUnit.id.toString()).then(
      data => {
        this.notifService.get('popup', this.auth.getUserId(), this.auth.getOrganizationId(), true).toPromise().then(notif => {
          this.termsAndConditions = notif;
          if (this.termsAndConditions) {
            this.loginData = data;
            this.showStepper = true;
            this.previousStepIndex = this.stepper.selectedIndex;
            this.stepper.selectedIndex = 3;
            this.isLoading = false;
            this.inProcess = false;
            this.SetTermAndConditionsValidations(this.termsAndConditions.askCredentialsForApproval);
            return true;
          } else {
            this.msjService.showInfo("Usuario logueado correctamente");
            this.navigateByRol(data);
            this.isLoading = false;
            this.inProcess = false;
          }
        },
          err => {
            this.msjService.showError(err);
            this.isLoading = false;
            this.inProcess = false;

            return false;
          });
      },
      err => {
        this.isLoading = false;
        this.inProcess = false;

        this.msjService.showError(err);
      }
    );
  }

  private async navigateByRol(data: any) {
    let route = null;
    if (this.isInRole(data, "RRHH_CONTENT") || this.isInRole(data, "RRHH_ACCESS")) {
      route = ['employer/employee-find'];
    } else if (this.isInRole(data, "FIRMANTE")) {
      route = ['employer/documentation-signer'];
    } else if (this.isInRole(data, "OVERSEER") || this.isInRole(data, "RRHH_DOCUMENTS")) {
      route = ['employer/file-document-search'];
    } else if (this.isInRole(data, "CANDIDATEADMIN")) {
      route = ['employer/candidate-find'];
    } else if (this.isInRole(data, "ADMIN_CANDIDATE_BASIC")) {
        route = ['employer/candidate-find'];
    } else if (this.isInRole(data, "EMPLOYEE LD")) {
      route = ['employee/pendings'];
    } else if (this.isInRole(data, "EMPLOYEE_2016")) {
      route = ['employee'];
    } else if (this.isInRole(data, "CANDIDATE")) {
      route = ['employee/pendings'];
    } else if (this.isInRole(data, "LSD_HUMANAGE")) {
      route = ['employer/lsd'];
    }else if (this.isInRole(data, "LEAVEAPROV")) {
      route = ['employer/leave-find'];
    }

    if (route) {
      const theme = data['humanageTheme'] != '' ? data['humanageTheme'] : 'default';
      document.body.classList.add(theme);
      this.route.navigate(route);
    } else {
      this.organizationalUnits = this.auth.getOrganizationalUnits();

      if (this.organizationalUnits.length === 0) {
        if (!await this.auth.anyRoleForApp()) {
          this.msjService.showError("UnsupportedUser");
          this.auth.logout();
          return;
        }

        // este caso no tiene ous por ende tendria que madarlo a 2016.
        this.auth.getTokenChangeApp()
          .then(
            token => window.location.href = `${AppConfig.settings.custom.cpp2016}/#/?t=` + token,
            err => this.msjService.showError(err)
          );
      } else {
        this.showStepper = true;
        this.previousStepIndex = this.stepper.selectedIndex;
        this.stepper.selectedIndex = 2;
      }
    }
  }


  confirmOTP(){
    let parameters: any = {};
    parameters.bodyText = '⚠️ ¿Desea configurar OTP? Si continúa y ya tenía configurado OTP, la configuración anterior quedará inhabilitada y deberá completar el proceso para generar un nuevo código en su dispositivo.'
    parameters.type = MessageType.YesNo;
    const t = this._bottomSheet.open(GenericBottomSheetComponent, {data:parameters, disableClose: true });
    t.instance.close.subscribe((response: any) => {
      if(response){
        this.generateOTP();
      }
    });
  }

  generateOTP() {
    this.isLoading = true;
    this.auth.generateOTP(
      this.userFormGroup.value.username,
      `${this.urlBase}/#/otp-code/{0}`,
      this.subdomain
    )
      .toPromise()
      .then(
        data => {
          this.isLoading = false;
          return this.msjService.showInfo(
            "Operación Exitosa. Se envió a su cuenta de correo un mensaje indicando los pasos a seguir para utilizar el código OTP."
          );
        },
        err => this.msjService.showError(err)
      );

  }

  loginOTP() {
    this.isLoading = true;
    this.inProcess = true;
    this.auth.loginOTP(
      this.userFormGroup.value.username,
      this.passwordFormGroup.value.password,
      this.OTPFormGroup.value.otp,
      this.subdomain).toPromise().then(
        data => {
          this.isLoading = false;
          this.inProcess = false;
          this.navigateByRol(data);
        },
        err => {
          this.isLoading = false;
          this.inProcess = false;
          this.msjService.showError(err);
        }
      );
  }
  back() {
    this.stepper.selectedIndex = this.previousStepIndex;
  }

  openHelp() {
    this.showHelp = true;
    this.showStepper = false;
    this.msjService.close();
  }

  closeHelp() {
    this.showHelp = false;
    this.showStepper = true;
  }

  move(index: number) {
    this.stepper.selectedIndex = index;
  }
  ouSelectComplete(name: string)
  {
    this.selectedOrganizationalUnit = this.organizationalUnits.find(x => x.name == name);

    if(this.selectedOrganizationalUnit)
    {
      this.ouFormGroup.setValue({organizationalUnit:this.organizationalUnits.find(x => x.name == name)});
    }
    else
    {
        this.ouFormGroup.setValue({organizationalUnit:null});
    }
  }
  useCaptcha(reCaptchaActive: boolean)
  {
    if(reCaptchaActive)
    {
        this.captchaRef.reset();
        this.reCaptchaToken = null;
        this.reCaptchaTokenValidated = false;
    }
  }
}
