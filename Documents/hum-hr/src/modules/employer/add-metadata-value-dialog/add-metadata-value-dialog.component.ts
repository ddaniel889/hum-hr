import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UntypedFormGroup, UntypedFormControl, UntypedFormBuilder, Validators } from '@angular/forms';
import { MessageService } from '../../shared/errorHandler/message.service';
import { EmployerService } from '../../shared/services/employer.service';
import { MetadataDocType } from '../../shared/models/MetadataDocType.model';
import { AddMetadataItem } from '../../shared/models/metadata.model';
import { OrganizationalUnitService } from '../../shared/services/organizational-unit.service';

@Component({
  selector: 'app-add-metadata-value-dialog',
  templateUrl: './add-metadata-value-dialog.component.html',
  styles: [
  ]
})
export class AddMetadataValueDialogComponent implements OnInit {
  valueFormGroup: UntypedFormGroup;
  valueFrmCtrl: UntypedFormControl;
  clickOnce = false;
  constructor(private dialogRef: MatDialogRef<AddMetadataValueDialogComponent>,
    private _formBuilder: UntypedFormBuilder,
    private messageService: MessageService,
    private employerService: EmployerService,
    private organizationalUnitService: OrganizationalUnitService,
    @Inject(MAT_DIALOG_DATA) public data: MetadataDocType
  ) { }

  ngOnInit(): void {
    this.valueFormGroup = this._formBuilder.group({});
    this.valueFrmCtrl = new UntypedFormControl('', Validators.required);
    this.valueFormGroup.addControl('valueFrmCtrl', this.valueFrmCtrl);
  }

  save() {
    const item: AddMetadataItem = {
      metadataId: this.data.metadataId,
      key: this.valueFrmCtrl.value,
      description: this.valueFrmCtrl.value,
      currentOuId: this.organizationalUnitService.getCurrentOrChildOU().id
    };
    this.clickOnce = true;
    this.employerService.addMetadataValue(item).toPromise().then(
      result => {
        this.clickOnce = false;
        this.dialogRef.close(item);
      },
      error => {
        this.messageService.showError(error);
        this.clickOnce = false;
        this.cancel();
      }
    );
  }
  cancel() {
    this.dialogRef.close();
  }
}







