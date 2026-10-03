import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators, UntypedFormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDatepicker } from "@angular/material/datepicker";
import { MessageService } from '../../shared/errorHandler/message.service';
import { LeaveService } from '../../shared/services/leave.service';
import { OrganizationalUnitService } from '../../shared/services/organizational-unit.service';
import { OrganizationalUnit } from '../../shared/models';
import { ConfigLeaveOu } from '../../shared/models/Employee/config-leave-ou.model';

@Component({
  selector: 'app-create-year-dialog',
  templateUrl: './create-year-dialog.component.html',
  styleUrls: ['./create-year-dialog.component.scss']
})
export class CreateYearDialogComponent implements OnInit {
  yearForm: UntypedFormGroup;
  active: UntypedFormControl;
  startDateFormControl: UntypedFormControl;
  yearConfig: UntypedFormControl;
  year: string = '';
  dateFrom: Date;
  dateTo: Date;
  chosenYear: number;
  isLoading = false;
  enableSaveButton = false;
  YearFormGroup: UntypedFormGroup;
  currentOu: OrganizationalUnit;
  allConfigs: ConfigLeaveOu[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private readonly dialogRef: MatDialogRef<CreateYearDialogComponent>,
    private readonly _formBuilder: UntypedFormBuilder,
    private readonly messageService: MessageService,
    private readonly leaveService: LeaveService,
    private readonly organizationalUnitService: OrganizationalUnitService
  ) {
  this.yearForm = this._formBuilder.group({
        startDateFormControl: new UntypedFormControl('', [Validators.required]),
        active: new UntypedFormControl(false),
      });
    }

    ngOnInit() {
    this.currentOu = this.organizationalUnitService.getCurrentOU();
    this.initForm();
    this.allConfigs = this.data.sort((a, b) => b.year - a.year );
    this.year = (+this.allConfigs[0].year + 1).toString();
    const newDate = new Date(+this.year, 0, 1);
    this.yearForm.get('startDateFormControl')!.setValue(newDate);
    this.enableSaveButton = true;
    this.isLoading = false;
  }

  initForm() {
    this.yearConfig = new UntypedFormControl('', [Validators.required]);
    this.active = new UntypedFormControl(false);
    this.yearForm = this._formBuilder.group({
      startDateFormControl: new UntypedFormControl('', [Validators.required]),
      active: new UntypedFormControl(false),
    });

  }
  closeDialog() {
    this.dialogRef.close();
  }

  // Validate that end date is after start date
  validateDates() {
    const startDate = this.yearForm.get('startDate').value;
    const endDate = this.yearForm.get('endDate').value;

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      this.yearForm.get('endDate').setErrors({ 'invalidEndDate': true });
      return false;
    }
    return true;
  }

    updateYearString(date: Date) {
    this.year = date.getFullYear().toString();
  }

  chosenYearHandler(normalizedYear: Date, datepicker: MatDatepicker<Date>) {
    this.chosenYear = normalizedYear.getFullYear();
    datepicker.close();
    const date = new Date(this.chosenYear,0,1);
    this.dateFrom = date;
    this.yearForm.get('startDateFormControl')!.setValue(date);
    this.onStartDateChange({ value: date });
  }

   onStartDateChange(event: any) {
    const pickedDate: Date = event.value;
    if(event.value ==''){
      this.enableSaveButton = false;

    }else{
      this.enableSaveButton = true;
      const year = pickedDate.getFullYear();
      this.dateFrom = new Date(year, 0, 1);
      this.dateTo = new Date(year, 11, 31);
      this.updateYearString(pickedDate);
    }
  }
  yearFilter = (d: Date): boolean => {
    const currentYear = new Date().getFullYear();
    const selectedYear = d.getFullYear();
    const years = this.data.map(c => +c.year) ?? [];
    if (selectedYear <= years[years.length-1] || selectedYear < currentYear || years.includes(selectedYear)) {
      return false;
    }
    return true;
  };

  save(){
    this.isLoading = true;
    const leaveConfig = this.allConfigs[0] // revisar si debo tomar le primero o el ultimo
    const year = this.yearForm.get('startDateFormControl')?.value.getFullYear().toString();
    leaveConfig.year = year;
    leaveConfig.enabled = false;
    leaveConfig.dateFrom = this.yearForm.get('startDateFormControl')?.value;
    leaveConfig.dateTo = new Date(+year, 11, 31);
    leaveConfig.description = 'Periodo: ' + year + ' desde ' + this.formatDate(leaveConfig.dateFrom) + ' hasta ' + this.formatDate(leaveConfig.dateTo);
    leaveConfig.id = 0;
    this.leaveService.setConfigLeave(leaveConfig).toPromise().then(() => {
      this.messageService.showInfo('Configuración de año creada correctamente.');
      this.isLoading = false;
      this.dialogRef.close(true);
    },
     error => {
      this.isLoading = false;
      this.messageService.showError(error);
    });
  }

  formatDate(date: Date): string {
    // Obtiene día, mes y año
    const day: number = date.getDate();
    const month: number = date.getMonth() + 1; // Se suma 1 porque los meses son 0-indexed
    const year: number = date.getFullYear();

    // Formatea la fecha en el formato dd/mm/AAAA
    const formattedDate: string = `${this.padNumber(day)}/${this.padNumber(month)}/${year}`;

    return formattedDate;
  }

    padNumber(num: number): string {
    // Añade un cero delante si el número es menor que 10
    return num < 10 ? `0${num}` : `${num}`;
  }

}
