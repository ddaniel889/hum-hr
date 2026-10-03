import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeEmployerRoutingModule } from './homeEmployer-routing.module';
import { HomeEmployerComponent } from './homeEmployer.component';
import { MyMaterialModule } from '../../../app.material';
import { WelcomeEmployerModule } from '../welcomeEmployer/welcomeEmployer.module';
import { InboxModule } from '../inbox/inbox.module';
import { ProfileModule } from '../../profile/profile.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { EmployeeService } from '../../shared/services/employee.service';
import { MatMenuModule } from '@angular/material/menu';
import { ContainerTypeService } from '../../shared/services/container-type.service.';


@NgModule({
  imports: [
    CommonModule,
    HomeEmployerRoutingModule,
    MyMaterialModule,
    WelcomeEmployerModule,
    InboxModule,
    MatRadioModule,
    ProfileModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MatMenuModule
  ],
  providers: [
    EmployeeService, ContainerTypeService
  ],
  declarations: [HomeEmployerComponent]
})
export class HomeEmployerModule { }
