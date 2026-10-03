import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DocumentationInProgressComponent } from './documentation-in-progress.component';
import { AuthGuardService } from '../../shared/services/auth-guard.service';

const routes: Routes = [
  {
    path: '',
    component: DocumentationInProgressComponent,
    children: [],
    canActivate: [AuthGuardService],
    data: { roles: ['RRHH_CONTENT'] }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DocumentationInProgressRoutingModule { }
