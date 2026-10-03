import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { MessageService } from '../../shared/errorHandler/message.service';
import { DocumentationFind } from '../../shared/models/documentation-find.model';
import { UserService } from '../../shared/services/user.service';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { RoleUserService } from '../../shared/services/role-user.service';
import { ContainerType } from '../../shared/models/container-type.model';
import { EmployeeMetadata } from '../../shared/models/employee-metadata.model';
import { DocumentationType } from '../../shared/models/documentation-type.model';
import { WelcomeParametersDTO } from '../../shared/models/email.model';
import { AuthService } from '../../shared/auth/auth.service';
import { AppConfig } from 'src/app/app.config';
import { OrganizationalUnitService } from '../../shared/services/organizational-unit.service';
import { OrganizationalUnit } from '../../shared/models';
import { ActorDetail } from '../../shared/models/actor-detail.model';

@Component({
  selector: 'app-actor-detail',
  templateUrl: './actor-detail.component.html',
  styles: []
})
export class ActorDetailComponent implements OnInit, OnChanges {
  @Input() actor: ActorDetail;
  @Input() selectedOu: OrganizationalUnit;
  @Input() organizationalUnits: OrganizationalUnit[];
  @Input() isAdjetiveSigner : boolean;
  @Output() closeDetail = new EventEmitter<boolean>();
  @Output() saved = new EventEmitter<ActorDetail>();
  @Output() changeState = new EventEmitter<boolean>();

  welcomeSent = false;
  saving = false;
  editForm: UntypedFormGroup;
  edittedActor: ActorDetail;
  selectedEditingControl: string;
  previousValue: any[];
  containerType: ContainerType;
  // Variables para la edicion de filtros
  allFilters: boolean;
  metadataFilters: any[];
  placeHolderDescription: string;
  selectedFilters: EmployeeMetadata[] = [];
  // Variables para la edicion de filtros de documentaciones
  allDocumentations: boolean;
  selectedDocumentationTypes: DocumentationFind[] = [];
  documentationTypes: DocumentationType[];
  hasSAML = false;
  isEnabled = true;
  isFirmante = false;
  useSaml = false;
  seeDocumentFilter = true;
  constructor(
    private msjService: MessageService,
    private userService: UserService,
    private _formBuilder: UntypedFormBuilder,
    private roleUserService: RoleUserService,
    private authService: AuthService,
    private organizationalUnitService: OrganizationalUnitService,
  ) {
  }

  ngOnInit() {
    this.editForm = this._formBuilder.group({});

  }

  ngOnChanges() {
    const ouId = this.actor.organizationalUnitId;
    const actorOu = this.organizationalUnitService.getTreeOu().find(t => t.id === ouId);
    this.useSaml = actorOu.useSaml;
    this.welcomeSent = false;
    this.clearFormEdition();
    if (this.actor) {
      this.seeDocumentFilter = !this.actor.roles.some(f => f.functions.some(f => f.name === 'CANDIDATEADMIN' || f.name === 'ADMIN_CANDIDATE_BASIC'));
    }
    this.actor.roles= this.actor.roles.map(rol => ({
      ...rol,
      toggleState:rol.enabled
    }))
  }

  close() {
    this.closeDetail.emit(false);
  }

  sendWelcomeMail() {
    const dto = new WelcomeParametersDTO();
    dto.userId = this.actor.userId;
    this.userService.pendingWelcome(dto).toPromise()
      .then(() => {
        this.welcomeSent = true;
        this.msjService.showInfo("El correo electrónico de bienvenida será enviado al usuario");
      })
      .catch(err => this.msjService.showError(err));
  }

  enableUser(rol) {
    let hasChange = false
    const roleIds = [rol.id];
    this.roleUserService
      .enableUser(roleIds)
      .subscribe(
        () => {
          this.msjService.showInfo('Rol '+rol.roleName.toLowerCase()+' activado'); 
          hasChange = !this.actor.roles.some(r => r.enabled);
          this.actor.roles.forEach(r => { if(r.id == rol.id) r.enabled = true });
          this.actor.enabled = this.actor.roles.some(x=>x.enabled);
          if(hasChange)  this.changeState.emit(hasChange);
        },
        error => {    
          rol.toggleState = false;
          rol.enabled = false;
          this.msjService.showError(error);
        });
  }


  disableUser(rol) {
    let hasChange = false;
    const roleIds = [rol.roleId];
    this.userService
      .removeRol(rol.userId, roleIds)
      .subscribe(
        () => {
          this.msjService.showInfo('Rol '+rol.roleName.toLowerCase()+' desactivado')
          hasChange = this.actor.roles.filter(r => r.enabled).length === 1;
          this.actor.roles.forEach(r => { if(r.id == rol.id) r.enabled = false });
          this.actor.enabled = this.actor.roles.some(x=>x.enabled);
          if(hasChange)  this.changeState.emit(hasChange);
        },
        error => {
          this.msjService.showError(error);
        });
  }

  editControl(selectedControl: string) {
    // Me guardo una copia del role User a editar
    this.edittedActor = { ...this.actor };

    if (this.selectedEditingControl) {
      this.clearFormEdition();
    }

    if (selectedControl === 'fullName') {
      this.editForm.addControl('firstName', this.getFormControl('firstName'));
      this.editForm.addControl('lastName', this.getFormControl('lastName'));
    } else {
      this.editForm.addControl(selectedControl, this.getFormControl(selectedControl));
    }

    this.selectedEditingControl = selectedControl;
  }

  clearFormEdition() {
    if (!this.editForm || !this.selectedEditingControl) {
      return;
    }

    if (this.selectedEditingControl == 'fullName') {
      this.editForm.removeControl('firstName');
      this.editForm.removeControl('lastName');
    } else {
      this.editForm.removeControl(this.selectedEditingControl);
    }
    this.saving = false;
    this.selectedEditingControl = null;
  }

  getFormControl(selectedControl: string): UntypedFormControl {
    switch (selectedControl) {
      case 'nickName':
        return new UntypedFormControl(this.edittedActor.delegatedSystemId, Validators.required);
      case 'firstName':
        return new UntypedFormControl(this.edittedActor.firstName, Validators.required);
      case 'lastName':
        return new UntypedFormControl(this.edittedActor.lastName, Validators.required);
      case 'mail':
        return new UntypedFormControl(this.edittedActor.mail, [Validators.required, Validators.email]);
      default:
        return new UntypedFormControl('', Validators.required);
    }
  }

  updateEntityWithEdittedData() {
    this.previousValue = [];
    switch (this.selectedEditingControl) {
      case 'nickName':
        this.previousValue.push(JSON.parse(JSON.stringify(this.actor.delegatedSystemId)));
        this.actor.delegatedSystemId = this.editForm.controls[this.selectedEditingControl].value;
        return;
      case 'fullName':
        this.previousValue.push(JSON.parse(JSON.stringify(this.actor.firstName)));
        this.previousValue.push(JSON.parse(JSON.stringify(this.actor.lastName)));
        this.actor.firstName = this.editForm.controls['firstName'].value;
        this.actor.lastName = this.editForm.controls['lastName'].value;
        return;
      case 'mail':
        this.previousValue.push(JSON.parse(JSON.stringify(this.actor.mail)));
        this.actor.mail = this.editForm.controls['mail'].value;
        return;
    }
  }

  resetValue() {
    switch (this.selectedEditingControl) {
      case 'nickName':
        this.actor.delegatedSystemId = this.previousValue[0];
        return;
      case 'fullName':
        this.actor.firstName = this.previousValue[0];
        this.actor.lastName = this.previousValue[1];
        return;
      case 'mail':
        this.actor.mail = this.previousValue[0];
        return;
    }
  }

  save() {
    this.saving = true;
    this.updateEntityWithEdittedData();
    const rol = {
      ...this.actor.roles[0],
      firstName: this.actor.firstName,
      lastName: this.actor.lastName,
      mail: this.actor.mail,
      nickName: this.actor.nickName,
      delegatedSystemId: this.actor.delegatedSystemId
    }
    this.roleUserService.update(rol).toPromise()
      .then(data => {
        this.msjService.showInfo('Dato guardado correctamente');
        this.clearFormEdition();
        this.actor.nickName = data.nickName;
        this.saved.emit(this.actor);
      },
        err => {
          this.msjService.showError(err);
          this.resetValue();
          this.saving = false;
        });
  }

  cancel() {
    this.clearFormEdition();
  }

  unlock() {
    const user = {
      id: this.actor.userId,
      locked: false
    };

    this.userService
      .updateLock(user)
      .subscribe(
        data => {
          this.actor.locked = false;
          this.msjService.showInfo('Usuario desbloqueado con éxito.\nEl usuario recibirá un mail con la nueva contraseña');
        },
        err => this.msjService.showError(err)
      );
  }

  getSAML() {
    this.authService.getSAML(this.actor.organizationalUnitId).toPromise().then(
      data => {
        this.hasSAML = (data != null) ? data.active : false;
      },
      err => {
        this.hasSAML = false;
      }
    );
  }

  changeSaml() {
    const params = {
      userid: this.actor.userId,
      applicationId: AppConfig.settings.application.id
    };
    this.userService.updateSaml(params, this.actor.isSamlActive).toPromise().then(
      () => {
        const message = (this.actor.isSamlActive) ? 'Se activó la Autenticación Delegada (SAML)' : 'Se Desactivó la Autenticación Delegada (SAML)';
        this.msjService.showInfo(message);
      },
      err => {
        this.actor.isSamlActive = !this.actor.isSamlActive;
        this.msjService.showError(err);
      }
    );
  }

  changeEnabled(rol) {  
    if (rol.toggleState && !rol.enabled) {
      this.enableUser(rol);      
    } else {
      this.disableUser(rol);      
    }    
  }
}
