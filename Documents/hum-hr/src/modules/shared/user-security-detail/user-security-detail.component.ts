import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { UserService } from '../services/user.service';
import { MessageService } from '../errorHandler/message.service';
import { RoleService } from '../services/role.service';
import { User } from '../models';
import { AuthService } from '../auth/auth.service';
import { AppConfig } from 'src/app/app.config';
import { WelcomeParametersDTO } from '../models/email.model';
import { MessageAtributtes, MessageType } from '../models/message-types.model';
import { GenericBottomSheetComponent } from '../generic-bottom-sheet/generic-bottom-sheet.component';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { DocumentationTypesService } from '../../shared/services/documentation-types.service';
import { DocumentationTypeSetService } from '../../shared/services/documentation-type-set.service';
@Component({
  selector: 'app-user-security-detail',
  templateUrl: './user-security-detail.component.html',
  styleUrls: []
})
export class UserSecurityDetailComponent implements OnInit {
  private _user: User;
  showRoleOrganizationalUnitName: boolean;
  roles: any[];
  hasSAML = false;
  isSamlActive = false;

  @Input() expanded: boolean;
  @Input() isRRHH: boolean;
  @Input() isCandidate: boolean;
  @Input() onlyEmployeeManagement: boolean

  @Output() reSendEmail = new EventEmitter<boolean>();

  constructor(
    private userService: UserService,
    private messageService: MessageService,
    private rolesService: RoleService,
    private authService: AuthService,
    private _bottomSheet: MatBottomSheet,
    private documentationTypesService: DocumentationTypesService,
    private docTypeSetSvc: DocumentationTypeSetService,
  ) { }

  @Input()
  set user(user: User) {
    this.roles = [];
    this._user = user;
  }

  get user(): User {
    return this._user;
  }

  ngOnInit() {
    if (this._user) {
      if (!this.isCandidate) {
        this.loadRoles();
      }
    }
    this.authService.getSAML(Number(this._user.organizationalUnitId)).toPromise().then(
      data => {
        this.hasSAML = (data != null) ? data.active : false;
        this.isSamlActive = this.user.isSamlActive;
      },
      err => {
        this.hasSAML = false;
      }
    );
  }

  updateUserLock() {
    this.userService
      .updateLock(this.user)
      .subscribe(
        data => {
          if (data['locked'] === false) {
            this.messageService.showInfo('Usuario desbloqueado con éxito.\nEl usuario recibirá un mail con la nueva contraseña.');
          } else {
            this.messageService.showInfo('El usuario fue bloqueado.');
          }
        },
        err => this.messageService.showError(err)
      );
  }

  enableUser() {
    this.userService
      .update(this.user)
      .subscribe(
        data => {
          if (data['enabled'] === false) {
            this.messageService.showInfo('El usuario fue deshabilitado.');
          } else {
            this.messageService.showInfo('El usuario fue habilitado.');
          }
          // actualizamos en cpp las colecciones de métrcias.         
          this.docTypeSetSvc.getSetbyIdFiscal(this.user.cuil,this.user.organizationalUnitId).toPromise().then( 
           set =>
           {               
               var Id = set?.setId ?? 0               
               if(Id > 0){               
               this.documentationTypesService.updateSetById(Id).toPromise()              
               .catch(error =>
                {
                  this.messageService.showError("No se pudo actualizar las métricas de Set")
                });
              }
           });
        },
        err => this.messageService.showError(err)
      );
  }

  updateRol(rol: any) {
    if (rol.isSelected) {
      this.addRoleToUser(rol);
    } else {
      if (this.confirmRemoveLastRole()) {
        this.messageService
          .showOkCancel('El usuario dejará de ser visible en la búsqueda. ¿Desea quitar el último rol de todas formas?', 'Sí', 'No')
          .subscribe(result => {
            if (result) {
              this.removeRoleToUser(rol);
            } else {
              rol.isSelected = !rol.isSelected;
            }
          });
      } else {
        this.removeRoleToUser(rol);
      }
    }
  }

  private loadRoles() {
    this.rolesService
      .getRolesFromConfig(this.isRRHH, this._user.organizationalUnitId)
      .then(
        data => {
          this.roles = [];
          for (let index = 0; index < data.length; index++) {
            const role = data[index]; {
              role.isSelected = this.user.roles.some(function (r) { return r.roleId == role.id; });
              if (this.roles.length > 0) {
                this.showRoleOrganizationalUnitName = this.showRoleOrganizationalUnitName || role.organizationalUnitId !== data[index - 1].organizationalUnitId;
              }
              this.roles.push(role);
            }
          }

        },
        err => {
          if (err['code'] !== '_404') {
            this.messageService.showError(err);
          }
        }
      );
  }

  private addRoleToUser(rol: any) {
    const roleIds = [rol.id];
    this.userService
      .addRol(this.user.id, roleIds)
      .subscribe(
        () => {
          const role = {
            roleId: rol.id,
            roleName: rol.name,
            isSelected: rol.isSelected,
            organizationalUnitId: rol.organizationalUnitId
          };
          this.user.roles.push(role);
        },
        error => this.messageService.showError(error)
      );
  }

  private removeRoleToUser(rol: any) {
    const roleIds = [rol.id];
    this.userService
      .removeRol(this.user.id, roleIds)
      .subscribe(
        () => {
          this.user.roles = this.user.roles.filter(z => z.roleId != rol.id);
        },
        error => this.messageService.showError(error)
      );
  }

  private confirmRemoveLastRole(): boolean {
    if (!this.user.roles) {
      return false;
    }
    let countOfRoles = 0;
    this.roles.forEach(element => {
      if (this.user.roles.some((item) => item.roleId == element.id)) {
        countOfRoles++;
      }
    });

    return countOfRoles == 1;
  }

  changeSaml() {
    if (this.isSamlActive) {
      // Si esta desactivado lo voy a activar
      const parameters = {
        bodyText: '¡Estás por desactivar las credenciales de ingreso a Humanage!',
        infoText: 'Esta acción impedirá que el empleado siga ingresando con las credenciales de Humanage y deberá usar su usuario de la aplicación externa de autenticación para ingresar al sistema. Procedé sólo si tenés la certeza que el empleado podrá ingresar con la Autenticación Delegada.',
        type: MessageType.OkCancel
      } as MessageAtributtes;

      const t = this._bottomSheet.open(GenericBottomSheetComponent, { data: parameters, disableClose: true });
      t.instance.close.subscribe(data => {
        if (data) {
          this.updateSamlActive(this.isSamlActive, false);
        } else {
          this.isSamlActive = !this.isSamlActive;
        }

      });
    } else {
      // Si es activo estoy desactivando
      const parameters = {
        bodyText: '¡Estás por activar las credenciales de ingreso a Humanage!',
        infoText: 'Ahora el empleado podrá ingresar con las credenciales de Humanage, si además enviás el Mail de Bienvenida, podrá gestionar nuevas credenciales de acceso al sistema.',
        actions: [
          {
            label: 'Activar',
            color: 'accent',
            execute: () => {
              this.updateSamlActive(this.isSamlActive, false);
            }
          },
          {
            label: 'Enviar Mail y Activar',
            color: 'primary',
            execute: () => {
              this.updateSamlActive(this.isSamlActive, true);
            }
          },
        ],
        type: MessageType.MultipleActions
      } as MessageAtributtes;

      const t = this._bottomSheet.open(GenericBottomSheetComponent, { data: parameters, disableClose: true });
      t.instance.close.subscribe(data => {
        if (!data) {
          this.isSamlActive = !this.isSamlActive;
        }
      });
    }
  }

  private updateSamlActive(isSamlActive: boolean, sendMail : boolean) {
    const params = {
      userid: this.user.id,
      applicationId: AppConfig.settings.application.id,
      sendMail: sendMail
    };

    this.userService.updateSaml(params, isSamlActive).toPromise().then(
      () => {
        this.user.isSamlActive = isSamlActive;
        const message = (this.user.isSamlActive) ? 'Se activó el modo accesibilidad desde otra aplicación.' : 'Se desactivó el modo accesibilidad desde otra aplicación.';

        this.messageService.showInfo(message);
      },
      err => {
        this.messageService.showError(err);
        this.isSamlActive = this.user.isSamlActive;
      }
    );
  }

  sendPendingWelcome() {
    const dto = new WelcomeParametersDTO();
    dto.organizationalUnitId = this.user.organizationalUnitId;
    dto.userId = this.user.id;
    dto.isCandidate = this.isCandidate;
    this.userService.pendingWelcome(dto).toPromise()
      .then(() => {
        const typePerson = this.isCandidate ? 'candidato' : 'empleado';
        this.messageService.showInfo(`El correo electrónico de bienvenida será enviado al ${typePerson}.`);
      })
      .catch(err => this.messageService.showError(err));
  }
}
