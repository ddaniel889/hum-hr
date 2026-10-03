import { AuthGuardService } from './../../shared/services/auth-guard.service';
import { DocumentationSignerComponent as DocumentationSignerComponent } from './documentation-signer.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: DocumentationSignerComponent,
    children: [],
    canActivate: [AuthGuardService],
    data: { roles: ['FIRMANTE'] }
  }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DocumentationSignerRoutingModule { }
