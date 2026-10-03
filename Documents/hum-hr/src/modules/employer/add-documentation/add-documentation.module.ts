import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatCardModule } from "@angular/material/card";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatRippleModule } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatMenuModule } from "@angular/material/menu";
import { MatRadioModule } from "@angular/material/radio";
import { MatSelectModule } from "@angular/material/select";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatStepperModule } from "@angular/material/stepper";
import { MatTabsModule } from "@angular/material/tabs";
import { MyMaterialModule } from "src/app/app.material";
import { FlexLayoutModule } from "@angular/flex-layout";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { FileDndModule } from "../../shared/file-dnd/file-dnd.module";
import { CsPaginatorModule } from "../../shared/cs-paginator/cs-paginator.module";
import { AvatarModule } from 'ngx-avatar';
import { AddDocumentationComponent } from "./add-documentation.component";
import { DocumentationTypesService } from "../../shared/services/documentation-types.service";
import { CustomControlModule } from "../../shared/custom-control/custom-control.module";
import { DocumentationService } from "../../shared/services/documentation.service";
import { NgxMaskModule } from "ngx-mask";
import { AutocompleteChipModule } from "../../shared/autocomplete-chip/autocomplete-chip.module";
import { AdvancedEmployeeSearchModule } from '../../shared/advanced-employee-search/advanced-employee-search.module';
import { FormioCardinalModule } from '../../formioCs/formio-cardinal.module';
import { WebScannerModule } from '../../shared/web-scanner/web-scanner.module';
import { GenericBottomsheetModule } from "../../shared/generic-bottom-sheet/generic-bottom-sheet.module";
import { FileDocumentDetailModule } from '../../shared/file-document-detail/file-document-detail.module';
import { ChapaModule } from "../../shared/chapa/chapa.module";


@NgModule({
  imports: [
    CommonModule,
    MatFormFieldModule,
    MyMaterialModule,
    FlexLayoutModule,
    MatRadioModule,
    MatRippleModule,
    MatIconModule,
    MatSelectModule,
    MatCheckboxModule,
    FormsModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatCardModule,
    MatInputModule,
    MatDatepickerModule,
    FileDndModule,
    CsPaginatorModule,
    AvatarModule,
    MatSlideToggleModule,
    MatMenuModule,
    CustomControlModule,
    FileDocumentDetailModule,
    NgxMaskModule,
    AutocompleteChipModule,
    AdvancedEmployeeSearchModule,
    FormioCardinalModule,
    WebScannerModule,
    MatTabsModule,
    GenericBottomsheetModule,
    ChapaModule

  ],
  declarations: [AddDocumentationComponent],
  exports: [AddDocumentationComponent],
  providers: [DocumentationTypesService, DocumentationService]
})
export class AddDocumentationModule { }
