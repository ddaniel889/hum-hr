import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuardService } from '../../shared/services/auth-guard.service';
import { HomeEmployerComponent } from './homeEmployer.component';

const routes: Routes = [
  {
    path: '',
    component: HomeEmployerComponent,
    children: [
      {
        path: 'welcome',
        loadChildren: () => import('../welcomeEmployer/welcomeEmployer.module').then(m => m.WelcomeEmployerModule)
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'welcome'
      },
      {
        path: 'employee-find',
        pathMatch: 'full',
        redirectTo: 'employee'
      },
      {
        path: 'detalle/:id',
        loadChildren: () => import('../process-detail/process-detail.module').then(m => m.ProcessDetailModule)
      },
      {
        path: 'detalleConIdentificacion/:id',
        loadChildren: () => import('../automatic-process-detail/automatic-process-detail.module').then(m => m.AutomaticProcessDetailModule)
      }
    ],
    canActivate: [AuthGuardService],
    data: { roles: ['RRHH_CONTENT', 'RRHH_ACCESS', 'RRHH_DOCUMENTS','CANDIDATEADMIN','ADMIN_CANDIDATE_BASIC'] }  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeEmployerRoutingModule { }
