import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FrameEmployeeComponent } from './frameEmployee.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MyMaterialModule } from 'src/app/app.material';
import { ProfileModule } from 'src/app/modules/profile/profile.module';
import { ControlsModule } from '../controls/controls.module';
import { MatMenuModule } from '@angular/material/menu';
import { MatRadioModule } from '@angular/material/radio';
import { FrameRoutingModule } from './frame-employee-routing.module';
import { EmployeeProcessService } from '../../shared/services/employee-process.service';
import { AvatarModule } from 'ngx-avatar';
import { PersonService } from '../../shared/services/person.service';
import { ContainerTypeService } from '../../shared/services/container-type.service.';
import { DocumentationTypesService } from '../../shared/services/documentation-types.service';
import { UiNotificationsService } from '../../shared/services/ui-notifications.service';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { AutocompleteChipModule } from '../../shared/autocomplete-chip/autocomplete-chip.module';


@NgModule({
  imports: [
    CommonModule,
    MyMaterialModule,
    ProfileModule,
    FlexLayoutModule,
    ControlsModule,
    MatMenuModule,
    MatRadioModule,
    FrameRoutingModule,
    AvatarModule,
    MatAutocompleteModule,
    AutocompleteChipModule
  ],
  declarations: [FrameEmployeeComponent],
  providers: [
    EmployeeProcessService,
    PersonService,
    ContainerTypeService,
    DocumentationTypesService,
    UiNotificationsService
  ]
})
export class FrameEmployeeModule { }
