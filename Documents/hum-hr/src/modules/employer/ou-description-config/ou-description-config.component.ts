import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MessageService } from '../../shared/errorHandler/message.service';
import { OrganizationalUnit } from '../../shared/models';
import { OuDescriptionConfig } from '../../shared/models/ou-description.model';
import { CustomConfigService } from '../../shared/services/custom-config.service';

@Component({
  selector: 'app-ou-description-config',
  templateUrl: './ou-description-config.component.html',
  styles: [
  ]
})
export class OuDescriptionConfigComponent implements OnInit, OnChanges {
  @Output() openDetailChanged = new EventEmitter<boolean>();
  @Input() ouSelected: OrganizationalUnit;
  loading = false;
  showDetails = false;
  OuDescriptionConfigForm: UntypedFormGroup;
  OuDescriptionConfigModel = new OuDescriptionConfig();


  constructor(
    private customConfigService: CustomConfigService,
    private _formBuilder: UntypedFormBuilder,
    private msjService: MessageService,
  ) { }

  ngOnInit(): void {
    this.OuDescriptionConfigModel.description = this.ouSelected.description;
    this.initFormOuDescriptionConfig();
  }

  ngOnChanges(): void {
    this.reload();
  }

  save() {
    if (this.OuDescriptionConfigForm.invalid) {
      return;
    }
    this.OuDescriptionConfigModel.organizationalUnitId = this.ouSelected.id;
    this.OuDescriptionConfigModel.description = this.OuDescriptionConfigForm.value.description;

    this.customConfigService.saveDescription(this.OuDescriptionConfigModel).toPromise().then(
      result => {
        this.OuDescriptionConfigModel = result;
        this.initFormOuDescriptionConfig();
        this.msjService.showInfo('Configuración guardada con éxito');
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

  private initFormOuDescriptionConfig() {

    this.OuDescriptionConfigForm = this._formBuilder.group({
      description: [this.OuDescriptionConfigModel.description, [Validators.required]]
    });
  }

  private reload() {
    this.OuDescriptionConfigModel.description = this.ouSelected.description;
    this.initFormOuDescriptionConfig();
  }

}
