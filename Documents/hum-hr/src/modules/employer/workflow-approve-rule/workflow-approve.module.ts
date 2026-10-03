import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule} from '@angular/material/card';
import { WorkflowApproveComponent } from './workflow-approve.component';

@NgModule({
  declarations: [
    WorkflowApproveComponent
  ],
  imports: [
    CommonModule,
    MatExpansionModule,
    MatIconModule,
    FlexLayoutModule,
    MatMenuModule,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatButtonModule,
    MatProgressBarModule,
    MatCardModule,
  ],
  exports: [
    WorkflowApproveComponent
  ]
})
export class WorkflowApproveModule { }
