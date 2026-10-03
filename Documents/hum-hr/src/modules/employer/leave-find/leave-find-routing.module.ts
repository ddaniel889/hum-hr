import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LeaveFindComponent } from './leave-find.component';

const routes: Routes = [
  {
    path: '',
    component: LeaveFindComponent,
    children: [{
      path: 'detail/:id',
      loadChildren: () => import('../leave-request-detail/leave-request-detail.module').then(m => m.LeaveRequestDetailModule)
    }],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LeaveFindRoutingModule { }
