import { Component,  Input,  OnChanges,  OnInit,  SimpleChanges,  ViewChild } from "@angular/core";
import { MatMenuTrigger } from "@angular/material/menu";
import { MessageService } from "../../shared/errorHandler/message.service";
import { OrganizationalUnit } from "../../shared/models";
import { LeaveService } from "../../shared/services/leave.service";
import { LeaveTimeLine, LeaveTimeLineFind } from "../../shared/models/times-lines.model";
import { LeaveRequestFind } from "../../shared/models/leave-request-find.model";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup,} from "@angular/forms";
import { AddTimeLineDialogComponent } from "../add-dialog-timeLines/add-dialog-time-lines.component";
import { MatDialog } from "@angular/material/dialog";
import { EditTimeLineDialogComponent } from "../edit-time-line-dialog/edit-time-line-dialog.component";
import { GenericBottomSheetComponent } from "../../shared/generic-bottom-sheet/generic-bottom-sheet.component";
import { MessageType } from "../../shared/models/message-types.model";
import { MatBottomSheet } from "@angular/material/bottom-sheet";
import { AssignTimeLines } from "../../shared/models/assign-timelines.model";
import { ConfigLeaveOu } from "../../shared/models/Employee/config-leave-ou.model";


@Component({
  selector: "app-leave-times-lines",
  templateUrl: "./leave-times-lines.component.html",
  styleUrls: ["./leave-times-lines.component.scss"],
})
export class LeaveTimesLinesComponent implements OnInit, OnChanges {
  @ViewChild("menuTrigger") menuTrigger!: MatMenuTrigger;
  @Input() ouSelected: OrganizationalUnit;
  timesLines: LeaveTimeLineFind[] = [];
  pageIndex: number = 0;
  itemsCount: number;
  loading = false;
  filterName: string;
  fechaFin: Date;
  MinDate: Date;
  MaxDate: Date;
  HastaMinDate: Date;
  StartDate: UntypedFormControl;
  EndDate: UntypedFormControl;
  durationFormLeave: UntypedFormGroup;
  editLoading = false;
  allSelected = false;
  showTimeLines = false;
  selectedYear: ConfigLeaveOu;
  availableYears: ConfigLeaveOu[];

  constructor(
    private _formBuilder: UntypedFormBuilder,
    private msjService: MessageService,
    private leaveService: LeaveService,
    private dialog: MatDialog,
    private _bottomSheet: MatBottomSheet
  ) {
    this.durationFormLeave = this._formBuilder.group({
      StartDate: [""],
      EndDate: [""],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.FindTimesLines();
  }

  async ngOnInit() {
   this.loadLeaveConfigOu()
    .then(() => {
      this.FindTimesLines();
    })
    .catch((error) => {
      console.error('Error al cargar la configuración:', error);
    });
  }

  refresh() {
    this.FindTimesLines();
  }

  FindTimesLines() {
    this.editLoading = false;
    this.loading = true;
    let param: LeaveRequestFind;
    let id = (this.selectedYear == undefined) ? 0 : this.selectedYear.id;
    param = {
      organizationalUnitId: this.ouSelected.id,
      page: this.pageIndex == 0 ? 1 : this.pageIndex,
      itemPerPage: 15,
      textSearch: this.filterName,
      configLeaveOuId: id
    };

    this.leaveService
    .getEfectivesTimesLines(param)
    .toPromise()
    .then((data) => {
      this.itemsCount = data.total;


      this.timesLines = [];

      const uniqueItems = new Map();
    for (const res of data.values) {
      if (!uniqueItems.has(res.id)) {
        uniqueItems.set(res.id, res);

        const response: LeaveTimeLineFind = {
          id: res.id,
          configLeaveOuId: res.configLeaveOuId,
          dateFrom: res.dateFrom,
          dateTo: res.dateTo,
          description: res.description,
          name: res.description + ' - ' + this.getFormattedDate(new Date(res.dateFrom)) + '-' + this.getFormattedDate(new Date(res.dateTo)),
          enabled: res.enabled,
          periodo: res.periodo,
          selected: false
        };

        this.timesLines.push(response);
      }
    }

    this.pageIndex = data.page;
    this.loading = false;
  })
  .catch(error => {
    console.error('Error al obtener las líneas de tiempo efectivas:', error);
    this.loading = false;
  });
  }

  async loadLeaveConfigOu() {
    this.loading = true;
    try {
      let configOu: ConfigLeaveOu[] = JSON.parse(localStorage.getItem('configOU'));

      if (configOu == undefined || configOu == null || configOu.length == 0) {
        this.availableYears = await this.leaveService.getConfigLeaveOu(this.ouSelected.id).toPromise();
      }
      else{
        this.availableYears = configOu;
      }
      if(this.availableYears.length > 0){
        const enabledYears = this.availableYears.filter(year => year.enabled);
        if( enabledYears.length > 0) {
          this.selectedYear = enabledYears.reduce((a, b) =>
            (a.year > b.year ? a : b), enabledYears[0]);
        }
      }
      this.loading = false;
    } catch (err) {
      this.msjService.showError(err);
      this.loading = false;
    }
  }

  getFormattedDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear());

    return `${day}/${month}/${year}`;
  }

  mapSingleResponse(res: LeaveTimeLine): LeaveTimeLineFind {
    let response: LeaveTimeLineFind;
    response.name = res.name;
    response.configLeaveOuId = res.configLeaveOuId;
    response.dateFrom = res.dateFrom;
    response.dateTo = res.dateTo;
    response.enabled = res.enabled;
    response.description = res.description;
    response.periodo = res.periodo;
    response.selected = false;
    return response;
  }

  selectedPageChanged(a) {
    this.FindTimesLines();
  }

  filteredSearch() {
    this.pageIndex = 0;
    this.FindTimesLines();
  }
  resetDateForm() {
    this.durationFormLeave.reset();
  }

  findButtonEnable() {
    const { StartDate, EndDate } = this.durationFormLeave.value;
    return (
      StartDate === "" ||
      StartDate === null ||
      EndDate === "" ||
      EndDate === null
    );
  }

  closeFindAdvanced() {
    this.menuTrigger.closeMenu();
  }
  setHastaMinDate(event: any) {
    this.HastaMinDate = event.value;
  }

  openAddTimeLineDialog(): void {
    const dialogRef = this.dialog.open(AddTimeLineDialogComponent, {
      disableClose: true,
      data: {
        selectedYear: this.selectedYear
      }
    });
    dialogRef.afterClosed().subscribe((res) => {
      if(res != "" && res){
        this.msjService.showInfo("Se ha dado de alta una nueva vigencia");
        this.FindTimesLines();
      }
      else if(res != "" && !res){
        this.msjService.showInfo("Error no se pudo dar de alta la Vigencia");
        this.FindTimesLines();
      }

    });
  }

  openEditTimeLineDialog(timeLine:LeaveTimeLine): void{
    this.editLoading = true;
    const dialogRef = this.dialog.open(EditTimeLineDialogComponent,{
      disableClose: true,
      data: timeLine
    } );
    dialogRef.afterClosed().subscribe((res) => {
      if(res == true){
        this.msjService.showInfo("Se ha modificado la Vigencia");
        this.FindTimesLines();
      }
      else if(res != ""){
        this.msjService.showInfo(res);
        this.FindTimesLines();
      }
      else{
        this.FindTimesLines();
      }
    });
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

  selectAllToogle() {
    if (this.timesLines) {
      this.timesLines.forEach(element => {
        element.selected = this.allSelected;
      });
    }
    this.showTimeLines = this.timesLines.filter(function (x) { return x.selected; }).length > 0;

  }

  selectedChange() {
   this.showTimeLines = this.timesLines.filter(function (x) { return x.selected; }).length > 0;

    const allTheSame = this.timesLines.every((val, i, arr) => val.selected === arr[0].selected);
    if (allTheSame) {
      this.allSelected = this.timesLines[0].selected;
    } else {
      this.allSelected = false;
    }
  }

  ShowMessage(success: any) {
    if (success) {
      this.msjService.showInfo("Se aplicaron todas los vigencias seleccionadas éxitosamente.");
    }
    else {
      this.msjService.showInfo("Algunos vigencias seleccionadas no pudieron ser aplicados.");
    }
  }

  SetTimeLines() {
    const selectedIds = this.timesLines.filter(line => line.selected).map(line => line.id);

    const showMessageAndAssignTimeLines = (allEmployees: boolean, infoMessage: string) => {
      const assignTimeLine: AssignTimeLines = {
        idOu: this.ouSelected.id,
        idTimeLines: selectedIds,
        allEmployees: allEmployees,
      };

      this.loading = true;
      this.msjService.showInfo(infoMessage, true, true);
      this.leaveService.assignSelectedTimeLines(assignTimeLine).subscribe(
        data => {
          this.showTimeLines = false;
          this.ShowMessage(data);
          this.FindTimesLines();
        },
        err => {
          this.msjService.showError(err);
          this.loading = false;
        }
      );
    };

    const applyToAllMessage = "Asignando las vigencias seleccionadas a todos los empleados. Por favor, espere...";
    const applyToUnassignedOnlyMessage = "Asignando las vigencias seleccionadas solo a empleados que no tienen vigencias. Por favor, espere...";

    const params: any = {
      bodyText: '¿A quién desea aplicar las vigencias seleccionadas?',
      firstOption:'A todos los empleados',
      secondOption:'Solo a los empleados sin vigencias asignadas',
      type: MessageType.Assign,
    };
    const mainOptions = this._bottomSheet.open(GenericBottomSheetComponent, { data: params, disableClose: false });
    mainOptions.instance.close.subscribe((response: any) => {
      if (response == 'all') {
        const confirmParams: any = {
          bodyText: '¿Confirma que desea asignar las vigencias de forma masiva?',
          type: MessageType.YesNo,
        };
        const confirmBottomSheet = this._bottomSheet.open(GenericBottomSheetComponent, { data: confirmParams, disableClose: false });
        confirmBottomSheet.instance.close.subscribe((res: any) => {
          if (res) {
            showMessageAndAssignTimeLines(true, applyToAllMessage);
          }
        });
      }
      else if (response == 'withoutValidity')
      {
        showMessageAndAssignTimeLines(false, applyToUnassignedOnlyMessage);
      }
    });
  }

  selectYear(year: ConfigLeaveOu) {
    this.selectedYear = this.availableYears.find(x => x.id == year.id);
    this.refresh();
  }
}
