import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { EmployeeFindRoutingModule } from './employeeFind-routing.module';
import { EmployeeFindComponent } from './employeeFind.component';
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
import { ChapaModule } from '../../shared/chapa/chapa.module';
import { AddDocumentationDialogModule } from '../add-documentation-dialog/add-documentation-dialog.module';

@NgModule({
  declarations: [
    EmployeeFindComponent
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    EmployeeFindRoutingModule,
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
    ChapaModule,
    AddDocumentationDialogModule
  ],
  providers: [
    EmployeeService
  ],
})
export class EmployeeFindModule { }
