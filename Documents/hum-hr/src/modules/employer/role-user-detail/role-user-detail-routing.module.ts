import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RoleUserDetailComponent } from './role-user-detail.component';
import { AuthGuardService } from '../../shared/services/auth-guard.service';

const routes: Routes = [
  {
    path: '',
    component: RoleUserDetailComponent,
    children: [],
    canActivate: [AuthGuardService],
    data: { roles: ['RRHH_ACCESS'] }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RoleUserDetailRoutingModule { }
