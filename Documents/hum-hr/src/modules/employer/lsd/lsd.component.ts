import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CreateLsdComponent } from '../create-lsd/create-lsd.component';
import { LawbookDocument } from '../../shared/models/lawbook-document.model.';
import { MessageService } from '../../shared/errorHandler/message.service';
import { LsdService } from '../../shared/services/lsd.service';
import { LsdStatesService } from '../../shared/services/lsd-states.service';
import { LsdStates } from '../../shared/models/lsd-states.model';
import { DocumentTypeDefinition } from '../../shared/models/document-type-definition.model';
import { UntypedFormControl, UntypedFormGroup, Validators, UntypedFormBuilder } from '@angular/forms';
import { UploadFileModalComponent } from '../upload-file-modal/upload-file-modal.component';
import { ACEPTED_EXTENSION, maxFiles } from '../../shared/models/documentation-type.model';
import { ViewFileModalData } from '../../shared/models/view-file-modal-data.model';
import { ViewFileModalComponent } from '../view-file-modal/view-file-modal.component';
import { GenericBottomSheetComponent } from '../../shared/generic-bottom-sheet/generic-bottom-sheet.component';
import { SignBatch } from '../../shared/models/Employee/sign-batch.model';
import { MessageType, MessageAtributtes } from '../../shared/models/message-types.model';
import { AppConfig } from 'src/app/app.config';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { AuthService } from '../../shared/auth/auth.service';
import { LawbookFindParameters } from '../../shared/models/lawbook-find-parameters.model';
import { MetadataFind, MetadataDefinition } from '../../shared/models/metadata.model';
import { OrganizationalUnitService } from '../../shared/services/organizational-unit.service';
import { OrganizationalUnit } from '../../shared/models/organizational-unit.model';
import { ProfileService } from '../../shared/services/profile.service';
import { Certificate, CertificateType } from '../../shared/models/certificate.model';
import { FileDocumentMetadata } from '../../shared/models/file-document-metadata.model';
import { CertificateService } from '../../shared/services/certificate.service';



@Component({
  selector: 'app-lsd',
  templateUrl: './lsd.component.html',
  styleUrls: []
})
export class LsdComponent implements OnInit {
  loading = true;
  isEditing = false;
  showDetail = false;
  showSearchBar = false;
  itemSelected = false;
  enabledFilter = true;
  disabledFilter = true;
  saving = false;
  loadingDocument = false;
  canSign = false;
  canCreate = false;
  isRootOu = false;

  lawbookDocuments: LawbookDocument[] = [];
  lsdStates: LsdStates[] = [];
  previousValue: any[];
  files: any[] = [];
  signableFiles: any[] = [];
  attachments: any[] = [];
  filterMetadatas: MetadataDefinition[] = [];
  findEntity: MetadataFind[] = [];
  docType: DocumentTypeDefinition;
  selectedDoc: LawbookDocument;
  editedEmployee: LawbookDocument;
  selectedEditingControl: string;
  period: string;
  totalItemsCount = 0;
  page = 1;
  husignerDownloadUrl = AppConfig.settings.custom.husignerDownloadUrl;

  //para borrar solo dummy
  statusDummyOk = false;
  statusDummyNot = false;
  selectedView = 'En Curso';
  organizationalUnits: OrganizationalUnit[];
  filerOrganizationalUnits: OrganizationalUnit[];
  selectedOrganizationalUnit: OrganizationalUnit;
  activeCertificates: Certificate[];

  editDocForm: UntypedFormGroup;

  openingFileId = 0;
  singingDocumentId = 0;

  constructor(
    public dialog: MatDialog,
    private lsdSvc: LsdService,
    private lsdStatesSvc: LsdStatesService,
    private msgSvc: MessageService,
    private authSvc: AuthService,
    private _formBuilder: UntypedFormBuilder,
    private _bottomSheet: MatBottomSheet,
    private organizationalUnitService: OrganizationalUnitService,
    private profileService: ProfileService,
    private certificateServices: CertificateService
    ) { }

  ngOnInit(): void {
    //this.loading = false;
    this.canSign = this.authSvc.isLSDSigner();
    this.canCreate = this.authSvc.isLSDWrite();

    const loadings = [];
    loadings.push(this.lsdStatesSvc.getStates().toPromise());
    loadings.push(this.lsdSvc.getDocType().toPromise());
    loadings.push(this.organizationalUnitService.getTreeInMemory());
    this.profileService.getMyActiveCertificates(null, null).toPromise()
      .then(
        dataCert => {
          this.activeCertificates = dataCert.filter(c => c.provider === "Token Firmador HuSigner");
        },
        err => this.msgSvc.showError(err)
      );

    this.editDocForm = this._formBuilder.group({});

    Promise.all(loadings)
      .then(result => {
        this.docType = result[1];
        this.lsdStates = result[0];
        this.organizationalUnits = result[2];
        this.filerOrganizationalUnits = this.organizationalUnits.filter(o => o.isRoot === false);
        const ouId = +this.authSvc.getOrganizationId();
        const currOu = this.organizationalUnits.find(o => o.id === ouId);
        this.isRootOu = currOu &&  currOu.isRoot && this.filerOrganizationalUnits.length > 1;

        // Obtengo los metadatos de filtros
        this.filterMetadatas = this.docType.metadata.filter(m => m.isSearchCriteria && m.metadataSystemName !== LawbookDocument.periodSystemName && m.metadataSystemName !== LawbookDocument.sateSysName);

        this.search();
      })
      .catch(err => this.msgSvc.showError(err));
  }

  openAddDocument(): void {
    const dialogRef = this.dialog.open(CreateLsdComponent, {disableClose: true});
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.search();
      }
    });
  }

  closeDetail(refreshSearch: boolean) {
    this.showDetail = false;
  }

  search() {
    this.loading = true;
    const params: LawbookFindParameters = {
      selecteView: this.selectedView,
      metadatas: this.findEntity,
      period: this.period,
      organizationalUnitId: this.selectedOrganizationalUnit ? this.selectedOrganizationalUnit.id : null,
      page: this.page,
      isPaged: true,
      itemPerPage: 15
    };


    this.lsdSvc.find(params, this.docType).toPromise()
      .then(data => {
        this.totalItemsCount = data.total;
        this.lawbookDocuments = data.values;
      })
      .catch(err => this.msgSvc.showError(err))
      .then(() => this.loading = false);
  }

  filteredSearch() {
    this.search();
  }

  selectDoc(doc: LawbookDocument) {
    // Si estaba editando primero le cancelo la edicion
    if (this.selectedEditingControl) {
      this.clearFormEdition();
    }

    this.itemSelected = true;
    this.selectedDoc = doc;
    this.files = [];
    this.attachments = [];
    this.signableFiles = [];
    this.loadingDocument = true;
    this.lsdSvc.getDocument(doc.id).toPromise()
    // Armo los files
    .then(data => {
        this.files = [];
        this.attachments = [];
        this.signableFiles = [];
        data.files.forEach(f => {
          if (f.maxSigners > 0) {
            this.files.push(f);
            if (!f.isSigned) {
              this.signableFiles.push(f);
            } else {
              this.getSignData(f);
            }
          } else {
            this.attachments.push(f);
          }
        });

        // Lleno los datos de los metadatos
        this.selectedDoc.metadatas.forEach(meta => {
          const m = data.documentTypes[0].metadatas.find(dt => dt.systemName === meta.systemName);
          if (m) {
            meta.metadataId = m.metadataId;
            meta.asName = m.asName;
            meta.metadataIsRequired = m.metadataIsRequired;
            meta.metadataIsUnique = m.metadataIsUnique;
            meta.metadataType = m.metadataType;
            meta.position = m.position;
          }
        });

        this.selectedDoc.documentType = {
          id: data.documentTypes[0].id,
          name: data.documentTypes[0].name,
          systemName: null,
          organizationalUnitId: data.organizationalUnitId,
          organizationalUnitName: data.organizationalUnitName,
          metadata: []
        };
        this.selectedDoc.versionId = data.versionId;
      })
      .catch(err => this.msgSvc.showError(err))
      .then(() => this.loadingDocument = false);
  }

  editControl(selectedControl: string) {
    if (!this.selectedDoc.canEdit(selectedControl) || !this.canCreate || this.loadingDocument || this.selectedDoc.isFinished(this.lsdStates)) {
      return;
    }

    this.editedEmployee = this.createLawbookDocumentCopy();

    if (this.selectedEditingControl) {
      this.clearFormEdition();
    }

    // Si no lo tiene agrego el metadato
    const meta = this.docType.metadata.find(m => m.metadataSystemName === selectedControl);
    if (!this.editedEmployee.metadatas.find(m => m.systemName === meta.metadataSystemName)) {
      const newMetadata = new FileDocumentMetadata();
      newMetadata.metadataId = meta.metadataId;
      newMetadata.asName = meta.asName;
      newMetadata.metadataIsRequired = meta.isRequired;
      newMetadata.metadataIsUnique = meta.isUnique;
      newMetadata.metadataLabel = meta.metadataLabel;
      newMetadata.metadataType = meta.metadataType;
      newMetadata.position = meta.position;
      newMetadata.systemName = meta.metadataSystemName;
      this.editedEmployee.metadatas.push(newMetadata);
    }

    this.editDocForm.addControl(selectedControl, this.getFormControl(selectedControl));

    this.selectedEditingControl = selectedControl;
  }

  createLawbookDocumentCopy(): LawbookDocument {
    const response: LawbookDocument = new LawbookDocument();
    response.metadatas = [... this.selectedDoc.metadatas];
    return response;
  }

  clearFormEdition() {
    this.editDocForm.removeControl(this.selectedEditingControl);
    this.saving = false;
    this.selectedEditingControl = null;
  }

  getFormControl(selectedControl: string): UntypedFormControl {
    return new UntypedFormControl('', Validators.required);
  }

  setMetadataValue(ev: any) {
    this.editDocForm.controls[ev.systemName].setValue(ev.metadataValue);
  }

  cancel() {
    this.clearFormEdition();
  }

  save() {
    this.saving = true;
    this.updateDocWithEdittedData();

    this.lsdSvc.modify(this.selectedDoc).toPromise()
      .then(data => {
        this.msgSvc.showInfo('Dato guardado correctamente');
        this.clearFormEdition();
        this.search();
      },
        err => {
          this.msgSvc.showError(err);
          this.resetValue();
          this.saving = false;
        });
  }

  updateDocWithEdittedData() {
    this.previousValue = [];
    const metaValue: any = this.editedEmployee.metadatas.find(m => m.systemName === this.selectedEditingControl);
    let newValue = false;
    if (this.selectedDoc.getMetadataValue(this.selectedEditingControl)) {
      this.previousValue.push(JSON.parse(JSON.stringify(this.selectedDoc.getMetadataValue(this.selectedEditingControl))));
    } else {
      newValue = true;
    }
    this.selectedDoc.setMetadataValue(this.selectedEditingControl, metaValue.metadataValue);
    this.selectedDoc.setDescriptionValue(this.selectedEditingControl, metaValue.metadataValueDescription);
    if (newValue) {
      const meta = this.selectedDoc.getMetadata(this.selectedEditingControl);
      meta.metadataType = metaValue.metadataType;
      meta.metadataLabel = metaValue.metadataLabel;
      meta.metadataId = metaValue.metadataId;
    }
    if (Array.isArray(metaValue.metadataValue)) {
      // Si es array actualizamos el descriptionValue
      const meta = this.selectedDoc.metadatas.find(m => m.systemName === this.selectedEditingControl);
      meta.metadataValueDescription = metaValue.metadataValueDescription;
    }
  }

  resetValue() {
    this.selectedDoc.setMetadataValue(this.selectedEditingControl, this.previousValue.length > 0 ? this.previousValue[0] : null);
  }

  addFile(signable: boolean) {
    const dialogData = {
      maxFiles: maxFiles.MULTIPLE,
      acceptedExtensions: signable ? '.pdf' : ACEPTED_EXTENSION.LSD,
      canViewFile: true,
      canRemove: true,
      multipleSelection: true,
      uploadFunction: async (files: any[]): Promise<boolean> => {
        this.saving = true;
        if (!this.canAgreggate(files))
        {
          var err =  {description: "El archivo ya fue agregado"}
          this.msgSvc.showError(err);
          return false;
        }
        if (signable) {
          files.forEach(file => {
            this.selectedDoc.signFileNames.push(file.name);

          });
        }

        let retorno = false;
        await this.lsdSvc.modify(this.selectedDoc, files).toPromise()
          .then(data => {
            this.msgSvc.showInfo('Dato guardado correctamente');
            retorno = true;
          })
          .catch(
            err => {
              this.msgSvc.showError(err);
              retorno = false;
            })
          .then(() => this.saving = false);

        return retorno;
      }
    };

    const dialogRef = this.dialog.open(UploadFileModalComponent, {
      data: dialogData,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.selectDoc(this.selectedDoc);
      }
    });
  }

  openFile(file: any) {
    this.openingFileId = file.id;
    const dialogData: ViewFileModalData = {
      fileName: file.name,
    };

    this.lsdSvc.getFiles(this.selectedDoc.id, this.selectedDoc.versionId, file.id).toPromise()
      .then(data => {
        dialogData.fileBase64 = data.base64File;
        dialogData.fileSize = data.size;
        dialogData.fileId = file.id;
        const dialogRef = this.dialog.open(ViewFileModalComponent, {
          // height: '800px',
          // width: '1024px',
          data: dialogData
        });

        dialogRef.afterClosed().subscribe(result => {
        });
      })
      .catch( err => this.msgSvc.showError(err))
      .then(() => this.openingFileId = 0);
  }

  signHusigner(doc: LawbookDocument) {
    if (this.activeCertificates.length < 1) {
      this.helpNoCertificate();
      return;
    }

    this.singingDocumentId = doc.id;
    this.lsdSvc.getDocument(doc.id).toPromise()
    .then(lawbookDoc => {
      // Verifico que tenga archivos para firmar
      const signDocs = [];
      lawbookDoc.files.forEach(f => {
        if (f.maxSigners > 0  && !f.isSigned) {
          signDocs.push(f);
        }
      });

      if (signDocs.length < 1) {
        this.msgSvc.showInfo('No hay archivos por firmar');
        return;
      }

      const documents: LawbookDocument[] = [];
      documents.push(doc);
      const name = `${doc.period} - ${doc.presentacion} ${doc.nomina}`;

      this.lsdSvc.createSignBatch( documents, doc.organizationalUnitId, name).toPromise()
        .then(data => {
          this.certificateServices.getSignatureTypesByOuId(doc.organizationalUnitId).toPromise().then(
            res=>{
              if(res.some(x => x.certificateProviderId == 7 && x.hasIntegratedHusigner)){
                this.authSvc.createHuToken().then(
                  token =>{
                    const base64Param = btoa(token)
                    window.open(`husigner://${base64Param}`, '_blank');
                  }
                )
              }
              else
                this.helpBatchSign(data);
            },
            err=>{
              this.loading = false;
              this.msgSvc.showError(err);
            }
          );

        })
        .catch(err => this.msgSvc.showError(err))
        .then(() => this.singingDocumentId = 0);
    })
    .catch(err => this.msgSvc.showError(err))
    .then(() => this.singingDocumentId = 0);

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
          image: '',
          children: []
        },
        {
          title: '¿Cómo acceder al firmador?',
          description: 'Ingresá a Husigner para firmar tus documentos<br>',
          itemListDescription: [
            '<b>Ubicá Husigner</b> en tu ordenador, ya sea en el <b>Escritorio</b> o en el <b>Menú de Inicio</b>.',
            'Abrí <b>Husigner</b> e ingresá tu <b>usuario</b> y <b>clave</b> de <b>Humanage</b> para acceder.'
          ],
          image: '',
          children: []
        }
      ]
    }];

    const parameters = {
      bodyText: 'Lote enviado correctamente',
      infoText: `Ya está disponible el lote <b class="accent">${signBatch.description}</b> para firmar en Husigner.`,
      type: MessageType.HelpIndex,
      helpModel: helpModel
    } as MessageAtributtes;

    const t = this._bottomSheet.open(GenericBottomSheetComponent, { data: parameters, disableClose: true });
  }

  helpNoCertificate() {
    const helpModel =  [{
      title: 'Declarar Certificado para firmar con Husigner',
      description: 'Guía para el usuario',
      image: '',
      itemTextDescription: [
        '<h3>En caso que aún no tengas uno, <b class="accent"> iniciá el tutorial</b> y conocé los pasos para dar de alta tu certificado.</h3>',
      ]
    },
    {
      title: 'Paso 1',
      description: 'Declarar Certificado para firmar con Husigner',
      image: '../../../../assets/img/no_certificate/step_1.png',
      itemTextDescription:[
        '<b>Hacé click</b> tal como muestra la imagen para abrir tu menú de <b>opciones personales.</b>',
      ],
      itemDescriptionAditional:[
        '<h5><u>Consejo:</u> Podés hacer click en la imagen para verla mas grande.</h5>',
      ]
    },
    {
      title: 'Paso 2',
      description: 'Declarar Certificado para firmar con Husigner',
      image: '../../../../assets/img/no_certificate/step_2.png',
      itemTextDescription:[
        '<b>Hacé click en el signo "+"</b> y se abrirá el diálogo con las opciones para <b>Agregar tipo de Firma para Firmante.</b>',
      ]
    },
    {
      title: 'Paso 3',
      description: 'Declarar Certificado para firmar con Husigner',
      image: '../../../../assets/img/no_certificate/step_3.png',
      itemTextDescription:[
        'Por último completá la empresa, elegí <b>Husigner</b> como tipo de Certificado e ingresá la <b>fecha de vencimento</b> que indica tu token de seguridad.',
      ],
      itemDescriptionAditional:[
        '<h5><u>Ayuda adicional:</u> la fecha de vencimiento del token es información obligatoria provista por su fabricante, consulta la documentación del dispositivo o ponte en contacto con tu proveedor si tenés problemas para obtenerla.</h5>',
      ]
    }
    ];

    const parameters = {
      bodyText: 'Ups! No podemos continuar',
      infoText: 'Aún no tenés tu Certificado declarado para Firmar con Husigner.<br>Tenés que <b>Declarar un Certificado</b> desde tu Perfil.',
      type: MessageType.HelpStepper,
      helpModel: helpModel
    } as MessageAtributtes;

    const t = this._bottomSheet.open(GenericBottomSheetComponent, { data: parameters, disableClose: true });
  }

  selectView(view: string) {
    this.selectedView = view;
    this.search();
  }

  private getSignData(file: any) {
    this.lsdSvc.getSignData(file.id).toPromise().then(data => {
      file.signedDate = data[0].signedDate;
      file.signedBy = data[0].signedBy;
    })
    .catch(err => this.msgSvc.showError(err));
  }

  private canAgreggate(files: any)
  {
    var attachduplicados = this.attachments.filter(x => files.find(f => f.name == x.name));
    var singduplicados = this.files.filter(x => files.find(f => f.name == x.name));

    return (attachduplicados.length  == 0 && singduplicados.length == 0);
  }

}
