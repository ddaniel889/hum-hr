import { Component, OnInit, EventEmitter, Output, Input, ViewChild } from "@angular/core";
import { UntypedFormBuilder, UntypedFormGroup, Validators, UntypedFormControl } from "@angular/forms";
import { MessageService } from "../errorHandler/message.service";
import { CertificateService } from "../services/certificate.service";
import { CertificateProvider } from "../models/certificate-provider.model";
import { Certificate, CertificateType } from "../models/certificate.model";
import { CertificatePost } from '../models/certificatePost.model';
import { AuthService } from "../auth/auth.service";
import { OrganizationalUnitService } from "../services/organizational-unit.service";
import { UploadFormComponent } from "../file-dnd/file-dnd.component";
import { OrganizationalUnit } from "../models";


@Component({
  selector: "app-certificate-renew",
  templateUrl: "./certificate-renew.component.html",
  styles: []
})
export class CertificateRenewComponent implements OnInit {
  constructor(
    private _formBuilder: UntypedFormBuilder,
    private msjService: MessageService,
    private organizationalUnitService: OrganizationalUnitService,
    private authService: AuthService,
    private certificateService: CertificateService
  ) {

    this.certificateFormGroup = this._formBuilder.group({
      selectedCertificate: ["", Validators.required]
    });

  }

  @ViewChild(UploadFormComponent) uploadFiles: UploadFormComponent;
  @Input() documentIds: number[];
  @Input() certificateType: CertificateType;
  @Output() addExpFinish = new EventEmitter<boolean>();
  showExpirationDate = false;
  showFile = false;
  selectedCertificateType: CertificateProvider;
  organizationalUnits: OrganizationalUnit[];
  expiredCertificate: Certificate[];
  certificateProviders: any[];
  certificateFormGroup: UntypedFormGroup;
  selectedCertificate: UntypedFormControl;
  files: File[];
  isSave = false;
  useRenewCertificate = false;
  isExpiredCertificate = false;
  ouId = 0;
  urlBase = location.origin;

  ngOnInit() {
    this.organizationalUnitService.getTreeInMemory().then(
      result => {
        this.organizationalUnits = result.filter(o => o.isRoot === false);
      },
      err => this.msjService.showError(err)
    );

    this.authService.getAccess().toPromise().then(
      usersOus => {
        const currentUserId = localStorage.getItem("userId");

        for (const userOu of usersOus) {
          if (currentUserId == userOu.userId) {
            this.ouId = userOu.organizationalUnit.id;
            this.useRenewCertificate = userOu.organizationalUnit.useRenewCertificate;

            this.certificateService.getMyExpiredCertificates(this.ouId.toString(),CertificateType.Employee).toPromise()
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
  }

  seletedCertificate(){
    this.isSave = true;
  }

  save() {
    const { selectedCertificate } = this.certificateFormGroup.value;
    const currentId = localStorage.getItem("userId");
     const certificate: CertificatePost = {
      Enabled: true,
      ExpirationDate: (this.showExpirationDate) ? this.certificateFormGroup.value.expirationDate : null,
      ProviderId: selectedCertificate.providerId,
      ProviderName: selectedCertificate.provider,
      OrganizationalUnitId:this.ouId,
      UserId: Number(currentId),
      Type: CertificateType.Employee,
      DocumentIds: this.documentIds,
      isAutoDeclarated: false
    };

    this.certificateService
      .renewExpiredCertificates(this.urlBase,certificate, null)
      .subscribe(
        () => {
          this.msjService.showInfo("El certificado fue renovado correctamente");
          this.addExpFinish.emit(true);
        },
        err => this.msjService.showError(err)
      );
  }

  cancel() {
    this.addExpFinish.emit(false);
  }
}
