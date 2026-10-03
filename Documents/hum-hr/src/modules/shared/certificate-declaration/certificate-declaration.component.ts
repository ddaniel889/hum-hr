import { Component, OnInit, EventEmitter, Output, Input, ViewChild } from "@angular/core";
import { UntypedFormBuilder, UntypedFormGroup, Validators, AbstractControl } from "@angular/forms";
import { MessageService } from "../../shared/errorHandler/message.service";
import { CertificateService } from "../../shared/services/certificate.service";
import { CertificateProvider } from "../../shared/models/certificate-provider.model";
import { CertificateType } from "../../shared/models/certificate.model";
import { CertificatePost } from '../../shared/models/certificatePost.model';
import { EmployeeService } from "../../shared/services/employee.service";
import { AuthService } from "../../shared/auth/auth.service";
import { ProfileService } from "../../shared/services/profile.service";
import { OrganizationalUnitService } from "../../shared/services/organizational-unit.service";
import { UploadFormComponent } from "../../shared/file-dnd/file-dnd.component";
import { OuConfigSignatureTypeParametersDTO } from "../models/signatureType.model";
import { OrganizationalUnit } from "../models";
import { PersonService } from "../services/person.service";


@Component({
  selector: "app-certificate-declaration",
  templateUrl: "./certificate-declaration.component.html",
  styles: []
})
export class CertificateDeclarationComponent implements OnInit {
  constructor(
    private _formBuilder: UntypedFormBuilder,
    private msjService: MessageService,
    private certificateService: CertificateService,
    private employeeService: EmployeeService,
    private authService: AuthService,
    private profile: ProfileService,
    private organizationalUnitService: OrganizationalUnitService,
    private personService: PersonService
  ) { }


  @ViewChild(UploadFormComponent) uploadFiles: UploadFormComponent;
  @Input() certificateType: CertificateType;
  @Input() onlyMultipleSign = false;
  @Output() addFinish = new EventEmitter<boolean>();
  showExpirationDate = false;
  showFile = false;
  selectedCertificateType: CertificateProvider;
  organizationalUnits: OrganizationalUnit[];
  certificateProviders: any[];
  certificateFormGroup: UntypedFormGroup;
  minDate = new Date();
  files: File[];
  inProcess = false;

  ngOnInit() {
    this.certificateFormGroup = this._formBuilder.group({
      certificateType: ["", Validators.required],
      expirationDate: [""],
      organizationalUnit: [""],
      certificateFileOk: ["", Validators.required],
      certificateFile: [""],
      fiscalIdentifier: [""]
    });

    this.organizationalUnitService.getTreeInMemory().then(
      result => {
        this.organizationalUnits = result.filter(o => o.isRoot === false);

      },
      err => this.msjService.showError(err)
    );
  }

  isEmployer() {
    return this.certificateType == CertificateType.Employer;
  }

  save() {
    this.inProcess = true;
    const certificate: CertificatePost = {
      Enabled: true,
      ExpirationDate: (this.showExpirationDate) ? this.certificateFormGroup.value.expirationDate : null,
      ProviderId: this.certificateFormGroup.value.certificateType.id,
      ProviderName: this.certificateFormGroup.value.certificateType.name,
      Type: this.certificateType,
      RevocationPin: '',
      OrganizationalUnitId: this.getOuIdForCertificate(),
      UserId: Number(this.authService.getUserId()),
      isAutoDeclarated: true,
      Cuil: (this.certificateFormGroup.value.fiscalIdentifier) ? this.certificateFormGroup.value.fiscalIdentifier : null
    };

    if (this.certificateType == CertificateType.Employee) {
      this.employeeService.certificateDeclaration(certificate, this.files).toPromise().then(
        () => {
          this.msjService.showInfo("El certificado fue declarado correctamente");
          this.profile.refreshMyActiveCertificatesForOu(null).toPromise();
          this.addFinish.emit(true);
          this.inProcess = false;
        },
        err => {
          this.msjService.showError(err);
          this.inProcess = false;
        }
      );
    } else {
      this.certificateService.certificateEmployerDeclaration(certificate, this.files).toPromise().then(
        () => {
          this.msjService.showInfo("El certificado fue declarado correctamente");
          this.profile.refreshMyActiveCertificatesForOu(null, CertificateType.Employer.toString()).toPromise();
          this.addFinish.emit(true);
          this.inProcess = false;
        },
        err => {
          this.msjService.showError(err);
          this.inProcess = false;
        }
      );
    }
  }

  private getOuIdForCertificate(): number {
    const provider = this.certificateProviders.find(x => x.id == this.certificateFormGroup.value.certificateType.id);
    if (provider.requiredOU) {
      return this.certificateFormGroup.value.organizationalUnit.id;
    } else {
      return null;
    }
  }

  onFilesChanged(changedReturn: any) {
    let files: File[] = changedReturn.files;
    this.certificateFormGroup.value.certificateFile = files;
    this.files = files;
    if (files == null || files.length === 0) {
      this.certificateFormGroup.get("certificateFileOk").setValue(null);
    } else {
      this.certificateFormGroup.get("certificateFileOk").setValue(true);
    }
    this.certificateFormGroup.controls['certificateFileOk'].updateValueAndValidity();

  }

  getProviders(ou: OrganizationalUnit) {
    this.showFile = false;
    this.showExpirationDate = false;
    this.certificateProviders = [];
    this.certificateFormGroup.controls.certificateType.setValue("");
    const parametersProviders: OuConfigSignatureTypeParametersDTO = {
      organizationalUnitId: ou.id,
      CertificateTypeId: this.certificateType,
      IsManualDeclaration: true
    };
    this.certificateService.getSignatureTypes(parametersProviders).toPromise().then(
      certificateProviders => {
        if (this.onlyMultipleSign) {
          this.certificateProviders = certificateProviders.filter(cp => cp.massiveSignatureAction !== null);
        } else {
          this.certificateProviders = certificateProviders;
        }
      },
      err => this.msjService.showError(err)
    );
  }

  cancel() {
    this.addFinish.emit(false);
  }

  validationProvider(provider: any) {
    this.showFile = provider.appCertificate && provider.manageAction == null;
    this.showExpirationDate = provider.askExpirationDate != false;

    this.certificateFormGroup.controls['expirationDate'].clearValidators();
    this.certificateFormGroup.controls['certificateFileOk'].clearValidators();
    this.certificateFormGroup.controls['fiscalIdentifier'].clearValidators();
    this.certificateFormGroup.controls['fiscalIdentifier'].setValue(null);
    this.certificateFormGroup.get("certificateFileOk").setValue(null);

    if (this.uploadFiles != null) {
      this.uploadFiles.files = [];
    }
    if (provider.askExpirationDate) {
      this.certificateFormGroup.controls['expirationDate'].setValidators([Validators.required]);
    }
    if (provider.requiresFiscalId && this.isEmployer()) {
      this.inProcess = true;
      this.certificateFormGroup.controls['fiscalIdentifier'].setValidators([Validators.required]);
    } else {
      this.inProcess = false;
    }
    if (this.showFile) {
      this.certificateFormGroup.controls['certificateFileOk'].setValidators([Validators.required]);
    }
    this.certificateFormGroup.controls['certificateFileOk'].updateValueAndValidity();
    this.certificateFormGroup.controls['expirationDate'].updateValueAndValidity();
    this.certificateFormGroup.controls['fiscalIdentifier'].updateValueAndValidity();
  }

  validateCuil() {
    this.inProcess = true;    
    //Si el pais de la empresa tiene mas de 1 mascara valido que la logitud coincida con las posibles del country
    let maskSplited = this.certificateFormGroup.value.organizationalUnit.country.fiscalIdMask.split('||');
    if (maskSplited.length > 1) {
      let isValid = maskSplited.some(mask => 
        this.certificateFormGroup.value.fiscalIdentifier.length === this.maskLength(mask)
      );

      if (!isValid) {
        return;
      }
    }
    //Si el pais tiene una sola mascara debe de salir por aca
    else { 
      if (this.certificateFormGroup.value.fiscalIdentifier.length != this.maskLength(this.certificateFormGroup.value.organizationalUnit.country.fiscalIdMask)) {
        return;
      }
    }
    this.personService.validateFiscalId(this.certificateFormGroup.value.fiscalIdentifier, this.certificateFormGroup.value.organizationalUnit).toPromise().then(
      (isValidFiscalId) => {
        if (isValidFiscalId) {
          this.inProcess = false;
        } else {
          this.msjService.showError("INTE021");
        }
      }, err => {
        this.msjService.showError(err);
      });
  }

  maskLength(mask: string): number {
    const rgx = new RegExp("[^a-zA-Z0-9 *]");
    return mask.replace(new RegExp(rgx, 'g'), '').length;
  }
}
