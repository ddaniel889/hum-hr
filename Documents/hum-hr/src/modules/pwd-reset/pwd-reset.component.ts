import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../shared/auth/auth.service';
import { OnInit, Component } from '@angular/core';
import { IPwdReset } from '../shared/models/pwd-reset.model';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { MessageService } from '../shared/errorHandler/message.service';
import { OrganizationalUnitService } from '../shared/services/organizational-unit.service';
import { AppConfig } from 'src/app/app.config';

@Component({
selector: 'app-pwd-reset',
  templateUrl: './pwd-reset.component.html',
  styles: []
})
export class PwdResetComponent implements OnInit {
  datos: any;
  subdomain = "";
  backgroundSrc = "../../../assets/img/background.jpg";
  logoSrc = "";
  humanageSrc = "../../../assets/img/logo.png";
  passwordFormGroup: UntypedFormGroup;
  pwdmodel: IPwdReset = {
    code : undefined,
    confirmPassword : undefined,
    password : undefined
  };

  constructor(
    private auth: AuthService,
    private router: Router,
    private _formBuilder: UntypedFormBuilder,
    private activatedRoute: ActivatedRoute,
    private msjSerive: MessageService,
    private readonly ouService: OrganizationalUnitService
      ) {     }

  ngOnInit() {
    this.getSubdomain();
    this.passwordFormGroup = this._formBuilder.group({
    password: ['', Validators.required],
    passwordConfirm: ['', Validators.required]
  });

  this.activatedRoute.params.subscribe(params => {
    this.pwdmodel.code = params['code'];
  });

  }

  toLogin() {
    this.router.navigate(['login']);
  }

  IsValidPwdModel(p: IPwdReset): boolean {
    return !( p == null
      || p.code == null
      || p.password == null || p.password === ""
      || p.confirmPassword == null || p.confirmPassword === ""
      || p.confirmPassword !== p.password);
  }

  save() {
    this.pwdmodel.password = this.passwordFormGroup.value.password;
    this.pwdmodel.confirmPassword = this.passwordFormGroup.value.passwordConfirm;
    if (!this.IsValidPwdModel(this.pwdmodel)) {
      this.msjSerive.showError('confirmPassword');
      return;
    }
    this.auth.resetPassword(this.pwdmodel).toPromise().then(
      data => {  this.datos = data;
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

