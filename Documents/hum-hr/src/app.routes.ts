import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
    { path: 'login', loadChildren: () => import('./modules/login/login.module').then(m => m.LoginModule)},
    { path: 'accessDenied', loadChildren: () => import('./modules/access-denied/access-denied.module').then(m => m.AccessDeniedModule)},
    { path: 'login/:t', loadChildren: () => import('./modules/login/login.module').then(m => m.LoginModule)},
    { path: 'employee', loadChildren: () => import('./modules/employee/employee.module').then(m => m.EmployeeModule)},
    { path: 'employer', loadChildren: () => import('./modules/employer/employer.module').then(m => m.EmployerModule)},
    { path: 'pwd-reset/:code', loadChildren: () => import('./modules/pwd-reset/pwd-reset.module').then(m => m.PwdResetModule)},
    { path: 'Ou/:ouId', children: [{ path: 'employee', loadChildren: () => import('./modules/employee/employee.module').then(m => m.EmployeeModule) }] },
    { path: 'pwd-first-time/:code', loadChildren: () => import('./modules/pwd-reset/pwd-reset.module').then(m => m.PwdResetModule)},
    { path: 'pwd-change', loadChildren: () => import('./modules/pwd-change/pwd-change.module').then(m => m.PwdChangeModule)},
    { path: 'otp-code/:code', loadChildren: () => import('./modules/otp/otp.module').then(m => m.OtpModule)},  
    {
        path: 'certificate-pwd-set/:code',
        loadChildren: () => import('./modules/shared/certificate-pwd/certificate-pwd.module').then(m => m.CertificatePwdModule),
        data: { login: false }
    },
    {
        path: 'certificate-pwd-confirm/:code',
        loadChildren: () => import('./modules/shared/certificate-pwd/certificate-pwd.module').then(m => m.CertificatePwdModule),
        data: { login: true }
    },
    { path: '**', redirectTo: 'login', pathMatch: 'full' },
];

export const APP_ROUTING = RouterModule.forRoot(routes, { useHash: true, relativeLinkResolution: 'legacy' });
