import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, FormControl, UntypedFormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MessageService } from '../../shared/errorHandler/message.service';
import { OrganizationalUnit } from '../../shared/models';
import { OUEmailConfigDTO } from '../../shared/models/email.model';
import { OrganizationalUnitEmailConfigService } from '../../shared/services/email-config.service';
import { FormValidationservice } from '../../shared/services/formValidations.service';

@Component({
  selector: 'app-email-config',
  templateUrl: './email-config.component.html',
  styles: [
  ]
})
export class EmailConfigComponent implements OnInit {
  @Output() openDetailChanged = new EventEmitter<boolean>();
  @Input() ouSelected: OrganizationalUnit;
  loading = false;
  showDetails = false;
  ouEmailConfigForm: UntypedFormGroup;
  ouEmailConfigModel = new OUEmailConfigDTO();
  formValidations = [];

  constructor(
    private ouEmailConfigService: OrganizationalUnitEmailConfigService,
    private _formBuilder: UntypedFormBuilder,
    private msjService: MessageService,
    private formValidationService: FormValidationservice
  ) {
    this.formValidations = [Validators.required, Validators.minLength(3), this.formValidationService.whitespace];
 
  }

  ngOnInit(): void {
    this.loading = true;
    this.ouEmailConfigService.getByOuId(this.ouSelected.id).toPromise().then(
      result => {
        this.ouEmailConfigModel = result;
        this.initFormOuEmailConfig();
        this.loading = false;
      },
      error => {
        this.msjService.showError(error);
      }
    );
  }

  changeDetails() {
    this.showDetails = !this.showDetails;
    this.openDetailChanged.emit(this.showDetails);
  }

  private initFormOuEmailConfig() {
    this.ouEmailConfigForm = this._formBuilder.group({
      productName: [this.ouEmailConfigModel.productName, this.formValidations],
      signature: [this.ouEmailConfigModel.signature, this.formValidations],
      imgLogo: [this.ouEmailConfigModel.imgLogo],
      imgBkg: [this.ouEmailConfigModel.imgBkg]
    });
  }

  save() {
    if (this.ouEmailConfigForm.invalid) {
      return;
    }
    this.ouEmailConfigModel.organizationalUnitId = this.ouSelected.id;
    this.ouEmailConfigModel.productName = this.ouEmailConfigForm.value.productName;
    this.ouEmailConfigModel.signature = this.ouEmailConfigForm.value.signature;
    this.ouEmailConfigModel.imgLogo = this.ouEmailConfigForm.value.imgLogo;
    this.ouEmailConfigModel.imgBkg = this.ouEmailConfigForm.value.imgBkg;

    this.ouEmailConfigService.create(this.ouEmailConfigModel).toPromise().then(
      result => {
        this.ouEmailConfigModel = result;
        this.initFormOuEmailConfig();
        this.msjService.showInfo('Configuración guardada con éxito');
      },
      error => {
        this.msjService.showError(error);
      }
    )
  }
}
