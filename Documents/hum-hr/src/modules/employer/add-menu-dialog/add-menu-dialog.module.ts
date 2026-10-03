import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddMenuDialogComponent } from './add-menu-dialog.component';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatStepperModule } from '@angular/material/stepper';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ReactiveFormsModule, FormsModule, FormGroup } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MyMaterialModule } from 'src/app/app.material';
import { NgxMaskModule } from 'ngx-mask';
import { FileDndModule } from '../../shared/file-dnd/file-dnd.module';
import { AddDocumentationModule } from '../add-documentation/add-documentation.module';
import { CustomControlModule } from '../../shared/custom-control/custom-control.module';
import { MetadataService } from '../../shared/services/metadatas.service';
import { AddPersonModule } from '../add-person/add-person.module';
import { CandidateService } from '../../shared/services/candidate.service';
import { HelpIndexModule } from '../../shared/help-index/help-index.module';

@NgModule({
  imports: [
    CommonModule,
    MatStepperModule,
    MatToolbarModule,
    MatRadioModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    MatOptionModule,
    MatSelectModule,
    MyMaterialModule,
    FileDndModule,
    MatDatepickerModule,
    NgxMaskModule.forRoot(),
    AddDocumentationModule,
    MatSlideToggleModule,
    CustomControlModule,
    AddPersonModule,
    MatDialogModule,
    HelpIndexModule,
  ],
  declarations: [AddMenuDialogComponent],
  exports: [AddMenuDialogComponent],
  providers: [MetadataService, CandidateService]
})
export class AddMenuDialogModule { }


