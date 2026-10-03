import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RoleUserFindComponent } from './role-user-find.component';
import { AuthGuardService } from '../../shared/services/auth-guard.service';

const routes: Routes = [
  {
    path: '',
    component: RoleUserFindComponent,
    children: [],
    canActivate: [AuthGuardService],
    data: { roles: ['RRHH_ACCESS'] }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RoleUserFindRoutingModule { }
