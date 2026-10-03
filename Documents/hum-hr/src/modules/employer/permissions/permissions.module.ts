import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PermissionsComponent } from './permissions.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { OrganizationalUnitAccessConfigService } from '../../shared/services/organizational-unit-access-configs.service';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';



@NgModule({
  declarations: [PermissionsComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatSlideToggleModule,
    MatCardModule,
    MatIconModule,
    FormsModule,
    MatButtonModule
  ],
  providers: [OrganizationalUnitAccessConfigService],
  exports: [PermissionsComponent]
})
export class PermissionsModule { }
