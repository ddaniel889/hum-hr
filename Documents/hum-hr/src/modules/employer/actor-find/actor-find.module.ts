import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActorFindComponent } from './actor-find.component';
import { MyMaterialModule } from 'src/app/app.material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import { ActorFindRoutingModule } from './actor-find-routing.module';
import { MatMenuModule } from '@angular/material/menu';
import { MatRippleModule } from '@angular/material/core';
import { RoleUserAddModule } from '../role-user-add/role-user-add.module';
import { RoleUserDetailModule } from '../role-user-detail/role-user-detail.module';
import { ActorDetailModule } from '../actor-detail/actor-detail.module';
import { ChapaModule } from '../../shared/chapa/chapa.module';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';


@NgModule({
  declarations: [ActorFindComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MyMaterialModule,
    FormsModule,
    MatMenuModule,
    MatRippleModule,
    MatSlideToggleModule,
    ActorFindRoutingModule,
    RoleUserAddModule,
    RoleUserDetailModule,
    ActorDetailModule,
    ChapaModule
  ],
  exports: [ActorFindComponent]
})
export class ActorFindModule { }



