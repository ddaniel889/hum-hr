import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ControlsComponent } from './controls.component';
import { MyMaterialModule } from '../../../app.material';
import { ProfileModule } from '../../profile/profile.module';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    MyMaterialModule,
    ProfileModule
  ],
  declarations: [ControlsComponent],
  exports: [ControlsComponent]
})
export class ControlsModule {}
