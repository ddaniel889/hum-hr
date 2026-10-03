import { Component, OnInit, Input } from '@angular/core';
import { ContainerType, User } from '../../shared/models';
import { LeaveService } from '../../shared/services/leave.service';
import { ConfigLeaveEmployee } from '../../shared/models/Employee/config-leave-employee.model';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ConfigLeaveEmployeeParams } from '../../shared/models/configLeaveEmployeeParams.model';
import { MessageService } from '../../shared/errorHandler/message.service';
import { AdditionalDays } from '../../shared/models/Employee/additional-type.model';
import { LeaveRequestFind } from '../../shared/models/leave-request-find.model';
import { LeaveTimeLine } from '../../shared/models/times-lines.model';
import { employeeFindFilters } from '../../shared/models/Employee/employee-find-filters';
import { AprobadoresSearchParams } from '../../shared/models/Employee/approvers-search-params.model';
import { AdvancedEmployeeFilters } from '../../shared/models/Employee/advanced-employee-filters';
import { AdjectiveRolesUser } from '../../shared/models/adjective-roles-user.model';
import { KeyValuePair } from '../../shared/models/Generics/ikeyValuePair.model';
import { EmployeeMetadata } from '../../shared/models/employee-metadata.model';
import { OrganizationalUnitService } from '../../shared/services/organizational-unit.service';
import { LeaveApprovers } from '../../shared/models/approvers.model';
import { EmployeeLeaveService } from '../../shared/services/employee-leave-requests.service';
import { AuthService } from '../../shared/auth/auth.service';
import { WorkflowApproveType } from '../../shared/models/Employee/leave-type-ou.model';
import { ConfigLeaveOu } from '../../shared/models/Employee/config-leave-ou.model';

@Component({
  selector: 'app-leave-config-employee',
  templateUrl: './leave-config-employee.component.html',
  styleUrls: []
})
export class LeaveConfigEmployeeComponent implements OnInit {
  private _user: User;
  @Input()
  set user(user: User) {
    this._user = user;
  }
  get user(): User {
    return this._user;
  }
  @Input() isValidator: boolean = false;
  @Input() userId: number = 0;
  @Input() isActiveEmployee: boolean = true;
  @Input() isLeaveConfig: boolean = true;
  @Input() organizationalUnitId : number;
  @Input() isCandidate = false;

  baseConfigForm: UntypedFormGroup;
  additionalDaysForm: UntypedFormGroup;
  baseDaysForm: UntypedFormControl;
  configLeaveEmployee: ConfigLeaveEmployee[] = [];
  isConfigLoaded: boolean;
  selectedEditingControl: string;
  leaveConfig: ConfigLeaveEmployee;
  editing: boolean = false;
  editingApprovers: boolean = false;
  editingAdditionalDays: boolean = false;
  canClick: boolean = true;
  saving: boolean = false;
  selectedTimeLines: LeaveTimeLine[] = [];
  selectedApprovers: LeaveApprovers[] = [];
  timeLinesOu: LeaveTimeLine[] = [];
  availableTimeLines: LeaveTimeLine[] = [];
  approversOu: LeaveApprovers[] = [];
  inputValue:string;
  containerType: ContainerType;
  containerTypeId:string;
  employeeFindFilter: employeeFindFilters;
  orderBy: string;
  orderAsc: boolean;
  allSelected = false;
  filterName: string;
  loading = false;
  pageIndex: number;
  itemsCount: number;
  searchOpened: boolean;
  isCertificateDeclarationOpen = false;
  documentIds = new Array<number>();
  active: boolean;
  isEmployeeEditOpened: boolean;
  withActiveCertificate: boolean;
  withPendingCertificate: boolean;
  withoutCertificate: boolean;
  empId = 0;
  isRRHH: boolean;
  isAdministrator: boolean;
  isRRHHAdmin:boolean;
  isCandidateAdmin: boolean;
  isCandidateAdminBasic: boolean;
  employeeManagement: boolean;
  columnsClass: string;
  private empSub: any;
  showResults = false;
  urlBase = location.origin;
  useMassivePendingNotification = false;
  dataPreview: LeaveApprovers[] = [];
  // Advanced employee filters
  public readonly ACTIVE = 'Activo';
  neverLoggedInUsers = 0;
  pendingUsers = 0;
  hasLogin: boolean;
  hasLoginFilter = true;
  hasNotLoginFilter = true;
  activeEmployees = true;
  inactiveEmployees = false;
  clickOnce = false;
  useSaml = false;
  hasFiltersMetadataEMPLOYEE = false;
  showNotifyPendingButton = false;
  columns: KeyValuePair<string, EmployeeMetadata>[] = [];
  exportColumns: KeyValuePair<string, EmployeeMetadata>[] = [];cd
  selectedView: KeyValuePair<string, string>;
  filtersmetadata: AdjectiveRolesUser[] = [];
  workflowApproveType: WorkflowApproveType
  mailEmployee:string;
  employeeFilters: AdvancedEmployeeFilters = {
    selectedEmployeeFind: [],
    segmentSearch: true,
    nroLegSearch: undefined,
    cuilSearch: undefined,
    inactiveSearch: false,
    activeSearch: true
  };
  selectedYear: ConfigLeaveOu;
  availableYears: ConfigLeaveOu[] = [];
  totalAvailableDays: number = 0;
  expiredSelectedYear: boolean = false;
  selectedYearActive: boolean = false;
  emptyApprovers: LeaveApprovers[];
  approverSaveBtn: boolean = true;

  isLeaveApprove:boolean;
  constructor(
    private leaveService: LeaveService,
    private _formBuilder: UntypedFormBuilder,
    private msjService: MessageService,
    private organizationalUnitService: OrganizationalUnitService,
    private employeeLeaveService: EmployeeLeaveService,
    private authService: AuthService,
  ) {

  }

  async ngOnInit() {
    try {
      this.loading = true;
      if (this._user && !this.isValidator) {
        this.mailEmployee = localStorage.getItem("mailEmployee");
        this.isLeaveApprove = this.authService.isLeaveApprov();

        await this.loadConfigLeaveOu();
        await this.refresh();

        if (this.selectedYear?.leaveTypeOu != null) {
          this.workflowApproveType = this.selectedYear.leaveTypeOu.workflowApprove;
        }
      }
      else if (this.isValidator)
      {
        await this.loadConfigLeaveOu();
        await this.loadConfigLeaveByValidator(this.userId);
        this.calculateTotalAvailableDays();
        this.selectedYearActive = this.isSelectedYearActive();

        if(this.selectedYear != undefined)
        {
          this.isConfigLoaded = true;
          this.leaveConfig = this.configLeaveEmployee.find(x => x.leaveType && x.leaveType.id == 1 && x.configLeaveOuId == this.selectedYear.id);
        }

        if (this.selectedYear?.leaveTypeOu != null) {
          this.workflowApproveType = this.selectedYear.leaveTypeOu.workflowApprove;
        }
      }
    } catch (error) {
      console.error('Error en ngOnInit:', error);
      this.msjService.showError(error);
    } finally {
      this.loading = false;
    }
  }

  async loadConfigLeaveByValidator(id: number){
    this.loading = true;

    try {
      this.configLeaveEmployee = await this.leaveService.getConfigLeaveByApprover(id).toPromise();

      if(this.configLeaveEmployee != undefined){
        this.calculateTotalAvailableDays();
      }

      if (this.configLeaveEmployee.length > 0) {
        if(this.selectedYear != undefined)
        {
          this.leaveConfig = this.configLeaveEmployee.find(x =>x.leaveType && x.leaveType.id == 1 && x.configLeaveOuId == this.selectedYear.id);
        }

        if (this.leaveConfig) {
          this.isConfigLoaded = true;
          this.baseConfigForm = this._formBuilder.group({
            baseDaysForm: [this.leaveConfig.baseDays, Validators.required]
          });

          //Timelines
          const configTimesLines = this.leaveConfig?.configTimeLines ?? [];
          this.selectedTimeLines = this.leaveConfig?.configTimeLines ?? [];
          localStorage.setItem('employeeConfigTimeLines', JSON.stringify(configTimesLines));

          const configApprovers = this.configLeaveEmployee[0]?.configApprovers ?? [];
          this.selectedApprovers = this.configLeaveEmployee[0].configApprovers ?? [];

          localStorage.removeItem('employeeConfigApprovers');
          localStorage.setItem('employeeConfigApprovers', JSON.stringify(configApprovers));

          const today = new Date();

          if(this.leaveConfig.configTimeLines.some(timeline => {
            const [dayTo, monthTo, yearTo] = timeline.dateTo.split('/');
            const toDate = new Date(+yearTo, +monthTo - 1, +dayTo);
            return today <= toDate;
          })){
            this.expiredSelectedYear = false;
          } else {
            this.expiredSelectedYear = true;
          }
        }
        else
        {
          this.isConfigLoaded = false;
          this.baseConfigForm = this._formBuilder.group({
            baseDaysForm: [1, Validators.required]
          });
          this.selectedTimeLines = [];
          this.selectedApprovers = [];
        }
      }
    }
    catch (error) {
      console.error('Error al cargar la configuración:', error);
      throw error;
    } finally {
      this.loading = false;
    }
  }

  addConfig() {
    const prevConfigLeaveEmployee = this.configLeaveEmployee.length > 0 ?
      this.configLeaveEmployee.reduce((prev, current) =>
        (prev.id > current.id) ? prev : current
      ) : null;
    this.editing = true;
    this.selectedTimeLines = [];
    this.selectedApprovers = prevConfigLeaveEmployee?.configApprovers ?? [];
    this.editingApprovers = false;
  }

  addAdditionalDay() {
    this.editingAdditionalDays = true;
    this.additionalDaysForm = this._formBuilder.group({
      additionalDayForm: [1, Validators.required],
      additionalDayCommentForm: ["", Validators.required]
    });
  }

  isDisabledSaveAdditionalDay() {
    return !this.canClick ||
      this.additionalDaysForm.get('additionalDayForm').hasError('required') ||
      this.additionalDaysForm.get('additionalDayForm').value <= 0 ||
      this.additionalDaysForm.get('additionalDayCommentForm').hasError('required');
  }

  isDisabledSaveConfigTimeLines() {
    let baseDaysValue = this.baseConfigForm?.get('baseDaysForm')?.value;
    return !this.canClick ||
      this.selectTimeLines.length < 1 || baseDaysValue <= 0;
  }

  async refresh() {
    try {
      this.loading = true;
      this.configLeaveEmployee = await this.leaveService.getConfigLeaveEmployee(this._user.id).toPromise();
      this.loadEmployeeConfigLeave();

      this.leaveConfig = this.configLeaveEmployee.find(x =>x.leaveType && x.leaveType.id == 1 && x.configLeaveOuId == this.selectedYear.id);
      const enabledYears = this.availableYears.filter(x => x.enabled && !Number.isNaN(x.id) && x.id == this.selectedYear.id).length;

      if(enabledYears > 0) {
        this.selectedYearActive = true;
      } else  {
        this.selectedYearActive = false;
      }
      await this.findTimesLines();
      await this.loadApprovers();

      this.totalAvailableDays = 0;
      const today = new Date();
      for (const config of this.configLeaveEmployee) {
        if(config.id != 0 && config.leaveType.id == 1 && config.configLeaveOu.enabled && config.configTimeLines.length > 0 &&
           config.configTimeLines.some(timeline => {
             const [dayTo, monthTo, yearTo] = timeline.dateTo.split('/');
             const toDate = new Date(+yearTo, +monthTo - 1, +dayTo);
             return today <= toDate;
           })) {
          this.totalAvailableDays += config.baseDays + config.additionalDaysSum - config.daysConsumed;
        }
      }
    } catch (error) {
      this.msjService.showError(error);
    } finally {
      this.loading = false;
    }
  }

  deleteAdditionalDay(additionalDayId: number) {
    this.leaveService.deleteAdditionalDays(additionalDayId).toPromise().then(
      data => {
        this.msjService.showInfo('Eliminado correctamente');
        this.refresh();
      },
      err => {
        this.msjService.showError(err);
      }
    );
  }

  save()
  {
    if(this.selectedTimeLines.length > 0) {
    this.canClick = false;
    if (this.baseConfigForm.valid) {
      const configToSave: ConfigLeaveEmployeeParams = {
        id: this.leaveConfig?.id,
        userId: this.user.id,
        configLeaveOuId: this.selectedYear.id,
        leaveType: this.leaveConfig?.leaveType,
        additionalDays: this.leaveConfig?.additionalDays,
        // Actualizo los dias base con los que tiene el formulario
        baseDays: this.baseConfigForm.value.baseDaysForm,
        // Actualizo las vigencias/timelines seleccionados.
        configTimesLines: this.selectedTimeLines,
        //Actualizo los aprobadores
        configApprovers: this.configLeaveEmployee.length < 1 ? this.emptyApprovers : this.configLeaveEmployee[0].configApprovers
      };
      this.saving = true;
        this.leaveService.createConfigEmployee(configToSave).toPromise().then(
          data => {
            this.msjService.showInfo('Configuración guardada correctamente');
            this.editing = false;
            this.editingApprovers = false;
            this.configLeaveEmployee.push(data)
            if (this.configLeaveEmployee.length > 0) {
              this.isConfigLoaded = true;
              this.leaveConfig = this.configLeaveEmployee.find(x => x.leaveType.id == 1 && x.configLeaveOuId == this.selectedYear.id);
              this.baseConfigForm = this._formBuilder.group({
                baseDaysForm: [this.leaveConfig.baseDays, Validators.required]
              });
            }
            this.refresh();
            this.saving = false;
            this.canClick = true
          },
          err => {
            this.msjService.showError(err);
            this.saving = false;
            this.canClick = true
            this.cancel()
          }
        );
    }
  } else {
    this.msjService.showInfo("Un empleado debe tener como minimo una vigencia asociada");
  }
  }

  saveApprovers()
  {
    if(this.selectedTimeLines.length > 0) {
    this.canClick = false;
    if (this.baseConfigForm.valid) {
      const configToSave: ConfigLeaveEmployeeParams = {
        id: this.configLeaveEmployee[0]?.id,
        userId: this.user.id,
        configLeaveOuId: this.configLeaveEmployee[0]?.configLeaveOuId,
        leaveType: this.configLeaveEmployee[0]?.leaveType,
        additionalDays: this.configLeaveEmployee[0]?.additionalDays,
        // Actualizo los dias base con los que tiene el formulario
        baseDays: this.configLeaveEmployee[0].baseDays,
        // Actualizo las vigencias/timelines seleccionados.
        configTimesLines: this.configLeaveEmployee[0].configTimeLines,
        //Actualizo los aprobadores
        configApprovers: this.selectedApprovers
      };
      this.saving = true;
        this.leaveService.createConfigEmployee(configToSave).toPromise().then(
          data => {
            this.msjService.showInfo('Aprobadores guardados correctamente');
            this.editing = false;
            this.editingApprovers = false;
            this.configLeaveEmployee.push(data)
            if (this.configLeaveEmployee.length > 0) {
              this.isConfigLoaded = true;
              this.leaveConfig = this.configLeaveEmployee.find(x =>x.leaveType && x.leaveType.id == 1 && x.configLeaveOuId == this.selectedYear.id);
              this.baseConfigForm = this._formBuilder.group({
                baseDaysForm: [this.leaveConfig.baseDays, Validators.required]
              });
            }
            this.refresh();
            this.saving = false;
            this.canClick = true
          },
          err => {
            this.msjService.showError(err);
            this.saving = false;
            this.canClick = true
            this.cancel()
          }
        );
    }
  } else {
    this.msjService.showInfo("Un empleado debe tener como minimo una vigencia asociada");
  }
  }

  saveAdditionalDays(leaveConfigId: number) {
    this.canClick = false
    if (this.additionalDaysForm.valid) {
      const additionalDay: AdditionalDays = {
        days: this.additionalDaysForm.value.additionalDayForm,
        description: this.additionalDaysForm.value.additionalDayCommentForm,
        configLeaveEmployeeId: leaveConfigId
      }
      this.leaveService.createAdditionalDays(additionalDay).toPromise().then(
        resp => {
          this.msjService.showInfo('Días adicionales guardados correctamente');
          this.editingAdditionalDays = false;
          this.refresh();
          this.canClick = true
        },
        error => {
          this.msjService.showError('Error al guardar días adicionales');
          this.canClick = true
        }
      )
    }
  }

  editBaseDays() {
    this.editing = true;
    this.baseConfigForm = this._formBuilder.group({
      baseDaysForm: [this.leaveConfig.baseDays ?? 1, Validators.required]
    });
  }

  editApprovers() {
    this.editingApprovers = true;
  }

  cancelApprovers() {
    this.editingApprovers = false;
    const storedConfigApprovers = localStorage.getItem('employeeConfigApprovers');
    const employeeApprovers = storedConfigApprovers ? JSON.parse(storedConfigApprovers) : [];
    this.selectedApprovers = employeeApprovers;
  }

  cancel() {
    this.editing = false;
    const storedConfigTimesLines = localStorage.getItem('employeeConfigTimeLines');
    const employeeTimeLines = storedConfigTimesLines ? JSON.parse(storedConfigTimesLines) : [];
    this.selectedTimeLines = employeeTimeLines;
    if (this.leaveConfig && this.leaveConfig.baseDays !== undefined) {
      this.baseConfigForm.get('baseDaysForm')?.setValue(this.leaveConfig.baseDays);
    } else {
      this.baseConfigForm.get('baseDaysForm')?.setValue(1);
    }
  }


  cancelAdditionalDay() {
    this.editingAdditionalDays = false;
  }

  getLeaveTypeIcon(configLeaveEmployee: ConfigLeaveEmployee): string {
    switch (configLeaveEmployee.leaveType.id) {
      case 1:
        return 'fa-umbrella-beach'
      case 2:
        return 'fa-stethoscope'
    }
  }

  async findTimesLines() {
    let param: LeaveRequestFind;
    param = {
      organizationalUnitId: this.organizationalUnitId,
      page: 1,
      itemPerPage: 50,
      timeLineEnabled : true
    };
    let res = await this.leaveService
      .getEfectivesTimesLines(param)
      .toPromise();
    this.timeLinesOu = res.values;
    this.availableTimeLines = this.timeLinesOu.filter(x => +x.configLeaveOuId === +this.selectedYear.id);
  }

  selectTimeLines(tlName: any) {
      const foundTimeLines = this.timeLinesOu.filter(tl => tl.name == tlName);
      if (foundTimeLines.length) {
        this.selectedTimeLines.push(foundTimeLines[0]);
      }
  }

  selectApprovers(tlName: any) {
    const startIndex = tlName.indexOf('(');
    const endIndex = tlName.indexOf(')', startIndex);

    let value = '';
    if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex) {
        value = tlName.substring(startIndex + 1, endIndex);
    }

    const foundApprovers = this.approversOu.filter(tl => tl.noLegajo == value);
    if (foundApprovers.length) {
      this.selectedApprovers.push(foundApprovers[0]);
      this.approverSaveBtn = false;
    }
  }

  filterApprovers(tlName: any) {
    if (tlName && tlName.length > 2) {
      const lowerCaseTlName = tlName.toLowerCase();
      this.approversOu = this.dataPreview.filter(item => item.name.toLowerCase().includes(lowerCaseTlName));
    } else {
      this.approversOu = [];
    }
  }

  itemRemovedApprovers(item: any) {
    this.selectedApprovers = this.selectedApprovers.filter(tl => tl.mail != item.mail);
    this.approverSaveBtn = false;
  }

  itemRemovedTimelines(item: any) {
    this.selectedTimeLines = this.selectedTimeLines.filter(tl => tl.name != item.name);
  }

  async loadApprovers() {
      this.loading = true;
      this.containerTypeId = localStorage.getItem("containerTypeId");
      this.allSelected = false;
      const orderBy = [];
      orderBy.push("m.factivo");
      let param: AprobadoresSearchParams;
      const organizationUnitIds: number[] = [this.organizationalUnitId];
      param = {
        containerTypeId: parseInt(this.containerTypeId),
        orderBy: orderBy,
        orderAscendent: true,
        itemPerPage: 0,
        organizationUnitIds: organizationUnitIds,
        hasLogin: null,
        active:true,
        certificateParamter: {
          withActiveCertificate: true,
          withPendingCertificate: true,
          withoutCertificate: true
        },
        metadataParameters: []
      };
      this.leaveService
          .getApprovers(
              param
          )
          .toPromise()
          .then(
              data => {
                  this.loading = false;
                  this.dataPreview = data;
                  if(this.mailEmployee != undefined){
                   this.dataPreview =  this.dataPreview.filter(x=>x.mail != this.mailEmployee);
                  }
              },
              err => {
                  this.msjService.showError(err);
                  this.loading = false;
              }
          );
  }
  onlyisLeaveApprove() {
    if (!localStorage.getItem("roles")) {
      return false;
    }
    const roles = localStorage.getItem("roles").split(",");
   return roles.length == 1 && this.isLeaveApprove;
  }

  isLeaveAprovConfig(){
    return this.isLeaveApprove && this.isLeaveConfig && this.hasFiltersMetadatos();
  }

  hasFiltersMetadatos() {
    let hasAdjetivation = JSON.parse(localStorage.getItem("hasFiltersMetadata")) as boolean ?? true;
    return hasAdjetivation;
  }

  async loadConfigLeaveOu() {
    try {
      const currentOu = this.organizationalUnitService.getCurrentOU();
      if(currentOu == undefined)
      {
        const ouid = Number(localStorage.getItem("organizationId"));
        if (isNaN(ouid)) throw new Error("Organization ID must be a number");
        const data = await this.employeeLeaveService.getMyConfigLeaveOU(ouid).toPromise();
        this.availableYears = data;
      }
      else
      {
        const data = await this.employeeLeaveService.getMyConfigLeaveOU(currentOu.id).toPromise();
        this.availableYears = data;
      }
      const enabledYears = this.availableYears.filter(year => year.enabled);
      if (enabledYears.length > 0) {
        this.selectedYear = this.selectedYear ?? enabledYears.reduce((a, b) =>
          a.year > b.year ? a : b
        );
      } else {
        this.expiredSelectedYear = true;
        this.selectedYear = this.selectedYear ?? this.availableYears.reduce((a, b) =>
          a.year > b.year ? a : b
        );
      }
    } catch (error) {
      console.error('Error cargando configuración:', error);
      this.msjService.showError(error);
    }
  }

  getLeaveDaysText(): string {
  const days = this.leaveConfig.baseDays + this.leaveConfig.additionalDaysSum - (this.leaveConfig?.daysConsumed || 0);
  const status = this.expiredSelectedYear ? 'expirado' : 'pendiente';

    if (days === 1) {
      return `1 día ${status}`;
    } else {
      return `${days} días ${status}${days !== 1 ? 's' : ''}`;
    }
  }

  getDaysText(days: number): {daysText: string, availableText: string, totalText: string} {
    if (days === 1) {
      return {
        daysText: '1 día',
        availableText: 'Disponible',
        totalText: 'Total'
      };
    } else {
      return {
        daysText: `${days} días`,
        availableText: 'Disponibles',
        totalText: 'Total'
      };
    }
  }

  loadEmployeeConfigLeave(){
    this.leaveConfig = this.configLeaveEmployee.find(x =>x.leaveType && x.leaveType.id == 1 && x.configLeaveOuId == this.selectedYear.id);

    if (this.leaveConfig) {
      this.isConfigLoaded = true;
      this.baseConfigForm = this._formBuilder.group({
        baseDaysForm: [this.leaveConfig.baseDays, Validators.required]
      });

      //Timelines
      const configTimesLines = this.leaveConfig?.configTimeLines ?? [];
      this.selectedTimeLines = this.leaveConfig?.configTimeLines ?? [];
      localStorage.setItem('employeeConfigTimeLines', JSON.stringify(configTimesLines));

      const configApprovers = this.configLeaveEmployee[0]?.configApprovers ?? [];
      this.selectedApprovers = this.configLeaveEmployee[0].configApprovers ?? [];

      localStorage.removeItem('employeeConfigApprovers');
      localStorage.setItem('employeeConfigApprovers', JSON.stringify(configApprovers));

      const today = new Date();
      if(this.leaveConfig.configTimeLines.some(timeline => {
          const [dayTo, monthTo, yearTo] = timeline.dateTo.split('/');
          const toDate = new Date(+yearTo, +monthTo - 1, +dayTo);
          return today <= toDate;
        })){
          this.expiredSelectedYear = false;
        } else {
          this.expiredSelectedYear = true;
        }
    } else {
      this.isConfigLoaded = false;
      this.baseConfigForm = this._formBuilder.group({
        baseDaysForm: [1, Validators.required]
      });
      this.selectedTimeLines = [];
      this.selectedApprovers = [];
    }
  }

  selectYear(year: ConfigLeaveOu) {
    this.selectedYear = this.availableYears.find(x => x.id == year.id);
    this.loadEmployeeConfigLeave();
    this.availableTimeLines = this.timeLinesOu.filter(x => +x.configLeaveOuId === +this.selectedYear.id);
    const enabledYears = this.availableYears.filter(x => x.enabled && !Number.isNaN(x.id) && x.id == year.id).length;

    if(enabledYears > 0) {
      this.selectedYearActive = true;
    } else  {
      this.selectedYearActive = false;
    }
  }

  isSelectedYearActive(): boolean {
      if (!this.selectedYear || !this.availableYears) {
        return false;
      }

      let yearActive = this.availableYears.some(year =>
        year.enabled &&
        !Number.isNaN(year.id) &&
        year.id === this.selectedYear.id
      );
      return yearActive;
  }

  calculateTotalAvailableDays() {
      this.totalAvailableDays = 0;
      const today = new Date();
      for (const config of this.configLeaveEmployee)
      {
        if(config.leaveType.id == 1 && config.configLeaveOu.enabled && config.configTimeLines.length > 0 &&
           config.configTimeLines.some(timeline => {
             const [dayTo, monthTo, yearTo] = timeline.dateTo.split('/');
             const toDate = new Date(+yearTo, +monthTo - 1, +dayTo);
             return today <= toDate;
           })) {
          this.totalAvailableDays += config.baseDays + config.additionalDaysSum - config.daysConsumed;
        }
      }
  }
}
