import { NgModule } from '@angular/core';
import { MatStepperModule } from '@angular/material/stepper';
import { MatBadgeModule } from '@angular/material/badge';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  imports: [
    MatSelectModule,
    MatCardModule,
    MatProgressBarModule,
    MatSidenavModule,
    MatFormFieldModule,
    MatSnackBarModule,
    MatInputModule,
    MatButtonModule,
    MatExpansionModule,
    MatIconModule,
    MatListModule,
    MatBadgeModule,
    MatTableModule,
    MatStepperModule,
    MatToolbarModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatBottomSheetModule,
    MatCheckboxModule
    ],
  exports: [
    MatSelectModule,
    MatCardModule,
    MatProgressBarModule,
    MatSidenavModule,
    MatFormFieldModule,
    MatSnackBarModule,
    MatInputModule,
    MatButtonModule,
    MatExpansionModule,
    MatIconModule,
    MatListModule,
    MatBadgeModule,
    MatTableModule,
    MatStepperModule,
    MatToolbarModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatBottomSheetModule,
    MatCheckboxModule,
    MatDatepickerModule
    ]
})
export class MyMaterialModule {}
