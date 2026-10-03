import { Component, Inject, OnInit, Output, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators, UntypedFormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EmployeeLeaveService } from '../../shared/services/employee-leave-requests.service';
import { ConfigLeaveEmployee } from '../../shared/models/Employee/config-leave-employee.model';
import { AdditionalDays } from '../../shared/models/Employee/additional-type.model';
import { LeaveRequestsFrom } from '../../shared/models/Employee/leave-requests-from.model';
import { MessageService } from '../../shared/errorHandler/message.service';
import { LeaveTimeLine } from '../../shared/models/times-lines.model';
import { LeaveService } from '../../shared/services/leave.service';
import { getKey, LeaveRules } from '../../shared/models/leave-rules.model';
import { MinLeaveRequestData } from '../../shared/models/Employee/min-leave-request';
import { Holiday } from '../../shared/models/calendar-holidays';
import { LeaveHolidayFind } from '../../shared/models/leave-request-find.model'; 



@Component({
  selector: 'app-add-leave-dialog',
  templateUrl: './add-leave-dialog.component.html',
  styles: []
})

export class AddLeaveDialogComponent implements OnInit {
  menuFormLeave: UntypedFormGroup;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: MinLeaveRequestData & { configLeaveEmployee: ConfigLeaveEmployee[] },
    private dialogRef: MatDialogRef<AddLeaveDialogComponent>,
    private _formBuilder: UntypedFormBuilder,
    private messageService: MessageService,
    private employeeLeaveService: EmployeeLeaveService,
    private leaveService: LeaveService
  ) {

    this.menuFormLeave = this._formBuilder.group({
      selectedMenuLeave: ["AddVacation", Validators.required]
    });

    this.durationFormLeave = this._formBuilder.group({
      StartDate: [""],
      EndDate: [""],
      DaysConsumed:["",[Validators.required,Validators.min(1)]]
    });

    this.daysFormLeave = this._formBuilder.group({
      DaysConsumed: ["", Validators.required]
    });
  }

  @Output()
  @ViewChild('stepper') stepper;

  isLoading = false;
  durationFormLeave: UntypedFormGroup;
  summaryFormLeave: UntypedFormGroup;
  daysFormLeave: UntypedFormGroup;
  summarySettlementFormLeave: UntypedFormGroup;
  selectedDays: UntypedFormControl;
  DaysConsumed: UntypedFormControl;
  StartDate: UntypedFormControl;
  EndDate: UntypedFormControl;
  selectedMenuLeave: any;
  leaveRequestsData: LeaveRequestsFrom;
  configLeaveEmployees: ConfigLeaveEmployee[];
  fechaInicio: Date;
  fechaFin: Date;
  daysRequestsNow: number;
  previousStep: number;
  leaveRequests: any;
  durationSave: any;
  daysRequests: any;
  employeeLeaveRequests: any;
  diasConsumidos: any;
  OrganizationalUnitId: number = 0;
  //mock para borrar
  AvailableDays = 0;
  AvailableDebth = 0;
  MinDate: Date;
  MaxDate: Date;
  timeslines: LeaveTimeLine[] = [];
  allTimeslines: LeaveTimeLine[] = [];
  holidays: Holiday[] = [];
  arrId:number[] = [];
  error: string="";
  daysNoAble: number[];
  rules: LeaveRules;
  fechaIni:Date;

  ngOnInit() {
    this.daysNoAble = [0,1,2,3,4,5,6];
    this.isLoading = true;

    this.configLeaveEmployees = this.data.configLeaveEmployee;
    if (this.configLeaveEmployees == null || this.configLeaveEmployees.length == 0) {
      this.messageService.showInfo("El empleado no posee configuración de vacaciones");
      this.dialogRef.close();
    }

    this.AvailableDays = 0;
    this.AvailableDebth = 0;
    const today = new Date();
    let configLeaveChecked = new Map<string, boolean>();
    for (const configLeaveEmployee of this.configLeaveEmployees) {
      if (configLeaveEmployee.configLeaveOu.enabled){
        configLeaveEmployee.configTimeLines.forEach(x => {
          x.dateTo = this.formatDateToDDMMYYYY(x.dateTo);
          const [dayTo, monthTo, yearTo] = x.dateTo.split('/');
          const toDate = new Date(+yearTo, +monthTo - 1, +dayTo);
          if(today < toDate){
            if(!configLeaveChecked.has(x.configLeaveOuId)){
              this.AvailableDays += configLeaveEmployee.baseDays + this.getDaysAdditional(configLeaveEmployee.additionalDays) - configLeaveEmployee.daysConsumed;
              configLeaveChecked.set(x.configLeaveOuId, true);
            }
            x.dateFrom = this.formatDateToDDMMYYYY(x.dateFrom);
            this.timeslines.push(x);
          }
          this.allTimeslines.push(x);
        })
      }
    }
    
   this.cargarHolidays()
    .then(() => {
    })
    .catch(err => this.messageService.showError(err));

    this.AvailableDebth = this.AvailableDays;
    this.arrId = this.mapConfigAproversIds(this.arrId, this.configLeaveEmployees[0])
    this.calendarToValidate(this.configLeaveEmployees[0].configLeaveOu.renewalMonthKey);
    this.leaveService.getWorkDays(this.configLeaveEmployees[0].configLeaveOu.leaveTypeOu.id).toPromise().then(res =>{
      if (res.workDays == null) {
        console.log("No se encontró días laborales de la Unidad Organizacional.");
      }

      if(res.workDays !== null)
        {
          res.workDays.forEach(w =>{
            switch (w) {
              case workdays.MONDAY: this.removeday(1);
                break;
                case workdays.TUESDAY: this.removeday(2);
                break;
                case workdays.WEDNESDAY:  this.removeday(3);
                break;
                case workdays.THURSDAY: this.removeday(4);
                break;
                case workdays.FRIDAY: this.removeday(5);
                break;
                case workdays.SATURDAY: this.removeday(6);
                break;
                case workdays.SUNDAY: this.removeday(0);
                break;
              default:
                break;
            }
          });
        }
        localStorage.setItem('daysNoAble', JSON.stringify(this.daysNoAble));
    });

    this.leaveService.getLeaveRule(this.configLeaveEmployees[0].configLeaveOu.leaveTypeOu.id).toPromise().then(rules =>{
      this.rules = rules;
      if (rules.id == 0) {
        console.log("No se encontró la reglas de la Unidad Organizacional.");
      }
      localStorage.setItem('rules', JSON.stringify(rules));
      localStorage.setItem('daystart', JSON.stringify(getKey(rules.leaveStartDay)));
    });

    localStorage.setItem('configLeavetimeslines', JSON.stringify(this.timeslines));
    localStorage.setItem('DayOfWeekAble', JSON.stringify(false));
    this.isLoading = false;
  }

    async cargarHolidays(){
    try {
      await this.obtenerHolidays(this.configLeaveEmployees);
    } catch (err) {
      this.messageService.showError(err);
    }
  }

  obtenerHolidays(configLeaveEmployees: any): Promise<void> {
    const param: LeaveHolidayFind = {
      ouId: configLeaveEmployees[0].configLeaveOu.organizationalUnitId,
      page: 1,
      itemperpage: null,
      active: true,
      type: null,
      textSearch: null
    };

    return new Promise<void>((resolve, reject) => {
      this.leaveService.postHolidaysByOuId(param).subscribe({
        next: (resp) => {
          this.holidays = resp?.values ?? [];
          localStorage.setItem('holydays', JSON.stringify(this.holidays));
          resolve();
        },
        error: (err) => {
          reject(err instanceof Error ? err : new Error(err?.message ?? String(err)));
        }
      });
    });
  }

  validateRequestsDays() {
    const { StartDate, EndDate, DaysConsumed } = this.durationFormLeave.value;
    return (StartDate === "" || EndDate === "" || DaysConsumed === "");
  }

  getDaysAdditional(additionalDays: AdditionalDays[]): number {
    let totalDays = 0;

    for (const day of additionalDays) {
      totalDays += day.days;
    }
    return totalDays;
  }

  goToSummaryVacation() {
    let validateRequestsDays = this.validateRequestsDays();
    if (!validateRequestsDays) {
      this.saveFormData();
     // this.getDaysRequests();
      if (this.daysRequestsNow > 0) {
        if (this.daysRequestsNow <= this.AvailableDays) {
          this.stepper.next();
        }
        else {
          this.messageService.showInfo('No puedes solicitar mas de ' + this.AvailableDays + ' día(s)');
        }
      }
      else if (this.daysRequestsNow < 0) {
        this.messageService.showInfo('La fecha de inicio debe ser anterior a la de fin');
      }
      else {
        this.messageService.showInfo('Las fechas no pueden ser iguales');
      }
    }
    else if(this.rules && this.AvailableDays > this.rules.leaveMinDays && this.durationFormLeave.controls.DaysConsumed.value < this.rules.leaveMinDays)
    {
      this.messageService.showInfo(`Por favor, los dÍas mÍnimos a solicitar son ${this.rules.leaveMinDays}`);
    }
    else{
    this.messageService.showInfo('Por favor, ingresa la duración de la solicitud');
    }
  }

  goToSummarySettlement() {
    this.saveFormData();
    const { DaysConsumed } = this.daysFormLeave.value;
    if (DaysConsumed > 0 && DaysConsumed !== undefined && DaysConsumed !== "") {
      if (DaysConsumed <= this.AvailableDebth) {
        this.stepper.next();
      }
      else {
        this.messageService.showInfo('No puedes solicitar mas de ' + this.AvailableDebth + ' día(s)');
      }
    }

    else {
      this.messageService.showInfo('Tenés que solicitar al menos 1 día a procesar');
    }
    this.durationFormLeave.controls.StartDate.markAsUntouched();
    this.durationFormLeave.controls.endDate.markAsUntouched();
  }

  closeDialog() {
    this.dialogRef.close();
  }

  getDaysRequests() {
    this.calcularDiferenciaEnDias(this.leaveRequestsData.StartDate, this.leaveRequestsData.EndDate);
  }

  calcularDiferenciaEnDias(startDate: Date, endDate: Date) {
    const fechaInicio = new Date(startDate);
    const fechaFin = new Date(endDate);
    const diferenciaEnMilisegundos = fechaFin.getTime() - fechaInicio.getTime();
    this.daysRequestsNow = Math.floor(diferenciaEnMilisegundos / (1000 * 60 * 60 * 24));
  }

  saveFormData() {
    const { StartDate, EndDate, DaysConsumed } = this.durationFormLeave.value;
    this.leaveRequestsData = this.buildLeaveRequestData(StartDate,EndDate,DaysConsumed);
    this.diasConsumidos = DaysConsumed;
    this.fechaInicio = StartDate;
    this.fechaFin = EndDate;
  }

  buildLeaveRequestData(StartDate:any, EndDate:any,DaysConsumed:number) {
    if(this.data.userId == undefined)
      {
        let leaveRequestsData :LeaveRequestsFrom = {
          StartDate: StartDate,
          EndDate: EndDate,
          DaysConsumed: Number(DaysConsumed),
          ConfigTimesLinesId: this.allTimeslines.map(x=> x.id),
          ConfigAproversId: this.arrId
        };
        return leaveRequestsData;
      }
      else
      {
        let leaveRequestsData: LeaveRequestsFrom = {
          StartDate: StartDate,
          EndDate: EndDate,
          DaysConsumed: Number(DaysConsumed),
          ConfigTimesLinesId: this.allTimeslines.map(x=> x.id),
          ConfigAproversId: this.arrId,
          userId: this.data.userId,
          userEmail:this.data.userEmail,
          userIdFiscal: this.data.userIdFiscal,
          firstName: this.data.firstName,
          lastName:this.data.lastName,
          nroLegajo:this.data.nroLegajo
        };
        return leaveRequestsData;
      }
  }

  sendFormData() {
    this.isLoading = true;
    this.employeeLeaveService.save(this.leaveRequestsData).toPromise()
      .then(leave => {
        this.isLoading = false;
        this.closeDialog();
        if(leave.length > 1)
        {
          this.messageService.showInfo('La solicitud ha sido creada exitosamente. Se generó una solicitud por cada año vacacional involucrado.');
        }
        else
        {
          this.messageService.showInfo('La solicitud ha sido creada exitosamente.');
        }
      })
      .catch(error => {
        this.isLoading = false;
        this.messageService.showError(error);
        this.closeDialog();
      });
  }

  calendarToValidate(renewalMonthKey: number) {
    let date = new Date();
    if (date.getMonth() < renewalMonthKey) {
      // año en curso
      this.MinDate = new Date(date.getFullYear() - 1, renewalMonthKey - 1, 1);
      this.MaxDate = new Date(date.getFullYear(), 0, 1)

      this.MaxDate.setMonth(this.MaxDate.getMonth() + (renewalMonthKey - 1))
      this.MaxDate.setDate(this.MaxDate.getDate() - 1);

    }
    else {
      // próximo año
      this.MinDate = new Date(date.getFullYear(), renewalMonthKey - 1, 1);
      this.MaxDate = new Date(date.getFullYear() + 1, 0, 1)

      this.MaxDate.setMonth(this.MaxDate.getMonth() + (renewalMonthKey - 1));
      this.MaxDate.setDate(this.MaxDate.getDate() - 1);

    }
  }

  setEndDate() {

  const { StartDate, DaysConsumed } = this.durationFormLeave.value;
    if (DaysConsumed > 0 && StartDate && StartDate != "")
    {
      this.fechaIni = new Date(StartDate);
      this.durationFormLeave.patchValue({
        EndDate: this.getEndDate(this.fechaIni, DaysConsumed)
      });
    }
  }

  private getEndDate(fecha: Date, DaysConsumed: number): Date {
    if (!fecha || isNaN(fecha.getTime()) || !DaysConsumed || isNaN(DaysConsumed) || !this.rules) {
      return null;
    }
    if(this.rules.useConsecutiveDays){
        return new Date(fecha.getFullYear(),fecha.getMonth(),(fecha.getDate()+DaysConsumed)-1)
    }
    else{
      let endDate = this.calculateEndDateExcludingDays(fecha, DaysConsumed, this.daysNoAble, this.holidays);
      return endDate
    }

  }

  private calculateEndDateExcludingDays(startDate: Date, daysToConsume: number, daysNoAble: number[], holidays: Holiday[]): Date {
    let daysAdded = 0;
    let currentDate = new Date(startDate);

    while (daysAdded < daysToConsume) {
      let dayOfWeek = currentDate.getDay();

      if (!daysNoAble.includes(dayOfWeek) && !(holidays.find(x => x.state && new Date(x.effectiveHolidayDate).toISOString() == currentDate.toISOString()))) {
        daysAdded++;
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }
    currentDate.setDate(currentDate.getDate() - 1);

    return currentDate;
  }

  FilterEfectiveTimes(d: Date): boolean
  {
    if(d !== undefined && d !== null)
    {
      let filterDate = new Date(d);
      let holidays = JSON.parse(localStorage.getItem('holydays'));
      let rules = JSON.parse(localStorage.getItem('rules'));
      let daysNoAble = JSON.parse(localStorage.getItem('daysNoAble'));
      let daystart = JSON.parse( localStorage.getItem('daystart')) == undefined ? getKey(rules.leaveStartDay) : JSON.parse( localStorage.getItem('daystart'));
      let dayOfWeekAble = JSON.parse( localStorage.getItem('DayOfWeekAble')) ?? false;
      dayOfWeekAble = filterDate.getDate() == 1 ? false : JSON.parse( localStorage.getItem('DayOfWeekAble'));
      if(filterDate.getDate() == 1)
      {
        localStorage.setItem('DayOfWeekAble', JSON.stringify(false));
      }

      if(rules == undefined || rules == null || rules.id == 0)
        {
          let result = false;
              let timeslines = JSON.parse(localStorage.getItem('configLeavetimeslines'));
              timeslines.forEach(t=>{
              let fechaInicio: Date=new Date(Number.parseInt(t.dateFrom.split('/')[2]),Number.parseInt(t.dateFrom.split('/')[1]) - 1,Number.parseInt(t.dateFrom.split('/')[0]));
              let fechaFin: Date=new Date(Number.parseInt(t.dateTo.split('/')[2]),Number.parseInt(t.dateTo.split('/')[1]) - 1,Number.parseInt(t.dateTo.split('/')[0]));
              if( fechaInicio<= filterDate && fechaFin >= filterDate)
              {
                result = true;
              }
              });

          return result;
        }
        else if(getKey(rules.leaveStartDay) != -1 && !rules.nextAbleDay)
          {
            let result = false;
            let timeslines = JSON.parse(localStorage.getItem('configLeavetimeslines'));
            timeslines.forEach(t=>{
            let fechaInicio: Date=new Date(Number.parseInt(t.dateFrom.split('/')[2]),Number.parseInt(t.dateFrom.split('/')[1]) - 1,Number.parseInt(t.dateFrom.split('/')[0]));
            let fechaFin: Date=new Date(Number.parseInt(t.dateTo.split('/')[2]),Number.parseInt(t.dateTo.split('/')[1]) - 1,Number.parseInt(t.dateTo.split('/')[0]));
            if( fechaInicio<= filterDate && fechaFin >= filterDate && daysNoAble != null && daysNoAble.find(x => x == filterDate.getDay()) == undefined && holidays.find(x => x.state && new Date(x.effectiveHolidayDate).toISOString() == filterDate.toISOString()) == undefined)
            {
              if(filterDate.getDay() == daystart)
              {
                result = true;
              }
            }
            });

             return result;
          }
        else if(getKey(rules.leaveStartDay) == -1)
          {
            let result = false;
            let timeslines = JSON.parse(localStorage.getItem('configLeavetimeslines'));
            timeslines.forEach(t=>{
            let fechaInicio: Date=new Date(Number.parseInt(t.dateFrom.split('/')[2]),Number.parseInt(t.dateFrom.split('/')[1]) - 1,Number.parseInt(t.dateFrom.split('/')[0]));
            let fechaFin: Date=new Date(Number.parseInt(t.dateTo.split('/')[2]),Number.parseInt(t.dateTo.split('/')[1]) - 1,Number.parseInt(t.dateTo.split('/')[0]));
            if( fechaInicio<= filterDate && fechaFin >= filterDate && daysNoAble != null && daysNoAble.find(x => x == filterDate.getDay()) == undefined && holidays.find(x => x.state && new Date(x.effectiveHolidayDate).toISOString() == filterDate.toISOString()) == undefined)
            {
              result = true;
            }
            });

             return result;
          }
        else
        {
          let result = false;
          let timeslines = JSON.parse(localStorage.getItem('configLeavetimeslines'));
          if (rules && holidays && daysNoAble && timeslines)
          {
            timeslines.forEach(t=>{
            let fechaInicio: Date=new Date(Number.parseInt(t.dateFrom.split('/')[2]),Number.parseInt(t.dateFrom.split('/')[1]) - 1,Number.parseInt(t.dateFrom.split('/')[0]));
            let fechaFin: Date=new Date(Number.parseInt(t.dateTo.split('/')[2]),Number.parseInt(t.dateTo.split('/')[1]) - 1,Number.parseInt(t.dateTo.split('/')[0]));

            if( fechaInicio <= filterDate && fechaFin >= filterDate)
            {
              if(daysNoAble != null && daysNoAble.find(x => x == filterDate.getDay()) == undefined && holidays.find(x => x.state && new Date(x.effectiveHolidayDate).toISOString() == filterDate.toISOString()) == undefined)
              {
                if(filterDate.getDay() == daystart)
                {
                  result = true;
                  daystart = getKey(rules.leaveStartDay);
                  localStorage.setItem('daystart', JSON.stringify(daystart));
                  localStorage.setItem('DayOfWeekAble', JSON.stringify(false));
                }
              }
              else
              {
                // preguntar si el dia anterior es feriado
                result = false;
                if(dayOfWeekAble){
                daystart = daystart <= filterDate.getDay() ? (filterDate.getDay() < 6 ? filterDate.getDay() + 1 : 0):daystart;
                localStorage.setItem('daystart', JSON.stringify(daystart));
                }
              }
              // si es domingo habilito para seleccionar el día de inicio de las solicitudes
              if(filterDate.getDay() == 0)
                {
                  localStorage.setItem('DayOfWeekAble', JSON.stringify(true));
                }
            }
            });

            return result;
          }
          else{
            return true;
          }
        }
    }
}

buildLeaveRequestParam(configLeave: ConfigLeaveEmployee[])
{
  let param = {
          userId:configLeave[0].userId.toString(),
          organizationalUnitId:configLeave[0].configLeaveOu.organizationalUnitId,
          page: 0,
          itemPerPage: 1200,
          isPaged: true
        };

        return param;

}

mapConfigTimeLinesIds(arrId: number[],configLeave: ConfigLeaveEmployee[])
{
    configLeave.forEach(c => {
      c.configEmployeesTimeLines.forEach(e => {
        if(e.enabled)
        {
          arrId.push(e.configTimeLineId);
        }
    })
  })
    return arrId;
}


mapConfigAproversIds(arrId: number[], configLeave: ConfigLeaveEmployee) {
  const uniqueApproverIds = new Set<number>(arrId);
 
  configLeave.configEmployeeApprovers.forEach(e => {
    if (e.enabled) {
      uniqueApproverIds.add(e.configAproversId);
    }
  });

  return Array.from(uniqueApproverIds);
}

focusOutFunction(event: any)
{
  if(this.durationFormLeave.controls.DaysConsumed.errors == null)
  {
    if (Number.parseInt(event.value) > this.AvailableDays)
    {
        event.value='';
        this.messageService.showInfo('No puedes solicitar mas de ' + this.AvailableDays + ' día(s)');
    }
    else
    {
      this.daysRequestsNow = Number.parseInt(event.value);
      const { StartDate, EndDate, DaysConsumed } = this.durationFormLeave.value;
      if(StartDate !== "")
        this.durationFormLeave.patchValue({
          EndDate: new Date(StartDate.getFullYear(),StartDate.getMonth(),(StartDate.getDate()+DaysConsumed)-1)
        });
    }
  }
  else
  {
    this.durationFormLeave.patchValue({
      EndDate: ''
    });
  }
}
validateInteger()
{
  if(this.durationFormLeave.controls.DaysConsumed.errors != null)
  {
  this.error = "Campo Inválido";
  }
  else if(this.rules.leaveMinDays && this.AvailableDays > this.rules.leaveMinDays && this.durationFormLeave.controls.DaysConsumed.value < this.rules.leaveMinDays)
  {
    this.error = `Los días mínimos que debe seleccionar son ${this.rules.leaveMinDays}`;
    this.durationFormLeave.controls['DaysConsumed'].setErrors({'error': true});
  }
  else if(this.durationFormLeave.controls.DaysConsumed.value > this.AvailableDays)
  {
    this.error = `No puede seleccionar más de  ${this.AvailableDays}`;
    this.durationFormLeave.controls['DaysConsumed'].setErrors({'error': true});
  }
  else
  {
    this.error ="";
  }
}
getMinLeaveRequestFromStorage(): any {
  const leaveRequestData = localStorage.getItem("minLeaveRequest");

  if (leaveRequestData) {
    try {
      return JSON.parse(leaveRequestData);
    } catch (err) {
      console.error('Error al parsear el objeto de localStorage', err);
      return null;
    }
  } else {
    console.warn('No se encontró el objeto "minLeaveRequest" en localStorage');
    return null;
  }
}
removeday(day: number)
{
  this.daysNoAble = this.daysNoAble.filter(x => x != day);
}
getStartLeaveDay(day: string): number
{
  switch (day) {
    case workdays.MONDAY: return 1;
      case workdays.TUESDAY: return 2;
      case workdays.WEDNESDAY: return 3;
      case workdays.THURSDAY: return 4;
      case workdays.FRIDAY: return 5;
      case workdays.SATURDAY: return 6;
      case workdays.SUNDAY: return 0;
    default:
      break;
  }
}

private formatDateToDDMMYYYY(dateString: string): string {
  const date = this.parseDate(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

private parseDate(dateStr: string): Date {
  if (dateStr.includes('-') && dateStr.split('-')[0].length === 4) {
    // Formato yyyy-mm-dd
    return new Date(dateStr);
  } else {
    // Formato dd/mm/yyyy
    const [day, month, year] = dateStr.split('/');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }
}
}

export enum workdays {
  MONDAY = "MONDAY",
  TUESDAY = "TUESDAY",
  WEDNESDAY = "WEDNESDAY",
  THURSDAY = "THURSDAY",
  FRIDAY = "FRIDAY",
  SATURDAY = "SATURDAY",
  SUNDAY= "SUNDAY"

}
