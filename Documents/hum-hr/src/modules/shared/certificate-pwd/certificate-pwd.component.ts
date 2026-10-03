import { ActivatedRoute, Router } from '@angular/router';
import { OnInit, Component } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, UntypedFormControl } from '@angular/forms';
import { MessageService } from '../errorHandler/message.service';
import { ICertificatePwdRequest } from '../models/certificate-pwd.model';
import { CertificateService } from '../services/certificate.service';
import { AppConfig } from 'src/app/app.config';
import { OrganizationalUnitService } from '../services/organizational-unit.service';

@Component({
  selector: 'app-certificate-pwd',
  templateUrl: './certificate-pwd.component.html',
  styles: []
})
export class CertificatePwdComponent implements OnInit {

  withLogin = false;
  isLoading = false;
  requestFormGroup: UntypedFormGroup;
  certificateRequest: ICertificatePwdRequest = {
    token: undefined,
    repeatPassword: undefined,
    password: undefined,
    withLogin: false,
  };
  subdomain = "";
  backgroundSrc = "../../../assets/img/background.jpg";
  logoSrc = "";
  humanageSrc = "../../../assets/img/logo.png";


  constructor(
    private _certificateService: CertificateService,
    private _formBuilder: UntypedFormBuilder,
    private activatedRoute: ActivatedRoute,
    private _router: Router,
    private msgService: MessageService,
    private readonly ouService: OrganizationalUnitService,
  ) { }

  ngOnInit() {
    this.getSubdomain();
    this.withLogin = this.activatedRoute.snapshot.data['login'];
    this.certificateRequest.withLogin = this.withLogin;

    this.requestFormGroup = this._formBuilder.group({
      password: ['', Validators.required]
    });

    if (!this.withLogin) {
      this.requestFormGroup.addControl('repeatPassword', new UntypedFormControl('', Validators.required));
    }

    this.activatedRoute.params.subscribe(params => {
      this.certificateRequest.token = params['code'];
    });
  }

  validate(r: ICertificatePwdRequest): boolean {
    return (r !== null && r.token !== null && r.token !== '' &&
      r.password !== '' && r.repeatPassword !== '' && r.password === r.repeatPassword);
  }

  setRequestValues(): boolean {
    if (this.requestFormGroup.valid === true) {
      this.certificateRequest.password = this.requestFormGroup.value.password;
      this.certificateRequest.repeatPassword = this.withLogin ? this.certificateRequest.password :
        this.requestFormGroup.value.repeatPassword;

      if (!this.validate(this.certificateRequest)) {
        this.msgService.showError('confirmPassword');
        return false;
      }


    } else {
      this.msgService.showError("VerifyFormData");
      return false;
    }

    return true;
  }

  save() {
    if (this.setRequestValues()) {
      this.isLoading = true;
      this._certificateService.automanage(this.certificateRequest).toPromise()
        .then(response => {
          if (response && response !== '') {
            window.location.href = `${AppConfig.settings.custom.arandanos}/#/saml/${response}`;
            return false;
          }

          this._router.navigate(['login']);
        })
        .catch(err => this.msgService.showError(err))
        .then(() => this.isLoading = false);
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
              ).catch(err => this.msgService.showError(err))
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

