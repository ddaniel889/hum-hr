import { OrganizationalUnit } from './../shared/models/organizational-unit.model';
import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { IProfile, Certificate, CertificateType, ContainerType } from '../shared/models';
import { ProfileService } from '../shared/services/profile.service';
import { AuthService } from '../shared/auth/auth.service';
import { Router } from '@angular/router';
import { MessageService } from '../shared/errorHandler/message.service';
import { Validators, UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { AuthGuardService } from '../shared/services/auth-guard.service';
import { PersonPreview } from '../shared/models/Employee/person.model';
import { PersonService } from '../shared/services/person.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HolographicSign } from '../shared/models/holographicSign';
import { MessageAtributtes, MessageType } from '../shared/models/message-types.model';
import { GenericBottomSheetComponent } from '../shared/generic-bottom-sheet/generic-bottom-sheet.component';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { OrganizationalUnitAccessConfig } from '../shared/models/ou-access-config.model';
import { ContainerTypeService } from '../shared/services/container-type.service.';
import { EmployeeService } from '../shared/services/employee.service';
import { OrganizationalUnitService } from '../shared/services/organizational-unit.service';
import { EmployeeFind } from '../shared/models/employee-find.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styles: []
})
export class ProfileComponent implements OnInit {
  private nroCelSystemname = '_nroCel';
  private nroLegSystemname = '_nroleg';
  @Input() isEditable: boolean;
  @Input() isEmployeeFrame: boolean;
  @Input() isEmployerFrame: boolean;
  @Input() preview: string;
  @Output() editingMode = new EventEmitter<boolean>();
  @Output() updatePreview = new EventEmitter<string>();

  editing = false;
  userProfile = {} as IProfile;
  userProfileBackUp = {} as IProfile;
  activeCertificates: Certificate[];
  expiredCertificate: Certificate[];
  profileForm: UntypedFormGroup;
  canCertificateFirmanteDeclarationOpen = false;
  isCertificateDeclarationOpen = false;
  loading = false;
  organizationalUnitDescription: string;
  organizationalUnitId: string;
  showHolosignUpload = false;
  showAvatarUpload = false;
  useCellPhone = false;
  avatar: SafeResourceUrl;
  holographicSign: SafeResourceUrl;
  holographicSignPreview = "../../../assets/img/user-signature.png";
  ouAccessConfig: OrganizationalUnitAccessConfig;
  containerType: ContainerType;
  cellPhone: string;
  cellPhoneRequired: boolean;
  nrolegajo:string;
  isCertificateRenewOpen = false;
  useRenewCertificate = false;
  isExpiredCertificate = false;
  ouId = 0;

  DATA = {
    FIRSTNAME: 'firstName',
    LASTNAME: 'lastName',
    NICKNAME: 'nickName',
    EMAIL: 'email',
    PHONENUMBER: 'phoneNumber'
  };


  constructor(
    private authGuardService: AuthGuardService,
    private profileService: ProfileService,
    private authService: AuthService,
    private router: Router,
    private msjService: MessageService,
    private _formBuilder: UntypedFormBuilder,
    private personService: PersonService,
    private sanitizer: DomSanitizer,
    private _bottomSheet: MatBottomSheet,
    private containerTypeService: ContainerTypeService,
    private employeeService: EmployeeService,
    private organizationalService: OrganizationalUnitService
  ) {
    this.activeCertificates = [];
  }

  ngOnInit() {

    this.profileService.subscribeToMyCertificateForOu().subscribe(
      data => {
        this.activeCertificates = data;
      },
      err => this.msjService.showError(err),
    );
    this.canCertificateFirmanteDeclarationOpen = this.authService.isInRole('FIRMANTE') || this.authService.isLSDSigner();
    this.loading = true;
    this.getProfileData();

    this.authService.getAccess().toPromise().then(
      usersOus => {
        const currentUserId = localStorage.getItem("userId");

        for (const userOu of usersOus) {
          if (currentUserId == userOu.userId) {
            this.ouId = userOu.organizationalUnit.id;
            this.useRenewCertificate = userOu.organizationalUnit.useRenewCertificate;

            this.profileService.getMyExpiredCertificates(this.ouId.toString(), CertificateType.Employee).toPromise()
            .then(
              dataExpCert => {
                this.expiredCertificate = dataExpCert;
                this.isExpiredCertificate = this.expiredCertificate.length > 0;
              },
              err => this.msjService.showError(err)
            );
          }
        }
      },
      err => this.msjService.showError(err)
    );

   // const CertType = this.authService.isInRole('FIRMANTE') ? CertificateType.Employer.toString() : CertificateType.Employee.toString();
    this.profileService.getMyActiveCertificates(null, null).toPromise()
      .then(
        dataCert => {
          this.activeCertificates = dataCert;
          this.loading = false;
        },
        err => this.msjService.showError(err)
      );
    //Chequeo que sea empleado o candidato
    if (this.authService.isInRole('EMPLOYEE LD') || this.authService.isInRole('CANDIDATE')) {
      //Obtengo el tipo de contenedor
      this.personService.getMyContainerType().toPromise()
        .then(containerType => {
          if (containerType) {
            //Verifico que tenga el metadato de telefono
            var metaDatoCel = containerType.metadata.filter(x => x.metadataSystemName === this.nroCelSystemname)
            this.useCellPhone = metaDatoCel && metaDatoCel.length > 0;
              //obtengo el contenedor
              this.personService.getMyContainer().toPromise()
                .then(container => {
                  //Valido / Set del número de legajo
                  this.SetNroLegajo(container);
                  if (this.useCellPhone) {
                  //obtengo el telefono
                  const cellPhone = container.metadatas.filter(x => x.metadataSystemName === this.nroCelSystemname);
                  this.cellPhoneRequired = metaDatoCel[0].isRequired;
                  //Si es obligatorio se lo seteo al profileForm
                  if (this.cellPhoneRequired) {
                    this.profileForm.controls.phoneNumber.setValidators(Validators.required);
                  }
                  if (cellPhone && cellPhone.length > 0) {
                    this.cellPhone = cellPhone[0].metadataValue;
                  }
                }
                },
                  err => this.msjService.showError(err));


          } else this.msjService.showInfo("No tiene permisos para modificar el numero de telefono");

        }, err => this.msjService.showError(err));

    };

    this.organizationalUnitDescription = this.authService.getOrganizationDescription();
    this.organizationalUnitId = this.authService.getOrganizationId();

    if (this.preview) {
      this.avatar = this.sanitizer.bypassSecurityTrustResourceUrl(this.preview);
    }

    if (this.isEmployeeFrame) {
      this.profileService.getAccessConfigByOu(+this.organizationalUnitId).toPromise().then(
        result => {
          this.ouAccessConfig = result;
        },
        error => this.msjService.showError(error)
      );
    } else {
      this.ouAccessConfig = new OrganizationalUnitAccessConfig();
    }
  }

  getProfileData() {
    this.profileService.getMyProfile().toPromise()
      .then(
        data => {
          this.userProfile = data;
          this.userProfileBackUp = { ...data };
          this.userProfile.userId = this.authService.getUserId();
          this.userProfileBackUp.userId = this.userProfile.userId;
          this.personService.getMyContainer().toPromise().then(container => {
            const cellPhone = container.metadatas.filter(x => x.metadataSystemName === this.nroCelSystemname);
           if (cellPhone && cellPhone.length > 0) {
              this.cellPhone = cellPhone[0].metadataValue;
            }
          });
          this.profileForm = this._formBuilder.group({
            firstName: [this.userProfile.firstName, [Validators.required, Validators.minLength(1), Validators.maxLength(200)]],
            lastName: [this.userProfile.lastName, [Validators.required, Validators.minLength(1), Validators.maxLength(200)]],
            nickName: [this.userProfile.nickName, [Validators.required, Validators.minLength(1), Validators.maxLength(200)]],
            email: [this.userProfile.mail, [Validators.required, Validators.email, Validators.maxLength(200)]],
            phoneNumber: [this.cellPhone, [Validators.pattern(/^\+[0-9]?()[0-9](\s|\S)(\d[0-9]{8,9})$/)]]
          });

          if (this.puedeFirmar()) {
            this.getHolographicSign();
          }
        },
        err => this.msjService.showError(err)
      );
  }

  logOut() {
    this.authService.logout();
    this.router.navigate(['login']);
  }


  save() {
    if (this.profileForm.valid) {
      this.userProfile.firstName = this.profileForm.value.firstName;
      this.userProfile.lastName = this.profileForm.value.lastName;
      this.userProfile.nickName = this.profileForm.value.nickName;
      this.userProfile.mail = this.profileForm.value.email;
      this.userProfile.ouId = this.organizationalUnitId;
      this.loading = true;
      this.cellPhone = this.profileForm.value.phoneNumber ?? null;
      this.employeeService.updatePhone(this.cellPhone).toPromise().then(
      () => {
            this.profileService.uploadProfile(this.userProfile).toPromise().then(
              data => {
                //Una vez actualizado el perfil, vuelvo a solicitar la info
                this.personService.updateLocalStoragePhoneNumber(this.cellPhone);
                this.editingMode.emit(this.editing);
                this.loading = false;
                this.getProfileData();
              },
              err => {
                this.msjService.showError(err);
                this.editingMode.emit(this.editing);
                this.loading = false;
                this.getProfileData();
              }
            );
          },
          err => {
            if (err.code == 'Nick name is invalid') {
              err = 'invalidNickName';
            }
            this.loading = false;
            this.msjService.showError(err);
          }
        );


    } else {
      this.msjService.showError('VerifyFormData');
    }
  }

  uploadAvatar(preview: any) {
    const personPreview = new PersonPreview();

    personPreview.organizationalUnitId = +this.organizationalUnitId;
    personPreview.preview = preview;
    personPreview.isCandidate = !this.authService.isInRole('EMPLOYEE LD') && this.authService.isInRole('CANDIDATE');
    this.personService.uploadAvatarByUser(personPreview).toPromise()
      .then((res) => {
        this.preview = res;
        this.avatar = this.sanitizer.bypassSecurityTrustResourceUrl(res);
        this.showAvatarUpload = false;
        this.updatePreview.emit(res);
      })
      .catch(err => this.msjService.showError(err));
  }

  cancel() {
    this.profileForm.reset();
    this.userProfile = { ...this.userProfileBackUp };
    this.editingMode.emit(this.editing);
    this.showAvatarUpload = false;
  }
  valid(data: string) {
    return this.profileForm.controls[data].hasError('required');
  }
  validEmail() {
    return this.profileForm.controls['email'].hasError('email') && !this.profileForm.controls['email'].hasError('required');
  }
  validPhone() {
    return this.profileForm.controls['phoneNumber'].hasError('pattern');
  }

    certificateType(): CertificateType {
    if (this.isEmployeeFrame) {
      return CertificateType.Employee;

    } else {
      return CertificateType.Employer;
    }
  }

  openDeclareCertificate() {
    this.isCertificateDeclarationOpen = true;
  }

  openRenewCertificate() {
    this.isCertificateRenewOpen = true;
  }

  closeAdd() {
    this.isCertificateDeclarationOpen = false;
  }

  closeRenewAdd() {
    this.isCertificateRenewOpen = false;
  }

  isFirmante(): boolean {
    return this.authGuardService.userHasFunction(['FIRMANTE']) || this.authService.isLSDSigner();
  }

  puedeFirmar(): boolean {
    return this.authService.isInRole('EMPLOYEE LD') || this.authService.isInRole('CANDIDATE') || this.isFirmante();
  }

  setHolographicSign(holosignImg: string) {
    const holoSign: HolographicSign = {
      image: holosignImg,
      userId: this.userProfile.userId,
      isEmployer: this.isEmployerFrame,
      isCandidate: this.authService.isInRole('CANDIDATE')
    };

    this.profileService.setHolographicSign(holoSign).toPromise()
      .then((res) => {
        this.holographicSignPreview = res.image;
        this.holographicSign = this.sanitizer.bypassSecurityTrustResourceUrl(res.image);
        this.showHolosignUpload = false;
      })
      .catch(err => this.msjService.showError(err));
  }

  getHolographicSign() {
    this.profileService.getHolographicSign(this.userProfile.userId).toPromise()
      .then((holoSign) => {
        if (holoSign) {
          this.holographicSignPreview = holoSign.image;
          this.holographicSign = this.sanitizer.bypassSecurityTrustResourceUrl(holoSign.image);
        }
      });
  }

  DeleteOlographicSign() {
    const parameters: MessageAtributtes = {
      bodyText: 'Eliminar firma ológrafa',
      infoText: '¿Está seguro que desea eliminar su firma ológrafa?',
      type: MessageType.YesNo
    };

    const t = this._bottomSheet.open(GenericBottomSheetComponent, { data: parameters, disableClose: true });
    t.instance.close.subscribe((response: boolean) => {
      if (response) {
        this.profileService.DeleteOlographicSign(this.userProfile.userId).toPromise()
          .then((res) => {
            this.holographicSignPreview = null;
            this.holographicSign = null;
            this.showHolosignUpload = false;
          })
          .catch(err => this.msjService.showError(err));
      }
    });
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
            err => {
              this.msjService.showError(err);
            }
          });

      }
    }
  }

  SetNroLegajo(container: any)
  {
    if(this.authService.isInRole('EMPLOYEE LD'))
    {
      var nodeMetada = container.metadatas.filter(x => x.metadataSystemName === this.nroLegSystemname);
      if(nodeMetada != undefined){
      this.nrolegajo =  nodeMetada.length>0 ? nodeMetada[0].metadataValue : undefined;
     }
    }
  }
}
