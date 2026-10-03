import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuditFindRoutingModule } from './audit-find-routing.module';
import { AuditFindComponent } from './audit-find.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CsPaginatorModule } from '../../shared/cs-paginator/cs-paginator.module';
import { AuditDetailModule } from '../audit-detail/audit-detail.module';
import { AutocompleteChipModule } from '../../shared/autocomplete-chip/autocomplete-chip.module';
import { MyMaterialModule } from 'src/app/app.material';
import { ChapaModule } from '../../shared/chapa/chapa.module';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';

@NgModule({
  imports: [
    CommonModule,
    AuditFindRoutingModule,
    MatToolbarModule,
    MatIconModule,
    MatDividerModule,
    MatProgressBarModule,
    MatSelectModule,
    MatInputModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDatepickerModule,
    CsPaginatorModule,
    AuditDetailModule,
    AutocompleteChipModule,
    MatCardModule,
    MatProgressSpinnerModule,
    ChapaModule,
    MatMenuModule
    ],
  declarations: [AuditFindComponent],
  exports: [AuditFindComponent]

})
export class AuditFindModule { }
