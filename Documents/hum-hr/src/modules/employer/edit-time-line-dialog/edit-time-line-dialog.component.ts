import { Component, Inject, Input, OnInit, SimpleChanges, ViewChild } from "@angular/core";
import { LeaveService } from "../../shared/services/leave.service";
import { EmployeeLeaveService } from "../../shared/services/employee-leave-requests.service";
import { LeaveTimeLine } from "../../shared/models/times-lines.model";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { ConfigLeaveOu } from "../../shared/models/Employee/config-leave-ou.model";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { EditTimeLineDialogModule } from "./edit-time-line-dialog.module";


@Component({
  selector: "app-edit-time-line-dialog",
  templateUrl: "./edit-time-line-dialog.component.html",
  styles: []
})
export class EditTimeLineDialogComponent implements OnInit {
  isLoading = false;
  StartDate: UntypedFormControl;
  EndDate: UntypedFormControl;
  configOu: ConfigLeaveOu = <ConfigLeaveOu>{};
  fechaInicio: Date;
  HastaMinDate: Date;
  MinDate: Date;
  MaxDate: Date;
  periods: ConfigLeaveOu[]=[];
  currentOuid:number;
  periodoid:string;
  description:string;
  labelDesc= "Descripción"
  error="";
  loading=true;
  menuFormLeaveTimeLine = this._formBuilder.group({
  StartDate: [""],
  EndDate: [""],
  description: ["", Validators.pattern(/^[a-zA-Z0-9\/\-áéíóúüñ\s]*$/)],
  periodo:[""],
  activo:[true]
});

  constructor(@Inject(MAT_DIALOG_DATA) public leaveTimeLine: LeaveTimeLine,
    private dialogRef: MatDialogRef<EditTimeLineDialogComponent>,
    private _formBuilder: UntypedFormBuilder,
    private leaveService: LeaveService,
    private configleaveservice: EmployeeLeaveService

  ) {}



  ngOnInit(): void {
    this.configleaveservice.getonfigLeaveOUById(Number.parseInt(this.leaveTimeLine.configLeaveOuId)).toPromise().then(
      data => {
        this.configOu = data;
        this.menuFormLeaveTimeLine.patchValue({
          StartDate: this.newDate(this.leaveTimeLine.dateFrom),
          EndDate: this.newDate(this.leaveTimeLine.dateTo),
          periodo: this.extractYear(this.configOu.description),
          description: this.leaveTimeLine.description,
          activo: this.leaveTimeLine.enabled
        });
          this.loading= false;
          this.MinDate=this.newDate(this.leaveTimeLine.dateFrom);
          this.MaxDate=this.newDate(this.leaveTimeLine.dateFrom);
          this.HastaMinDate = this.newDate(this.leaveTimeLine.dateTo);
      },
      err =>{this.loading= false;}
    )
  }
   save()
  {
    this.loading = true;
    const { StartDate, EndDate, description, activo, periodo } = this.menuFormLeaveTimeLine.value;
    this.leaveTimeLine.description = description;
    this.leaveTimeLine.dateFrom = StartDate;
    this.leaveTimeLine.dateTo = EndDate;
    this.leaveTimeLine.enabled = activo;

    this.leaveService.modifyTimeLine(this.leaveTimeLine).subscribe(()=>{
      this.loading = false;
      this.dialogRef.close(true);},
      error => {
        this.loading = false;
        this.dialogRef.close(error.description);;
      });
    }

    ButtonEnable()
    {
      const { StartDate, EndDate, description, periodoid } = this.menuFormLeaveTimeLine.value;
      return ((StartDate === "" || StartDate === null) || (EndDate === "" || EndDate === null) || ((description === "" || description === undefined) || this.menuFormLeaveTimeLine.controls.description.errors != null));
    }

    getDay(date: string)
    {
      return Number.parseInt(date.split('/')[0]);
    }
    getMonth(date: string)
    {
      return Number.parseInt(date.split('/')[1]);
    }
    getYear(date: string)
    {
      return Number.parseInt(date.split('/')[2]);
    }

     newDate(stringdate: string)
    {
      return new Date(
        this.getYear(stringdate),
        this.getMonth(stringdate)-1,
        this.getDay(stringdate)
      )
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

    extractYear(input: string): string {
      try {
        const parts = input.split(':');
        if (parts.length < 2) {
          return '';
        }
        const yearPart = parts[1].trim();
        const year = yearPart.substring(0,4);
        return year;
      } catch (error) {
        return '';
      }
    }
}
