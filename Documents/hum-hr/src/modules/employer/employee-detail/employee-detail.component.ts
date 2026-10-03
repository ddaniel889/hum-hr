import { Component, Input, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from '../../shared/errorHandler/message.service';
import { OrganizationalUnit, ContainerType, User } from "../../shared/models";
import { FileDocument } from '../../shared/models/file-document.model';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { EmployeeService } from '../../shared/services/employee.service';
import { OrganizationalUnitService } from '../../shared/services/organizational-unit.service';
import { UserService } from '../../shared/services/user.service';
import { EmployeeDetailLastDocumentsComponent } from '../employee-detail-last-documents/employee-detail-last-documents.component';
import { GroupData } from '../../shared/models/GroupData.models.';
import { ContainerTypeService } from '../../shared/services/container-type.service.';
import { CertificatesComponent } from '../../shared/certificates/certificates.component';
import { AuthService } from '../../shared/auth/auth.service';
import { PersonPreview } from '../../shared/models/Employee/person.model';
import { PersonService } from '../../shared/services/person.service';
import { UntypedFormGroup, UntypedFormBuilder, Validators, UntypedFormControl } from '@angular/forms';
import { Employee } from '../../shared/models/Employee/employee.model';
import { EmployeeMetadata } from '../../shared/models/employee-metadata.model';
import { CandidateService } from '../../shared/services/candidate.service';
import { WelcomeParametersDTO } from '../../shared/models/email.model';
import { SharePersonDialogComponent } from '../share-person-dialog/share-person-dialog.component';
import { MessageAtributtes, MessageType } from '../../shared/models/message-types.model';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { GenericBottomSheetComponent } from '../../shared/generic-bottom-sheet/generic-bottom-sheet.component';
import { CandidateSet } from '../../shared/models/Employee/candidate-set.model';
import { LeaveConfigEmployeeComponent } from '../leave-config-employee/leave-config-employee.component';
import { EmployeeLeaveService } from '../../shared/services/employee-leave-requests.service';
import { EmployeeFindApprover } from '../../shared/models/Employee/employeeFindApprover.model';

@Component({
  selector: 'app-employee-detail',
  templateUrl: './employee-detail.component.html',
  styleUrls: []
})
export class EmployeeDetailComponent implements OnInit {
  @Input() selectedEmployee = new Employee();
  @Input() isCandidate = false;
  @ViewChild(EmployeeDetailLastDocumentsComponent) lastDocumentsComponent: EmployeeDetailLastDocumentsComponent;
  @ViewChild(CertificatesComponent) certficatesComponent: CertificatesComponent;
  @ViewChild(LeaveConfigEmployeeComponent) leaveConfigEmployeeComponent: LeaveConfigEmployeeComponent;
  @Output() refreshGrid = new EventEmitter<boolean>();
  @Output() detailClose = new EventEmitter<boolean>();
  @Output() updatePreview = new EventEmitter<string>();

  editPersonForm: UntypedFormGroup;
  editedEmployee: Employee;
  selectedEditingControl: string;
  editMetadataDefinition: EmployeeMetadata[] = [];
  previousValue: any[];
  loading: boolean;
  accessToggle: boolean;
  employee: Employee;
  initials: string;
  canEdit: boolean;
  isAdministrator: boolean;
  isRRHH: boolean;
  userResult: any;
  rolesResult: any;
  enabledUser: boolean;
  selectedData: GroupData = GroupData.UltimosDocumentosLegajo;
  grupoData = GroupData;
  items: FileDocument[] = [];
  loaded = false;
  saving = false;
  organizationalUnits: OrganizationalUnit[];
  organizationalUnitId: string;
  containerType: ContainerType;
  isContainerTypeLoaded = false;
  adittionalsMetadatas: any[];
  isImageUploadOpened: boolean;
  updateAvatar: boolean;
  isCandidateAdmin = false;
  isCandidateAdminBasic = false;
  canSendWelcome = false;
  hasOuToShare = false;
  canDeleteEmployee = false;
  useSaml = false;
  oldUserHide: boolean;
  enableHumanageHrEmailChange = false;
  maskFiscalId: string;
  maskFiscalIdInput: string;
  employeeManagement: boolean;
  onlyEmployeeManagement: boolean;
  isLeaveConfig = false;
  isLeaveManager = false;
  isLeaveAprov = false;
  hasConfigLeave: boolean = false;
  employeeFindApprover: EmployeeFindApprover;
  isValidator: boolean = false;

  constructor(
    private msjService: MessageService,
    private employeeService: EmployeeService,
    private userService: UserService,
    public dialog: MatDialog,
    private router: Router,
    private authService: AuthService,
    private organizationalUnitService: OrganizationalUnitService,
    private containerTypeService: ContainerTypeService,
    private personService: PersonService,
    private candidateService: CandidateService,
    private _formBuilder: UntypedFormBuilder,
    private _bottomSheet: MatBottomSheet,
    private employeeLeaveService: EmployeeLeaveService) {
    this.adittionalsMetadatas = [];

  }

  ngOnInit() {
    // Se agrega el AND y la ultima parte en canEdit para que a un gestor de accesos no le aparezca el lapiz si no tiene permisos de edicion como gestor de accesos.
    this.canEdit = (this.authService.canEdit() || this.authService.isCandidateAdmin() || this.authService.isCandidateAdminBasic()) && !(this.authService.isAdministrator() && !this.authService.canEdit());
    this.isAdministrator = this.authService.isAdministrator();
    this.isRRHH = this.authService.isRRHH();
    this.isCandidateAdmin = this.authService.isCandidateAdmin();
    this.isCandidateAdminBasic = this.authService.isCandidateAdminBasic();
    this.canDeleteEmployee = this.authService.isCandidateAdmin() || this.authService.isAdministrator() || this.authService.isCandidateAdminBasic();
    this.isImageUploadOpened = false;
    this.employeeManagement = this.authService.employeeManagement();
    this.onlyEmployeeManagement = this.employeeManagement && !(this.isAdministrator || this.isCandidateAdmin || this.isCandidateAdminBasic)
    this.canSendWelcome = this.isAdministrator || this.isCandidateAdmin || this.isCandidateAdminBasic;
    this.editPersonForm = this._formBuilder.group({});
    this.isLeaveConfig = this.authService.isLeaveConfig();
    this.isLeaveManager = this.authService.isLeaveManager();
    this.isLeaveAprov = this.authService.isLeaveApprov();

    this.organizationalUnitService.getTreeInMemory()
      .then(ous => {
        this.organizationalUnits = ous;
        this.loaded = false;
      },
        err => this.msjService.showError(err)
      );

    if (this.isAdministrator) {
      this.organizationalUnitService.getOuRootTree().toPromise()
        .then(ous => {
          ous = ous.filter(o => o.isRoot == false);
          this.hasOuToShare = ous.length > 1;
        },
          err => this.msjService.showError(err)
        );
    }

  }

  maskSplited(mask: string) {
    let masksplited = mask.split("||")
    if (masksplited.length > 1) {
      //Las mascaras de Id Fiscales cuando son mas de una por pais, al ser de distintas longitudes y estar ordenadas de menor a mayor longitud,
      //siempre elijo la mayor que queda en la ultima posicion del arreglo
      let i = masksplited.length - 1;
      this.maskFiscalId = masksplited[i];
    }
    else {
      this.maskFiscalId = mask;
      this.maskFiscalIdInput = mask;
    }
  }

  getContainerType() {
    if (this.employee && +this.organizationalUnitId !== this.employee.organizationalUnitId ||
      !this.containerType) {
      this.isContainerTypeLoaded = false;
      this.containerTypeService
        .getContainerType(this.employee.organizationalUnitId.toString(), this.isCandidate)
        .toPromise()
        .then(containerType => {
          this.containerType = containerType;
          localStorage.removeItem("containerTypeId");
          localStorage.setItem("containerTypeId",this.containerType.id.toString());
          this.maskSplited(this.containerType.mask)
          this.isContainerTypeLoaded = true;
          this.setAdittionalMetadatas();
        },
          err => {
            this.msjService.showError(err);
          }
        );
    } else {
      this.setAdittionalMetadatas();
    }
  }

  getEmployeeDetail(id: string, setId?: number) {
    this.isImageUploadOpened = false;
    this.loading = true;
    this.loaded = false;
    this.oldUserHide = false;
    this.userResult = null;
    this.clearFormEdition();
    this.employeeService
    .getContainer(id)
    .subscribe(
      res => {
          this.employee = res;
          localStorage.removeItem("mailEmployee");
          localStorage.setItem("mailEmployee",this.employee.nickName);
          this.hasConfig(this.employee.organizationalUnitId);
          this.employee.candidateSet = new CandidateSet;
          this.employee.candidateSet.setId = setId;
          this.getContainerType();
          this.organizationalUnitId = this.employee.organizationalUnitId.toString();
          this.loading = true;
          this.initials = this.employee.lastName + ' ' + this.employee.name;
          this.updateAvatar = false;

          if (this.certficatesComponent != null) {
            this.certficatesComponent.refresh();
          }
          this.refreshGrid.emit(false);
          const currentOu = this.organizationalUnitService.getCurrentOU();
          this.useSaml = currentOu.useSaml;
          this.enableHumanageHrEmailChange = currentOu.enableHumanageHrEmailChange;

          this.userService.getById(this.employee['userId']).toPromise().then(
            dataU => {
              this.userResult = dataU;
              this.refreshDocuments(this.selectedData);
              this.loaded = true;
              this.loading = false;
              this.updateAvatar = true;
            },
            err => this.msjService.showError(err)
          );

        },
        err => this.msjService.showError(err)
      );
  }

  getEmployeeDetailByValidator(emp: Employee) {
    this.isValidator = true;
    this.isImageUploadOpened = false;
    this.loading = true;
    this.loaded = false;
    this.oldUserHide = false;
    this.employeeService
    .getTeamEmployee({"userId": emp.userId, "employeeId": emp.id})
    .subscribe(
      res => {
          this.employee = res;
          localStorage.removeItem("mailEmployee");
          localStorage.setItem("mailEmployee",this.employee.nickName);
          this.hasConfig(this.employee.organizationalUnitId);
          this.employee.candidateSet = new CandidateSet;
          this.organizationalUnitId = this.employee.organizationalUnitId.toString();
          this.loading = true;
          this.initials = this.employee.lastName + ' ' + this.employee.name;
          this.updateAvatar = true;
          this.getContainerType();
          if (this.certficatesComponent != null) {
            this.certficatesComponent.refresh();
          }
          this.refreshGrid.emit(false);
          this.userResult = new User();
          this.loading = false;
          this.leaveConfigEmployeeComponent.loadConfigLeaveByValidator(this.employee.userId);
        },
        err => this.msjService.showError(err)
      );
  }

  hasConfig(ouId:number){
    this.employeeLeaveService.getMyConfigLeaveOU(ouId).toPromise().then(
      data => {
        if (data && data.length > 0) {
          this.hasConfigLeave = true;
        }else{
          this.hasConfigLeave = false;
        }
      },
      err => {

      }
    );
  }

  refresh(): boolean {
    if(this.isValidator){
      this.getEmployeeDetailByValidator(this.selectedEmployee);
      return true;
    }
    if (this.employee) {
      this.getEmployeeDetail(this.employee.id);
      return true;
    }
    return false;
  }

  refreshAfterSavingLeaveConfig() {
    this.refreshGrid.emit(true);
  }

  employeeDetailClose() {
    this.detailClose.emit(true);
  }

  enableEmployee(emp: Employee) {
    const name = emp.metadatas.find(o => o.metadataSystemName == '_nom')['metadataValue'];
    const lastName = emp.metadatas.find(o => o.metadataSystemName == '_ape')['metadataValue'];
    this.msjService
      .showOkCancel('¿Desea activar el Legajo Nro ' + emp.nroLeg + ' de ' + name + ' ' + lastName + '?', 'Si', 'No')
      .subscribe(result => {
        if (result == true) {
          this.loading = true;
          this.employeeService
            .activeEmployee(emp)
            .subscribe(
              data => {
                this.refreshGrid.emit(true);
                this.employee = new Employee();
                this.employee.id = data.id;
                this.employee.organizationalUnitId = data.organizationalUnitId;
                this.employee.organizationalUnitName = data.organizationalUnitName;
                this.employee.metadatas = data.metadatas;
                this.employee.containerTypeId = data.containerTypeId;
                this.loading = false;
              },
              err => {
                this.msjService.showError(err);
                this.loading = false;
              }
            );
        }
      });
  }

  disableEmployee(emp) {
    this.msjService
      .showYesNoCancel('¿Desea que el legajo continúe visualizando los documentos recibidos hasta este momento?')
      .subscribe(result => {
        if (result != undefined) {
          this.loading = true;
          this.employeeService
            .deleteEmployee(emp.id, !result)
            .subscribe(
              data => {
                this.refreshGrid.emit(true);
                this.employee = new Employee();
                this.employee.id = data.id;
                this.employee.organizationalUnitId = data.organizationalUnitId;
                this.employee.organizationalUnitName = data.organizationalUnitName;
                this.employee.metadatas = data.metadatas;
                this.employee.containerTypeId = data.containerTypeId;
                this.loading = false;
              },
              err => {
                this.msjService.showError(err);
                this.loading = false;
              }
            );
        }
      });
  }

  changeExpander(group: GroupData) {
    this.selectedData = group;
  }

  private refreshDocuments(group: GroupData) {
    if (group == this.grupoData.UltimosDocumentosLegajo && this.organizationalUnits != null && this.lastDocumentsComponent != null) {
      this.lastDocumentsComponent.refreshDocuments();
    }
  }

  gotoEmployeeDocumentView(emp: Employee) {
    this.router.navigate(['employer/employee-document-view', emp.id]);
  }

  uploadAvatar(preview: any) {
    const personPreview = new PersonPreview();

    personPreview.id = +this.employee.id;
    personPreview.organizationalUnitId = +this.organizationalUnitId;
    personPreview.preview = preview;
    this.personService.uploadAvatar(personPreview).toPromise()
      .then((res) => {
        this.selectedEmployee.preview = res;
        this.employee.preview = res;
        this.isImageUploadOpened = false;
        this.updatePreview.emit(res);
      })
      .catch(err => this.msjService.showError(err));
  }

  sendPendingWelcome() {
    const dto = new WelcomeParametersDTO();
    dto.userId = this.employee.userId;
    dto.isCandidate = this.isCandidate;
    this.userService.pendingWelcome(dto).toPromise().then(() => {
      this.refresh();
      const typePerson = this.isCandidate ? 'candidato.' : 'empleado.';
      this.msjService.showInfo("El correo electrónico de bienvenida será enviado al " + typePerson);
    })
      .catch(err => this.msjService.showError(err));
  }

  editControl(selectedControl: string) {
    if (selectedControl === 'nickName' && (!this.useSaml || this.isCandidate)) {
      return;
    }

    if (!this.isContainerTypeLoaded) {
      return;
    }

    if (!this.canEdit) {
      return;
    }

    if (selectedControl === 'email' && !this.enableHumanageHrEmailChange && !this.isCandidate) {
      return;
    }

    this.editedEmployee = this.createEmployeeCopy();

    if (this.selectedEditingControl) {
      this.clearFormEdition();
    }

    if (selectedControl === 'fullName') {
      this.editPersonForm.addControl('firstName', this.getFormControl('firstName'));
      this.editPersonForm.addControl('lastName', this.getFormControl('lastName'));
    } else {
      this.editPersonForm.addControl(selectedControl, this.getFormControl(selectedControl));
    }

    this.selectedEditingControl = selectedControl;
  }

  getFormControl(selectedControl: string): UntypedFormControl {
    switch (selectedControl) {
      case 'nickName':
        return new UntypedFormControl(this.editedEmployee.delegatedSystemId, Validators.required);
      case 'firstName':
        return new UntypedFormControl(this.editedEmployee.name, Validators.required);
      case 'lastName':
        return new UntypedFormControl(this.editedEmployee.lastName, Validators.required);
      case 'email':
        return new UntypedFormControl(this.editedEmployee.email, [Validators.required, Validators.email]);
      case 'nroLeg':
        return new UntypedFormControl(this.editedEmployee.nroLeg, Validators.required);
      case 'fiscalId':
        return new UntypedFormControl(this.editedEmployee.cuil, [Validators.required, Validators.pattern(this.organizationalUnitService.getCurrentOrChildOU().country.fiscalIdValidator)]);
      default:
        return new UntypedFormControl('', Validators.required);
    }
  }

  clearFormEdition() {
    if (this.selectedEditingControl == 'fullName') {
      this.editPersonForm.removeControl('firstName');
      this.editPersonForm.removeControl('lastName');
    } else {
      this.editPersonForm.removeControl(this.selectedEditingControl);
    }
    this.saving = false;
    this.selectedEditingControl = null;
  }

  save() {

    this.saving = true;
    this.oldUserHide = true;
    this.updateEmployeeWithEdittedData();
    if (this.isCandidate) {
      this.candidateService.modify(this.employee).toPromise()
        .then(data => {
          this.msjService.showInfo('Dato guardado correctamente');
          this.setAdittionalMetadatas();
          this.clearFormEdition();
          this.refreshGrid.emit(true);
        },
          err => {
            this.msjService.showError(err);
            this.resetValue();
            this.saving = false;
          });

    } else {
      this.employeeService.modifyEmployee(this.employee).toPromise()
        .then(data => {
          this.msjService.showInfo('Dato guardado correctamente');
          this.setAdittionalMetadatas();
          this.clearFormEdition();
          this.refreshGrid.emit(true);
        },
          err => {
            this.msjService.showError(err);
            this.resetValue();
            this.saving = false;
          });
    }
  }

  cancel() {
    this.clearFormEdition();
  }

  setMetadataValue(ev: any) {
    this.editPersonForm.controls[ev.metadataSystemName].setValue(ev.metadataValue);
  }

  resetValue() {
    switch (this.selectedEditingControl) {
      case 'nickName':
        this.employee.delegatedSystemId = this.previousValue[0];
        return;
      case 'fullName':
        this.employee.name = this.previousValue[0];
        this.employee.lastName = this.previousValue[1];
        return;
      case 'email':
        this.employee.email = this.previousValue[0];
        return;
      case 'nroLeg':
        this.employee.nroLeg = this.previousValue[0];
        return;
      case 'fiscalId':
        this.employee.cuil = this.previousValue[0];
        return;

      default:
        this.employee.setMetadataValue(this.selectedEditingControl, this.previousValue.length > 0 ? this.previousValue[0] : null);
        return;
    }
  }

  updateEmployeeWithEdittedData() {
    this.previousValue = [];
    switch (this.selectedEditingControl) {
      case 'nickName':
        this.previousValue.push(JSON.parse(JSON.stringify(this.employee.delegatedSystemId)));
        this.employee.delegatedSystemId = this.editPersonForm.controls[this.selectedEditingControl].value;
        return;
      case 'fullName':
        this.previousValue.push(JSON.parse(JSON.stringify(this.employee.name)));
        this.previousValue.push(JSON.parse(JSON.stringify(this.employee.lastName)));
        this.employee.name = this.editPersonForm.controls['firstName'].value;
        this.employee.lastName = this.editPersonForm.controls['lastName'].value;
        return;
      case 'email':
        this.previousValue.push(JSON.parse(JSON.stringify(this.employee.email)));
        this.employee.email = this.editPersonForm.controls['email'].value;
        return;
      case 'nroLeg':
        this.previousValue.push(JSON.parse(JSON.stringify(this.employee.nroLeg)));
        this.employee.nroLeg = this.editPersonForm.controls[this.selectedEditingControl].value;
        break;
      case 'fiscalId':
        this.previousValue.push(JSON.parse(JSON.stringify(this.employee.cuil)));
        this.employee.cuil = this.editPersonForm.controls[this.selectedEditingControl].value;
        break;
      default:
        const metaValue: any = this.editedEmployee.metadatas.find(m => m.metadataSystemName === this.selectedEditingControl);
        if (this.employee.getMetadataValue(this.selectedEditingControl)) {
          this.previousValue.push(JSON.parse(JSON.stringify(this.employee.getMetadataValue(this.selectedEditingControl))));
        }
        this.employee.setMetadataValue(this.selectedEditingControl, metaValue.metadataValue);
        this.employee.setDescriptionValue(this.selectedEditingControl, metaValue.metadataValueDescription);
        if (Array.isArray(metaValue.metadataValue)) {
          // Si es array actualizamos el descriptionValue
          const meta = this.employee.metadatas.find(m => m.metadataSystemName === this.selectedEditingControl);
          meta.descriptionValue = metaValue.metadataValueDescription;
        }
        return;
    }
  }

  mergeMetadataWithDefinition(metadataDefinition: any, metadatas: any): EmployeeMetadata {
    const meta = (Object.assign({}, metadataDefinition));
    meta.metadataValue = metadatas.metadataValue;
    return meta;
  }

  createEmployeeCopy(): Employee {
    const response: Employee = new Employee();
    response.id = JSON.parse(JSON.stringify(this.employee.id));
    response.organizationalUnitId = JSON.parse(JSON.stringify(this.employee.organizationalUnitId));
    response.organizationalUnitName = JSON.parse(JSON.stringify(this.employee.organizationalUnitName));
    response.metadatas = JSON.parse(JSON.stringify(this.employee.metadatas));
    response.containerTypeId = JSON.parse(JSON.stringify(this.employee.containerTypeId));
    response.nickName = JSON.parse(JSON.stringify(this.employee.nickName));
    response.delegatedSystemId = JSON.parse(JSON.stringify(this.employee.delegatedSystemId));
    response.hasActiveCertificate = JSON.parse(JSON.stringify(this.employee.hasActiveCertificate));
    response.preview = JSON.parse(JSON.stringify(this.employee.preview));
    return response;

  }

  setAdittionalMetadatas() {
    this.adittionalsMetadatas = this.employee.customMetadatas();
    // Agrego los metadatos adicionales que no esten completados.
    this.containerType.metadata.forEach(m => {
      if (!this.employee.metadatas.find(meta => meta.metadataSystemName === m.metadataSystemName) && !this.employee.fixedMedatadas.find(f => f.value === m.metadataSystemName)) {
        this.adittionalsMetadatas.push(JSON.parse(JSON.stringify(m)));
        this.employee.metadatas.push(JSON.parse(JSON.stringify(m)));
      }
    });
    this.adittionalsMetadatas.forEach(meta => {
      meta.position = this.containerType.metadata.find(m => meta.metadataSystemName === m.metadataSystemName).position;
    });
    this.adittionalsMetadatas = this.adittionalsMetadatas.sort((a, b) => a.position > b.position ? 1 : -1);
  }

  updateOptionValues() {
    this.containerTypeService.cleanStorageContainer(this.employee.organizationalUnitId.toString());
    this.containerType = null;
    this.refresh();
  }

  showSharePerson() {
    const dialogRef = this.dialog.open(SharePersonDialogComponent, {
      data: this.employee,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
    });
  }

  hardDeleteEmployee() {
    const bodyText = `¡Estás por eliminar un ${this.isCandidate ? 'candidato' : 'empleado'}!`
    const parameters: MessageAtributtes = {
      bodyText: bodyText,
      infoText: 'Una vez realizada esta operación no podrá deshacerse.',
      type: MessageType.CaptchaNumbers
    };

    const t = this._bottomSheet.open(GenericBottomSheetComponent, { data: parameters, disableClose: true });
    t.instance.close.subscribe(s => {
      if (s) {
        this.loading = true;
        this.employeeService.hardDeleteEmployee(+this.employee.id, +this.employee.userId,this.isCandidate).toPromise()
          .then(() => {
            this.msjService.showInfo(`El ${this.isCandidate ? 'candidato' : 'empleado'} fue eliminado`);
            this.refreshGrid.emit(true);
          })
          .catch(err => this.msjService.showError(err))
          .then(() => this.loading = false);
      }
    });
  }

  onlyisLeaveApprove() {
    if (!localStorage.getItem("roles")) {
      return false;
    }
    const roles = localStorage.getItem("roles").split(",");
   return roles.length == 1 && this.isLeaveAprov;
  }
}
