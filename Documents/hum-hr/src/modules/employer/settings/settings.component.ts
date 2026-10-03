import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTabChangeEvent, MatTabGroup } from '@angular/material/tabs';
import { AuthService } from '../../shared/auth/auth.service';
import { MessageService } from '../../shared/errorHandler/message.service';
import { OrganizationalUnit } from '../../shared/models/organizational-unit.model';
import { OrganizationalUnitService } from '../../shared/services/organizational-unit.service';
import { AppearanceComponent } from '../appearance/appearance.component';
import { EmailConfigComponent } from '../email-config/email-config.component';
import { PermissionsComponent } from '../permissions/permissions.component';
import { ConfigLeaveOu } from '../../shared/models/Employee/config-leave-ou.model';
import { WorkDaysConfigComponent } from '../frame/work-days-config/work-days-config.component';
import { LeaveRulesComponent } from '../leave-rules/leave-rules.component';
import { CalendarHolidaysComponent } from '../calendar-holidays/calendar-holidays.component';
import { WorkflowApproveComponent } from '../workflow-approve-rule/workflow-approve.component';
import { LeaveService } from '../../shared/services/leave.service';
import { LeaveTimesLinesComponent } from '../leave-time-lines/leave-times-lines.component';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styles: [
  ]
})
export class SettingsComponent implements OnInit {
  organizationalUnits: OrganizationalUnit[];
  selectedOrganizationalUnit: OrganizationalUnit;
  parentOu: OrganizationalUnit;
  loading = false;
  ouLoaded = false;
  showDetail = false;
  configTabs = ConfigTabs;
  childTab = 0;
  isCandidateAdmin = false;
  isCandidateAdminBasic = false;
  isRRHHAccess = false;
  showSettings = false;
  isLeaveConfig = false;
  configOu: ConfigLeaveOu[];
  configLeaveOuId = 0;
  @ViewChild(PermissionsComponent) _permisssions: PermissionsComponent;
  @ViewChild(EmailConfigComponent) _emailConfig: EmailConfigComponent;
  @ViewChild(AppearanceComponent) _appearanceComponent: AppearanceComponent;
  @ViewChild(LeaveTimesLinesComponent) _leavetimelines: LeaveTimesLinesComponent;
  @ViewChild(WorkDaysConfigComponent) _workDaysComponent: WorkDaysConfigComponent;
  @ViewChild(LeaveRulesComponent) _leaveRules: LeaveRulesComponent;
  @ViewChild(CalendarHolidaysComponent) _holidays: CalendarHolidaysComponent;
  @ViewChild(WorkflowApproveComponent) _workflowApprove: WorkflowApproveComponent;
  showOus= false;
  @ViewChild("tab", { static: false }) tab: MatTabGroup;

  constructor(
    private organizationalUnitService: OrganizationalUnitService,
    private msjService: MessageService,
    private authService: AuthService,
    private readonly leaveService: LeaveService
  ) { }

  ngOnInit(): void {
    this.loading = true;
    this.isCandidateAdmin = this.authService.isCandidateAdmin();
    this.isCandidateAdminBasic = this.authService.isCandidateAdminBasic();
    this.isRRHHAccess = this.authService.isAdministrator();
    this.showSettings = this.authService.RRHHManagment();
    this.isLeaveConfig = this.authService.isLeaveConfig();
    this.organizationalUnitService.getTreeInMemory()
      .then(ous => {
        this.organizationalUnits = ous.filter(o => o.isRoot === false);
        this.parentOu = ous.find(o => o.isRoot);
        if (this.organizationalUnitService.getCurrentOU() == null) {
          this.selectChildOu(this.organizationalUnits[0]);
          this.organizationalUnitService.setCurrentOU(this.organizationalUnits[0]);
        } else {
          // Si es root hacer otra cosa!
          const currentOu = this.organizationalUnitService.getCurrentOU();
          if (currentOu.isRoot) {
            this.selectRootOu();
          } else {
            this.selectChildOu(currentOu);
          }

          if (this.organizationalUnitService.getCurrentOU().isRoot) {
            this.parentOu.selected = true;
          } else {
            this.organizationalUnits.find(ou => ou.id === this.selectedOrganizationalUnit.id).selected = true;
          }
        }
        this.ouLoaded = true;
        this.loading = false;
      },
        err => {
          this.loading = false;
          this.msjService.showError(err);
        }
      );
  }

  selectRootOu() {
    this.organizationalUnits.map(o => o.selected = false);
    this.parentOu.selected = true;
    this.selectedOrganizationalUnit = this.parentOu;
    this.organizationalUnitService.setCurrentOU(this.selectedOrganizationalUnit);
    this.childTab = 0;
    this.tab.selectedIndex = 0;
  }

  selectChildOu(ou: OrganizationalUnit) {
    this.loading = true;
    this.organizationalUnits.map(o => o.selected = false);
    if (this.parentOu) {
      this.parentOu.selected = false;
    }
    ou.selected = true;
    this.selectedOrganizationalUnit = ou;
    this.organizationalUnitService.setCurrentOU(this.selectedOrganizationalUnit);
    this.loading = false;

    this.getConfigLeaveOu(ou);
    this.refreshChildComponent(this._permisssions);
    this.refreshChildComponent(this._emailConfig);
    this.refreshChildComponent(this._appearanceComponent);
    this.refreshChildComponent(this._leavetimelines);
    this.refreshChildComponent(this._holidays);
    this.refreshChildComponent(this._workflowApprove);
    if (this._permisssions) {
      this._permisssions.ouSelected = ou;
      this._permisssions.ngOnInit();
    }
  }

  myTabFocusChange(changeEvent: MatTabChangeEvent) {
    this.childTab = changeEvent.index;
    this.showDetail = false;
  }

  openDetailChanged(openDetail: boolean) {
    this.showDetail = openDetail;
  }

  refreshChildComponent(component: any) {
    if (component) {
      component.ngOnInit();
    }
  }

  refreshRules(component: any)
  {
    if (component) {
    component.ouSelected = this.selectedOrganizationalUnit;
    this.leaveService.getConfigLeaveOu(this.selectedOrganizationalUnit.id).toPromise().then(
      data => {
        this.configOu  = data;
        component.ngOnInit();
      },
      err => {this.configOu = [];}
    );
  }

  }
  toggleOus(){
    this.showOus=true;
  }

  closeOus(){
    this.showOus=false;
  }

  reloadRules(){
    this.refreshRules(this._leaveRules);
    this.refreshRules(this._leavetimelines);
  }

  getConfigLeaveOu(ou: OrganizationalUnit) {
    this.leaveService.getConfigLeaveOu(ou.id).toPromise().then(
      data => {
        this.configOu = data ?? [];

        if (this.configOu.length > 0 && this.configOu[0]?.id > 0) {
          this.refreshRules(this._workDaysComponent);
          this.refreshRules(this._leaveRules);
          this.refreshRules(this._workflowApprove);
        }
      },
      err => {
        this.configOu = [];
      }
    );
  }
}



export enum ConfigTabs {
  APPEARANCE = 0,
  PERMISSIONS = 1,
  EMAIL = 2
}
