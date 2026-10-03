import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SettingsRoutingModule } from './settings-routing.module';
import { SettingsComponent } from './settings.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { ChapaModule } from '../../shared/chapa/chapa.module';
import { MatExpansionModule } from '@angular/material/expansion';
import { PermissionsModule } from '../permissions/permissions.module';
import { AppearanceModule } from '../appearance/appearance.module';
import { EmailConfigModule } from '../email-config/email-config.module';
import { HelpLinkConfigModule } from '../help-link-config/help-link-config.module';
import { OuDescriptionConfigModule } from '../ou-description-config/ou-description-config.module';
import { LeaveTimesLinesModule } from '../leave-time-lines/leave-times-lines.module';
import { CsPaginatorModule } from '../../shared/cs-paginator/cs-paginator.module';
import { WorkDaysConfigModule } from '../frame/work-days-config/work-days-config.module';
import { LeaveRulesModule } from "../leave-rules/leave-rules.module";
import { CalendarHolidaysModule } from '../calendar-holidays/calendar-holidays .module';
import { WorkflowApproveModule } from '../workflow-approve-rule/workflow-approve.module';

@NgModule({
  declarations: [SettingsComponent],
  imports: [
    CommonModule,
    SettingsRoutingModule,
    FlexLayoutModule,
    MatToolbarModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTabsModule,
    ChapaModule,
    MatExpansionModule,
    PermissionsModule,
    AppearanceModule,
    EmailConfigModule,
    HelpLinkConfigModule,
    OuDescriptionConfigModule,
    CsPaginatorModule,
    LeaveTimesLinesModule,
    WorkDaysConfigModule,
    LeaveRulesModule,
    CalendarHolidaysModule,
    WorkflowApproveModule
]
})
export class SettingsModule { }
