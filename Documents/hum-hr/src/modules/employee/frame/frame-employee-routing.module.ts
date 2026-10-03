import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from 'src/app/modules/shared/services/auth-guard.service';
import { FrameEmployeeComponent } from './frameEmployee.component';
import { startsWith, WebComponentWrapper, WebComponentWrapperOptions } from '@angular-architects/module-federation-tools';
import { AppConfig } from 'src/app/app.config';

const routes: Routes = [
  {
    path: '',
    component: FrameEmployeeComponent,
    children: [
      {
        path: 'home',
        loadChildren: () => import('../home/home.module').then(m => m.HomeModule),
        canActivate: [AuthGuardService],
        data: { roles: ['EMPLOYEE_2016'] }
      },
      {
        path: 'home-file-documents',
        loadChildren: () => import('../home-file-documents/home-file-documents.module').then(m => m.HomeFileDocumentsModule),
        canActivate: [AuthGuardService],
        data: { roles: ['EMPLOYEE LD', 'CANDIDATE' ] }
      },
      {
        path: 'leaves',
        loadChildren: () => import('../leaves/leaves.module').then(m => m.LeavesModule),
        canActivate: [AuthGuardService],
        data: { roles: ['EMPLOYEE LD', 'CANDIDATE','LEAVEAPROV' ] }
      },
      {
        path: 'leaves/:id',
        loadChildren: () => import('../leaves/leaves.module').then(m => m.LeavesModule),
        canActivate: [AuthGuardService],
        data: { roles: ['EMPLOYEE LD', 'CANDIDATE','LEAVEAPROV' ] }
      },
      {
        path: 'team',
        loadChildren: () => import('../employee-team/employee-team.module').then(m => m.EmployeeTeamModule),
        canActivate: [AuthGuardService],
        data: { roles: ['EMPLOYEE LD', 'CANDIDATE','LEAVEAPROV'] }
      },
      {
        matcher: startsWith('humanage-connect'),
        component: WebComponentWrapper,
        canActivate: [AuthGuardService],
        data: {
          type: 'module',
          remoteEntry: AppConfig.settings.microfrontends.humanageConnect + 'remoteEntry.js',
          exposedModule: './bootstrap',
          elementName: 'mf-hr-root',
          roles: ['EMPLOYEE LD'],
          featureFlag: 'useConnect'
        } as WebComponentWrapperOptions
      },
      {
        path: 'employee-leaves-view/:id/:userid',
        loadChildren: () => import('../../employee/employee-leaves/employee-leaves.module').then(m => m.EmployeeLeavesModule),
      
      },
      {
        path: 'pendings',
        loadChildren: () => import('../pendings/pendings.module').then(m => m.PendingsModule),
        canActivate: [AuthGuardService],
        data: { roles: ['EMPLOYEE LD', 'CANDIDATE' ] }
      },
      {
        path: 'pendings/:id',
        loadChildren: () => import('../pendings/pendings.module').then(m => m.PendingsModule),
        canActivate: [AuthGuardService],
        data: { roles: ['EMPLOYEE LD', 'CANDIDATE' ] }
      },
      {
        path: 'sign-massive',
        loadChildren: () => import('../document-sign-massive/document-sign-massive.module').then(m => m.DocumentSignMassiveModule),
        canActivate: [AuthGuardService],
        data: { roles: ['EMPLOYEE LD', 'CANDIDATE' ] }
      },
      {
        path: 'home-file-documents/:idDoc',
        loadChildren: () => import('../home-file-documents/home-file-documents.module').then(m => m.HomeFileDocumentsModule),
        canActivate: [AuthGuardService],
        data: { roles: ['EMPLOYEE LD', 'CANDIDATE'] }
      },
      {
        path: 'add-documentation',
        loadChildren: () => import('../add-documentation/add-documentation.module').then(m => m.AddDocumentationModule),
        canActivate: [AuthGuardService],
        data: { roles: ['EMPLOYEE LD', 'CANDIDATE'] }
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'home'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FrameRoutingModule { }
