import { Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { MessageService } from '../../shared/errorHandler/message.service';
import { OrganizationalUnit } from '../../shared/models';
import { FileService } from '../../shared/services/file.service';
import { OrganizationalUnitService } from '../../shared/services/organizational-unit.service';
import { AppConfig } from "src/app/app.config";

@Component({
  selector: 'app-appearance',
  templateUrl: './appearance.component.html',
  styles: [
  ]
})
export class AppearanceComponent implements OnInit, OnChanges, OnDestroy {
  loading = true;
  isDirty = false;
  iconBase64: string;
  edittingIconBase64: string;
  logo: File;
  mainColor: string;
  primaryColor: string;
  darkMode = false;
  logoId: string;
  logoEditing = false;

  imageId: string;
  subdomain: string = "";
  imgBackgroundBase64: any = '';
  croppedImage: any = '';
  imageChangedEvent: any = '';

  @Input() ouSelected: OrganizationalUnit;

  constructor(
    private ouService: OrganizationalUnitService,
    private msjService: MessageService,
    private fileSvc: FileService) { }

  ngOnDestroy(): void {
    this.cancelTheme();
  }

  ngOnInit(): void {
    this.isDirty = false;
    this.getSubdomain();
    this.loadTheme();
  }

  ngOnChanges(): void {
    this.loadLogo();
    this.getSubdomain();
    this.loadTheme();
  }

  uploadLogo(preview: any) {
    this.saveIcon(preview)
    this.iconBase64 = preview;

  }

  deleteLogo() {
    this.ouService.deleteImage(this.logoId).toPromise()
      .then(() => {
        this.loadLogo();
        this.msjService.showInfo('Verás reflejados los cambios en tu próximo ingreso');
      })
      .catch(err => this.msjService.showError(err));
  }

  onColorSelected(isMain: boolean) {
    if (!this.mainColor || !this.primaryColor) {
      return;
    }

    //Si tiene elegidos los dos colores seteo el tema
    if (this.mainColor && this.primaryColor) {
      const theme = `${this.mainColor}-${this.primaryColor}`;
      const ouId = +localStorage.getItem('organizationId');
      if (this.ouSelected.id == ouId) {
        document.body.classList.value = '';
        document.body.classList.add(theme);
      }
      this.isDirty = true;
    }
  }

  onDarkModeChanged() {
    const ouId = +localStorage.getItem('organizationId');
    if (this.ouSelected.id == ouId) {
      if (!this.darkMode) {
        document.body.classList.remove('dark');
      } else {
        document.body.classList.add('dark');
      }
    }
    this.isDirty = true;
  }

  cancelTheme(forceRefresh = false) {
    this.loadTheme();
    document.body.classList.value = '';
    this.ouService.setTheme(forceRefresh);
    this.isDirty = false;
  }

  saveTheme() {
    if (!this.mainColor && !this.primaryColor) {
      return;
    }

    this.ouSelected.humanageTheme = `${this.mainColor}-${this.primaryColor}`;
    this.ouSelected.darkMode = this.darkMode;

    this.ouService.saveTheme(this.ouSelected).toPromise()
      .then(() => {
        const ouId = +localStorage.getItem('organizationId');
        if (this.ouSelected.id !== ouId) {
          this.msjService.showInfo('El tema se aplicará al ingresar a la empresa modificada.');
        }

        this.cancelTheme(this.ouSelected.id === ouId);
      })
      .catch(err => this.msjService.showError(err));
  }

  saveIcon(logoBase64: any) {
    const base64 = logoBase64.substring(22);
    const imageName = 'logo.png';
    const imageBlob = this.fileSvc.convertBase64ToBlob(base64);
    const imageFile = new File([imageBlob], imageName, { type: 'image/png' });

    this.ouService.saveLogo(this.ouSelected.id, imageFile).toPromise()
      .then(() => {
        this.loadLogo();
        this.msjService.showInfo('Verás reflejados los cambios en tu próximo ingreso');
      })

      .catch(err => this.msjService.showError(err)).then(() => this.logoEditing = false);

  }

  private loadLogo() {
    this.loading = true;
    this.iconBase64 = undefined;
    this.ouService.getImagesByOuId(this.ouSelected.id).toPromise().then(
      images => {
        const logo = images.filter(image => image.isLogo)[0];

        if (logo && logo.base64File) {
          this.iconBase64 = logo.getLogoData();
          this.logoId = logo.id.toString();
        }
      }).
      catch(err => this.msjService.showError(err))
      .then(() => this.loading = false);
  }

  private loadTheme() {
    if (!this.ouSelected.humanageTheme) {
      return;
    }

    // Obtengo el tema de la ou y lo preselecciono
    this.darkMode = this.ouSelected.darkMode;
    const indexSeparator = this.ouSelected.humanageTheme.indexOf('-');
    this.mainColor = this.ouSelected.humanageTheme.substring(0, indexSeparator);
    this.primaryColor = this.ouSelected.humanageTheme.substring(indexSeparator + 1);
    if (this.primaryColor === 'default' || !this.primaryColor) {
      this.mainColor = 'default';
      this.primaryColor = undefined;
    }
  }

  getSubdomain() {
    const domain = window.location.hostname;
    if (domain.indexOf('.') > 0 && domain.split('.')[0] != 'app' && domain.split('.')[0] != 'cppatest' && domain.split('.')[0] != 'cppa' &&
      domain.split('.')[0] != AppConfig.settings.application.subdomain && this.ouSelected.isRoot) {
      this.subdomain = domain.split('.')[0];
      this.ouService.getImagesBySubDomain(this.subdomain).toPromise().then(
        images => {
          const image = images.filter(image => !image.isLogo)[0];
          if (image !== undefined) {
            this.imageId = image.id.toString();
            this.imgBackgroundBase64 = image.getImageData();
          }
          else {
            this.imgBackgroundBase64 = '';
          }
          document.body.hidden = false;
        }
      ).catch(err => {
        this.loading = false;
        this.msjService.showError(err);
      });
    }
  }

  uploadBackgroundImage(event: any) {
    const targetEvent = event.target;
    const file: File = targetEvent.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const base64img = reader.result as string;
      this.loading = true;
      const imageName = 'background.png';
      const imageFile = new File([file], imageName, { type: 'image/*' });
      this.ouService.saveImages(this.ouSelected, [imageFile], this.subdomain).toPromise()
      .then(() => {
        this.msjService.showInfo('Verás reflejados los cambios en tu próximo ingreso');
        this.imgBackgroundBase64 = base64img;
        this.getSubdomain();
        this.loading = false;
        })
        .catch(err => {
          this.loading = false;
          this.msjService.showError(err);
        })
    }
    reader.readAsDataURL(file);
  }

  updateBackgroundImage(event: any){
    this.ouService.deleteImage(this.imageId).toPromise().then().catch(err => this.msjService.showError(err));
    this.imgBackgroundBase64 = '';
    this.uploadBackgroundImage(event);
  }


  deleteImage(){
    this.loading = true;
    this.ouService.deleteImage(this.imageId).toPromise()
    .then(() => {
      this.getSubdomain();
      this.loading = false;
      this.msjService.showInfo('Verás reflejados los cambios en tu próximo ingreso');
    })
    .catch(err => this.msjService.showError(err));
  }

}
