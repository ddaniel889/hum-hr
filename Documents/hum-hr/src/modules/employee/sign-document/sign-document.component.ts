import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
  Output,
  EventEmitter
} from "@angular/core";
import { Certificate, EmployeeProcess } from "../../shared/models";
import { ProfileService } from "../../shared/services/profile.service";
import { MessageService } from "../../shared/errorHandler/message.service";
import { MatStepper } from "@angular/material/stepper";
import { EmployeeProcessService } from "../../shared/services/employee-process.service";
import { OrganizationalUnitService } from "../../shared/services/organizational-unit.service";
import { CertificateType } from "../../shared/models/certificate.model";

@Component({
  selector: "app-sign-document",
  templateUrl: "./sign-document.component.html",
  styles: []
})
export class SignDocumentComponent implements OnInit, OnChanges {
  @Input() employeeProcess: EmployeeProcess;
  @Output() signingChanged = new EventEmitter<boolean>();
  @Output() signingFinish = new EventEmitter<boolean>();
  @ViewChild("stepper") stepper: MatStepper;

  signing = false;
  signable = false;
  showMotiveDisagreement = false;
  disagreementSelected = false;
  certificates: Certificate[] = [];
  selectedCertificate: Certificate;
  selectedMotive: string;
  password: string;
  motiveDisagreement: string;
  loading = false;
  processState: string;

  constructor(
    private profileService: ProfileService,
    private msjService: MessageService,
    private employeeProcessService: EmployeeProcessService,
    private organizationalUnitService: OrganizationalUnitService
  ) { }

  ngOnInit() { }

  ngOnChanges(changes: SimpleChanges): void {
    this.signing = false;
    this.signingChanged.emit(this.signing);
    if (this.stepper && this.stepper.selectedIndex > 0) {
      this.stepper.selectedIndex = 0;
    }

    if (this.employeeProcess) {
      this.signable = this.employeeProcess.isSignable;

      this.motiveDisagreement = this.employeeProcess.motiveDisagreement;
      if (this.employeeProcess.motiveDisagreement) {
        let md: string;
        switch (this.employeeProcess.motiveDisagreement) {
          case "EL":
            md = "Error de liquidación";
            break;
          case "EDP":
            md = "Error de datos personales";
            break;
          case "ECL":
            md = "Error de condición laboral";
            break;
          case "O":
            md = "Otros";
            break;
          default:
            md = this.employeeProcess.motiveDisagreement;
            break;
        }

        this.motiveDisagreement = md;
      }

      if (this.signable) {
        this.profileService
          .getMySignCertificates(this.employeeProcess.organizationalUnitId)
          .then(
            certificates => {
              this.certificates = certificates.filter(
                f =>
                  f.typeId === CertificateType.Employee &&
                  f.singleSignatureAction
              );
              if (this.certificates.length === 0) {
                this.msjService.showInfo(
                  "Para firmar tus documentos necesitás un certificado digital."
                );
              }

              if (this.certificates.length === 1) {
                this.selectedCertificate = this.certificates[0];
                this.stepper.selectedIndex = 1;
              }
            },
            err => this.msjService.showError(err)
          );

        this.organizationalUnitService
          .getOuConfig(
            [
              `#OuConfigRA${this.employeeProcess.typeValue}`,
              "#OuConfigSectionPaychecks"
            ],
            this.employeeProcess.organizationalUnitId
          )
          .then(
            confi =>
              (this.showMotiveDisagreement = confi
                ? confi.showMotiveDisagreement
                : false),
            err => this.msjService.showError(err)
          );
      }
    }
  }

  sign(estrec: string) {
    this.processState = estrec;

    if (this.selectedCertificate.requirePassword) {
      // this.stepper.selectedIndex = 3; // Go to password step
      this.stepper.next(); // Go to password step
    } else {
      this.onSigning();
    }
  }

  setDisagreement() {
    this.disagreementSelected = true;
    if (this.showMotiveDisagreement) {
      this.stepper.selectedIndex = 2; // Go to disagreement
    } else {
      this.sign("NC");
    }
  }

  onSigning() {
    this.employeeProcess.setMetadata("_estrec", this.processState);

    this.loading = true;
    this.employeeProcess.setMetadata("_motivodisc", this.selectedMotive);

    if (this.selectedCertificate.requirePassword) {
      this.employeeProcess.setMetadata("_cpassword", this.password);
    }

    this.employeeProcess.setMetadata(
      "_idCertificado",
      this.selectedCertificate.id.toString()
    );

    // TODO: Definir si conviene usar el ProviderID (Encode = 1, Nacion = 2)
    switch (this.selectedCertificate.singleSignatureAction) {
      case "signNacion":
        this.employeeProcessService
          .signNacion(
            this.employeeProcess,
            `${location.origin}/#/employee/home/welcome/SignPending`
          )
          .toPromise()
          .then(
            response => {
              this.signingChanged.emit(this.signing);
              window.location.href = response.value;
            },
            err => {
              this.employeeProcess.setMetadata("_estrec", null);
              this.msjService.showError(err);
            }
          );
        break;
      case "signEncode":
        this.employeeProcessService.sign(this.employeeProcess).then(
          () => {
            this.password = null;
            this.signing = false;
            this.signingChanged.emit(this.signing);
            this.signingFinish.emit();
            this.signable = false;
            this.loading = false;
            this.msjService.showInfo("Firmado con éxito");
            this.employeeProcessService.refreshMyProcess().toPromise();
          },
          err => {
            this.loading = false;
            this.employeeProcess.setMetadata("_estrec", null);
            this.msjService.showError(err);
          }
        );
        break;
      default:
        this.msjService.showError("UnsupportedSignMethod");
        this.loading = false;
        this.employeeProcess.setMetadata("_estrec", null);
        break;
    }
  }

  revertMotive() {
    this.disagreementSelected = false;
    this.selectedMotive = null;
    this.stepper.previous();
  }
}
