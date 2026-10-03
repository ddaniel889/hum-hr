import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ActorDetailComponent } from './actor-detail.component';
import { AuthGuardService } from '../../shared/services/auth-guard.service';

const routes: Routes = [
  {
    path: '',
    component: ActorDetailComponent,
    children: [],
    canActivate: [AuthGuardService],
    data: { roles: ['RRHH_ACCESS'] }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ActorDetailRoutingModule { }
