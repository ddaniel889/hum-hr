import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PwdChangeComponent } from './pwd-change.component';

const routes: Routes = [
  { path: '', component: PwdChangeComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PwdChangeRoutingModule { }
