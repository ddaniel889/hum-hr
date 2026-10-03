import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AppConfig } from 'src/app/app.config';
import { FileDocumentSignMassiveDialogData } from '../models/file-document-sign-massive-dialog-data.model';
import { ContainerTypeService } from '../services/container-type.service.';
import { ContainerType } from '../models';
import { OrganizationalUnitService } from '../services/organizational-unit.service';
import { AuthService } from '../auth/auth.service';
import { MessageService } from '../errorHandler/message.service';
import { UiNotificationsService } from '../services/ui-notifications.service';

@Component({
  selector: 'app-file-document-sign-massive-dialog',
  templateUrl: './file-document-sign-massive-dialog.component.html',
  styles: []
})
export class FileDocumentSignMassiveDialogComponent implements OnInit {
  displayedColumns: string[] = ['organizationalUnitName', 'documentationName', 'employeeFirstName', 'employeeLastName', 'employeeFile', 'employeeLegalId'];
  showSigning = false;
  showTokenInfo = false;
  urlHelp: string;
  showCloseDialog = true;
  containerType: ContainerType;
  ouId: string;

  constructor(@Inject(MAT_DIALOG_DATA) public data: FileDocumentSignMassiveDialogData,
    private dialogRef: MatDialogRef<FileDocumentSignMassiveDialogComponent>,
    private containerTypeService: ContainerTypeService,
    private organizationalUnitService: OrganizationalUnitService,
    private authService: AuthService,
    private msjService: MessageService,
    private uiNotificationsService: UiNotificationsService
  ) {
    this.urlHelp = AppConfig.settings.custom.employerHelpUrl;
  }

  ngOnInit() {
    if (this.data?.organizationalUnitId) {
      this.ouId = this.data?.organizationalUnitId.toString();
    } else {
      this.ouId = this.organizationalUnitService.getCurrentOrChildOU() ?
        this.organizationalUnitService.getCurrentOrChildOU().id.toString() :
        this.authService.getOrganizationId();

    }
    this.containerTypeService
      .getContainerType(this.ouId)
      .toPromise()
      .then(containerType => {
        this.containerType = containerType;
      },
        err => {
          this.msjService.showError(err);
          this.closeDialog();
        }
      );
  }

  signingStart(event) {
    this.showCloseDialog = !event;
  }

  finishSigning(event) {
    if (event === true || event.value === true) {
      this.dialogRef.close(event);
      this.showTokenInfo = false;
    } else {
      // Si termino de firmar pero no esta finished quiere decir que es un firmador externo.
      this.showTokenInfo = true;
      this.showSigning = true;
      this.showCloseDialog = true;
    }
  }

  closeDialog() {
    this.uiNotificationsService.refreshNotifiationProcess(true, false);
    this.dialogRef.close(false);
    this.showSigning = false;
  }
}
