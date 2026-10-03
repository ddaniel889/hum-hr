import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FrameComponent } from './frame.component';
import { AuthGuardService } from 'src/app/modules/shared/services/auth-guard.service';
import { startsWith, WebComponentWrapper, WebComponentWrapperOptions } from '@angular-architects/module-federation-tools';
import { AppConfig } from 'src/app/app.config';
import { AdjetivationGuard } from '../../shared/guards/adjetivation-guard.guard';

const routes: Routes = [
  {
    path: '',
    component: FrameComponent,
    children: [
      {
        path: 'dashboard',
        component: WebComponentWrapper,
        canActivate: [AuthGuardService],
        data: {
          type: 'module',
          remoteEntry: AppConfig.settings.microfrontends.dashboard + 'remoteEntry.js',
          exposedModule: './bootstrap',
          elementName: 'mf-hd-root',
          roles: ['RRHH_CONTENT', 'RRHH_ACCESS', 'RRHH_DOCUMENTS', 'CANDIDATEADMIN','ADMIN_CANDIDATE_BASIC'],
          featureFlag: 'useDashboard'
        } as WebComponentWrapperOptions
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
          roles: ['RRHH_CONTENT', 'RRHH_ACCESS', 'RRHH_DOCUMENTS', 'CANDIDATEADMIN','ADMIN_CANDIDATE_BASIC'],
          featureFlag: 'useConnect'
        } as WebComponentWrapperOptions
      },
      {
        path: 'home-employer',
        loadChildren: () => import('../homeEmployer/homeEmployer.module').then(m => m.HomeEmployerModule),
        canActivate: [AuthGuardService],
        data: { roles: ['RRHH_CONTENT', 'RRHH_ACCESS', 'RRHH_DOCUMENTS', 'CANDIDATEADMIN','ADMIN_CANDIDATE_BASIC'] }
      },
      {
        path: 'deferred-processes',
        loadChildren: () => import('../deferred-processes/deferred-processes.module').then(m => m.DeferredProcessesModule),
        canActivate: [AuthGuardService],
        data: { roles: ['RRHH_CONTENT', 'RRHH_ACCESS', 'RRHH_DOCUMENTS', 'CANDIDATEADMIN','ADMIN_CANDIDATE_BASIC'] }
      },
      {
        path: 'employee-find',
        loadChildren: () => import('../employee-find/employeeFind.module').then(m => m.EmployeeFindModule),
        canActivate: [AuthGuardService],
        data: { roles: ['RRHH_CONTENT', 'RRHH_ACCESS','LEAVEAPROV'] }
      },
      {
        path: 'candidate-find',
        loadChildren: () => import('../candidate-find/candidateFind.module').then(m => m.CandidateFindModule),
        canActivate: [AuthGuardService],
        data: { roles: ['RRHH_CONTENT', 'RRHH_ACCESS', 'CANDIDATEADMIN','ADMIN_CANDIDATE_BASIC'] }
      },
      {
        path: 'employee-find/:id',
        loadChildren: () => import('../employee-find/employeeFind.module').then(m => m.EmployeeFindModule),
        canActivate: [AuthGuardService],
        data: { roles: ['RRHH_CONTENT', 'RRHH_ACCESS'] }
      },
      {
        path: 'file-document-search',
        loadChildren: () => import('../file-document-search/file-document-search.module').then(m => m.FileDocumentSearchModule),
        canActivate: [AuthGuardService],
        data: { roles: ['RRHH_CONTENT', 'OVERSEER', 'RRHH_DOCUMENTS'] }
      },
      {
        path: 'documentation-in-progress',
        loadChildren: () => import('../documentation-in-progress/documentation-in-progress.module').then(m => m.DocumentationInProgressModule),
        canActivate: [AuthGuardService],
        data: { roles: ['RRHH_CONTENT'] }
      },
      {
        path: 'employee-document-view/:id',
        loadChildren: () => import('../employee-file-document/employee-file-document.module').then(m => m.EmployeeFileDocumentModule),
        canActivate: [AuthGuardService],
        data: { roles: ['RRHH_CONTENT', 'CANDIDATEADMIN','ADMIN_CANDIDATE_BASIC'] }
      },
      {
        path: 'employee-leaves-view/:id',
        loadChildren: () => import('../../employee/employee-leaves/employee-leaves.module').then(m => m.EmployeeLeavesModule),
      },
      {
        path: 'employee-document-view/:id/:idDoc/:isCand',
        loadChildren: () => import('../employee-file-document/employee-file-document.module').then(m => m.EmployeeFileDocumentModule),
        canActivate: [AuthGuardService],
        data: { roles: ['RRHH_CONTENT', 'CANDIDATEADMIN','ADMIN_CANDIDATE_BASIC'] }
      },
      {
        path: 'document-configuration',
        loadChildren: () => import('../document-configuration/document-configuration.module').then(m => m.DocumentConfigurationModule),
        canActivate: [AuthGuardService],
        data: { roles: ['RRHH_ADMIN', 'CANDIDATEADMIN','ADMIN_CANDIDATE_BASIC'] }
      },
      {
        path: 'documentation-signer',
        loadChildren: () => import('../documentation-signer/documentation-signer.module').then(m => m.DocumentationSignerModule),
        canActivate: [AuthGuardService],
        data: { roles: ['FIRMANTE'] }
      },
      {
        path: 'analytics',
        loadChildren: () => import('../analytics/analytics.module').then(m => m.AnalyticsModule),
        canActivate: [AuthGuardService],
        data: { roles: ['DASHBOARDADMIN'] }
      },
      {
        path: 'analytics-document-set',
        loadChildren: () => import('../analytics-document-set/analytics-document-set.module').then(m => m.AnalyticsDocumentSetModule),
        canActivate: [AuthGuardService],
        data: { roles: ['RRHH_CONTENT'] }
      },
      // {
      //   path: 'role-user-find',
      //   loadChildren: () => import('../role-user-find/role-user-find.module').then(m => m.RoleUserFindModule),
      //   canActivate: [AuthGuardService],
      //   data: { roles: ['RRHH_ACCESS', 'RRHH_ADMIN'] }
      // },
      {
        path: 'actor-find',
        loadChildren: () => import('../actor-find/actor-find.module').then(m => m.ActorFindModule),
        canActivate: [AuthGuardService, AdjetivationGuard],
        data: { roles: ['RRHH_ACCESS', 'RRHH_ADMIN'] }
      },
      {
        path: 'leave-find',//
        loadChildren: () => import('../leave-find/leave-find.module').then(m => m.LeaveFindModule),//
        canActivate: [AuthGuardService, AdjetivationGuard],
        data: { roles: ['RRHH_ACCESS', 'RRHH_ADMIN','LEAVEAPROV'] }
      },
      {
        path: 'leave-find/:id',
        loadChildren: () => import('../leave-find/leave-find.module').then(m => m.LeaveFindModule),
        canActivate: [AuthGuardService, AdjetivationGuard],
        data: { roles: ['RRHH_ACCESS', 'RRHH_ADMIN','LEAVEAPROV'] }
      },
      {
        path: 'audits',
        loadChildren: () => import('../audit-find/audit-find.module').then(m => m.AuditFindModule),
        canActivate: [AuthGuardService],
        data: { roles: ['RRHH_ACCESS', 'RRHH_ADMIN'] }
      },
      {
        path: 'settings',
        loadChildren: () => import('../settings/settings.module').then(m => m.SettingsModule),
        canActivate: [AuthGuardService, AdjetivationGuard],
        data: { roles: ['RRHH_ACCESS', 'RRHH_ADMIN',['LEAVECONFIG']] }
      },
      {
        path: 'lsd',
        loadChildren: () => import('../lsd/lsd.module').then(m => m.LsdModule),
        canActivate: [AuthGuardService],
        data: { roles: ['LSD_HUMANAGE'] }
      }
    ],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FrameRoutingModule { }
