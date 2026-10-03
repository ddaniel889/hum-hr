import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, UntypedFormGroup } from '@angular/forms';
import { LeaveService } from '../../shared/services/leave.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Holiday } from '../../shared/models/calendar-holidays';
import { MessageService } from '../../shared/errorHandler/message.service';

@Component({
  selector: 'app-add-dialog-holiday',
  templateUrl: './add-dialog-holiday.component.html',
  styleUrls: ['./add-dialog-holicady.component.scss']
})
export class AddHolidayDialogComponent implements OnInit {
  menuFormHoliday: UntypedFormGroup;
  tiposDeFeriados = ['Nacional', 'Local','Actividad', 'Otro'];
  error = '';
  MinDate: Date;
  MaxDate: Date;
  HastaMinDate: Date;
  loading= false;
  holiday: Holiday;
  holidayYear: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { holiday: Holiday; year: string },
    private dialogRef: MatDialogRef<AddHolidayDialogComponent>,
    private _formBuilder: FormBuilder,
    private leaveService: LeaveService,
    private msjService: MessageService
  ) {
    this.menuFormHoliday = this._formBuilder.group({
      TipoFeriado: [""],
      description: [""],
      DateFeriado: [""],
      EffectiveDate: [""],
      state: [true],
    });

    this.holiday = this.data.holiday;
    this.holidayYear = this.data.year;
  }

  ngOnInit(): void {
    if(this.holiday.id != undefined)
    {
      this.menuFormHoliday.patchValue({
        TipoFeriado:this.holiday.holidayType,
        description: this.holiday.description,
        DateFeriado: this.holiday.holidayDate,
        EffectiveDate: this.holiday.effectiveHolidayDate,
        state: this.holiday.state
      })
      this.tiposDeFeriados = this.tiposDeFeriados.filter(x => x != this.holiday.holidayType)
    }
  }

  save(){
    this.loading = true;
    const addHoliday: Holiday = {
      holidayType: this.menuFormHoliday.value.TipoFeriado,
      description: this.menuFormHoliday.value.description,
      holidayDate: this.menuFormHoliday.value.DateFeriado,
      effectiveHolidayDate: this.menuFormHoliday.value.EffectiveDate,
      state: this.menuFormHoliday.value.state,
      configLeaveOuId: this.holiday.configLeaveOuId,
      id:this.holiday.id
    }
    if(addHoliday.id == undefined)
    {
      this.leaveService.uploadHoliday(addHoliday).subscribe(()=>{
        this.loading = false;
        this.dialogRef.close(true);
        this.msjService.showInfo("Feriado agregado correctamente.");
      }, (error) => {
        this.msjService.showError("Ha fallado al agregar feriado.");
      })
    }
    else{
    this.leaveService.updateHoliday(addHoliday).subscribe(()=>{
      this.loading = false;
      this.dialogRef.close(true);
      this.msjService.showInfo("Feriado actualizado correctamente.");
    }, (error) => {
      this.msjService.showError("Ha fallado al actualizar feriado.");
    })
}
  }
  setEffectiveDate(event: any)
  {
      let fecha = new Date(event.value);
      this.menuFormHoliday.patchValue({
        EffectiveDate: new Date(fecha.getFullYear(),fecha.getMonth(),fecha.getDate())
      });
  }

  yearFilter = (d: Date): boolean => {
    if (d.getFullYear().toString() !== this.holidayYear) {
      return false;
    }
    return true;
  };

  disabledbutton()
  {
    const { TipoFeriado, description, DateFeriado, EffectiveDate } = this.menuFormHoliday.value;
    if(TipoFeriado == '' || description == '' || DateFeriado == '' || EffectiveDate == ''){
      return true;
    }
    else
   {
    return false;
   }

  }
}
