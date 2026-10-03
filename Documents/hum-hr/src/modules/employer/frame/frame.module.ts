import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FrameComponent } from './frame.component';
import { FrameRoutingModule } from './frame-routing.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MyMaterialModule } from 'src/app/app.material';
import { ProfileModule } from 'src/app/modules/profile/profile.module';
import { ControlsModule } from '../controls/controls.module';
import { MatMenuModule } from '@angular/material/menu';
import { EmployeeService } from '../../shared/services/employee.service';
import { ContainerTypeService } from '../../shared/services/container-type.service.';
import { AddMenuDialogModule } from '../add-menu-dialog/add-menu-dialog.module';
import { AvatarModule } from 'ngx-avatar';
import { AddMenuDialogComponent } from '../add-menu-dialog/add-menu-dialog.component';
import { ReleaseNotesDialogModule } from '../../shared/release-notes-dialog/release-notes-dialog.module';
import { UiNotificationsService } from '../../shared/services/ui-notifications.service';
import { CertificateDeclarationModule } from '../certificate-declaration/certificate-declaration.module';
import { SharePersonResponseDialogModule } from '../share-person-response-dialog/share-person-response-dialog.module';
import { SharePersonResponseDialogComponent } from '../share-person-response-dialog/share-person-response-dialog.component';
import { AutocompleteChipModule } from '../../shared/autocomplete-chip/autocomplete-chip.module';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

@NgModule({
    imports: [
        CommonModule,
        MyMaterialModule,
        ProfileModule,
        FlexLayoutModule,
        FrameRoutingModule,
        ControlsModule,
        MatMenuModule,
        AddMenuDialogModule,
        AvatarModule,
        ReleaseNotesDialogModule,
        CertificateDeclarationModule,
        SharePersonResponseDialogModule,
        MatAutocompleteModule,
        AutocompleteChipModule
    ],
    declarations: [FrameComponent],
    providers: [
        EmployeeService,
        ContainerTypeService,
        UiNotificationsService
    ]
})
export class FrameModule {}
