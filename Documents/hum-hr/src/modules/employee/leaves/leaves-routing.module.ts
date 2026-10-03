import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LeavesComponent } from './leave.component';

const routes: Routes = [
  {
    path: '',
    component: LeavesComponent,
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
        loadChildren: () => import('./../../../modules/employee/leave-detail/leave-detail.module').then(m => m.LeaveDetailModule)
      }
    ],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LeavesRoutingModule { }
