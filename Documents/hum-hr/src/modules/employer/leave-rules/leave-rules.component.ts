import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { LeaveRules } from '../../shared/models/leave-rules.model';
import { LeaveService } from '../../shared/services/leave.service';
import { OrganizationalUnitService } from '../../shared/services/organizational-unit.service';
import { MessageService } from '../../shared/errorHandler/message.service';
import { LeaveHolidayFind } from '../../shared/models/leave-request-find.model';
import { ConfigLeaveOu } from '../../shared/models/Employee/config-leave-ou.model';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MessageType } from '../../shared/models/message-types.model';
import { GenericBottomSheetComponent } from '../../shared/generic-bottom-sheet/generic-bottom-sheet.component';

@Component({
  selector: 'app-leave-rules',
  templateUrl: './leave-rules.component.html',
  styleUrls: ['./leave-rules.component.scss']
})
export class LeaveRulesComponent implements OnInit {
  @Input() configOu:ConfigLeaveOu[];
  configLeaveOuId: number;
  ruleForm: UntypedFormGroup;
  leavesRules: LeaveRules;
  loading = false;
  isNextAbleDayChecked: boolean = false;
  disableNextAbleDay: boolean = false;
  upsertLeaveRule: LeaveRules;
  isLeaveRuleEmpty: boolean = true;
  daysOfWeek: { key: string; value: string }[];
  enableSubmitButton: boolean = false;
  selectedStartDay: {key: string, value: string};
  activeHoliday: boolean = true;
  inactiveHoliday: boolean = false;
  pageIndex: number;
  selectedTipo = 'Todos';
  filterName:string;
  workDays: string[];
  haveHoliDays = false;
  oldComputingScheme: string = "corridos";
  constructor(
    private _formBuilder: UntypedFormBuilder,
    private leaveService: LeaveService,
    private organizationalUnitService: OrganizationalUnitService,
    private readonly _bottomSheet: MatBottomSheet,
    private msjService: MessageService
  ) {
    this.ruleForm = this._formBuilder.group({
      leaveMinDayForm: [0, Validators.required],
      leaveStartDayForm: ["", Validators.pattern(/^[a-zA-Z0-9/\-áéíóúüñ\s]*$/)],
      nextAbleDayForm: [false],
      computingScheme: "corridos"
    });
  }

  ngOnInit(): void {
    this.resetdaysOfWeek();
    this.loadHolidays(this.configOu[0].id);
    this.loadLeaveRules();
  }

  resetdaysOfWeek(){
    this.daysOfWeek = [
      { 'key': 'SUNDAY', 'value': 'Domingo' },
      { 'key': 'MONDAY', 'value': 'Lunes' },
      { 'key': 'TUESDAY', 'value': 'Martes' },
      { 'key': 'WEDNESDAY', 'value': 'Miércoles' },
      { 'key': 'THURSDAY', 'value': 'Jueves' },
      { 'key': 'FRIDAY', 'value': 'Viernes' },
      { 'key': 'SATURDAY', 'value': 'Sábado' }
    ];
  }

  loadLeaveConfig() {
    this.loading = true;
    const currentOu = this.organizationalUnitService.getCurrentOU();
    this.leaveService.getConfigLeaveOu(currentOu.id).toPromise().then(
      data => {
        this.configLeaveOuId = data[0].id;
        this.loadHolidays(this.configLeaveOuId);
        this.loadLeaveRules();
      },
      err => {
        this.msjService.showError(err);
        this.loading = false;
      }
    );
  }

  loadLeaveRules() {
    this.loading = true;
    this.leaveService.getWorkDays(this.configOu[0].leaveTypeOu.id).toPromise().then(
      (response) => {
        this.workDays = response.workDays;
        if (this.workDays != null || this.workDays != undefined) {
          this.resetdaysOfWeek();
          this.daysOfWeek = this.daysOfWeek.filter(arr => this.workDays.includes(arr['key']));
          this.daysOfWeek.push({ 'key': 'ANY', 'value': 'Cualquier día'});
          this.leaveService.getLeaveRule(this.configOu[0].leaveTypeOu.id).toPromise().then(
            data => {
              this.selectedStartDay =  this.daysOfWeek.find(day => day["value"].toLowerCase() == data.leaveStartDay) ? this.daysOfWeek.find(day => day["value"].toLowerCase() == data.leaveStartDay) : { 'key': 'ANY', 'value': 'Cualquier día'};
              this.ruleForm.patchValue({
                leaveMinDayForm: data.leaveMinDays,
                leaveStartDayForm: this.selectedStartDay["value"],
                nextAbleDayForm: data.nextAbleDay,
                computingScheme: data.useConsecutiveDays ? "corridos" : "habiles",
                leaveTypeOuId: data.leaveTypeOuId
              })
              this.oldComputingScheme = data.useConsecutiveDays ? "corridos" : "habiles";
              this.isNextAbleDayChecked = data.nextAbleDay;
              this.disableNextAbleDay = this.selectedStartDay["value"] == "Cualquier día" || !this.haveHoliDays;
              this.isLeaveRuleEmpty = false;
              this.loading = false;
              this.enableSubmitButton = false;
            }
          ).catch(error => {
            if (error.status === 404) {
              this.ruleForm.patchValue({
                leaveMinDayForm: 0,
                leaveStartDayForm: "",
                nextAbleDayForm: false
              })
              this.isLeaveRuleEmpty = true;
            }
            this.loading = false;
          }
          )
        }
        else
        {
          this.ruleForm.patchValue({
            leaveMinDayForm: 0,
            leaveStartDayForm: "",
            nextAbleDayForm: false
          });
        this.enableSubmit();
        }
        this.loading = false;
      },
      (error) => {
        this.msjService.showError("Ha fallado al cargar los dias laborales.");
        this.loading = false;
      }
    );
  }

  loadHolidays(configLeaveOuId){
    if(this.validateParams())
    {
      this.msjService.showInfo('Parámetros de búsquedas incorrectos. Revise la Búsqueda Avanzada');
      this.loading = false;
    }
    else{
    let param:LeaveHolidayFind;
    param = {
      configLeaveOuId:configLeaveOuId,
      itemperpage:15,
      page: this.pageIndex == 0 ? 1 : this.pageIndex,
      active: this.buildParam(),
      type: this.selectedTipo == 'Todos' ? null : this.selectedTipo,
      textSearch: this.filterName
    }
    this.leaveService.postHolidays(param).toPromise().then(
      data => {
        this.haveHoliDays = data.values.length > 0;
        this.pageIndex = data.page;
      }, err => {
        this.msjService.showError(err);
      }
    )
  }
  }

  validateParams()
  {
    return !this.activeHoliday && !this.inactiveHoliday;
  }

  buildParam() {
    if(this.activeHoliday && this.inactiveHoliday)
    {
      return null;
    }
    else if(this.activeHoliday && !this.inactiveHoliday)
    {
       return true;
    }
    else
    {
      return false;
    }
  }

  Save() {
    this.upsertLeaveRule = {
      leaveMinDays: this.ruleForm.value.leaveMinDayForm,
      leaveStartDay: this.ruleForm.value.leaveStartDayForm.toLowerCase(),
      nextAbleDay: this.ruleForm.value.nextAbleDayForm,
      configLeaveOuId: this.configOu[0].id,
      useConsecutiveDays: this.ruleForm.value.computingScheme == "corridos",
      leaveTypeOuId: this.configOu[0].leaveTypeOu.id
    }
    this.enableSubmitButton = true;
    if(this.oldComputingScheme != this.ruleForm.value.computingScheme){
      let parameters: any = {};
      parameters.bodyText = '⚠ Estás por modificar el esquema de cómputo de días, las nuevas solicitudes de vacaciones se calcularán según la nueva regla configurada. Las solicitudes previas mantendrán el esquema de días original. ¿Confirmas el cambio?'
       parameters.type = MessageType.YesNo;
      const t = this._bottomSheet.open(GenericBottomSheetComponent, {data:parameters, disableClose: true });
      t.instance.close.subscribe((response: any) => {
        if(response){
          this.leaveService.upsertLeaveRules(this.upsertLeaveRule).subscribe(
            () => {
              this.msjService.showInfo("Reglas de licencia guardadas satisfactoriamente.");
              this.loadLeaveConfig();
            },
            (error) => {
              this.msjService.showError("Ha fallado al guardar las reglas de licencia.");
            }
          );
        }else{
          this.upsertLeaveRule.useConsecutiveDays = this.oldComputingScheme == "corridos";
          this.ruleForm.value.computingScheme = this.oldComputingScheme;
          this.leaveService.upsertLeaveRules(this.upsertLeaveRule).subscribe(
            () => {
              this.msjService.showInfo("Reglas de licencia guardadas satisfactoriamente.");
              this.loadLeaveConfig();
            },
            (error) => {
              this.msjService.showError("Ha fallado al guardar las reglas de licencia.");
            }
          );
        }
      });

    }
    else{
      this.leaveService.upsertLeaveRules(this.upsertLeaveRule).subscribe(
        () => {
          this.msjService.showInfo("Reglas de licencia guardadas satisfactoriamente.");
          this.loadLeaveConfig();
        },
        (error) => {
          this.msjService.showError("Ha fallado al guardar las reglas de licencia.");
        }
      );
    }

  }

  enableSubmit(){
    const {leaveMinDayForm: leaveDays,leaveStartDayForm: startDay } = this.ruleForm.value;
    if(leaveDays < 1)
    {
      this.enableSubmitButton = false;
    }
    else if(startDay == this.daysOfWeek[this.daysOfWeek.length - 1].value){
      this.disableNextAbleDay = true;
      this.isNextAbleDayChecked = false;
      this.ruleForm.patchValue({nextAbleDayForm:false});
      this.enableSubmitButton = true;
    }
    else if((leaveDays > 0 && leaveDays < 32 && Number.isInteger(leaveDays) && startDay != this.daysOfWeek[this.daysOfWeek.length - 1].value)){
      this.disableNextAbleDay = !this.haveHoliDays;
      this.enableSubmitButton = true;
    }
    else{
      this.disableNextAbleDay = true;
      this.isNextAbleDayChecked = !this.isNextAbleDayChecked;
      this.enableSubmitButton = false;
    }
  }
  changeSubmit(){
    this.enableSubmitButton = true;
  }
}
