import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ActorFindComponent } from './actor-find.component';
import { AuthGuardService } from '../../shared/services/auth-guard.service';

const routes: Routes = [
  {
    path: '',
    component: ActorFindComponent,
    children: [],
    canActivate: [AuthGuardService],
    data: { roles: ['RRHH_ACCESS'] }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ActorFindRoutingModule { }
