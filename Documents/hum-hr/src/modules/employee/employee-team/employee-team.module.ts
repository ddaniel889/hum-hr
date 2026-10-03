import { NgModule } from "@angular/core";
import { EmployeeTeamComponent } from "./employee-team.component";
import { CommonModule } from "@angular/common";
import { FlexLayoutModule } from "@angular/flex-layout";
import { EmployeeService } from "../../shared/services/employee.service";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatCardModule } from "@angular/material/card";
import { MatMenuModule } from "@angular/material/menu";
import { MatRippleModule } from "@angular/material/core";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatButtonModule } from "@angular/material/button";
import { MatDividerModule } from "@angular/material/divider";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { TeamRoutingModule } from './team-routing.module';
import { ProfileModule } from "../../profile/profile.module";
import { ChapaModule } from "../../shared/chapa/chapa.module";
import { MatTabsModule } from "@angular/material/tabs";
import { AuthService } from "../../shared/auth/auth.service";
import { LeaveService } from "../../shared/services/leave.service";
import { LocalStorageService } from "../../shared/services/local-storage.service";
import { FormsModule } from "@angular/forms";
import { EmployeeDetailModule } from "../../employer/employee-detail/employee-detail.module";
import { CsPaginatorModule } from "../../shared/cs-paginator/cs-paginator.module";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { NgxMaskModule } from "ngx-mask";

@NgModule({
  declarations: [EmployeeTeamComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatMenuModule,
    MatRippleModule,
    MatSidenavModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatToolbarModule,
    MatCardModule,
    ProfileModule,
    ChapaModule,
    MatTabsModule,
    TeamRoutingModule,
    FormsModule,
    EmployeeDetailModule,
    CsPaginatorModule,
    MatProgressBarModule,
    NgxMaskModule
  ],
  providers: [
    AuthService,
    EmployeeService,
    LeaveService,
    LocalStorageService
  ]
})
export class EmployeeTeamModule {}
