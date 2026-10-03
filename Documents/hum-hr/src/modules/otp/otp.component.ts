import { Router, ActivatedRoute } from '@angular/router';
import { OnInit, Component, ViewChild } from '@angular/core';
import { AuthService } from '../shared/auth/auth.service';
import { MessageService } from '../shared/errorHandler/message.service';
import { MatStepper } from '@angular/material/stepper';
import { AppConfig } from 'src/app/app.config';
import { OrganizationalUnitService } from '../shared/services/organizational-unit.service';


@Component({
  selector: 'app-otp',
  templateUrl: './otp.component.html',
  styles: []
})
export class OtpComponent implements OnInit {
  QRBase64: any;
  @ViewChild('stepper') stepper: MatStepper;
  isOtpKeyAcquired = false;
  appAndroidInstall = false;
  appIphoneInstall = false;
  isLoadingQR = false;
  backgroundSrc = "../../../assets/img/background.jpg";
  logoSrc = "";
  humanageSrc = "../../../assets/img/logo.png";
  subdomain = "";
  constructor(
    private router: Router,
    private authService: AuthService,
    private msjService: MessageService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly ouService: OrganizationalUnitService,
  ) { }


  ngOnInit() {
    this.getSubdomain();
    let dataCode: string;
    this.activatedRoute.params.subscribe(params => {
      dataCode = params['code'];
    });
    const encode = encodeURIComponent(dataCode);
    this.isLoadingQR = true;
    this.authService.getOtpQR(encode).toPromise().then(
      data => {
        this.isLoadingQR = false;
        this.QRBase64 = "data:image/jpeg;base64," + data;
      },
      err => {
        this.isLoadingQR = false;
      }
    );
  }

  toLogin() {
    this.router.navigate(['login']);
  }

  acquireOtp() {
    this.isOtpKeyAcquired = true;
  }

  installAndroid() {
    this.appAndroidInstall = !this.appAndroidInstall;

  }

  installIphone() {
    this.appIphoneInstall = !this.appIphoneInstall;

  }

  cancelInstall() {
    this.appAndroidInstall = false;
    this.appIphoneInstall = false;
  }

  move(index: number) {
    this.stepper.selectedIndex = index;
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
}

