import { Component, Inject } from "@angular/core";
import { LeaveService } from "../../shared/services/leave.service";
import { LeaveTimeLine } from "../../shared/models/times-lines.model";
import { FormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { ConfigLeaveEmployee } from "../../shared/models/Employee/config-leave-employee.model";
import { ConfigLeaveOu } from "../../shared/models/Employee/config-leave-ou.model";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";


@Component({
  selector: "app-add-dialog-time-lines",
  templateUrl: "./add-dialog-time-lines.components.html",
  styles: []
})
export class AddTimeLineDialogComponent {
  menuFormLeaveTimeLine: UntypedFormGroup;
  isLoading = false;
  StartDate: UntypedFormControl;
  EndDate: UntypedFormControl;
  configLeave: ConfigLeaveEmployee;
  configOu: ConfigLeaveOu[];
  fechaInicio: Date;
  HastaMinDate: Date;
  OrganizationalUnitId: number = 0;
  isActive = false;
  MinDate: Date;
  MaxDate: Date;
  description:string;
  timeLine:LeaveTimeLine;
  labelDesc= "Descripción"
  error="";
  loading = false;
  selectedYear: ConfigLeaveOu;
  constructor(@Inject(MAT_DIALOG_DATA) public data: {selectedYear: ConfigLeaveOu},
    private dialogRef: MatDialogRef<AddTimeLineDialogComponent>,
    private _formBuilder: FormBuilder,
    private readonly leaveService: LeaveService
  ) {

    this.menuFormLeaveTimeLine = this._formBuilder.group({
      StartDate: [""],
      EndDate: [""],
      description: ["", Validators.pattern(/^[a-zA-Z0-9\/\-áéíóúüñ\s]*$/)]
    });
    this.selectedYear = this.data.selectedYear;

  }

  getYear(date: Date): string {
    return new Date(date).getFullYear().toString();
  }

  setHastaMinDate(event: any) {
    this.menuFormLeaveTimeLine.patchValue({
      EndDate: ""
    });
    this.HastaMinDate = event.value;
  }

  save()
  {
    this.loading = true;
    const { StartDate, EndDate,description } = this.menuFormLeaveTimeLine.value;
    const leaveTimeLine: LeaveTimeLine =
    {
          configLeaveOuId: this.data.selectedYear.id.toString(),
          description: description,
          dateFrom:StartDate,
          dateTo:EndDate,
          enabled:true
    };

    this.leaveService.newTimeLine(leaveTimeLine).subscribe(()=>{
      this.loading = false;
      this.dialogRef.close(true);},
      error => {
        this.loading = false;
        this.dialogRef.close(false);;
      });
    }

    ButtonEnable()
    {
      const { StartDate, EndDate, description } = this.menuFormLeaveTimeLine.value;
      return (((StartDate === "" || StartDate === null) || (EndDate === "" || EndDate === null) ||  (description === "" || description === undefined)) || this.menuFormLeaveTimeLine.controls.description.errors != null);
    }

    validateDescription()
   {
    if (this.menuFormLeaveTimeLine.controls.description.errors != null)
      {
        this.error = "Campo Inválido";
        this.labelDesc = "";
        this.menuFormLeaveTimeLine.controls.description.markAsDirty();
      }
      else{

        this.error = "";
        this.labelDesc = "Descripción";
        this.menuFormLeaveTimeLine.controls.description.markAsPending();
      }
    }
}
