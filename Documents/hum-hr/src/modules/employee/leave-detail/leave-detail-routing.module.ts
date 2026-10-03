import { NgModule } from '@angular/core';
import { LeaveDetailComponent } from './leave-detail.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: LeaveDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LeaveDetailRoutingModule { }

