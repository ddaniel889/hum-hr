import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CandidatePromotionComponent } from './candidate-promotion.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CustomControlModule } from '../../shared/custom-control/custom-control.module';

@NgModule({
    imports: [
        CommonModule,
        FlexLayoutModule,
        MatToolbarModule,
        MatDividerModule,
        MatIconModule,
        MatProgressBarModule,
        FormsModule,
        ReactiveFormsModule,
        CustomControlModule,
        MatButtonModule,
        MatInputModule,
        MatProgressSpinnerModule
    ],
    declarations: [CandidatePromotionComponent],
    exports: [CandidatePromotionComponent]
})
export class CandidatePromotionModule { }
