import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuardService } from '../../shared/services/auth-guard.service';
import { AnalyticsDocumentSetComponent } from './analytics-document-set.component';

const routes: Routes = [
  {
    path: '',
    component: AnalyticsDocumentSetComponent,
    children: [],
    canActivate: [AuthGuardService],
    data: { roles: ['RRHH_CONTENT'] }
  },
  {
    path: ':id',
    component: AnalyticsDocumentSetComponent,
    children: [],
    canActivate: [AuthGuardService],
    data: { roles: ['RRHH_CONTENT'] }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],exports: [RouterModule]
})
export class AnalyticsDocumentSetRoutingModule { }
