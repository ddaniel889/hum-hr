import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MyMaterialModule } from 'src/app/app.material';
import { UserSecurityDetailComponent } from './user-security-detail.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';

@NgModule({
    declarations: [UserSecurityDetailComponent],
    imports: [
        CommonModule,
        FlexLayoutModule,
        MyMaterialModule,
        FormsModule,
        MatSlideToggleModule
    ],
    exports: [UserSecurityDetailComponent]
})
export class UserSecurityDetailModule { }
