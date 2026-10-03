import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from '../../shared/services/auth-guard.service';
import { AddDocumentationComponent } from './add-documentation.component';

const routes: Routes = [
  {
    path: '',
    component: AddDocumentationComponent,
    canActivate: [AuthGuardService],
    data: { roles: ['EMPLOYEE LD' , 'CANDIDATE'] }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AddDocumentationRoutingModule { }
