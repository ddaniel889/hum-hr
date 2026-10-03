import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AnalyticsComponent } from './analytics.component';
import { AuthGuardService } from '../../shared/services/auth-guard.service';

const routes: Routes = [
  {
    path: '',
    component: AnalyticsComponent,
    children: [],
    canActivate: [AuthGuardService],
    data: { roles: ['DASHBOARDADMIN'] }
  },
  {
    path: ':id',
    component: AnalyticsComponent,
    children: [],
    canActivate: [AuthGuardService],
    data: { roles: ['DASHBOARDADMIN'] }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AnalyticsRoutingModule { }
