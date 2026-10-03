import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuardService } from '../../shared/services/auth-guard.service';
import { AuditFindComponent } from './audit-find.component';

const routes: Routes = [
  {
    path: '',
    component: AuditFindComponent,
    children: [],
    canActivate: [AuthGuardService],
    data: { roles: ['RRHH_ACCESS', 'RRHH_CONTENT'] }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuditFindRoutingModule { }
