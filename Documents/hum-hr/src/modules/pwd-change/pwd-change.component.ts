import { Router } from '@angular/router';
import { AuthService } from '../shared/auth/auth.service';
import { OnInit, Component } from '@angular/core';
import { IPwdChange } from '../shared/models/pwd-reset.model';
import { MessageService } from '../shared/errorHandler/message.service';
import { UntypedFormGroup, Validators, UntypedFormBuilder } from '@angular/forms';
import { OrganizationalUnitService } from '../shared/services/organizational-unit.service';
import { AppConfig } from "src/app/app.config";

@Component({
  selector: 'app-pwd-change',
  templateUrl: './pwd-change.component.html',
  styles: []
})
export class PwdChangeComponent implements OnInit {
  subdomain = "";
  backgroundSrc = "../../../assets/img/background.jpg";
  logoSrc = "";
  humanageSrc = "../../../assets/img/logo.png";

  passwordFormGroup: UntypedFormGroup;
  pwdmodel: IPwdChange = {
    oldPassword: undefined,
    newPassword: undefined,
    confirmPassword: undefined,
  };

  constructor(
    private auth: AuthService,
    private router: Router,
    private _formBuilder: UntypedFormBuilder,
    private msjSerive: MessageService,
    private readonly ouService: OrganizationalUnitService
  ) { }

  ngOnInit() {
    this.getSubdomain();
    this.passwordFormGroup = this._formBuilder.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    });
  }

  toLogin() {
    this.router.navigate(['login']);
  }

  isValidModel() {
    return (this.pwdmodel == null
      || this.pwdmodel.oldPassword == null
      || this.pwdmodel.newPassword == null
      || this.pwdmodel.confirmPassword == null
      || this.pwdmodel.confirmPassword != this.pwdmodel.newPassword) ? false : true;
  }

  cancel() {
    this.toLogin();
  }
  save() {
    this.auth.changePassword(this.pwdmodel).toPromise().then(
      () => {
        this.msjSerive.showInfo('Operación Exitosa. Contraseña reestablecida con éxito.');
        this.toLogin();
      },
      err => this.msjSerive.showError(err));
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
              ).catch(err => this.msjSerive.showError(err))
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

