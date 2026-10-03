import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FileDocumentSearchComponent } from './file-document-search.component';
import { AuthGuardService } from '../../shared/services/auth-guard.service';

const routes: Routes = [
  {
    path: '',
    component: FileDocumentSearchComponent,
    children: [],
    canActivate: [AuthGuardService],
    data: { roles: ['RRHH_CONTENT', 'OVERSEER', 'RRHH_DOCUMENTS'] }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FileDocumentSearchRoutingModule { }
