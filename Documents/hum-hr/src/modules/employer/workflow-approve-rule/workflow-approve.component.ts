import { Component, Input, OnInit } from '@angular/core';
import { ConfigLeaveOu } from '../../shared/models/Employee/config-leave-ou.model';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MessageService } from '../../shared/errorHandler/message.service';
import { LeaveService } from '../../shared/services/leave.service';
import { KeyValuePair } from '../../shared/models/Generics/ikeyValuePair.model';
import { MatBottomSheet } from "@angular/material/bottom-sheet";
import { GenericBottomSheetComponent } from '../../shared/generic-bottom-sheet/generic-bottom-sheet.component';
import { MessageType } from "../../shared/models/message-types.model";
import { EmployeeLeaveService } from '../../shared/services/employee-leave-requests.service';

@Component({
  selector: 'app-workflow-approve',
  templateUrl: './workflow-approve.component.html',
  styleUrls: ['./workflow-approve.component.scss']
})
export class WorkflowApproveComponent implements OnInit {
  @Input() configOu: ConfigLeaveOu[];
  workflowForm: UntypedFormGroup;
  workflowApproveType: KeyValuePair<number, string>[] = [
    { key: 2, value: 'Aprobación basada en RRHH' }, { key: 1, value: 'Aprobación opcional de JEFE y requerida de RRHH' }, { key: 3, value: 'Aprobación basada en JEFE' },{ key: 4, value: 'Aprobación requerida de JEFE y RRHH' }
  ];
  workflowInfo: KeyValuePair<number, string>[] = [
    { key: 2, value: 'RRHH gestiona todas las solicitudes de licencia por vacaciones de los empleados, realizando su aprobación o rechazo.' }, { key: 1, value: 'El Jefe valida las solicitudes de licencia por vacaciones de su Equipo pero siguen pendientes de aprobación por RRHH o realiza su rechazo sin intervención de RRHH.\n RRHH aprueba o rechaza las solicitudes validadas o no por el JEFE.' }, { key: 3, value: "El Jefe gestiona todas las solicitudes de licencia por vacaciones de su Equipo, realizando su aprobación o rechazo. \n RRHH aprueba o rechaza las solicitudes de empleados que no tienen asignado un JEFE." },{ key: 4, value: "El Jefe valida las solicitudes de licencia por vacaciones de su Equipo pero siguen pendientes de aprobación por RRHH o realiza su rechazo sin intervención de RRHH. \n RRHH aprueba o rechaza las solicitudes una vez validadas por el JEFE. También aprueba o rechaza las solicitudes de empleados que no tienen asignado un JEFE." }
  ];
  selectedWorkflow: KeyValuePair<number, string>;
  selectedWorkflowInfo: KeyValuePair<number, string>;
  loading: boolean = false;
  enableSubmitButton: boolean = false;
  showWorkflowInfo: boolean = false;

  constructor(
    private readonly _formsBuilder: UntypedFormBuilder,
    private readonly leaveService: LeaveService,
    private readonly configLeaveService: EmployeeLeaveService,
    private _bottomSheet: MatBottomSheet,
    private readonly msjService: MessageService
  ) {
    this.workflowForm = this._formsBuilder.group({
      workflowApproveType: [false, Validators.required]
    })
  }

  ngOnInit() {
    this.loadWorkflowApproveType();
  }

//  loadWorkflowApproveType(){
//    if(this.configOu.leaveTypeOu?.workflowApprove !== null){
//      this.selectedWorkflow = this.workflowApproveType.find(x => x.key == +this.configOu.leaveTypeOu?.workflowApprove.id);
//    }else{
//      this.selectedWorkflow = this.workflowApproveType[0];
//    }
//    this.updateInfoWorkflow();
//    this.workflowForm.patchValue({
//      workflowApproveType: this.selectedWorkflow["value"]
//    });
//  }

  loadWorkflowApproveType() {
    const firstConfigOu = this.configOu?.[0];

    if (firstConfigOu?.leaveTypeOu?.workflowApprove !== null) {
      this.selectedWorkflow = this.workflowApproveType.find(x => x.key == +firstConfigOu.leaveTypeOu.workflowApprove.id);
    } else {
      this.selectedWorkflow = this.workflowApproveType[0];
    }

    this.updateInfoWorkflow();

    this.workflowForm.patchValue({
      workflowApproveType: this.selectedWorkflow["value"]
    });
  }


  updateWorkflowValue(){
    this.selectedWorkflow = this.workflowApproveType.find(x => x.value == this.workflowForm.value.workflowApproveType);
    this.showWorkflowInfo = false;
    this.updateInfoWorkflow();
    this.enableSubmitButton = true;
  }

  updateInfoWorkflow(){
    this.selectedWorkflowInfo = this.workflowInfo.find(x => x.key == this.selectedWorkflow.key);
  }

  toggleInfo(){
    this.showWorkflowInfo = !this.showWorkflowInfo;
  }

  save(){
    if (this.configOu) {
      if(this.selectedWorkflow['key'] == 2){
        let parameters: any = {};
        parameters.bodyText = 'Al seleccionar este flujo de aprobación se eliminarán los jefes de equipo asociados a cada empleado.\n ¿Desea continuar?';
        parameters.type = MessageType.YesNo;
        const t = this._bottomSheet.open(GenericBottomSheetComponent, {data:parameters, disableClose: true });
                t.instance.close.subscribe((response: any) => {
                  if (response) {
                    this.loading = true;
                    const firstConfigOu = this.configOu?.[0];
                    const newLeaveConfigOu: ConfigLeaveOu = {
                      ...firstConfigOu,
                      leaveTypeOu: {
                        ...firstConfigOu.leaveTypeOu,
                        workflowApprove: {
                          id: this.selectedWorkflow.key,
                          description: this.selectedWorkflow.value
                        }
                      }
                    }
                    this.configLeaveService.setConfigLeave(newLeaveConfigOu)
                    .toPromise()
                    .then(
                      (result) => {
                        this.configOu = [result];
                        this.enableSubmitButton = false;
                        this.loading = false;
                        this.msjService.showInfo("Configuración guardada correctamente");
                      },
                      (error) => {
                          this.loading = false;
                          this.msjService.showError(error);
                        }
                      );
                  }else{
                    this.loadWorkflowApproveType();
                  }
                });
      } else{
        this.loading = true;
        const newLeaveConfigOu: ConfigLeaveOu = {
          ...this.configOu[0],
          leaveTypeOu: {
            ...this.configOu[0].leaveTypeOu,
            workflowApprove: {
              id: this.selectedWorkflow.key,
              description: this.selectedWorkflow.value
            }
          }
        };
        this.configLeaveService.setConfigLeave(newLeaveConfigOu)
        .toPromise()
        .then(
          (result) => {
            this.configOu = [result];
            this.enableSubmitButton = false;
            this.loading = false;
            this.msjService.showInfo("Configuración guardada correctamente");
          },
          (error) => {
              this.loading = false;
              this.msjService.showError(error);
            }
          );
      }
    }else{
      this.msjService.showError('Ha ocurrido un error');
    }

  }
}
