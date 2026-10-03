import { Component, OnInit, EventEmitter, Output, Input, ViewChild } from "@angular/core";
import { UntypedFormBuilder, Validators, FormControl, UntypedFormGroup } from "@angular/forms";
import { MessageService } from "../../shared/errorHandler/message.service";
import { CertificateService } from "../../shared/services/certificate.service";
import { OrganizationalUnit, User } from "../../shared/models";
import { CertificateProvider } from "../../shared/models/certificate-provider.model";
import { CertificateType } from "../../shared/models/certificate.model";
import { CertificatePost } from '../../shared/models/certificatePost.model';
import { EmployeeService } from "../../shared/services/employee.service";
import { AuthService } from "../../shared/auth/auth.service";
import { OrganizationalUnitService } from "../../shared/services/organizational-unit.service";
import { MatStepper } from "@angular/material/stepper";
import { UserService } from "../../shared/services/user.service";
import { OuConfigSignatureTypeParametersDTO } from "../../shared/models/signatureType.model";


@Component({
  selector: "app-certificate-declaration",
  templateUrl: "./certificate-declaration.component.html",
  styles: []
})
export class CertificateDeclarationComponent implements OnInit {
  constructor(
    private _formBuilder: UntypedFormBuilder,
    private msjService: MessageService,
    private authService: AuthService,
    private employeeService: EmployeeService,
    private organizationalUnitsService: OrganizationalUnitService,
    private certificateService: CertificateService,
    private userService: UserService) {
  }

  @Input() documentIds: number[];
  @Input() users: User[];
  @Output() addFinish = new EventEmitter<boolean>();
  @Input() ouId : number;
  @ViewChild("stepper") stepper: MatStepper;

  certificateFormGroup: UntypedFormGroup;
  organizationalUnits: OrganizationalUnit[] = [];
  selectedCertificateType: CertificateProvider;
  certificateProviders: any;
  isEmployeeFileUser: boolean;
  proveedor: any;
  minDate = Date.now;
  usersOUOfSelectedUser: User[];
  roleFirmanteId: Number;
  showExpirationDate = false;
  isRequired = false;
  ngOnInit() {

    this.certificateFormGroup = this._formBuilder.group({
      certificateProvider: ["", Validators.required],
      expirationDate: [""]
    });

    this.isEmployeeFileUser = this.documentIds && this.documentIds.length > 0;

    if (!this.isEmployeeFileUser) {
      this.certificateFormGroup.controls["expirationDate"].setValidators(Validators.required);
      this.organizationalUnitsService
        .getUserTree(this.users[0].id)
        .subscribe(response => {
          this.organizationalUnits = response.filter(ou => ou.enabled);
        },
          err => this.msjService.showError(err)
        );

      this.userService.get({ loginId: this.users[0].loginId })
        .subscribe(response => {
          this.usersOUOfSelectedUser = response;
        },
          err => this.msjService.showError(err)
        );

      const parameters: OuConfigSignatureTypeParametersDTO = {
        organizationalUnitId: Number(this.authService.getOrganizationId()),
        CertificateTypeId: CertificateType.Employer,
        IsManualDeclaration: true,
        IsAutomaticDeclaration: false
      };
      this.certificateProviders = [];
      this.certificateService.getSignatureTypes(parameters)
        .subscribe(
          certificateProviders => {
            this.certificateProviders = certificateProviders;
          },
          err => this.msjService.showError(err)
        );

     this.organizationalUnitsService.getLawerRolId(Number(this.organizationalUnitsService.getCurrentOrChildOU().id)).toPromise().then(
          async rolId => {
            this.roleFirmanteId = Number(rolId);
          },
          err => this.msjService.showError(err)
        );

    } else {
      this.organizationalUnits = [
        new OrganizationalUnit()
      ];
      const parameters: OuConfigSignatureTypeParametersDTO = {
        organizationalUnitId: this.ouId && !isNaN(this.ouId)  ? this.ouId : Number(this.organizationalUnitsService.getCurrentOrChildOU().id),
        CertificateTypeId: CertificateType.Employee,
        IsManualDeclaration: true
      };

      this.certificateService
        .getSignatureTypes(parameters)
        .subscribe(
          certificateProviders => {
            this.certificateProviders = certificateProviders;
          },
          err => this.msjService.showError(err)
        );
    }
  }

  saveAndContinue(ou: OrganizationalUnit) {

    if (this.isEmployeeFileUser) {
      // declaracion de certificado para empleado
      const certificate: CertificatePost = {
        Enabled: true,
        ExpirationDate: (this.showExpirationDate) ? this.certificateFormGroup.value.expirationDate : null,
        ProviderId: this.certificateFormGroup.value.certificateProvider.id,
        ProviderName: this.certificateFormGroup.value.certificateProvider.name,
        Type: CertificateType.Employee,
        DocumentIds: this.documentIds,
        isAutoDeclarated: false
      };

      this.employeeService
        .certificateDeclaration(certificate, null)
        .subscribe(
          () => {
            this.msjService.showInfo("Los certificados fueron declarados correctamente");
            this.addFinish.emit(true);
          },
          err => this.msjService.showError(err)
        );
    } else {
      // declaracion de certificado para rrhh/firmante
      const certificate: CertificatePost = {
        OrganizationalUnitId: ou.id,
        Enabled: true,
        ExpirationDate: this.certificateFormGroup.value.expirationDate,
        ProviderId: this.certificateFormGroup.value.certificateProvider.id,
        ProviderName: this.certificateFormGroup.value.certificateProvider.name,
        Type: CertificateType.Employer,
        UserId: this.users[0].id,
        isAutoDeclarated: false
      };

      this.certificateService.certificateEmployerDeclaration(certificate, null)
        .subscribe(response => {
          if (response) {
            this.msjService.showInfo("El certificado fue declarado correctamente");
          }
        },
          err => this.msjService.showError(err)
        );

      this.certificateFormGroup.reset();
    }

    if (this.stepper.selectedIndex == this.organizationalUnits.length - 1) {
      this.addFinish.emit(false);
    }
  }

  cancel() {
    this.addFinish.emit(false);
  }

  validationProvider(provider: any) {
    this.showExpirationDate = ((provider.askExpirationDate != false) && provider.manageAction == null);
    this.isRequired = (provider.askExpirationDate == true) && provider.manageAction == null;
    this.certificateFormGroup.controls['expirationDate'].clearValidators();
    if (this.isRequired) {
      this.certificateFormGroup.controls['expirationDate'].setValidators([Validators.required]);
    }
    this.certificateFormGroup.controls['expirationDate'].updateValueAndValidity();
  }
}
