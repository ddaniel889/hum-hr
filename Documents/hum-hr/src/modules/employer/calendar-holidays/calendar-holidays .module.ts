import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarHolidaysComponent } from './calendar-holidays.component';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LeaveService } from '../../shared/services/leave.service';
import { ChapaModule } from '../../shared/chapa/chapa.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatExpansionModule } from '@angular/material/expansion';
import { OrganizationalUnitService } from '../../shared/services/organizational-unit.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatMenuModule } from '@angular/material/menu';
import { CsPaginatorModule } from '../../shared/cs-paginator/cs-paginator.module';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [
    CalendarHolidaysComponent
  ],
  imports: [
    CommonModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    CsPaginatorModule,
    ChapaModule,
    FlexLayoutModule,
    MatExpansionModule,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,
    MatSelectModule,
    MatCardModule,
    MatProgressBarModule,
    MatMenuModule,
    MatSlideToggleModule,
    MatTooltipModule
  ],
  exports: [
    CalendarHolidaysComponent
  ],
  providers: [
    LeaveService,
    OrganizationalUnitService
  ]
})
export class CalendarHolidaysModule { }
