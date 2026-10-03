import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UntypedFormGroup, UntypedFormControl, UntypedFormBuilder, Validators } from '@angular/forms';
import { MessageService } from '../../shared/errorHandler/message.service';
import { EmployerService } from '../../shared/services/employer.service';
import { MetadataDocType } from '../../shared/models/MetadataDocType.model';
import { AddMetadataItem } from '../../shared/models/metadata.model';
import { GenericBottomSheetComponent } from '../../shared/generic-bottom-sheet/generic-bottom-sheet.component';
import { MessageAtributtes, MessageType } from '../../shared/models/message-types.model';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { OrganizationalUnitService } from '../../shared/services/organizational-unit.service';

@Component({
  selector: 'app-edit-metadata-value-dialog',
  templateUrl: './edit-metadata-value-dialog.component.html',
  styles: [
  ]
})
export class EditMetadataValueDialogComponent implements OnInit {
  valueFormGroup: UntypedFormGroup;
  valueFrmCtrl: UntypedFormControl;
  clickOnce = false;
  constructor(private dialogRef: MatDialogRef<EditMetadataValueDialogComponent>,
    private _formBuilder: UntypedFormBuilder,
    private messageService: MessageService,
    private employerService: EmployerService,
    private _bottomSheet: MatBottomSheet,
    private organizationalUnitService: OrganizationalUnitService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.valueFormGroup = this._formBuilder.group({});
    this.valueFrmCtrl = new UntypedFormControl('', Validators.required);
    this.valueFormGroup.addControl('valueFrmCtrl', this.valueFrmCtrl);
  }

  save() {

    const parameters: MessageAtributtes = {
      bodyText: 'Editar metadato',
      infoText: '¿Esta seguro que desea modificar el valor de la descripción?',
      type: MessageType.OkCancel
    };

    const t = this._bottomSheet.open(GenericBottomSheetComponent, { data: parameters, disableClose: true });
    t.instance.close.subscribe((response: boolean) => {
      if (response) {
        const item: AddMetadataItem = {
          metadataId: this.data.metadataDef.metadataId,
          key: this.data.editValue.value,
          description: this.valueFrmCtrl.value,
          currentOuId: this.organizationalUnitService.getCurrentOrChildOU().id
        };
        this.clickOnce = true;
        this.employerService.editMetadataValue(item).toPromise().then(
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
    });


  }

  cancel() {
    this.dialogRef.close();
  }
}







