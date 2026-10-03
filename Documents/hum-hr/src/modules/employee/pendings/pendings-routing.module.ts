import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PendingComponent } from './pending.component';
import { AuthGuardService } from '../../shared/services/auth-guard.service';

const routes: Routes = [
  {
    path: '',
    component: PendingComponent,
    canActivate: [AuthGuardService],
    data: { roles: ['EMPLOYEE LD' , 'CANDIDATE'] }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PendingsRoutingModule { }
