import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from "@angular/core";
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatStepper } from '@angular/material/stepper';
import { timeout } from "rxjs/internal/operators/timeout";
import { MessageService } from "../errorHandler/message.service";
import { Certificate } from "../models";
import { CertificateType } from "../models/certificate.model";
import { FileDocument } from "../models/file-document.model";
import { FileDocumentService } from "../services/file-document.service";
import { OrganizationalUnitService } from "../services/organizational-unit.service";
import { ProfileService } from "../services/profile.service";
import { DocumentationTypesService } from '../services/documentation-types.service';
import { CertificateService } from "../services/certificate.service";
import { TokenCertificateParameters } from "../models/tokenCertificateParameters.model";
import { CertificatePost } from "../models/certificatePost.model";
import { AuthService } from "../auth/auth.service";
import { Providers } from "../models/certificate-provider.model";
import { SignBatchService } from "../services/sign-batch.service";
import { HelpStepper } from '../models/helpStepper.model';
import { SignBatch } from '../models/Employee/sign-batch.model';
import { MessageAtributtes, MessageType } from '../models/message-types.model';
import { GenericBottomSheetComponent } from '../generic-bottom-sheet/generic-bottom-sheet.component';
import { UiNotificationsService } from '../services/ui-notifications.service';
import { UINotificationDTO } from '../models/ui-notifications.model';
import { PersonService } from '../services/person.service';
import { AppConfig } from "src/app/app.config";

@Component({
  selector: "app-file-document-sign",
  templateUrl: "./file-document-sign.component.html",
  styles: []
})
export class FileDocumentSignComponent implements OnInit, OnChanges {
  @Input() showMotiveDisagreement = false;
  @Input() organizationalUnitId: number;
  @Input() documentationTypeId: number;
  @Input() creationDate: Date;
  @Input() doc: FileDocument;
  @Input() docs: FileDocument[];
  @Input() employerSign: false;
  @Input() filterDocumentationTypes = [];
  @Output() signingChanged = new EventEmitter<boolean>();
  @Output() signingStart = new EventEmitter<boolean>();
  @Output() signingFinish = new EventEmitter<any>();
  @Output() signingTokenFinish = new EventEmitter<boolean>();
  @ViewChild("stepper") stepper: MatStepper;
  signing = false;
  disagreementSelected = false;
  certificates: Certificate[] = [];
  selectedCertificate: Certificate;
  password: string;
  loading = false;
  showViewed = false;
  showSigned = false;
  signatureResult: string;
  disagreementMotives: any[];
  urlBase = location.origin;
  providersEnum = Providers;
  providers: any;
  fechaVencimiento: Date;
  minDate = new Date();
  providerSelected: any;
  batchDescription: string;
  helpStepperModel: HelpStepper[];
  certificateHasErrors = true;
  husignerDownloadUrl = AppConfig.settings.custom.husignerDownloadUrl;
  signLoading = false;
  isSigner = false;
  isCertificateDeclarationOpen = false;
  someCertificates: boolean;
  loginAutomatico = false;
  haveExpiredCertif = false;
  useRenewCertificate = false;
  ouId = 0;

  showHelpHint = false;
  private readonly timeOutSigningToken = 1000000000;
  private readonly CertificateSelectonStep = 0;
  private readonly ConformitySelectionStep = 1;
  private readonly NonConformityReasonSelectionStep = 2;
  private readonly PasswordStep = 3;
  private readonly ManageCertificateStep = 4;
  private readonly addExpirationDateStep = 5;
  private readonly batchHelpNonUsedStep = 6;
  private readonly setBatchPropertiesStep = 7;
  private readonly processingStep = 8;

  constructor(
    private profileService: ProfileService,
    private msjService: MessageService,
    private fileDocumentService: FileDocumentService,
    private organizationalUnitService: OrganizationalUnitService,
    private documentationTypeService: DocumentationTypesService,
    private certificateServices: CertificateService,
    private authService: AuthService,
    private signBatchService: SignBatchService,
    private _bottomSheet: MatBottomSheet,
    private uiNotifSvc: UiNotificationsService,
    private personService: PersonService,
    private ref: ChangeDetectorRef,

  ) { }

  ngOnInit() {
    this.isSigner = this.authService.isInRole('FIRMANTE');
    if (this.doc) {
      this.showHelpHint = false;
      this.loading = true;
      this.documentationTypeService.getById(this.doc.documentationTypeId).toPromise()
        .then(
          dt => {
            if (dt != null) {
              this.doc.documentationTypeSelected = dt;
              this.documentationTypeService.getDocumentType(this.doc.documentationTypeSelected.documentTypeId).toPromise()
                .then(
                  res => {
                    if (res != null) {
                      const foundMetadata = res.metadata.filter(m => m.metadataId === dt.nonConformityReasonId);

                      if (foundMetadata.length > 0) {
                        this.showMotiveDisagreement = true;
                        this.doc.disagrementMotive.systemName = foundMetadata[0].metadataSystemName;
                        this.doc.disagrementMotive.metadataValueDescription = foundMetadata[0].legSystemName;
                        this.doc.disagrementMotive.metadataLabel = foundMetadata[0].metadataLabel;
                        this.doc.disagrementMotive.metadataId = foundMetadata[0].metadataId;
                        this.disagreementMotives = JSON.parse(foundMetadata[0].optionValues.toString());
                      }
                    }
                  },
                  err => {
                    this.loading = false;
                    this.msjService.showError(err);
                  }
                );
            }
          },
          err => {
            this.loading = false;
            this.msjService.showError(err);
            this.signingFinish.emit(false);
          }
        )
        .then(() => this.loading = false);
    }
    this.certificateServices.getSignatureTypesByOuId(this.organizationalUnitId).toPromise().then(
      res => {
        if (res.some(x => x.certificateProviderId == 7 && x.hasIntegratedHusigner)) {
          this.loginAutomatico = true
        }
      },
      err => {
        this.loading = false;
        this.msjService.showError(err);
      }
    );

    this.authService.getAccess().toPromise().then(
      usersOus => {
        const currentUserId = localStorage.getItem("userId");

        for (const userOu of usersOus) {
          if (currentUserId == userOu.userId) {
            this.ouId = userOu.organizationalUnit.id;
            this.useRenewCertificate = userOu.organizationalUnit.useRenewCertificate;
          }
        }
      },
      err => this.msjService.showError(err)
    );
  }

  setSign() {
    this.signLoading = true;
    this.signing = true;
    this.signingChanged.emit(true);
    // Fuerzo la deteccion de cambios para que se oculte mientras estoy reconstruyendo el modelo
    this.ref.detectChanges();
    // Si no tiene certificados mando notificacion
    if (this.certificates.length === 0 && !this.certificateHasErrors) {
      this.personService.getMyContainer().toPromise().then(myContainerResult => {
        const entity = {
          firstName: this.doc.employeeFirstName,
          lastName: this.doc.employeeLastName,
          personId: myContainerResult.id,
          ouIdPerson: myContainerResult.organizationalUnitId
        };

        const notif: UINotificationDTO = {
          code: 'PNC',
          entity: JSON.stringify(entity)
        };

        this.uiNotifSvc.create(notif).toPromise();
      });
    }
    this.signLoading = false;
  }

  openDeclareCertificate() {
    this.isCertificateDeclarationOpen = true;
  }

  closeAdd(isSingSet: boolean) {
    this.isCertificateDeclarationOpen = false;
    if (isSingSet) {
      this.getMySignCertificates(true);
    }
  }

  certificateType(): CertificateType {
    return CertificateType.Employer;
  }

  onlyMultiple(): boolean {
    return !((this.docs && this.docs.length == 1) || this.doc);
  }


  setCertificate() {
    this.certificateServices.getCertificateProviders(null, null).toPromise().then(
      results => {
        this.providers = results;
        this.providerSelected = this.providers.find(t => t.id == this.selectedCertificate.providerId);
        if (this.selectedCertificate.isPending) {
          if (this.providerSelected.manageAction == 'verifyLoginPassword' || this.providerSelected.manageAction == 'createCertificatePassword') {
            this.stepper.selectedIndex = this.ManageCertificateStep;
            // Llamar al metodo de manage
            this.profileService.manageCertificateCardinal(
              `${this.urlBase}`,
              this.selectedCertificate).toPromise();
            return;
          }
          if (this.providerSelected.manageAction == 'addExpirationDate') {
            this.stepper.selectedIndex = this.addExpirationDateStep;
            return;
          }
        }
        if (this.providerSelected.massiveSignatureAction == 'multiplesignTokenHumanage') {
          if (!this.selectedCertificate.lastUseDate) {
            this.helpStepperModel = [{
              title: 'Firmando con Husigner por primera vez',
              description: 'Para poder firmar vas a necesitar:',
              image: '',
              itemListDescription: [
                `<b>Husigner instalado</b> en la computadora donde estás trabajando.<br><a href="${this.husignerDownloadUrl}" target="_blank">click Aquí si nunca has instalado el firmador</a>`,
                'El <b>token</b> que contiene el certificado de firma.',
                'La <b>clave</b> del certificado.'
              ]
            },
            {
              title: 'Firmando con Husigner por primera vez',
              description: 'Los próximos pasos son:',
              image: '',
              itemListDescription: [
                '<b>Conformar un lote</b> de documentos a firmar <b>identificándolo con un nombre.</b>',
                '<b>Ingresar e iniciar sesión en Husigner</b>, buscar el lote, colocar la clave del certificado y <b>firmar.</b>',
                '<b>Y listo!</b><br><b class="tip-text">El estado del avance se irá actualizando en Humanage.</b>'
              ]
            }
            ];
            this.stepper.selectedIndex = this.batchHelpNonUsedStep;
            return;
          }
          this.stepper.selectedIndex = this.setBatchPropertiesStep;
          return;
        }

        this.checkDocumentationConformity();

      },
      err => {
        this.loading = false;
        this.msjService.showError(err);
        if (err && err.code === "invalid_grant") {
          this.signingFinish.emit(true);
        }
      }
    );
  }

  setAgreement() {
    this.sign('C');
  }

  setDisagreement() {
    this.disagreementSelected = true;
    if (this.showMotiveDisagreement) {
      this.stepper.selectedIndex = this.NonConformityReasonSelectionStep; // Go to disagreement
    } else {
      this.sign("NC");
    }
  }

  setDisagreementMotive() {
    this.sign("NC");
  }

  revertAgreement() {
    this.stepper.reset();
    // this.stepper.selectedIndex = 1;
  }

  revertDisagreement() {
    if (this.employerSign) {
      this.stepper.selectedIndex = 0;
    } else {
      if (this.showMotiveDisagreement && this.signatureResult == 'NC') {
        // this.stepper.selectedIndex = 2;
        this.stepper.reset();
      } else {
        this.disagreementSelected = false;
        // this.stepper.selectedIndex = 1;
        this.stepper.reset();
      }
    }
  }

  revertMotive() {
    this.disagreementSelected = false;
    this.doc.disagrementMotive.metadataValue = "";
    // this.stepper.selectedIndex = 1;
    this.stepper.reset();
  }

  revertBatch() {
    this.stepper.reset();
  }

  sign(estado: string) {
    this.signatureResult = estado;

    if (!this.selectedCertificate.requirePassword) {
      this.onSigning();
    } else {
      this.stepper.selectedIndex = this.PasswordStep; // Go to password step
    }
  }

  onSigning() {
    this.loading = true;
    if (this.employerSign) {
      this.onSigningEmployer();
    } else {
      this.onSigningEmployee();      
    }
  }

  onSigningEmployee() {
    switch (this.selectedCertificate.singleSignatureAction) {
      case "signNacion":
        this.fileDocumentService
          .signNacion(
            this.doc,
            this.selectedCertificate,
            this.signatureResult,
            `${location.origin}/#/employee/home-file-documents/SignPending`
          )
          .toPromise()
          .then(
            response => {
              // this.signing = false;
              this.signingChanged.emit(this.signing);
              // this.loading = false;
              window.location.href = response;
            },
            err => {              
              this.msjService.showError(err);
              this.loading = false;
            }
          );
        break;
      case "signEncode":
        this.fileDocumentService
          .signDocument(
            this.doc,
            this.selectedCertificate,
            this.password,
            this.signatureResult
          )
          .toPromise()
          .then(
            () => {
              this.password = null;
              this.signing = false;
              this.signingChanged.emit(this.signing);
              this.signingFinish.emit(true);
              this.loading = false;
              this.msjService.showInfo("Firmado con éxito");
            },
            err => {
              this.loading = false;
              this.msjService.showError(err);
            }
          );
        break;
      case "signValidateId":
        this.fileDocumentService
          .signValidatedId(
            this.doc,
            this.selectedCertificate,
            this.password,
            this.signatureResult,
            false
          )
          .toPromise()
          .then(
            () => {
              this.password = null;
              this.signing = false;
              this.signingChanged.emit(this.signing);
              this.signingFinish.emit(true);
              this.loading = false;
              const parameters = {
                bodyText: 'Firma Electrónica Avanzada',
                infoText: 'Te enviamos un mail para continuar el proceso de firma',
                type: MessageType.Info
              } as MessageAtributtes;

              const t = this._bottomSheet.open(GenericBottomSheetComponent, { data: parameters, disableClose: true });
              t.instance.close.subscribe((response: boolean) => {
              });
            },
            err => {
              this.loading = false;
              this.msjService.showError(err);
            }
          );
        break;
      default:
        this.msjService.showError("UnsupportedSignMethod");
        this.loading = false;
        break;
    }
  }

  async onSigningEmployer() {
    this.isSigner = this.authService.isInRole('FIRMANTE');
    this.signingStart.emit(true);
    switch (this.selectedCertificate.massiveSignatureAction ?? this.selectedCertificate.singleSignatureAction) {
      case "multipleSignLakaut":
        this.signMassiveToken();
        break;
      case "multipleSignEncode":
        if (!this.docs || this.docs.length < 1) {
          const param = {
            organizationalUnitId: this.organizationalUnitId,
            documentationTypeId: this.documentationTypeId,
            creationDate: this.creationDate
          };

          await this.fileDocumentService.getFileDocumentsGroupSignPending(param)
            .then(data => this.docs = data,
              err => {
                this.loading = false;
                if (err && err.code === "403") {
                  err.description = "El proceso de firma que estaba en curso se ha interrumpido, Inicie la firma nuevamente.";
                }

                this.msjService.showError(err);
                if (err && (err.code === "invalid_grant" || err.code === "403")) {
                  this.signingFinish.emit(true);
                }
              });
        }

        this.uiNotifSvc.refreshNotifiationProcess(false, false, true);
        this.fileDocumentService
          .createMultiplesignDocument(
            this.docs,
            this.selectedCertificate,
            this.password,
            null
          )
          .toPromise()
          .then(
            data => {
              if (this.providerSelected.appCertificate) {
                this.stepper.selectedIndex = this.processingStep;
              }

              this.fileDocumentService
                .multiplesignDocument(data).toPromise()
                .then(() => {
                  this.password = null;
                  this.signing = false;
                  this.signingChanged.emit(this.signing);
                  this.signingFinish.emit(true);
                  this.loading = false;
                  this.uiNotifSvc.refreshNotifiationProcess();
                })
                .catch(err => {
                  this.loading = false;
                  if (err && err.code === "403") {
                    err.description = "El proceso de firma que estaba en curso se ha interrumpido, Inicie la firma nuevamente.";
                  }
                  this.msjService.showError(err);
                  if (err && (err.code === "invalid_grant" || err.code === "403")) {
                    this.signingFinish.emit(true);
                  }
                  this.signingStart.emit(false);
                  if (err && err.code === "AUTHC004") {
                    this.stepper.selectedIndex = this.PasswordStep;
                  } else {
                    this.signingFinish.emit(true);
                  }
                });
            },
            err => {
              this.loading = false;
              if (err && err.code === "403") {
                err.description = "El proceso de firma que estaba en curso se ha interrumpido, Inicie la firma nuevamente.";
              }
              this.msjService.showError(err);
              if (err && (err.code === "invalid_grant" || err.code === "403")) {
                this.signingFinish.emit(true);
              }
              this.signingStart.emit(false);
            }
          );
        break;
      case "signValidateId":
        this.fileDocumentService
          .signValidatedId(
            this.docs[0],
            this.selectedCertificate,
            this.password,
            this.signatureResult,
            this.isSigner
          )
          .toPromise()
          .then(
            () => {
              this.password = null;
              this.signing = false;
              this.signingChanged.emit(this.signing);
              this.signingFinish.emit(true);
              this.loading = false;
              const parameters = {
                bodyText: 'Firma Electrónica Avanzada',
                infoText: 'Te enviamos un mail para continuar el proceso de firma',
                type: MessageType.Info
              } as MessageAtributtes;

              const t = this._bottomSheet.open(GenericBottomSheetComponent, { data: parameters, disableClose: true });
              t.instance.close.subscribe((response: boolean) => {
              });
            },
            err => {
              this.loading = false;
              this.msjService.showError(err);
              this.signingStart.emit(false);
            }
          );
        break;
      default:
        this.msjService.showError("UnsupportedSignMethod");
        this.loading = false;
        break;
    }
  }

  async createBatch(isSigning) {
    if (this.selectedCertificate.massiveSignatureAction == "multiplesignTokenHumanage") {
      this.loading = true;
      let description = this.batchDescription;
      if (!this.docs || this.docs.length < 1) {
        const param = {
          organizationalUnitId: this.organizationalUnitId,
          documentationTypeId: this.documentationTypeId,
          creationDate: this.creationDate
        };

        await this.fileDocumentService.getFileDocumentsGroupSignPending(param)
          .then(data => this.docs = data,
            err => {
              this.loading = false;
              this.msjService.showError(err);
              if (err && err.code === "invalid_grant") {
                this.signingFinish.emit(true);
              }
            });
      }

      if (!description) {
        description = this.documentationTypeId ? this.docs[0].documentationTypeName + " " + new Date(this.docs[0].fileCreationDate).toLocaleDateString() : "Lote: " + this.organizationalUnitService.getCurrentOrChildOU().name;
      }

      await this.signBatchService.createSignBatch(this.docs, this.organizationalUnitId, description
      ).toPromise()
        .then(
          data => {
            this.loading = false;
            this.signing = false;
            this.signingChanged.emit(this.signing);
            this.signingFinish.emit({
              value: true,
              sendToSign: false
            });

            if (isSigning) {
              this.authService.createHuToken().then(
                token => {
                  const base64Param = btoa(token)
                  window.open(`husigner://${base64Param}`, '_blank');
                }
              )
            }
            else
              this.helpBatchSign(data);
          },
          err => {
            this.loading = false;
            this.msjService.showError(err);
            if (err && err.code === "invalid_grant") {
              this.signingFinish.emit(true);
            }
          }
        );
    }
  }

  private signMassiveToken() {
    this.loading = true;
    this.organizationalUnitService.getLawerRolId(this.organizationalUnitId).toPromise().then(
      async rolId => {
        // Meter aca una llamada a API que traiga los docs.
        if (!this.docs || this.docs.length < 1) {
          const param = {
            organizationalUnitId: this.organizationalUnitId,
            documentationTypeId: this.documentationTypeId,
            creationDate: this.creationDate,
            roleId: rolId
          };

          await this.fileDocumentService.getFileDocumentsGroupSignPending(param)
            .then(data => this.docs = data,
              err => {
                this.loading = false;
                this.msjService.showError(err);
                if (err && err.code === "invalid_grant") {
                  this.signingFinish.emit(true);
                }
              }
            );
        }

        this.fileDocumentService.shareDocumentBulk(this.docs, rolId).toPromise()
          .then(
            async data => {
              const parameters = {
                organizationalUnitId: this.organizationalUnitId,
                CertificateTypeId: CertificateType.Employer,
                certificateProviderId: Providers.Token
              };

              const tokenParams = new TokenCertificateParameters();

              await this.certificateServices.getSignatureTypes(parameters).toPromise()
                .then(
                  async r => {
                    if (r.length > 0 && r[0].ouConfigSignaturePorts && r[0].ouConfigSignaturePorts.httpsFrom > 0) {
                      tokenParams.httpFrom = r[0].ouConfigSignaturePorts.httpsFrom;
                      tokenParams.httpsTo = r[0].ouConfigSignaturePorts.httpsTo;
                      tokenParams.httpTo = r[0].ouConfigSignaturePorts.httpTo;
                      tokenParams.httpFrom = r[0].ouConfigSignaturePorts.httpFrom;
                    }

                    let ejecutado = false;
                    for (
                      let port = tokenParams.httpsFrom;
                      port < tokenParams.httpsTo && !ejecutado;
                      port++
                    ) {
                      await this.fileDocumentService.pingToken("https", port).toPromise()
                        .then(
                          () => {
                            ejecutado = this.callSignAppToken(
                              "https",
                              port,
                              data,
                              this.docs,
                              rolId,
                              this.selectedCertificate.id,
                              this.selectedCertificate.typeId
                            );
                          },
                          err => { }
                        );
                    }
                    if (!ejecutado) {
                      for (let port = tokenParams.httpFrom; port < tokenParams.httpTo && !ejecutado; port++) {
                        await this.fileDocumentService.pingToken("http", port).toPromise()
                          .then(
                            () => {
                              ejecutado = this.callSignAppToken(
                                "http",
                                port,
                                data,
                                this.docs,
                                rolId,
                                this.selectedCertificate.id,
                                this.selectedCertificate.typeId
                              );
                            },
                            err => { }
                          );
                      }
                    }

                    if (!ejecutado) {
                      this.loading = false;
                      this.msjService.showInfo("Verifique que la aplicación de Token este configurada como servicio.");
                    } else {
                      this.signingChanged.emit(this.signing);
                      this.signingFinish.emit(false);
                    }
                  },
                  err => {
                    this.msjService.showError(err);
                    this.loading = false;
                    this.signingFinish.emit(true);
                  }
                );

            },
            err => {
              this.loading = false;
              this.msjService.showError(err);
              if (err && err.code === "invalid_grant") {
                this.signingFinish.emit(true);
              }
            }
          );
      },
      err => {
        this.loading = false;
        this.msjService.showError(err);
        if (err && err.code === "invalid_grant") {
          this.signingFinish.emit(true);
        }
      }
    );
    this.loading = false;
    this.signingFinish.emit(false);
  }

  private callSignAppToken(
    protocol: string,
    port: number,
    data: string[],
    docs: FileDocument[],
    rolId: string,
    certificateId: Number,
    certificateTypeId: number
  ) {
    const res = true;
    this.fileDocumentService
      .callAppToken(protocol, port, data)
      .pipe(timeout(this.timeOutSigningToken))
      .toPromise()
      .then(
        response => {
          if (response.data === "An unknown error happen during the process") {
            this.msjService.showInfo(
              "Error en el proceso de firma de Token. Verifique la configuración del mismo."
            );
          } else if (response.data === "No cert selected") {
            this.msjService.showInfo(
              "No seleccionó ningún certificado válido."
            );
          }
        })
      // Temporary solution for token signature mid failure.
      .catch()
      .then(() => {
        this.fileDocumentService
          .signToken(docs, rolId, certificateId, certificateTypeId)
          .toPromise()
          .then(
            () => {
              this.signingTokenFinish.emit(true);
              this.signingFinish.emit(true);
              this.loading = false;
            },
            err => {
              this.loading = false;
              this.signingFinish.emit(true);
              this.msjService.showError(err);
            }
          );
      });
    return res;
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.signing = false;
    this.signingChanged.emit(this.signing);

    if (this.doc && !this.doc.documentationTypeSelected) {
      this.ngOnInit();
    }
    this.getMySignCertificates()
    this.haveExpiredCertificate()
  }

  private getMySignCertificates(forceSearch: boolean = false) {
    this.profileService.getMySignCertificates(this.organizationalUnitId, forceSearch).then(
      certificates => {
        this.haveCertificates(certificates);
        if (this.employerSign) {
          if (this.docs && this.docs.length == 1) {
            this.certificates = certificates.filter(
              f =>
                f.typeId === CertificateType.Employer && f.enabled
            );
          } else {
            this.certificates = certificates.filter(
              f =>
                f.typeId === CertificateType.Employer && f.massiveSignatureAction && f.enabled
            );
          }
        } else {
          this.certificates = certificates.filter(
            f =>
              f.typeId === CertificateType.Employee && f.singleSignatureAction && f.enabled
          );
        }
        if (this.certificates.length === 1) {
          this.selectedCertificate = this.certificates[0];
        }
        this.stepper.reset();
        this.certificateHasErrors = false;
      },
      err => this.msjService.showError(err)
    );
  }


  forgotPassword() {
    const dto: CertificatePost = {
      Type: Number(this.selectedCertificate.typeId),
      ProviderId: Number(this.selectedCertificate.providerId),
      Enabled: true,
      UserId: Number(this.authService.getUserId()),
      OrganizationalUnitId: this.organizationalUnitId,
      RevocationPin: null,
      isAutoDeclarated: false,
      url: this.urlBase
    };

    this.msjService
      .showOkCancel('¿Olvidaste tu clave? Podemos generar un nuevo certificado.', 'Si', 'No')
      .subscribe(result => {
        if (result == true) {
          this.loading = true;
          this.certificateServices.forgotPassword(dto).toPromise().then(
            () => {
              this.loading = false;
              this.msjService.showInfo('Operación Exitosa. Se envió a su cuenta de correo un mensaje indicando los pasos a seguir para reestablecer la contraseña de su certificado.');
              this.signing = false;
              this.signingChanged.emit(this.signing);
              this.signingFinish.emit(true);
            },
            err => {
              this.loading = false;
              this.msjService.showError(err);
            }
          );
        }
      });
  }

  setExpirationDate() {
    this.selectedCertificate.expirationDate = this.fechaVencimiento;
    this.profileService.manageCertificateCardinal(
      `${this.urlBase}`,
      this.selectedCertificate).toPromise().then(
        () => {
          this.selectedCertificate.isPending = false;
          this.checkDocumentationConformity();
        },
        err => this.msjService.showError(err)
      );

  }

  checkDocumentationConformity() {
    if (this.doc && this.doc.documentationTypeSelected.isNonConformityAllowed && this.selectedCertificate.supportDisagreement) {
      this.stepper.selectedIndex = this.ConformitySelectionStep;
    } else {
      this.sign('C');
    }
  }

  helpBatchSign(signBatch: SignBatch) {
    const helpModel = [{
      title: 'Ayuda para firmar con Husigner',
      description: 'Husigner te permitirá firmar tus documentos con tu certificado digital.',
      children: [
        {
          title: '¿Cómo obtener la aplicación?',
          description: 'Paso a paso para instalar Husigner en tu computadora:<br>',
          itemListDescription: [
            `<b>Descargá</b>  <a href="${this.husignerDownloadUrl}" target="_blank">desde Aquí</a> el instalador de Husigner.`,
            '<b>Ejecutá</b> el instalador descargado: <b>huSignerInstaller</b>.',
            'Finalizada la instalación dispondrás de <b>Husigner</b> en tu computadora, ya sea en el <b>Escritorio</b> o en el <b>Menú de Inicio</b>.'

          ],
          image: '<img class="husigner-icon" src="../../../../assets/img/Hu_Signer.png"/>',
          children: []
        },
        {
          title: '¿Cómo acceder al firmador?',
          description: 'Ingresá a Husigner para firmar tus documentos<br>',
          itemListDescription: [
            '<b>Ubicá Husigner</b> en tu ordenador, ya sea en el <b>Escritorio</b> o en el <b>Menú de Inicio</b>.',
            'Abrí la aplicación, iniciá <b>Husigner</b> e ingresá tu <b>usuario</b> y <b>clave</b> de <b>Humanage</b> para acceder.'
          ],
          image: '<img class="husigner-icon" src="../../../../assets/img/Hu_Signer.png"/>',
          children: []
        }
      ]
    }];

    const parameters = {
      bodyText: 'Lote enviado correctamente',
      infoText: `Ya está disponible el lote ${signBatch.description} con ${signBatch.documentsCount} documento(s) para firmar en Husigner.`,
      type: MessageType.HelpIndex,
      helpModel: helpModel
    } as MessageAtributtes;

    const t = this._bottomSheet.open(GenericBottomSheetComponent, { data: parameters, disableClose: true });

  }

  finishHelp() {
    this.stepper.next();
  }
  close() {
    this.signingFinish.emit(true);
  }

  haveCertificates(certificates: Certificate[]) {
    this.someCertificates = certificates.length > 0;
  }

  haveExpiredCertificate() {
    this.profileService.haveExpiredCertificates(this.organizationalUnitId).subscribe(
      data => {
        this.haveExpiredCertif = data
      },
      err => this.msjService.showError(err)
    );
  }

  isEmployee() {
    let isEmployee = localStorage.getItem("isEmployee");
    return (isEmployee == "true");
  }

}
