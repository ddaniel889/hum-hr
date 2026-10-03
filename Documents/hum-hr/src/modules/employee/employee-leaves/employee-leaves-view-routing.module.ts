import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EmployeeLeavesViewComponent } from './employee-leaves-view.component';
import { AuthGuardService } from '../../shared/services/auth-guard.service';

const routes: Routes = [
  {
    path: '',
    component: EmployeeLeavesViewComponent,
    children: [
      {
        path: 'welcome',
        loadChildren: () => import('../welcome/welcome.module').then(m => m.WelcomeModule)
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'welcome'
      },
      {
        path: 'detalle/:id/:isApprover',
        loadChildren: () => import('../leave-detail/leave-detail.module').then(m => m.LeaveDetailModule)
      },
      {
        path: 'team',
        pathMatch: 'full',
        loadChildren: () => import('../employee-team/employee-team.module').then(m => m.EmployeeTeamModule),
        canActivate: [AuthGuardService],
        data: { roles: ['EMPLOYEE LD', 'CANDIDATE','LEAVEAPROV'] }
      }
    ],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployeeLeavesRoutingModule { }
