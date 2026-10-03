import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuardService } from '../../shared/services/auth-guard.service';
import { AuditDetailComponent } from './audit-detail.component';

const routes: Routes = [
  {
    path: '',
    component: AuditDetailComponent,
    children: [],
    canActivate: [AuthGuardService],
    data: { roles: ['RRHH_ACCESS', 'RRHH_CONTENT'] }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuditDetailRoutingModule { }
