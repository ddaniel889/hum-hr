import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RoleUserAddComponent } from './role-user-add.component';
import { AuthGuardService } from '../../shared/services/auth-guard.service';

const routes: Routes = [
  {
    path: '',
    component: RoleUserAddComponent,
    children: [],
    canActivate: [AuthGuardService],
    data: { roles: ['RRHH_ACCESS'] }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RoleUserAddRoutingModule { }
