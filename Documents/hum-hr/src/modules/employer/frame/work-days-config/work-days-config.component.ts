import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { MessageService } from 'src/app/modules/shared/errorHandler/message.service';
import { ConfigLeaveOu } from 'src/app/modules/shared/models/Employee/config-leave-ou.model';
import { WorkDays } from 'src/app/modules/shared/models/work-days.model';
import { LeaveService } from 'src/app/modules/shared/services/leave.service';
import { OrganizationalUnitService } from 'src/app/modules/shared/services/organizational-unit.service';

@Component({
  selector: 'app-work-days-config',
  templateUrl: './work-days-config.component.html',
  styleUrls: ['./work-days-config.component.scss']
})
export class WorkDaysConfigComponent implements OnInit {
  @Output() loadRules = new EventEmitter<void>();
  @Input() configOu:ConfigLeaveOu[];
  configLeaveId: number;
  workDays: WorkDays = {
  workDays: []
  };
  workDaysBoolean: { [key: string]: boolean } = {
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false
  };
  workDaysEmpty: { [key: string]: boolean } = {
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false
  };
  loading: boolean = false;

  private daysMap = {
    MONDAY: 'monday',
    TUESDAY: 'tuesday',
    WEDNESDAY: 'wednesday',
    THURSDAY: 'thursday',
    FRIDAY: 'friday',
    SATURDAY: 'saturday',
    SUNDAY: 'sunday'
  };

  private reverseDaysMap = {
    monday: 'MONDAY',
    tuesday: 'TUESDAY',
    wednesday: 'WEDNESDAY',
    thursday: 'THURSDAY',
    friday: 'FRIDAY',
    saturday: 'SATURDAY',
    sunday: 'SUNDAY'
  };
  enableSubmitButton = false;

  constructor(private leaveService: LeaveService, private msjService: MessageService,private organizationalUnitService:OrganizationalUnitService) { }



  ngOnInit() {
    this.loadWorkDays();
  }

  loadLeaveConfigOu() {
    this.loading = true;
    const currentOu = this.organizationalUnitService.getCurrentOU();
    this.leaveService.getConfigLeaveOu(currentOu.id).toPromise().then(
      data => {
        this.configLeaveId = data[0].id;
        this.loadWorkDays();
      },
      err => {
        this.msjService.showError(err);
        this.loading = false;
      }
    );
  }

  loadWorkDays() {
    this.loading = true;
    this.leaveService.getWorkDays(this.configOu[0].leaveTypeOu.id).toPromise().then(
      (response) => {
        let workDays = response.workDays;
        if (workDays != null || workDays != undefined) {
         this.workDaysBoolean = this.transformWorkDaysShow(workDays);
        } else {
          this.workDaysBoolean = this.workDaysEmpty;
        }
        this.enableSubmit();
        this.loading = false;
      },
      (error) => {
        this.msjService.showError("Ha fallado al cargar los dias laborales.");
        this.loading = false;
      }
    );
  }

  saveWorkDays() {
    this.loading = true;
    this.enableSubmitButton = true;
    const workDaysToSave = this.transformWorkDaysSave(this.workDaysBoolean);
    this.workDays.workDays = workDaysToSave;
    this.workDays.configLeaveOuId = this.configOu[0].id;
    this.workDays.leaveTypeOuId = this.configOu[0].leaveTypeOu.id;
    this.leaveService.modifyWorkDays(this.workDays).subscribe(
      () => {
        this.enableSubmit();
        this.loadRules.emit();
        this.msjService.showInfo("Días laborales guardados satisfactoriamente.");
        this.loading = false;
      },
      (error) => {
        this.msjService.showInfo("Ha fallado al guardar días laborales.");
        this.loading = false;
      }
    );
  }

  transformWorkDaysSave(workDaysBoolean: any): string[] {
    return Object.keys(workDaysBoolean)
      .filter(day => workDaysBoolean[day])
      .map(day => this.reverseDaysMap[day]);
  }

  transformWorkDaysShow(workdays: string[]): { [key: string]: boolean } {
    const transformed: { [key: string]: boolean } = {};
    Object.keys(this.reverseDaysMap).forEach(key => {
      transformed[key] = workdays.includes(this.reverseDaysMap[key]);
    });

    return transformed;
  }

  cancel() {
    this.loadWorkDays();
    this.msjService.showInfo("Se cancela el guardado de días laborales.");
  }

  enableSubmit (){
      this.enableSubmitButton = false;
  }
  changeSubmit(): void{
    let allFalse = true;
    Object.values(this.workDaysBoolean).some((value) => {
      if (value) {
        this.enableSubmitButton = true;
        allFalse = false;
      }
    });
    if (allFalse) {
      this.enableSubmitButton = false;
    }
  }
}
