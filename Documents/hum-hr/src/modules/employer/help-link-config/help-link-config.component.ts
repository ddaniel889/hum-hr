import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MessageService } from '../../shared/errorHandler/message.service';
import { OrganizationalUnit } from '../../shared/models';
import { HelpLinkConfig } from '../../shared/models/help-link.model';
import { FormValidationservice } from '../../shared/services/formValidations.service';
import { CustomConfigService } from '../../shared/services/custom-config.service';

@Component({
  selector: 'app-help-link-config',
  templateUrl: './help-link-config.component.html',
  styles: [
  ]
})
export class HelpLinkConfigComponent implements OnInit {
  @Output() openDetailChanged = new EventEmitter<boolean>();
  @Input() ouSelected: OrganizationalUnit;
  loading = false;
  showDetails = false;
  ouHelpLinkConfigForm: UntypedFormGroup;
  ouHelpLinkConfigModel = new HelpLinkConfig();


  constructor(
    private ouHelpLinkConfigService: CustomConfigService,
    private _formBuilder: UntypedFormBuilder,
    private msjService: MessageService,
  ) {
  }

  ngOnInit(): void {
    this.loading = true;
    this.ouHelpLinkConfigService.getByOuId(this.ouSelected.id).toPromise().then(
      result => {
        this.ouHelpLinkConfigModel = result;
        this.initFormOuHelpLinkConfig();
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


  private initFormOuHelpLinkConfig() {
    const urlRegex = /(http(s)?):\/\//;
    this.ouHelpLinkConfigForm = this._formBuilder.group({
      url: [this.ouHelpLinkConfigModel.helpLink, [Validators.required, Validators.pattern(urlRegex)]]
    });
  }

  save() {
    if (this.ouHelpLinkConfigForm.invalid) {
      return;
    }
    this.ouHelpLinkConfigModel.OrganizationalUnitId = this.ouSelected.id;
    this.ouHelpLinkConfigModel.helpLink = this.ouHelpLinkConfigForm.value.url;

    this.ouHelpLinkConfigService.create(this.ouHelpLinkConfigModel).toPromise().then(
      result => {
        this.ouHelpLinkConfigModel = result;
        this.initFormOuHelpLinkConfig();
        this.msjService.showInfo('Configuración guardada con éxito');
      },
      error => {
        this.msjService.showError(error);
      }
    );
  }

}
