import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from '../../shared/services/auth-guard.service';
import { HomeFileDocumentsComponent } from './home-file-documents.component';

const routes: Routes = [
  {
    path: '',
    component: HomeFileDocumentsComponent,
    children: [
      {
        path: 'SignPending',
        loadChildren: () => import('../home-file-documents/home-file-documents.module').then(m => m.HomeFileDocumentsModule),
        data: { legend: 'El documento está siendo firmado' }
      }],
    canActivate: [AuthGuardService],
    data: { roles: ['EMPLOYEE LD' , 'CANDIDATE'] }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeFileDocumentsRoutingModule { }
