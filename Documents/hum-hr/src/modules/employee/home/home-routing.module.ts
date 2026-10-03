import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuardService } from '../../shared/services/auth-guard.service';
import { HomeComponent } from './home.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
      {
        path: 'welcome',
        loadChildren: () => import('../welcome/welcome.module').then(m => m.WelcomeModule)
      },
      {
        path: 'welcome/SignPending',
        loadChildren: () => import('../welcome/welcome.module').then(m => m.WelcomeModule),
        data: { legend: 'El documento está siendo firmado' }
      },
      {
        path: 'detail/:id',
        loadChildren: () => import('../document-detail/document-detail.module').then(m => m.DocumentDetailModule)
      },
      {
        path: '**',
        pathMatch: 'full',
        redirectTo: 'welcome'
      }
    ],
    canActivate: [AuthGuardService],
    data: { roles: ['EMPLOYEE_2016'] }  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
