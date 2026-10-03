import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CandidateFindRoutingModule } from './candidateFind-routing.module';
import { CandidateFindComponent } from './candidateFind.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MyMaterialModule } from '../../../app.material';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../../shared/services/employee.service';
import { CsPaginatorModule } from '../../shared/cs-paginator/cs-paginator.module';
import { AvatarModule } from 'ngx-avatar';
import { MatRippleModule } from '@angular/material/core';
import { MatMenuModule } from '@angular/material/menu';
import { CertificateDeclarationModule } from '../certificate-declaration/certificate-declaration.module';
import { EmployeeDetailModule } from '../employee-detail/employee-detail.module';
import { NgxMaskModule } from 'ngx-mask';
import { AdvancedEmployeeSearchModule } from '../../shared/advanced-employee-search/advanced-employee-search.module';
import { SharedPipeModule } from '../../shared/pipes/shared-pipe.module';
import { CsGridControlModule } from '../../shared/cs-grid-control/cs-grid-control.module';
import { AddDocumentationModule } from '../add-documentation/add-documentation.module';
import { GenericBottomSheetComponent } from '../../shared/generic-bottom-sheet/generic-bottom-sheet.component';
import { GenericBottomsheetModule } from '../../shared/generic-bottom-sheet/generic-bottom-sheet.module';
import { CandidatePromotionModule } from '../candidate-promotion/candidate-promotion.module';
import { ChapaModule } from '../../shared/chapa/chapa.module';
import { DocumentationTypeSetConfigurationDialogModule } from '../documentation-type-set-configuration-dialog/documentation-type-set-configuration-dialog.module';
import { AddCandidateDialogModule } from '../add-candidate-dialog/add-candidate-dialog.module';

@NgModule({
    declarations: [
        CandidateFindComponent
    ],
    imports: [
        CommonModule,
        FlexLayoutModule,
        CandidateFindRoutingModule,
        MatCheckboxModule,
        MatSlideToggleModule,
        MyMaterialModule,
        MatMenuModule,
        MatRippleModule,
        FormsModule,
        CsPaginatorModule,
        AvatarModule,
        CertificateDeclarationModule,
        EmployeeDetailModule,
        NgxMaskModule,
        AdvancedEmployeeSearchModule,
        SharedPipeModule.forRoot(),
        CsGridControlModule,
        AddDocumentationModule,
        GenericBottomsheetModule,
        CandidatePromotionModule,
        ChapaModule,
        DocumentationTypeSetConfigurationDialogModule,
        AddCandidateDialogModule
    ],
    providers: [
        EmployeeService
    ]
})
export class CandidateFindModule { }
