import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CertificatePwdComponent } from './certificate-pwd.component';

const routes: Routes = [
  { path: '', component: CertificatePwdComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CertificatePwdRoutingModule { }
