import { Component, Inject, OnInit } from '@angular/core';
import { OrganizationalUnitService } from '../../shared/services/organizational-unit.service';
import { MessageService } from "../../shared/errorHandler/message.service";
import { Employee, OrganizationalUnit } from '../../shared/models';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UINotificationDTO } from '../../shared/models/ui-notifications.model';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { SharePersonResponseDialogComponent } from '../share-person-response-dialog/share-person-response-dialog.component';
import { EmployeeService } from '../../shared/services/employee.service';


@Component({
  selector: 'app-share-person-dialog',
  templateUrl: './share-person-dialog.component.html',
  styles: []
})
export class SharePersonDialogComponent implements OnInit {
  organizationalUnits: OrganizationalUnit[];
  organizationalUnitsFromUserLogged: OrganizationalUnit[];
  sharePersonForm: UntypedFormGroup;
  loading = false;
  constructor(private dialogRef: MatDialogRef<SharePersonDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Employee,
    private organizationalUnitService: OrganizationalUnitService,
    private msjService: MessageService,
    private _formBuilder: UntypedFormBuilder,
    public dialog: MatDialog,
    public employeeServices: EmployeeService
  ) { }

  ngOnInit() {
    this.loading = true;
    this.sharePersonForm = this._formBuilder.group({
      organizationalUnit: ['', Validators.required]
    });
    this.organizationalUnitService.getOuRootTree().toPromise()
      .then(ous => {
        this.loading = false;
        this.organizationalUnits = ous.filter(o => o.isRoot == false && o.id != this.data.organizationalUnitId);
        if (this.organizationalUnits.length == 1) {
          this.sharePersonForm.get('organizationalUnit').setValue(this.organizationalUnits[0].id);
        }
      },
        err => this.msjService.showError(err)
      );
    this.organizationalUnitService.getTreeInMemory().then(
      ous => {
        this.organizationalUnitsFromUserLogged = ous;
      }
    );
  }

  sharePerson() {
    this.loading = true;
    const entity = {
      personId: +this.data.id,
      ouIdTo: +this.sharePersonForm.value.organizationalUnit,
      ouNameFrom: this.data.organizationalUnitName,
      firstName: this.data.name,
      lastName: this.data.lastName
    };
    const notif: UINotificationDTO = {
      code: 'SP',
      creationDate: new Date(),
      entity: JSON.stringify(entity)
    };

    this.employeeServices.sharePerson(notif).toPromise().then(
      data => {
        if (data.userId != 0) {
          this.addPerson(data);
        } else {
          this.msjService.showInfo('Se compartieron con éxito los datos del legajo');
          this.closeSharePerson();
          this.loading = false;
        }
      },
      error => {
        this.loading = false;
        this.msjService.showError(error);
      }
    );
  }

  closeSharePerson() {
    this.dialogRef.close();
  }

  private addPerson(employee: Employee) {
    employee.organizationalUnitId = +this.sharePersonForm.value.organizationalUnit;
    const dialogRef = this.dialog.open(SharePersonResponseDialogComponent, {
      data: employee
    });
    dialogRef.afterClosed().subscribe(() => {
      this.closeSharePerson();
      this.loading = false;
    });
  }
}
