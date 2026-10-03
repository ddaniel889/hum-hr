import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EmployeeFindComponent } from './employeeFind.component';

const routes: Routes = [
  {
    path: '',
    component: EmployeeFindComponent,
    children: [{
      path: 'detail/:id',
      loadChildren: () => import('../employee-detail/employee-detail.module').then(m => m.EmployeeDetailModule)
    }],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployeeFindRoutingModule { }
