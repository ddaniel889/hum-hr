import { Component, OnInit, Inject } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, FormControl } from '@angular/forms';
import { ContainerType } from '../../shared/models/container-type.model';
import { ContainerTypeService } from '../../shared/services/container-type.service.';
import { OrganizationalUnitService } from '../../shared/services/organizational-unit.service';
import { MessageService } from '../../shared/errorHandler/message.service';
import { EmployeeMetadata } from '../../shared/models/employee-metadata.model';
import { Candidate } from '../../shared/models/Employee/candidate.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CandidateService } from '../../shared/services/candidate.service';
import { PromoteCandidate } from '../../shared/models/Employee/promote-candidate.model';
import { Employee } from '../../shared/models/Employee/employee.model';

@Component({
  selector: 'app-candidate-promotion',
  templateUrl: './candidate-promotion.component.html',
  styles: []
})
export class CandidatePromotionComponent implements OnInit {
  promotionForm: UntypedFormGroup;
  promotedCandidate: PromoteCandidate;
  clickOnce = false;
  loading = false;
  useSaml = false;
  CandidateType: ContainerType;
  EmployeeType: ContainerType;
  metadatasToFill: EmployeeMetadata[] = [];
  
  constructor (@Inject(MAT_DIALOG_DATA) public candidate: Candidate,
              private dialogRef: MatDialogRef<CandidatePromotionComponent>,
              private organizationalUnitService: OrganizationalUnitService,
              private msjService: MessageService,
              private _formBuilder: UntypedFormBuilder,
              private containerTypeService: ContainerTypeService,
              private candidateSvc: CandidateService) { }

  ngOnInit() {
    this.loading = true;
    const loadings = [];
    
    this.useSaml = this.organizationalUnitService.getCurrentOrChildOU().useSaml;
    this.promotionForm = this._formBuilder.group({});

    this.promotedCandidate = new PromoteCandidate(Number.parseInt(this.candidate.id));
    this.promotedCandidate.DocumentStatistics = this.candidate.documentStateProgress;

    loadings.push(this.containerTypeService.getCandidateContainerType(this.organizationalUnitService.getCurrentOrChildOU().id.toString()).toPromise());
    loadings.push(this.containerTypeService.getEmployeeContainerType(this.organizationalUnitService.getCurrentOrChildOU().id.toString()).toPromise());
    Promise.all(loadings)
    .then(res => {
      this.CandidateType = res[0];
      this.EmployeeType = res[1];
      this.promotedCandidate.containerTypeId = this.EmployeeType.id;

      // Obtengo los metadatos que tengo qeu llenar.
      this.metadatasToFill =  this.getMetadatas();
      
      // Si la empresa usa SAML le agrego el usuario
      if (this.useSaml) {
        this.promotionForm.addControl('nickNameFrmCtrl', this._formBuilder.control(''));
      }
      this.loading = false;
    })
    .catch(err => this.msjService.showError(err));
  }

  save() {
    if (this.promotionForm.invalid) {
        this.msjService.showError('CPPAPIV001');
        return;
    }

    this.clickOnce = true;

    if (this.useSaml) {
      this.promotedCandidate.delegatedSystemId = this.promotionForm.controls.nickNameFrmCtrl.value;
    }

    this.candidateSvc.promoteCandidate(this.promotedCandidate).toPromise()
        .then(result => {
          this.clickOnce = false;
          this.msjService.showInfo('Felicitaciones fue promovido a empleado');
          this.dialogRef.close();
        })
        .catch(err => {
          this.msjService.showError(err);
          this.clickOnce = false;
        });
  }

  cancel() {
    if (this.clickOnce) return; 
    this.dialogRef.close();
  }

  setMetadatasValuesCustomContro(ev: any) {
    this.promotedCandidate.setMetadataValue(ev.metadataSystemName, ev.metadataValue);
    this.promotionForm.controls[ev.metadataSystemName].setValue(ev.metadataValue);
  }

  getMetadatas(): EmployeeMetadata[] {
    const metas = this.EmployeeType.metadata.filter(m => !this.CandidateType.metadata.find(a => a.metadataSystemName === m.metadataSystemName) && m.metadataSystemName !== Employee.fechaActivoSystemName && m.metadataSystemName !== Employee.fechaInactivoSystemName);
    metas.forEach(meta => {
      // Creo el FormControl
      const val = [];

      if (meta.metadataSystemName === Employee.nroLegSystemName) {
        meta.isRequired = true;
      }

      if (meta.isRequired) {
        val.push(Validators.required);
      }

      if (meta.metadataType === 'email') {
        val.push(Validators.email);
      }

      if (meta.metadataType === 'period') {
        val.push(Validators.pattern(meta.periodPattern));
      }

      this.promotionForm.addControl(meta.metadataSystemName, this._formBuilder.control('', val));
    });

    return metas;
  }
}
