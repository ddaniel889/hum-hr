import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AuthService } from '../../shared/auth/auth.service';
import { MessageService } from '../../shared/errorHandler/message.service';
import { OrganizationalUnit } from '../../shared/models';
import { OrganizationalUnitAccessConfig } from '../../shared/models/ou-access-config.model';
import { OrganizationalUnitAccessConfigService } from '../../shared/services/organizational-unit-access-configs.service';

@Component({
  selector: 'app-permissions',
  templateUrl: './permissions.component.html',
  styles: [
  ]
})
export class PermissionsComponent implements OnInit {
  @Input() ouSelected: OrganizationalUnit;
  loading = true;
  showDetails = false;
  saving = false;
  isDirty = false;
  isCandidateAdmin = false;
  isCandidateAdminBasic = false;
  isRRHH = false;
  //cancelToDo: boolean = false;
  ouAccessConfigEmployeeModel = new OrganizationalUnitAccessConfig();
  ouAccessConfigCandidateModel = new OrganizationalUnitAccessConfig();
  @Output() openDetailChanged = new EventEmitter<boolean>();
  messageenableHumanageHrEmailChange = "Nadie podrá volver a cambiar su correo electrónico ya que al desactivar esta opción dejarás sin efecto la única forma de cambio disponible para tu organización, sin embargo podés volver a activar la edición si deseas recuperar esta función.";

  constructor(
    private ouAccessConfigService: OrganizationalUnitAccessConfigService,
    private messageService: MessageService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.isCandidateAdmin = this.authService.isCandidateAdmin();
    this.isCandidateAdminBasic = this.authService.isCandidateAdminBasic();
    this.isRRHH = this.authService.isAdministrator();
    this.ouAccessConfigService.getByOuId(this.ouSelected.id).toPromise().then(
      configs => {
        this.loadConfigs(configs);
      },
      error => this.messageService.showError(error)
    ).then(() => this.loading = false);
  }

  changeDetails() {
    this.showDetails = !this.showDetails;
    this.openDetailChanged.emit(this.showDetails);
  }

  cancel() {

    this.loading = true;
    this.ouAccessConfigEmployeeModel = new OrganizationalUnitAccessConfig();
    this.ouAccessConfigCandidateModel = new OrganizationalUnitAccessConfig();
    this.ouAccessConfigService.getByOuId(this.ouSelected.id).toPromise().then(
      configs => {
        this.loadConfigs(configs);
      },
      error => this.messageService.showError(error)
    ).then(() => {
      this.loading = false
      this.isDirty = false;
    });

  }

  save() {
    this.saving = true;
    this.loading = true;
    const records: OrganizationalUnitAccessConfig[] = [];
    if (this.isRRHH) {
      const ouAccessConfigEmployee = { ...this.ouAccessConfigEmployeeModel };
      ouAccessConfigEmployee.organizationalUnitId = this.ouSelected.id;
      ouAccessConfigEmployee.isCandidate = false;
      records.push(ouAccessConfigEmployee);
    }

    const ouAccessConfigCandidate = { ...this.ouAccessConfigCandidateModel };
    ouAccessConfigCandidate.organizationalUnitId = this.ouSelected.id;
    ouAccessConfigCandidate.isCandidate = true;
    records.push(ouAccessConfigCandidate);

    this.ouAccessConfigService.create(records).toPromise().then(
      configs => {
        this.loadConfigs(configs);
        this.saving = false;
        this.messageService.showInfo('Configuración guardada con éxito.');
        this.isDirty = false;
        this.loading = false;
      },
      error => {
        this.messageService.showError(error);
        this.saving = false;
        this.loading = false;
      }
    )
  }

  loadConfigs(configs: OrganizationalUnitAccessConfig[]) {
    if (configs == null || configs.length == 0)
      return;
    this.ouAccessConfigEmployeeModel = configs.find(item => !item.isCandidate);
    this.ouAccessConfigCandidateModel = configs.find(item => item.isCandidate);

  }

  onChangePerson(name: string, isChecked: boolean, isCandidateSettings:boolean, ouAccessConfigModel: OrganizationalUnitAccessConfig) {
    this.isDirty = true;
    switch (name) {
      case 'canEditProfile':
        if (isChecked) {
          ouAccessConfigModel.canEditAvatar = true;
          ouAccessConfigModel.canEditPersonalInformation = true;
          ouAccessConfigModel.canEditSignature = true;
          this.onChangePerson('canEditPersonalInformation', true,isCandidateSettings, ouAccessConfigModel);
        } else {
          if (!this.ouSelected.enableHumanageHrEmailChange && !isCandidateSettings) {
            this.messageService.showInfo(this.messageenableHumanageHrEmailChange, true, true);

          }
        }
        break;
      case 'canEditPersonalInformation':
        if (isChecked) {
          ouAccessConfigModel.canEditEmail = true;
          ouAccessConfigModel.canEditFullName = true;
          ouAccessConfigModel.canEditUserName = true;
          ouAccessConfigModel.canEditPhoneNumber = true;
        } else {
          if (!this.ouSelected.enableHumanageHrEmailChange && !isCandidateSettings) {
            this.messageService.showInfo(this.messageenableHumanageHrEmailChange, true, true);

          }

          this.setCanEditProfile(ouAccessConfigModel);
        }
        break;
      case 'canEditFullName':
      case 'canEditEmail':
      case 'canEditUserName':
        if (!isChecked) {
          ouAccessConfigModel.canEditPersonalInformation =
            ouAccessConfigModel.canEditEmail ||
            ouAccessConfigModel.canEditFullName ||
            ouAccessConfigModel.canEditUserName;
          this.onChangePerson('canEditPersonalInformation', false,isCandidateSettings, ouAccessConfigModel);
        }
        break;
      case 'canEditAvatar':
      case 'canEditSignature':
        if (!isChecked) {
          this.setCanEditProfile(ouAccessConfigModel);
        }
      case 'canEditPhoneNumber':
        break;
    }
  }

  private setCanEditProfile(ouAccessConfigModel: OrganizationalUnitAccessConfig) {
    ouAccessConfigModel.canEditProfile =
      ouAccessConfigModel.canEditSignature ||
      ouAccessConfigModel.canEditAvatar ||
      ouAccessConfigModel.canEditPersonalInformation;
  }
}
