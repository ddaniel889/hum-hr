import { Component, EventEmitter, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { LeaveService } from '../../shared/services/leave.service';
import { MatDialog } from '@angular/material/dialog';
import { Holiday } from '../../shared/models/calendar-holidays';
import { OrganizationalUnitService } from '../../shared/services/organizational-unit.service';
import { MessageService } from '../../shared/errorHandler/message.service';
import { AddHolidayDialogComponent } from '../add-dialog-holiday/add-dialog-holiday.component';
import { LeaveHolidayFind } from '../../shared/models/leave-request-find.model';
import { MatMenuTrigger } from '@angular/material/menu';
import { CreateYearDialogComponent } from '../create-year-dialog/create-year-dialog.component';
import { ConfigLeaveOu } from '../../shared/models/Employee/config-leave-ou.model';

@Component({
  selector: 'app-calendar-holidays',
  templateUrl: './calendar-holidays.component.html',
  styleUrls: ['./calendar-holidays.component.scss']
})
export class CalendarHolidaysComponent implements OnInit, OnChanges {
  @Output() loadRules = new EventEmitter<void>();
  @ViewChild('menuTrigger') menuTrigger!: MatMenuTrigger;
  calendarHolidays: Holiday[] = [];
  editLoading = false;
  loading: boolean = false;
  configLeaveOuId: number;
  filterTiposDeFeriados = ['Actividad', 'Nacional', 'Local', 'Otro','Todos'];
  selectedTipo = 'Todos';
  pageIndex:number = 0;
  itemsCount:number;
  activeHoliday:boolean = true;
  inactiveHoliday:boolean = false;
  filterName:string;
  selectedYear: string;
  years: string[] = [];
  allConfigs: any[] = [];
  estadoActivo: boolean = true;
  enableCreateYear: boolean = false;
  selectedYearActive: boolean = false;
  selectedConfig: ConfigLeaveOu;

  constructor(
    private readonly leaveService: LeaveService,
    private readonly dialog: MatDialog,
    private readonly organizationalUnitservice: OrganizationalUnitService,
    private readonly msjService: MessageService,
   ){}

  ngOnChanges(changes: SimpleChanges): void {
    this.loadLeaveConfig(false);
  }

  ngOnInit(){
    this.loadLeaveConfig(false);
  }

  refresh(){
    this.loadLeaveConfig(false);
  }

  loadLeaveConfig(isfiltered: boolean, selectedYear: string = '') {
    this.loading = true;
    const currentOu = this.organizationalUnitservice.getCurrentOU();

    this.leaveService.getConfigLeaveOu(currentOu.id).toPromise().then(data => {
      this.years = data.map(c => c.year);
      this.allConfigs = data;
      const enabledConfig = data.find(c => c.enabled);
      const configToUse = selectedYear ? data.find(c => c.enabled && c.year === selectedYear) : enabledConfig ?? data[0];
      this.selectedYearActive = configToUse.enabled;
      this.selectedYear = configToUse.year;
      this.selectedConfig = configToUse;
      this.configLeaveOuId = configToUse.id;
      this.loadHolidays(configToUse.id, isfiltered);
      this.loadRules.emit();
      this.enableCreateYear = true;
    });
  }

  onYearChange(year: string): void {
    this.loading = true;
    const config = this.allConfigs.find(c => c.year.toString() === year);
    this.selectedYearActive = config.enabled;
    this.selectedConfig = config;
    this.selectedYear = year;
    if (config) {
      this.configLeaveOuId = config.id;
      console.log("Cambiando a año:", year, "ConfigId:", config.id);
      this.loadHolidays(config.id, false);
    } else {
      this.selectedYear = year;
      this.calendarHolidays = [];
      this.itemsCount = 0;
    }
  }

  loadHolidays(configLeaveOuId, isfiltered:boolean){
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
      page: (this.pageIndex == 0 || isfiltered) ? 1 : this.pageIndex,
      active: this.buildParam(),
      type: this.selectedTipo == 'Todos' ? null : this.selectedTipo,
      textSearch: this.filterName

    }
    this.leaveService.postHolidays(param).toPromise().then(
      data => {
        this.calendarHolidays = data.values
        .map(h => {
          const config = this.allConfigs.find(c => c.id === h.configLeaveOuId);
          return {
            ...h,
            year: config?.year?.toString()
          };
        })
        .sort((a, b) =>
          new Date(a.effectiveHolidayDate).getTime() - new Date(b.effectiveHolidayDate).getTime()
        );
        this.loading = false;
        this.itemsCount = data.total;
        this.pageIndex = data.page;
      }, err => {
        this.msjService.showError(err);
      }
    )
  }
  }

  openAddHoliday() {
    const holiday = new Holiday();
    holiday.configLeaveOuId = this.configLeaveOuId;
    this.dialog.open(AddHolidayDialogComponent, {
      disableClose: true,
      data: {
        holiday: holiday,
        year: this.selectedYear
      }
    }).afterClosed().subscribe((result) => {
      if (result) {
        const config = this.allConfigs.find(c => c.year.toString() === this.selectedYear);
        if (config) {
          this.loadHolidays(config.id, false);
        }
      }
    });
  }

  editAddHoliday(holiday) {
    const config = this.allConfigs.find(c => c.id === holiday.configLeaveOuId);
    const year = config ? config.year.toString() : '-';

    this.dialog.open(AddHolidayDialogComponent, {
      disableClose: true,
      data: {
        holiday: holiday,
        year: year
      }
    }).afterClosed().subscribe(() => {
      if (config) {
        this.loadHolidays(config.id, false);
      }
    });
  }

  selectedPageChanged(a) {
    this.loadLeaveConfig(false);
  }
  errorStatus() {
    return !this.activeHoliday && !this.inactiveHoliday;
  }

  filteredSearch() {
    this.menuTrigger.closeMenu();
    this.loadLeaveConfig(true, this.selectedYear);
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

  validateParams()
  {
    return !this.activeHoliday && !this.inactiveHoliday;
  }

  closeFindAdvanced(){
    this.menuTrigger.closeMenu();
  }

  openCreateYearDialog() {
    const dialogRef = this.dialog.open(CreateYearDialogComponent, {
      disableClose: true,
      width: '90%',
      // height: '85%',
      panelClass: 'create-year-dialog',
      // minHeight: '95vh',
      position: { top: '25px', left: '95px', right: '15px' },
      data: this.allConfigs
    });
    dialogRef.afterClosed().subscribe(() => {
      this.loadLeaveConfig(false);
    });
  }

  onYearMenuChange(year: number, menu: any): void {
    this.selectedYear = year.toString();
    this.onYearChange(this.selectedYear);
    menu.closeMenu();
  }

  resetSearchForm(){
    this.selectedTipo = 'Todos';
    this.activeHoliday = true;
    this.inactiveHoliday = false;
  }

  activeConfig(){
    this.loading = true;
    this.selectedConfig.enabled = true;
    this.leaveService.setConfigLeave(this.selectedConfig).toPromise().then(() => {
      this.refresh();
      this.loading = true;
      this.msjService.showInfo('Configuración de año activada correctamente.');
    }).catch(() => {
      this.selectedConfig.enabled = false;
      this.loading = true;
      this.msjService.showError('Error al activar la configuración de año.');
    });
  }
}
